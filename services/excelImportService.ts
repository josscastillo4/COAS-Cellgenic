import { slugify } from "@/lib/utils";
import type { DocumentInput, ProductDocument } from "@/types/document";
import type { ExcelColumnMapping, ImportRow, ImportSummary, ParsedWorkbook } from "@/types/import";
import type { RowQrMap } from "@/services/xlsxImageService";

/**
 * Excel Import parsing/mapping/validation — pure functions, no persistence.
 * Mirrors documentService.ts: this file never touches localStorage, so it
 * stays untouched when the persistence layer is swapped for Supabase later.
 * Reads via read-excel-file (browser build) rather than a schema-based parse
 * because duplicate detection (within-file and against existing documents)
 * isn't something a column schema can express — one consistent, fully
 * custom validation pass is simpler than mixing two validation systems.
 */

const COLUMN_ALIASES: Record<keyof ExcelColumnMapping, string[]> = {
  documentName: ["COA NAME", "COA Name", "Document Name", "Name"],
  publicUrl: ["Link", "Public URL", "URL"],
  datePublished: ["Date Published", "Published Date", "Published Year"],
  lotNumber: ["LOT Number", "Lot Number", "LOT", "Lot #"],
  qrUrl: ["QR", "QR URL", "QR Code"],
  updateRequired: ["ACTUALIZAR PDF", "Update Required"],
  mg: ["Gramaje", "MG", "Gramaje / MG", "Gramaje/MG"],
};

const TRUE_TOKENS = new Set(["SI", "S", "YES", "Y", "TRUE", "1"]);
const FALSE_TOKENS = new Set(["NO", "N", "FALSE", "0"]);

function normalizeHeader(value: string): string {
  return value.trim().toUpperCase().replace(/\s+/g, " ");
}

function cellToString(value: unknown): string {
  if (value === null || value === undefined) return "";
  if (value instanceof Date) return value.toISOString();
  return String(value).trim();
}

/** Reads the first sheet of an .xlsx file into raw headers + row objects. */
export async function parseWorkbook(file: File): Promise<ParsedWorkbook> {
  const { readSheet } = await import("read-excel-file/browser");
  const rows = await readSheet(file);
  const [headerRow, ...dataRows] = rows;

  if (!headerRow) {
    return { headers: [], rows: [] };
  }

  const headers = headerRow.map((cell) => cellToString(cell));

  const rowObjects = dataRows.map((row) => {
    const record: Record<string, unknown> = {};
    headers.forEach((header, index) => {
      record[header] = row[index];
    });
    return record;
  });

  return { headers, rows: rowObjects };
}

/** Matches actual file headers against known aliases for each expected column. */
export function detectColumnMapping(headers: string[]): ExcelColumnMapping {
  const normalizedHeaders = headers.map((header) => ({
    original: header,
    normalized: normalizeHeader(header),
  }));

  function findMatch(aliases: string[]): string | null {
    const normalizedAliases = aliases.map(normalizeHeader);
    const match = normalizedHeaders.find((header) => normalizedAliases.includes(header.normalized));
    return match ? match.original : null;
  }

  return {
    documentName: findMatch(COLUMN_ALIASES.documentName),
    publicUrl: findMatch(COLUMN_ALIASES.publicUrl),
    datePublished: findMatch(COLUMN_ALIASES.datePublished),
    lotNumber: findMatch(COLUMN_ALIASES.lotNumber),
    qrUrl: findMatch(COLUMN_ALIASES.qrUrl),
    updateRequired: findMatch(COLUMN_ALIASES.updateRequired),
    mg: findMatch(COLUMN_ALIASES.mg),
  };
}

function extractPublishedYear(value: unknown): number | null {
  if (value instanceof Date) {
    return value.getFullYear();
  }
  if (typeof value === "number" && value >= 1900 && value <= 2100) {
    return value;
  }
  if (typeof value === "string") {
    const trimmed = value.trim();
    const yearMatch = trimmed.match(/\b(19|20)\d{2}\b/);
    if (yearMatch) return Number(yearMatch[0]);
    const parsedDate = new Date(trimmed);
    if (!Number.isNaN(parsedDate.getTime())) return parsedDate.getFullYear();
  }
  return null;
}

