import type { VerificationStatus } from "@/types/document";
import Badge, { type BadgeTone } from "@/components/documents/Badge";

interface VerificationStatusBadgeProps {
  verificationStatus?: VerificationStatus;
}

/**
 * Pill for whether the currently published PDF matches what the QR/document
 * should show. "Mismatch" = the QR currently serves the wrong PDF.
 * "Outdated" = the PDF is correct but a newer version exists. Distinct from
 * `updateRequired`, which only flags that *something* needs attention.
 */
const VERIFICATION_TONE: Record<VerificationStatus, BadgeTone> = {
  Verified: "success",
  Outdated: "warning",
  Mismatch: "danger",
  Unverified: "neutral",
};

export default function VerificationStatusBadge({
  verificationStatus = "Unverified",
}: VerificationStatusBadgeProps) {
  return <Badge tone={VERIFICATION_TONE[verificationStatus]} label={verificationStatus} />;
}
