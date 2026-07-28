import { FileText, Package, Users, AlertCircle } from "lucide-react";
import PageContainer from "@/components/PageContainer";
import StatCard from "@/components/StatCard";
import EmptyStateCard from "@/components/EmptyStateCard";

export default function DashboardPage() {
  return (
    <PageContainer
      title="Dashboard"
      description="Overview of Certificates of Analysis across all Cellgenic products."
    >
      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total COAs" value="0" icon={FileText} />
        <StatCard label="Products" value="0" icon={Package} />
        <StatCard label="Users" value="0" icon={Users} />
        <StatCard label="Pending Review" value="0" icon={AlertCircle} />
      </div>

      <EmptyStateCard
        icon={FileText}
        title="No data yet"
        description="Once COAs, products, and users are connected, dashboard metrics will appear here."
      />
    </PageContainer>
  );
}
