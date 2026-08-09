import Badge from "@/components/documents/Badge";

interface UpdateRequiredBadgeProps {
  updateRequired?: boolean;
}

/**
 * Pill for the raw "ACTUALIZAR PDF" (SI/NO) flag imported from Excel.
 * Independent of `status` and `verificationStatus` — this only says whether
 * Marketing has flagged the document as needing attention, not why.
 */
export default function UpdateRequiredBadge({ updateRequired }: UpdateRequiredBadgeProps) {
  return updateRequired ? (
    <Badge tone="warning" label="Update required" />
  ) : (
    <Badge tone="success" label="Up to date" />
  );
}
