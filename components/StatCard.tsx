import type { LucideIcon } from "lucide-react";

interface StatCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  /** Optional supporting text, e.g. "vs last month" (no logic, purely display). */
  hint?: string;
}

/**
 * Compact metric card used on the dashboard (and any future analytics views).
 * Purely presentational — no data fetching or business logic lives here.
 */
export default function StatCard({ label, value, icon: Icon, hint }: StatCardProps) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900 p-5">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-slate-400">{label}</span>
        <div className="rounded-lg bg-blue-600/10 p-2">
          <Icon className="h-5 w-5 text-blue-500" />
        </div>
      </div>
      <p className="mt-3 text-3xl font-semibold text-white">{value}</p>
      {hint && <p className="mt-1 text-xs text-slate-400">{hint}</p>}
    </div>
  );
}
