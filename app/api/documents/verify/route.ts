import { NextResponse } from "next/server";

/**
 * Stateless verification endpoint — holds no document data itself. The
 * client sends what to check (the QR's target URL + the expected Excel
 * values) and gets back what was actually found live on the WordPress page
 * right now. This has to be server-side because fetching an arbitrary
 * external URL from browser JS hits CORS almost universally.
 *
 * POST body:  { qrUrl: string, expected: { name?, publishedYear?, lotNumber?, mg? } }
 * Response:   { outcome, foundPdfUrl?, found?, mismatchedFields?, message? }
 */

const FETCH_TIMEOUT_MS = 15_000;
const MAX_PDF_BYTES = 20 * 1024 * 1024; // 20MB — avoid processing arbitrarily large downloads

interface ExpectedFields {
  name?: string;
  publishedYear?: number;
  lotNumber?: string;
  mg?: string;
}

interface VerifyRequestBody {
  qrUrl?: string;
  expected?: ExpectedFields;
}

function isHttpUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

async function fetchWithTimeout(url: string, timeoutMs: number): Promise<Response> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { signal: controller.signal, redirect: "follow" });
  } finally {
    clearTimeout(timeout);
  }
}

/** Regex-based PDF link discovery — no HTML-parser dependency (see plan). */
function findPdfUrl(html: string, baseUrl: string): string | null {
  const absoluteMatch = html.match(/https?:\/\/[^\s"'<>]+\.pdf/i);
  if (absoluteMatch) return absoluteMatch[0];

  const relativeMatch = html.match(/(?:href|src)\s*=\s*["']([^"']+\.pdf)["']/i);
  if (relativeMatch) {
    try {
      return new URL(relativeMatch[1], baseUrl).toString();
    } catch {
      return null;
    }
  }

  return null;
}

function extractYear(text: string): number | undefined {
  const match = text.match(/\b(19|20)\d{2}\b/);
  return match ? Number(match[0]) : undefined;
}

function extractLotNumber(text: string): string | undefined {
  const match = text.match(/lot(?:e)?\.?\s*(?:number|no\.?|#)?\s*[:\-]?\s*([A-Za-z0-9-]{2,})/i);
  return match ? match[1] : undefined;
}

function extractMg(text: string): string | undefined {
  const match = text.match(/(?:gramaje|mg)\s*[:\-]?\s*([0-9]+(?:\.[0-9]+)?\s*mg?)/i);
  return match ? match[1].trim() : undefined;
}

function fieldsMatch(expected: string | undefined, found: string | undefined): boolean {
  if (!expected || !found) return true; // nothing to compare, don't flag as a mismatch
  return expected.trim().toLowerCase() === found.trim().toLowerCase();
}

export async function POST(request: Request) {
  let body: VerifyRequestBody;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ outcome: "unreachable", message: "Invalid request body" });
  }

  const qrUrl = body.qrUrl;
  const expected = body.expected ?? {};

  if (!qrUrl || !isHttpUrl(qrUrl)) {
    return NextResponse.json({
      outcome: "unreachable",
      message: "QR URL is missing or not a valid http(s) URL",
    });
  }

  let pageResponse: Response;
  try {
    pageResponse = await fetchWithTimeout(qrUrl, FETCH_TIMEOUT_MS);
  } catch (error) {
    return NextResponse.json({
      outcome: "unreachable",
      message: `Could not reach the QR URL: ${error instanceof Error ? error.message : "unknown error"}`,
    });
  }

  if (!pageResponse.ok) {
    return NextResponse.json({
      outcome: "unreachable",
      message: `QR URL responded with HTTP ${pageResponse.status}`,
    });
  }

  const contentType = pageResponse.headers.get("content-type") ?? "";
  let pdfResponse: Response;
  let foundPdfUrl: string;

  if (contentType.includes("application/pdf")) {
    pdfResponse = pageResponse;
    foundPdfUrl = qrUrl;
  } else {
    const html = await pageResponse.text();
    const discoveredPdfUrl = findPdfUrl(html, qrUrl);
    if (!discoveredPdfUrl) {
      return NextResponse.json({
        outcome: "pdf_not_found",
        message: "The page was reachable, but no PDF link could be found on it",
      });
    }
    foundPdfUrl = discoveredPdfUrl;

    try {
      pdfResponse = await fetchWithTimeout(discoveredPdfUrl, FETCH_TIMEOUT_MS);
    } catch (error) {
      return NextResponse.json({
        outcome: "pdf_not_found",
        foundPdfUrl,
        message: `Found a PDF link but could not fetch it: ${error instanceof Error ? error.message : "unknown error"}`,
      });
    }

    if (!pdfResponse.ok) {
      return NextResponse.json({
        outcome: "pdf_not_found",
        foundPdfUrl,
        message: `PDF URL responded with HTTP ${pdfResponse.status}`,
      });
    }
  }

  const contentLength = Number(pdfResponse.headers.get("content-length") ?? 0);
  if (contentLength > MAX_PDF_BYTES) {
    return NextResponse.json({
      outcome: "pdf_unreadable",
      foundPdfUrl,
      message: "PDF exceeds the maximum size we process (20MB)",
    });
  }

  let text: string;
  try {
    const arrayBuffer = await pdfResponse.arrayBuffer();
    if (arrayBuffer.byteLength > MAX_PDF_BYTES) {
      return NextResponse.json({
        outcome: "pdf_unreadable",
        foundPdfUrl,
        message: "PDF exceeds the maximum size we process (20MB)",
      });
    }

    const { extractText } = await import("unpdf");
    const result = await extractText(new Uint8Array(arrayBuffer), { mergePages: true });
    text = result.text;
  } catch (error) {
    return NextResponse.json({
      outcome: "pdf_unreadable",
      foundPdfUrl,
      message: `Could not extract text from the PDF: ${error instanceof Error ? error.message : "unknown error"}`,
    });
  }

  if (!text || text.trim().length === 0) {
    return NextResponse.json({
      outcome: "pdf_unreadable",
      foundPdfUrl,
      message: "PDF text extraction returned no content (likely a scanned/image-only PDF)",
    });
  }

  const found = {
    publishedYear: extractYear(text),
    lotNumber: extractLotNumber(text),
    mg: extractMg(text),
  };

  const mismatchedFields: string[] = [];
  if (expected.publishedYear && found.publishedYear && expected.publishedYear !== found.publishedYear) {
    mismatchedFields.push("publishedYear");
  }
  if (!fieldsMatch(expected.lotNumber, found.lotNumber)) {
    mismatchedFields.push("lotNumber");
  }
  if (!fieldsMatch(expected.mg, found.mg)) {
    mismatchedFields.push("mg");
  }

  return NextResponse.json({
    outcome: mismatchedFields.length > 0 ? "mismatch" : "matched",
    foundPdfUrl,
    found,
    mismatchedFields,
  });
}
