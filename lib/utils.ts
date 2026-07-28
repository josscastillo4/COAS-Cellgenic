/**
 * Lightweight className combiner (no external libs like clsx/tailwind-merge
 * are installed, so we keep this dependency-free).
 * Filters out falsy values and joins the rest with a space.
 */
export function cn(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(" ");
}
