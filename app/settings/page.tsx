import { Settings } from "lucide-react";
import PageContainer from "@/components/PageContainer";
import EmptyStateCard from "@/components/EmptyStateCard";

export default function SettingsPage() {
  return (
    <PageContainer
      title="Settings"
      description="Configure application preferences and integrations."
    >
      <EmptyStateCard
        icon={Settings}
        title="No settings configured"
        description="Application, storage, and WordPress integration settings will live here."
      />
    </PageContainer>
  );
}
