/**
 * Shared types for the Documents module (/app/documents).
 * Kept separate from types/navigation.ts since this describes domain data,
 * not app chrome.
 */

export type DocumentType = "COA" | "MSDS" | "IFU" | "Brochure" | "Package Insert";

export type DocumentStatus = "Active" | "Archived" | "Draft";

/**
 * Whether the currently published PDF matches what this QR/document should
 * show. Distinct from `updateRequired` (which just flags "something needs
 * attention" without saying why) and from `status` (lifecycle state).
 * - "Mismatch": the QR/public URL currently serves the WRONG PDF.
 * - "Outdated": the PDF is correct but a newer version has been released.
 */
export type VerificationStatus = "Verified" | "Mismatch" | "Outdated" | "Unverified";

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

  // PDF verification & replacement audit
  verificationStatus?: VerificationStatus;
  pdfHistory?: PdfHistoryEntry[];
}

/** Shape accepted when creating a document — only `name` is required, everything else defaults. */
export type DocumentInput = Partial<Omit<ProductDocument, "id" | "createdAt" | "updatedAt">> & {
  name: string;
};
