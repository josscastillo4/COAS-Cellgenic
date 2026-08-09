import type { ImportRow, ImportRowStatus, ImportSummary } from "@/types/import";
import Badge, { type BadgeTone } from "@/components/documents/Badge";

interface ImportPreviewTableProps {
  rows: ImportRow[];
  summary: ImportSummary;
}

const PREVIEW_LIMIT = 50;

const STATUS_TONE: Record<ImportRowStatus, BadgeTone> = {
  valid: "success",
  invalid: "danger",
  duplicate: "neutral",
};

const STATUS_LABEL: Record<ImportRowStatus, string> = {
  valid: "Valid",
  invalid: "Invalid",
  duplicate: "Duplicate",
};

/**
 * Summary counts always reflect the entire file; the rendered table caps at
 * the first PREVIEW_LIMIT rows for scannability. Nothing here is saved —
 * this is purely a preview before the user confirms the import.
 */
export default function ImportPreviewTable({ rows, summary }: ImportPreviewTableProps) {
  const previewRows = rows.slice(0, PREVIEW_LIMIT);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <SummaryStat label="Total Rows" value={summary.totalRows} />
        <SummaryStat label="Valid" value={summary.validRows} tone="text-emerald-400" />
        <SummaryStat label="Invalid" value={summary.invalidRows} tone="text-red-400" />
        <SummaryStat label="Duplicates" value={summary.duplicateRows} tone="text-slate-400" />
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-800 bg-slate-900">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-left text-sm">
            <thead>
              <tr className="border-b border-slate-800 text-xs uppercase tracking-wide text-slate-400">
                <th className="px-4 py-3 font-medium">Row</th>
                <th className="px-4 py-3 font-medium">Document Name</th>
                <th className="px-4 py-3 font-medium">Public URL</th>
                <th className="px-4 py-3 font-medium">Published Year</th>
                <th className="px-4 py-3 font-medium">Lot Number</th>
                <th className="px-4 py-3 font-medium">QR URL</th>
                <th className="px-4 py-3 font-medium">Update Required</th>
                <th className="px-4 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {previewRows.map((row) => (
                <tr key={row.rowNumber} className="align-top">
                  <td className="px-4 py-3 text-slate-400">{row.rowNumber}</td>
                  <td className="px-4 py-3 text-white">{row.input.name || "—"}</td>
                  <td className="max-w-[220px] truncate px-4 py-3 text-slate-300">
                    {row.input.publicUrl || "—"}
                  </td>
                  <td className="px-4 py-3 text-slate-300">{row.input.publishedYear ?? "—"}</td>
                  <td className="px-4 py-3 text-slate-300">{row.input.lotNumber || "—"}</td>
                  <td className="max-w-[180px] truncate px-4 py-3 text-slate-300">
                    {row.input.qrUrl || "—"}
                  </td>
                  <td className="px-4 py-3 text-slate-300">{row.input.updateRequired ? "Yes" : "No"}</td>
                  <td className="px-4 py-3">
                    <Badge tone={STATUS_TONE[row.status]} label={STATUS_LABEL[row.status]} />
                    {row.errors.length > 0 && (
                      <ul className="mt-1 space-y-0.5 text-xs text-red-400">
                        {row.errors.map((error) => (
                          <li key={error}>{error}</li>
                        ))}
                      </ul>
                    )}
                  </td>
                </tr>
              ))}

              {rows.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-4 py-10 text-center text-slate-400">
                    No rows found in this file.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {rows.length > PREVIEW_LIMIT && (
        <p className="text-xs text-slate-500">
          Showing {PREVIEW_LIMIT} of {rows.length} rows. All {rows.length} rows were validated —
          the counts above reflect the entire file.
        </p>
      )}
    </div>
  );
}

function SummaryStat({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone?: string;
}) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900 p-4">
      <span className="text-xs font-medium text-slate-400">{label}</span>
      <p className={`mt-1 text-2xl font-semibold ${tone ?? "text-white"}`}>{value}</p>
    </div>
  );
}
