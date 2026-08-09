import type { PdfHistoryEntry, ProductDocument } from "@/types/document";

/**
 * Pure, server-safe transforms over a documents array — no localStorage or
 * other browser APIs here. This is the seam that gets swapped for real
 * Supabase queries later; callers (currently hooks/useDocuments.ts) own
 * persistence and pass the array in/out.
 */

export function getDocumentById(
  documents: ProductDocument[],
  id: string
): ProductDocument | undefined {
  return documents.find((doc) => doc.id === id);
}

export function addDocument(
  documents: ProductDocument[],
  document: ProductDocument
): ProductDocument[] {
  return [...documents, document];
}

/** Bulk variant of addDocument, used by the Excel importer — one array operation instead of N. */
export function addDocuments(
  documents: ProductDocument[],
  newDocuments: ProductDocument[]
): ProductDocument[] {
  return [...documents, ...newDocuments];
}

export function updateDocument(
  documents: ProductDocument[],
  id: string,
  patch: Partial<ProductDocument>
): ProductDocument[] {
  const updatedAt = new Date().toISOString();
  return documents.map((doc) =>
    doc.id === id ? { ...doc, ...patch, updatedAt } : doc
  );
}

/**
 * Replaces a document's PDF while preserving the QR/public URL contract:
 * qrUrl and publicUrl are never part of this operation's payload, so they
 * cannot change here. The previous pdfUrl is archived into pdfHistory.
 */
export function replacePdf(
  documents: ProductDocument[],
  id: string,
  newPdfUrl: string,
  reason?: PdfHistoryEntry["reason"]
): ProductDocument[] {
  const now = new Date().toISOString();

  return documents.map((doc) => {
    if (doc.id !== id) return doc;

    const history: PdfHistoryEntry[] = doc.pdfUrl
      ? [...(doc.pdfHistory ?? []), { pdfUrl: doc.pdfUrl, replacedAt: now, reason }]
      : (doc.pdfHistory ?? []);

    return {
      ...doc,
      pdfUrl: newPdfUrl,
      pdfHistory: history,
      verificationStatus: "Verified",
      updateRequired: false,
      updatedAt: now,
    };
  });
}
