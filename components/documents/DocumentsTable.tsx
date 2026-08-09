"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { PdfHistoryEntry, ProductDocument, VerificationFieldSnapshot } from "@/types/document";
import { formatDate } from "@/lib/utils";
import StatusBadge from "@/components/documents/StatusBadge";
import UpdateRequiredBadge from "@/components/documents/UpdateRequiredBadge";
import VerificationStatusBadge from "@/components/documents/VerificationStatusBadge";
import DocumentActionsMenu from "@/components/documents/DocumentActionsMenu";
import ReplacePdfModal from "@/components/documents/ReplacePdfModal";

interface DocumentsTableProps {
  documents: ProductDocument[];
  selectedIds: Set<string>;
  onToggleRow: (id: string) => void;
  onToggleAll: () => void;
  onReplacePdf: (id: string, newPdfUrl: string, reason?: PdfHistoryEntry["reason"]) => void;
  onVerify: (id: string) => void;
}

const MISMATCH_FIELD_LABELS: Record<keyof VerificationFieldSnapshot, string> = {
  name: "Name",
  publishedYear: "Year",
  lotNumber: "Lot",
  mg: "MG",
};

/**
 * Renders the Documents table itself: header row + one row per document.
 * Takes an already-filtered list, so it has no knowledge of search/filter
 * state — that logic stays in the parent page. Selection state is also
 * owned by the parent (bulk Verify/Delete actions live in its toolbar), so
 * this only reports toggles up. Owns the Replace PDF modal state locally
 * since it's triggered per-row from the actions menu.
 */
export default function DocumentsTable({
  documents,
  selectedIds,
  onToggleRow,
  onToggleAll,
  onReplacePdf,
  onVerify,
}: DocumentsTableProps) {
  const router = useRouter();
  const [replaceTarget, setReplaceTarget] = useState<ProductDocument | null>(null);

  const allSelected = documents.length > 0 && documents.every((doc) => selectedIds.has(doc.id));

  return (
    <div className="overflow-hidden rounded-xl border border-slate-800 bg-slate-900">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[1200px] text-left text-sm">
          <thead>
            <tr className="border-b border-slate-800 text-xs uppercase tracking-wide text-slate-400">
              <th className="w-10 px-4 py-3">
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={onToggleAll}
                  aria-label="Select all documents"
                  className="h-4 w-4 rounded border-slate-700 bg-slate-900 text-blue-600 focus:ring-blue-600"
                />
              </th>
              <th className="px-4 py-3 font-medium">Document Name</th>
              <th className="px-4 py-3 font-medium">Type</th>
              <th className="px-4 py-3 font-medium">Lot Number</th>
              <th className="px-4 py-3 font-medium">Published Year</th>
              <th className="px-4 py-3 font-medium">Update Required</th>
              <th className="px-4 py-3 font-medium">Verification</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Updated</th>
              <th className="px-4 py-3 text-right font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {documents.map((doc) => (
              <tr key={doc.id} className="transition-colors hover:bg-slate-800/40">
                <td className="px-4 py-3">
                  <input
                    type="checkbox"
                    checked={selectedIds.has(doc.id)}
                    onChange={() => onToggleRow(doc.id)}
                    aria-label={`Select ${doc.name}`}
                    className="h-4 w-4 rounded border-slate-700 bg-slate-900 text-blue-600 focus:ring-blue-600"
                  />
                </td>
                <td className="px-4 py-3 font-medium text-white">
                  {doc.publicUrl ? (
                    <a
                      href={doc.publicUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-blue-400 hover:underline"
                    >
                      {doc.name}
                    </a>
                  ) : (
                    doc.name
                  )}
                </td>
                <td className="px-4 py-3 text-slate-300">{doc.type}</td>
                <td className="px-4 py-3 text-slate-300">{doc.lotNumber ?? "—"}</td>
                <td className="px-4 py-3 text-slate-300">{doc.publishedYear ?? "—"}</td>
                <td className="px-4 py-3">
                  <UpdateRequiredBadge updateRequired={doc.updateRequired} />
                </td>
                <td className="px-4 py-3">
                  <VerificationStatusBadge verificationStatus={doc.verificationStatus} />
                  {doc.verificationResult?.mismatchedFields &&
                    doc.verificationResult.mismatchedFields.length > 0 && (
                      <p
                        className="mt-1 text-xs text-red-400"
                        title={`Mismatch: ${doc.verificationResult.mismatchedFields
                          .map((field) => MISMATCH_FIELD_LABELS[field])
                          .join(", ")}`}
                      >
                        {doc.verificationResult.mismatchedFields.length} field
                        {doc.verificationResult.mismatchedFields.length === 1 ? "" : "s"} mismatched
                      </p>
                    )}
                  {doc.verificationResult?.message && doc.verificationStatus === "Verification failed" && (
                    <p className="mt-1 max-w-[200px] truncate text-xs text-amber-400" title={doc.verificationResult.message}>
                      {doc.verificationResult.message}
                    </p>
                  )}
                </td>
                <td className="px-4 py-3">
                  <StatusBadge status={doc.status} />
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-slate-400">
                  {formatDate(doc.updatedAt)}
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex justify-end">
                    <DocumentActionsMenu
                      documentName={doc.name}
                      onView={() => router.push(`/documents/${doc.id}`)}
                      onEdit={() => router.push(`/documents/${doc.id}/edit`)}
                      onReplacePdf={() => setReplaceTarget(doc)}
                      onVerify={() => onVerify(doc.id)}
                    />
                  </div>
                </td>
              </tr>
            ))}

            {documents.length === 0 && (
              <tr>
                <td colSpan={10} className="px-4 py-10 text-center text-slate-400">
                  No documents match your search or filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {replaceTarget && (
        <ReplacePdfModal
          isOpen={Boolean(replaceTarget)}
          doc={replaceTarget}
          onClose={() => setReplaceTarget(null)}
          onConfirm={(newPdfUrl, reason) => onReplacePdf(replaceTarget.id, newPdfUrl, reason)}
        />
      )}
    </div>
  );
}
