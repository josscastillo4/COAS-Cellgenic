/**
 * Lightweight className combiner (no external libs like clsx/tailwind-merge
 * are installed, so we keep this dependency-free).
 * Filters out falsy values and joins the rest with a space.
 */
export function cn(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(" ");
}

/**
 * Formats an ISO date string (YYYY-MM-DD or full ISO timestamp) as e.g. "Jul 24, 2026".
 * Shared by every Documents view that displays a date so formatting stays consistent.
 */
export function formatDate(iso: string): string {
  const date = iso.length <= 10 ? new Date(`${iso}T00:00:00`) : new Date(iso);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

/**
 * Slugifies a document name into a URL-friendly slug, e.g.
 * "Certificate of Analysis - Lot 4821" -> "certificate-of-analysis-lot-4821".
 * Used to suggest a default `slug` when one isn't supplied.
 */
export function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
