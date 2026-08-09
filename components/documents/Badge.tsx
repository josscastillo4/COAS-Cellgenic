import { cn } from "@/lib/utils";

export type BadgeTone = "success" | "warning" | "danger" | "neutral";

const TONE_STYLES: Record<BadgeTone, string> = {
  success: "bg-emerald-500/10 text-emerald-400 ring-1 ring-inset ring-emerald-500/20",
  warning: "bg-amber-500/10 text-amber-400 ring-1 ring-inset ring-amber-500/20",
  danger: "bg-red-500/10 text-red-400 ring-1 ring-inset ring-red-500/20",
  neutral: "bg-slate-500/10 text-slate-400 ring-1 ring-inset ring-slate-500/20",
};

interface BadgeProps {
  tone: BadgeTone;
  label: string;
}

/**
 * Generic color-coded pill. Shared base for every status-like indicator in
 * the Documents module (lifecycle status, update-required, verification
 * status) so the pill markup/styling only has to be tuned in one place.
 */
export default function Badge({ tone, label }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        TONE_STYLES[tone]
      )}
    >
      {label}
    </span>
  );
}
