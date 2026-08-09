import type { DocumentInput } from "@/types/document";

/**
 * Shared types for the Excel Import wizard (/app/documents/import).
 * Kept separate from types/document.ts since these describe the import
 * process itself, not the Document/COA domain data.
 */

/** Detected/selected source header for each expected Excel column, or null if unmapped. */
export interface ExcelColumnMapping {
  documentName: string | null; // "COA NAME"
  publicUrl: string | null; // "Link"
  datePublished: string | null; // "Date Published"
  lotNumber: string | null; // "LOT Number"
  qrUrl: string | null; // "QR"
  updateRequired: string | null; // "ACTUALIZAR PDF"
}

export type ImportRowStatus = "valid" | "invalid" | "duplicate";

export interface ImportRow {
  /** 1-based row number in the source file (header row is row 1), for error messages. */
  rowNumber: number;
  /** Mapped result. Present even for invalid/duplicate rows so the preview can show what was read. */
  input: DocumentInput;
  status: ImportRowStatus;
  /** Human-readable validation messages; empty when status is "valid" or "duplicate". */
  errors: string[];
}

export interface ImportSummary {
  totalRows: number;
  validRows: number;
  invalidRows: number;
  duplicateRows: number;
}

export interface ParsedWorkbook {
  headers: string[];
  rows: Record<string, unknown>[];
}
