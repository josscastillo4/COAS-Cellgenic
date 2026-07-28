/**
 * Shared types for the Documents module (/app/documents).
 * Kept separate from types/navigation.ts since this describes domain data,
 * not app chrome.
 */

export type DocumentType = "COA" | "MSDS" | "IFU" | "Brochure";

export type DocumentStatus = "Active" | "Archived" | "Draft";

export interface ProductDocument {
  id: string;
  /** Display name of the document, e.g. "Certificate of Analysis - Batch 4821". */
  name: string;
  type: DocumentType;
  /** Name of the product this document is associated with. */
  product: string;
  /** Document version, e.g. "v1.0". */
  version: string;
  status: DocumentStatus;
  /** ISO date string (YYYY-MM-DD) for the last update. */
  updated: string;
}
