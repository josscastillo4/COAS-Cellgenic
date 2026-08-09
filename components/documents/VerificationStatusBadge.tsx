import type { VerificationStatus } from "@/types/document";
import Badge, { type BadgeTone } from "@/components/documents/Badge";

interface VerificationStatusBadgeProps {
  verificationStatus?: VerificationStatus;
}

/**
 * Pill for the real, automatically-calculated verification state. Never
 * manually assigned — set only by services/verificationService.ts via
 * hooks/useVerificationRunner.ts. Distinct from `updateRequired` (the raw
 * Excel flag) and `status` (Active/Archived/Draft lifecycle).
 */
const VERIFICATION_TONE: Record<VerificationStatus, BadgeTone> = {
  "Pending verification": "neutral",
  Verifying: "neutral",
  "Up to date": "success",
  "Update required": "danger",
  "Verification failed": "warning",
};

export default function VerificationStatusBadge({
  verificationStatus = "Pending verification",
}: VerificationStatusBadgeProps) {
  return <Badge tone={VERIFICATION_TONE[verificationStatus]} label={verificationStatus} />;
}
