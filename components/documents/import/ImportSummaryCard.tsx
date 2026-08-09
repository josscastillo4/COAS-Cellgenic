import { CheckCircle2 } from "lucide-react";

interface ImportSummaryCardProps {
  imported: number;
  duplicates: number;
  errors: number;
  onImportAnother: () => void;
  onViewDocuments: () => void;
}

/**
 * Shown once the user has confirmed the import. Skipped = duplicates +
 * errors, since only rows still marked "valid" at confirm time get imported.
 */
export default function ImportSummaryCard({
  imported,
  duplicates,
  errors,
  onImportAnother,
  onViewDocuments,
}: ImportSummaryCardProps) {
  const skipped = duplicates + errors;

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900 p-8 text-center">
      <div className="mx-auto mb-4 w-fit rounded-full bg-emerald-500/10 p-3">
        <CheckCircle2 className="h-6 w-6 text-emerald-400" />
      </div>
      <h2 className="text-base font-medium text-white">Import complete</h2>

      <div className="mx-auto mt-6 grid max-w-md grid-cols-2 gap-4 sm:grid-cols-4">
        <Stat label="Imported" value={imported} tone="text-emerald-400" />
        <Stat label="Skipped" value={skipped} tone="text-slate-300" />
        <Stat label="Errors" value={errors} tone="text-red-400" />
        <Stat label="Duplicates" value={duplicates} tone="text-slate-400" />
      </div>

      <div className="mt-8 flex items-center justify-center gap-3">
        <button
          type="button"
          onClick={onImportAnother}
          className="rounded-lg border border-slate-700 px-4 py-2 text-sm font-medium text-slate-200 transition-colors hover:bg-slate-800"
        >
          Import another file
        </button>
        <button
          type="button"
          onClick={onViewDocuments}
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-500"
        >
          View Documents
        </button>
      </div>
    </div>
  );
}

function Stat({ label, value, tone }: { label: string; value: number; tone: string }) {
  return (
    <div>
      <p className={`text-2xl font-semibold ${tone}`}>{value}</p>
      <span className="text-xs text-slate-400">{label}</span>
    </div>
  );
}
