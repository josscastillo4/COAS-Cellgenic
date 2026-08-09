import type { DocumentStatus } from "@/types/document";
import Badge, { type BadgeTone } from "@/components/documents/Badge";

interface StatusBadgeProps {
  status: DocumentStatus;
}

/**
 * Pill for a document's lifecycle status (Active/Archived/Draft).
 * Independent of updateRequired/verificationStatus — this only reflects
 * whether the document is published, archived, or still a draft.
 */
const STATUS_TONE: Record<DocumentStatus, BadgeTone> = {
  Active: "success",
  Archived: "neutral",
  Draft: "warning",
};

export default function StatusBadge({ status }: StatusBadgeProps) {
  return <Badge tone={STATUS_TONE[status]} label={status} />;
}
