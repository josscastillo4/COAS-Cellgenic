import type { DocumentStatus } from "@/types/document";
import { cn } from "@/lib/utils";

interface StatusBadgeProps {
  status: DocumentStatus;
}

/**
 * Small color-coded pill for a document's status.
 * Centralizing the color map here means every table/card that shows a
 * status stays visually consistent, and the palette only has to be tuned
 * in one place.
 */
const STATUS_STYLES: Record<DocumentStatus, string> = {
  Active: "bg-emerald-500/10 text-emerald-400 ring-1 ring-inset ring-emerald-500/20",
  Archived: "bg-slate-500/10 text-slate-400 ring-1 ring-inset ring-slate-500/20",
  Draft: "bg-amber-500/10 text-amber-400 ring-1 ring-inset ring-amber-500/20",
};

export default function StatusBadge({ status }: StatusBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        STATUS_STYLES[status]
      )}
    >
      {status}
    </span>
  );
}
