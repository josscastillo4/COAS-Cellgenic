import type { ProductDocument } from "@/types/document";
import StatusBadge from "@/components/documents/StatusBadge";
import DocumentActionsMenu from "@/components/documents/DocumentActionsMenu";

interface DocumentsTableProps {
  documents: ProductDocument[];
}

/**
 * Formats an ISO date string (YYYY-MM-DD) as e.g. "Jul 24, 2026".
 * Kept local to this component since no other module needs it yet.
 */
function formatDate(iso: string): string {
  return new Date(`${iso}T00:00:00`).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

/**
 * Renders the Documents table itself: header row + one row per document.
 * Takes an already-filtered list, so it has no knowledge of search/filter
 * state — that logic stays in the parent page.
 */
export default function DocumentsTable({ documents }: DocumentsTableProps) {
  return (
    <div className="overflow-hidden rounded-xl border border-slate-800 bg-slate-900">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[860px] text-left text-sm">
          <thead>
            <tr className="border-b border-slate-800 text-xs uppercase tracking-wide text-slate-400">
              <th className="px-4 py-3 font-medium">Document Name</th>
              <th className="px-4 py-3 font-medium">Type</th>
              <th className="px-4 py-3 font-medium">Product</th>
              <th className="px-4 py-3 font-medium">Version</th>
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
                <td className="px-4 py-3 text-slate-300">{doc.product}</td>
                <td className="px-4 py-3 text-slate-300">{doc.version}</td>
                <td className="px-4 py-3">
                  <StatusBadge status={doc.status} />
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-slate-400">
                  {formatDate(doc.updated)}
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex justify-end">
                    <DocumentActionsMenu documentName={doc.name} />
                  </div>
                </td>
              </tr>
            ))}

            {documents.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-10 text-center text-slate-400">
                  No documents match your search or filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
