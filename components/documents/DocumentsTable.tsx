"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { PdfHistoryEntry, ProductDocument } from "@/types/document";
import { formatDate } from "@/lib/utils";
import StatusBadge from "@/components/documents/StatusBadge";
import UpdateRequiredBadge from "@/components/documents/UpdateRequiredBadge";
import VerificationStatusBadge from "@/components/documents/VerificationStatusBadge";
import DocumentActionsMenu from "@/components/documents/DocumentActionsMenu";
import ReplacePdfModal from "@/components/documents/ReplacePdfModal";

interface DocumentsTableProps {
  documents: ProductDocument[];
  onReplacePdf: (id: string, newPdfUrl: string, reason?: PdfHistoryEntry["reason"]) => void;
}

/**
 * Renders the Documents table itself: header row + one row per document.
 * Takes an already-filtered list, so it has no knowledge of search/filter
 * state — that logic stays in the parent page. Owns the Replace PDF modal
 * state locally since it's triggered per-row from the actions menu.
 */
export default function DocumentsTable({ documents, onReplacePdf }: DocumentsTableProps) {
  const router = useRouter();
  const [replaceTarget, setReplaceTarget] = useState<ProductDocument | null>(null);

  return (
    <div className="overflow-hidden rounded-xl border border-slate-800 bg-slate-900">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[1100px] text-left text-sm">
          <thead>
            <tr className="border-b border-slate-800 text-xs uppercase tracking-wide text-slate-400">
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
                <td className="px-4 py-3 font-medium text-white">{doc.name}</td>
                <td className="px-4 py-3 text-slate-300">{doc.type}</td>
                <td className="px-4 py-3 text-slate-300">{doc.lotNumber ?? "—"}</td>
                <td className="px-4 py-3 text-slate-300">{doc.publishedYear ?? "—"}</td>
                <td className="px-4 py-3">
                  <UpdateRequiredBadge updateRequired={doc.updateRequired} />
                </td>
                <td className="px-4 py-3">
                  <VerificationStatusBadge verificationStatus={doc.verificationStatus} />
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
                    />
                  </div>
                </td>
              </tr>
            ))}

            {documents.length === 0 && (
              <tr>
                <td colSpan={9} className="px-4 py-10 text-center text-slate-400">
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
