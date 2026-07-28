import type { LucideIcon } from "lucide-react";

/**
 * Represents a single item in the primary application navigation (Sidebar).
 * Kept generic on purpose so future routes (e.g. nested COA detail pages)
 * can reuse the same shape without modification.
 */
export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
}