function parseUpdateRequired(value: unknown): {
  parsed: boolean | undefined;
  invalid: boolean;
  raw: string;
} {
  const raw = cellToString(value);
  if (raw === "") return { parsed: undefined, invalid: false, raw };

  const token = raw.toUpperCase();
  if (TRUE_TOKENS.has(token)) return { parsed: true, invalid: false, raw };
  if (FALSE_TOKENS.has(token)) return { parsed: false, invalid: false, raw };
  return { parsed: undefined, invalid: true, raw };
}

function isValidUrl(value: string): boolean {
  if (!value) return false;
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

/**
 * Validates and maps every row, then flags duplicates by Public URL (the
 * field meant to be globally unique — one URL resolves to one document/QR).
 * Runs across the full dataset, not just the previewed slice. Duplicate
 * checking only runs on rows that already passed field validation.
 *
 * `rowQrMap` (0-indexed worksheet row -> decoded QR URL, from
 * xlsxImageService.extractRowQrMap) takes priority over the text QR column
 * when both are present for a row — the embedded image is the real QR data;
 * the text column is a fallback for files that don't have one.
 */
export function buildImportRows(
  rows: Record<string, unknown>[],
  mapping: ExcelColumnMapping,
  existingDocuments: ProductDocument[],
  rowQrMap?: RowQrMap
): ImportRow[] {
  const existingUrls = new Set(
    existingDocuments
      .map((doc) => doc.publicUrl?.trim().toLowerCase())
      .filter((url): url is string => Boolean(url))
  );
  const seenUrlsInFile = new Set<string>();

  return rows.map((row, index) => {
    const rowNumber = index + 2; // +1 for 1-based, +1 for the header row
    const errors: string[] = [];

    const name = cellToString(mapping.documentName ? row[mapping.documentName] : undefined);
    if (!name) errors.push("Missing Document Name");

    const publicUrl = cellToString(mapping.publicUrl ? row[mapping.publicUrl] : undefined);
    if (!publicUrl) {
      errors.push("Missing Public URL");
    } else if (!isValidUrl(publicUrl)) {
      errors.push(`Invalid URL: "${publicUrl}"`);
    }

    const publishedYear = extractPublishedYear(
      mapping.datePublished ? row[mapping.datePublished] : undefined
    );
    if (!publishedYear) errors.push("Missing or unparseable Published Year");

    const lotNumber = cellToString(mapping.lotNumber ? row[mapping.lotNumber] : undefined);
    if (!lotNumber) errors.push("Missing Lot Number");

    // Data rows start at worksheet row 1 (row 0 is the header) — matches the
    // 0-indexed row numbers used in <xdr:from><xdr:row> anchors.
    const qrFromImage = rowQrMap?.get(index + 1);
    const qrFromText = cellToString(mapping.qrUrl ? row[mapping.qrUrl] : undefined);
    const qrUrl = qrFromImage || qrFromText;

    const mg = cellToString(mapping.mg ? row[mapping.mg] : undefined);

    const {
      parsed: updateRequired,
      invalid: updateRequiredInvalid,
      raw: updateRequiredRaw,
    } = parseUpdateRequired(mapping.updateRequired ? row[mapping.updateRequired] : undefined);
    if (updateRequiredInvalid) {
      errors.push(`Invalid ACTUALIZAR PDF value: "${updateRequiredRaw}"`);
    }

    const input: DocumentInput = {
      name,
      type: "COA",
      status: "Draft",
      verificationStatus: "Pending verification",
      publicUrl: publicUrl || undefined,
      slug: name ? slugify(name) : undefined,
      publishedYear: publishedYear ?? undefined,
      lotNumber: lotNumber || undefined,
      qrUrl: qrUrl || undefined,
      mg: mg || undefined,
      updateRequired: updateRequired ?? false,
    };

    if (errors.length > 0) {
      return { rowNumber, input, status: "invalid", errors };
    }

    const normalizedUrl = publicUrl.toLowerCase();
    if (existingUrls.has(normalizedUrl) || seenUrlsInFile.has(normalizedUrl)) {
      return { rowNumber, input, status: "duplicate", errors: [] };
    }

    seenUrlsInFile.add(normalizedUrl);
    return { rowNumber, input, status: "valid", errors: [] };
  });
}

export function summarize(rows: ImportRow[]): ImportSummary {
  return {
    totalRows: rows.length,
    validRows: rows.filter((row) => row.status === "valid").length,
    invalidRows: rows.filter((row) => row.status === "invalid").length,
    duplicateRows: rows.filter((row) => row.status === "duplicate").length,
  };
}
