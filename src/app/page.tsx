import { auth } from "@clerk/nextjs/server";
import { MarketingHome } from "@/components/home/MarketingHome";
import { DashboardOverview } from "@/components/dashboard/DashboardOverview";
import { UserWorkspaceLayout } from "@/components/layout/UserWorkspaceLayout";

export default async function HomePage() {
  const { userId } = await auth();

  if (userId) {
    return (
      <UserWorkspaceLayout>
        <DashboardOverview userId={userId} />
      </UserWorkspaceLayout>
    );
  }

  return <MarketingHome />;
}
