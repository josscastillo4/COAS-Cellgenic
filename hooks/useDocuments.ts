"use client";

import { useCallback, useEffect, useState } from "react";
import { MOCK_DOCUMENTS } from "@/data/documents";
import * as documentService from "@/services/documentService";
import type { DocumentInput, PdfHistoryEntry, ProductDocument } from "@/types/document";

const STORAGE_KEY = "cellgenic-documents";

function loadFromStorage(): ProductDocument[] {
  if (typeof window === "undefined") return MOCK_DOCUMENTS;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as ProductDocument[]) : MOCK_DOCUMENTS;
  } catch {
    return MOCK_DOCUMENTS;
  }
}

function saveToStorage(documents: ProductDocument[]): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(documents));
}

function generateId(): string {
  return `doc-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

/**
 * Client-side data layer for the Documents module. Backed by localStorage
 * (seeded from the mock dataset on first load) so edits survive reloads in
 * the same browser without a real backend yet. Every operation delegates its
 * actual array transform to services/documentService.ts, which is the seam
 * that gets swapped for real Supabase calls later — this hook only owns
 * "where the array lives" (browser storage) and id/timestamp generation.
 */
export function useDocuments() {
  const [documents, setDocuments] = useState<ProductDocument[]>(MOCK_DOCUMENTS);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Intentional one-time sync from a client-only store (localStorage isn't
    // available during SSR): the initial render must match server output
    // (MOCK_DOCUMENTS) to avoid a hydration mismatch, then this swaps in
    // whatever's actually in the browser immediately after mount.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setDocuments(loadFromStorage());
    setIsReady(true);
  }, []);

  const createDocument = useCallback((input: DocumentInput): ProductDocument => {
    const now = new Date().toISOString();
    const newDocument: ProductDocument = {
      type: "COA",
      status: "Draft",
      verificationStatus: "Unverified",
      updateRequired: false,
      ...input,
      id: generateId(),
      createdAt: now,
      updatedAt: now,
    };

    setDocuments((prev) => {
      const next = documentService.addDocument(prev, newDocument);
      saveToStorage(next);
      return next;
    });

    return newDocument;
  }, []);

  const importDocuments = useCallback((inputs: DocumentInput[]): ProductDocument[] => {
    const now = new Date().toISOString();
    const newDocuments: ProductDocument[] = inputs.map((input) => ({
      type: "COA",
      status: "Draft",
      verificationStatus: "Unverified",
      updateRequired: false,
      ...input,
      id: generateId(),
      createdAt: now,
      updatedAt: now,
    }));

    setDocuments((prev) => {
      const next = documentService.addDocuments(prev, newDocuments);
      saveToStorage(next);
      return next;
    });

    return newDocuments;
  }, []);

  const updateDocument = useCallback((id: string, patch: Partial<ProductDocument>) => {
    setDocuments((prev) => {
      const next = documentService.updateDocument(prev, id, patch);
      saveToStorage(next);
      return next;
    });
  }, []);

  const replacePdf = useCallback(
    (id: string, newPdfUrl: string, reason?: PdfHistoryEntry["reason"]) => {
      setDocuments((prev) => {
        const next = documentService.replacePdf(prev, id, newPdfUrl, reason);
        saveToStorage(next);
        return next;
      });
    },
    []
  );

  const getDocumentById = useCallback(
    (id: string) => documentService.getDocumentById(documents, id),
    [documents]
  );

  return {
    documents,
    isReady,
    createDocument,
    importDocuments,
    updateDocument,
    replacePdf,
    getDocumentById,
  };
}
