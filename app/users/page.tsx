import { Users } from "lucide-react";
import PageContainer from "@/components/PageContainer";
import EmptyStateCard from "@/components/EmptyStateCard";

export default function UsersPage() {
  return (
    <PageContainer
      title="Users"
      description="Manage team members and their access to the COA Manager."
    >
      <EmptyStateCard
        icon={Users}
        title="No users yet"
        description="User management will be available once authentication is added."
      />
    </PageContainer>
  );
}
