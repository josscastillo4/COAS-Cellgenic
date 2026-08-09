/**
 * Shared types for the Documents module (/app/documents).
 * Kept separate from types/navigation.ts since this describes domain data,
 * not app chrome.
 */

export type DocumentType = "COA" | "MSDS" | "IFU" | "Brochure" | "Package Insert";

export type DocumentStatus = "Active" | "Archived" | "Draft";

/**
 * Real, automatically-calculated verification state — never manually
 * assigned. Distinct from `updateRequired` (the raw Excel SI/NO flag — what
 * Marketing flagged, not what we've actually checked) and from `status`
 * (Active/Archived/Draft lifecycle).
 * - "Pending verification": imported/reset, not yet checked.
 * - "Verifying": a batch/manual verification run is checking it right now.
 * - "Up to date": checked — the live PDF matches the expected Excel data.
 * - "Update required": checked — the live PDF was found but doesn't match.
 * - "Verification failed": could not complete the check (see
 *   verificationResult.message for why — unreachable URL, no PDF found, or
 *   the PDF couldn't be parsed). Never conflated with "Up to date".
 */
export type VerificationStatus =
  | "Pending verification"
  | "Verifying"
  | "Up to date"
  | "Update required"
  | "Verification failed";

/** Snapshot of the fields verification compares, used for both `expected` and `found`. */
export interface VerificationFieldSnapshot {
  name?: string;
  publishedYear?: number;
  lotNumber?: string;
  mg?: string;
}

/**
 * Structured "why" behind the current verificationStatus, so a mismatch is
 * never just a status pill with no explanation.
 */
export interface VerificationResult {
  /** ISO date string for when this check ran. */
  checkedAt: string;
  outcome: "matched" | "mismatch" | "unreachable" | "pdf_not_found" | "pdf_unreadable";
  /** The PDF URL actually discovered on the WordPress page — may differ from the stored pdfUrl. */
  foundPdfUrl?: string;
  expected?: VerificationFieldSnapshot;
  found?: VerificationFieldSnapshot;
  mismatchedFields?: Array<keyof VerificationFieldSnapshot>;
  /** Human-readable detail, mainly for the unreachable/pdf_not_found/pdf_unreadable outcomes. */
  message?: string;
}

/** One prior PDF that was replaced, kept for audit history. */
export interface PdfHistoryEntry {
  pdfUrl: string;
  /** ISO date string for when this version was replaced. */
  replacedAt: string;
  reason?: "QR Correction" | "Version Update";
}

export interface ProductDocument {
  // Core — required for every document regardless of type
  id: string;
  /** Display name of the document, e.g. "Certificate of Analysis - Lot 4821". */
  name: string;
  type: DocumentType;
  /** Active | Archived | Draft — lifecycle state, independent of updateRequired. */
  status: DocumentStatus;
  /** ISO date string. */
  createdAt: string;
  /** ISO date string. */
  updatedAt: string;

  // Kept from the original model, now optional since Excel-driven COA
  // records don't supply them
  /** Name of the product this document is associated with. */
  product?: string;
  /** Document version, e.g. "v1.0". */
  version?: string;

  // COA/Excel-driven fields — optional at the type level; populated for COA
  // records today, left undefined for other types until they get their own
  // type-specific fields.
  /** Stable public URL — this is what the QR code must keep resolving to. */
  publicUrl?: string;
  /** Derived from name or parsed from publicUrl. */
  slug?: string;
  /** Parsed from the Excel "Date Published" column. */
  publishedYear?: number;
  lotNumber?: string;
  /** URL the QR code redirects to — kept stable across PDF replacements. */
  qrUrl?: string;
  /** Raw "ACTUALIZAR PDF" SI/NO flag from Excel — "something needs attention". */
  updateRequired?: boolean;
  /** The currently published PDF. Change this only via the Replace PDF flow so history is recorded. */
  pdfUrl?: string;
  /** "Gramaje / MG" — compared against the PDF during verification, alongside name/year/lot. */
  mg?: string;

  // PDF verification & replacement audit
  verificationStatus?: VerificationStatus;
  verificationResult?: VerificationResult;
  pdfHistory?: PdfHistoryEntry[];
}

/** Shape accepted when creating a document — only `name` is required, everything else defaults. */
export type DocumentInput = Partial<Omit<ProductDocument, "id" | "createdAt" | "updatedAt">> & {
  name: string;
};
