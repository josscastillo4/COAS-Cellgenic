"use client";

import { useState } from "react";
import { FileUp } from "lucide-react";
import type { PdfHistoryEntry, ProductDocument } from "@/types/document";

interface ReplacePdfModalProps {
  isOpen: boolean;
  doc: ProductDocument;
  onClose: () => void;
  onConfirm: (newPdfUrl: string, reason?: PdfHistoryEntry["reason"]) => void;
}

const REASONS: Array<{ value: PdfHistoryEntry["reason"]; label: string }> = [
  { value: "QR Correction", label: "QR Correction — the QR currently shows the wrong PDF" },
  { value: "Version Update", label: "Version Update — a newer PDF is replacing a correct one" },
];

/**
 * Replace PDF flow. Only ever changes `pdfUrl` — `qrUrl` and `publicUrl` are
 * not part of the payload this component can submit, so a printed QR code
 * keeps resolving to the same place after the PDF behind it changes.
 * No file upload yet (no storage backend connected): the interim path is a
 * PDF URL field, which is honest today and extends cleanly to a real
 * uploader once Cloudflare R2 is wired in.
 */
export default function ReplacePdfModal({ isOpen, doc, onClose, onConfirm }: ReplacePdfModalProps) {
  const [newPdfUrl, setNewPdfUrl] = useState("");
  const [reason, setReason] = useState<PdfHistoryEntry["reason"]>(undefined);

  if (!isOpen) return null;

  function handleConfirm() {
    const trimmed = newPdfUrl.trim();
    if (!trimmed) return;
    onConfirm(trimmed, reason);
    setNewPdfUrl("");
    setReason(undefined);
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="w-full max-w-lg rounded-xl border border-slate-800 bg-slate-900 p-6 shadow-xl shadow-black/40">
        <div className="mb-4 flex items-center gap-2">
          <div className="rounded-lg bg-blue-600/10 p-2">
            <FileUp className="h-5 w-5 text-blue-500" />
          </div>
          <h2 className="text-base font-semibold text-white">Replace PDF</h2>
        </div>

        <div className="mb-4 space-y-3 rounded-lg border border-slate-800 bg-slate-950 p-4 text-sm">
          <div>
            <span className="text-slate-500">Current PDF</span>
            <p className="truncate text-slate-300">{doc.pdfUrl ?? "Not set"}</p>
          </div>
          <div>
            <span className="text-slate-500">New PDF</span>
            <p className="truncate text-white">{newPdfUrl || "—"}</p>
          </div>
        </div>

        <label className="mb-1.5 block text-sm font-medium text-slate-300" htmlFor="new-pdf-url">
          New PDF URL
        </label>
        <input
          id="new-pdf-url"
          type="url"
          autoFocus
          value={newPdfUrl}
          onChange={(event) => setNewPdfUrl(event.target.value)}
          placeholder="https://cdn.cellgenic.com/pdfs/..."
          className="mb-4 w-full rounded-lg border border-slate-800 bg-slate-900 py-2 px-3 text-sm text-white placeholder:text-slate-500 focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600"
        />

        <span className="mb-1.5 block text-sm font-medium text-slate-300">Reason (optional)</span>
        <div className="mb-6 space-y-2">
          {REASONS.map((option) => (
            <label
              key={option.value}
              className="flex items-start gap-2 rounded-lg border border-slate-800 p-3 text-sm text-slate-300 hover:bg-slate-800/40"
            >
              <input
                type="radio"
                name="reason"
                checked={reason === option.value}
                onChange={() => setReason(option.value)}
                className="mt-0.5 h-4 w-4 border-slate-700 bg-slate-900 text-blue-600 focus:ring-blue-600"
              />
              {option.label}
            </label>
          ))}
        </div>

        <p className="mb-6 text-xs text-slate-500">
          The QR URL ({doc.qrUrl ?? "not set"}) and Public URL ({doc.publicUrl ?? "not set"}) will not
          change. The current PDF will be kept in this document&apos;s history.
        </p>

        <div className="flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg px-4 py-2 text-sm font-medium text-slate-400 hover:text-white"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={!newPdfUrl.trim()}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Confirm replacement
          </button>
        </div>
      </div>
    </div>
  );
}
