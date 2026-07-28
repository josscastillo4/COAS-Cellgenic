import type { LucideIcon } from "lucide-react";

interface EmptyStateCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
}

/**
 * Consistent "nothing here yet" card shown on every placeholder route.
 * Once real data/business logic is added, individual pages will replace
 * this with actual lists/tables and only fall back to this when empty.
 */
export default function EmptyStateCard({
  icon: Icon,
  title,
  description,
}: EmptyStateCardProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-800 bg-slate-900 px-6 py-16 text-center">
      <div className="mb-4 rounded-full bg-slate-800 p-3">
        <Icon className="h-6 w-6 text-slate-400" />
      </div>
      <h3 className="text-base font-medium text-white">{title}</h3>
      <p className="mt-1 max-w-sm text-sm text-slate-400">{description}</p>
    </div>
  );
}
