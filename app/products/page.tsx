import { Package } from "lucide-react";
import PageContainer from "@/components/PageContainer";
import EmptyStateCard from "@/components/EmptyStateCard";

export default function ProductsPage() {
  return (
    <PageContainer
      title="Products"
      description="Manage the Cellgenic product catalog that COAs are linked to."
    >
      <EmptyStateCard
        icon={Package}
        title="No products yet"
        description="Products will appear here once the catalog is connected."
      />
    </PageContainer>
  );
}
