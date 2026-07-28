import { FileText } from "lucide-react";
import PageContainer from "@/components/PageContainer";
import EmptyStateCard from "@/components/EmptyStateCard";

export default function CoasPage() {
  return (
    <PageContainer
      title="Certificates of Analysis"
      description="View, upload, and manage COAs for every Cellgenic product batch."
    >
      <EmptyStateCard
        icon={FileText}
        title="No COAs yet"
        description="Uploaded Certificates of Analysis will be listed here once the feature is built."
      />
    </PageContainer>
  );
}
