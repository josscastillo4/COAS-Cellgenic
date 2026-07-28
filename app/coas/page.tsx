import { redirect } from "next/navigation";

/**
 * The "COAs" section was renamed to "Documents" (see /app/documents).
 * This route is kept only so old links/bookmarks to /coas don't 404 —
 * it immediately redirects to the new Documents module.
 */
export default function CoasPage() {
  redirect("/documents");
}
