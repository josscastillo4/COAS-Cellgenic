import type { ProductDocument, VerificationResult, VerificationStatus } from "@/types/document";

export interface VerifyApiResponse {
  outcome: "matched" | "mismatch" | "unreachable" | "pdf_not_found" | "pdf_unreadable";
  foundPdfUrl?: string;
  found?: { publishedYear?: number; lotNumber?: string; mg?: string };
  mismatchedFields?: string[];
  message?: string;
}

/**
 * Calls the stateless /api/documents/verify route for a single document.
 * The server holds no document data — this sends whatever's needed to check
 * (the QR/public URL and the expected Excel values) and gets back what was
 * actually found live on the page right now.
 */
export async function callVerifyApi(doc: ProductDocument): Promise<VerifyApiResponse> {
  const qrUrl = doc.qrUrl || doc.publicUrl;
  if (!qrUrl) {
    return { outcome: "unreachable", message: "This document has no QR or public URL to verify." };
  }

  try {
    const response = await fetch("/api/documents/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        qrUrl,
        expected: {
          name: doc.name,
          publishedYear: doc.publishedYear,
          lotNumber: doc.lotNumber,
          mg: doc.mg,
        },
      }),
    });

    if (!response.ok) {
      return {
        outcome: "unreachable",
        message: `Verification request failed (HTTP ${response.status})`,
      };
    }

    return (await response.json()) as VerifyApiResponse;
  } catch (error) {
    return {
      outcome: "unreachable",
      message: `Verification request failed: ${error instanceof Error ? error.message : "unknown error"}`,
    };
  }
}

/** Pure mapping from a raw API response into the patch applied via updateDocument. */
export function toVerificationPatch(
  doc: ProductDocument,
  apiResponse: VerifyApiResponse
): { verificationStatus: VerificationStatus; verificationResult: VerificationResult } {
  const verificationResult: VerificationResult = {
    checkedAt: new Date().toISOString(),
    outcome: apiResponse.outcome,
    foundPdfUrl: apiResponse.foundPdfUrl,
    expected: {
      name: doc.name,
      publishedYear: doc.publishedYear,
      lotNumber: doc.lotNumber,
      mg: doc.mg,
    },
    found: apiResponse.found,
    mismatchedFields: apiResponse.mismatchedFields as VerificationResult["mismatchedFields"],
    message: apiResponse.message,
  };

  const verificationStatus: VerificationStatus =
    apiResponse.outcome === "matched"
      ? "Up to date"
      : apiResponse.outcome === "mismatch"
        ? "Update required"
        : "Verification failed";

  return { verificationStatus, verificationResult };
}
