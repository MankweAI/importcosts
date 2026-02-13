import { LandedPageFrame } from "@/components/landed/LandedPageFrame";
import { SavedDealPage } from "@/components/landed/SavedDealPage";

interface DealPageProps {
  params: Promise<{ dealId: string }>;
}

export default async function DealPage({ params }: DealPageProps) {
  const { dealId } = await params;
  return (
    <LandedPageFrame>
      <SavedDealPage dealId={dealId} />
    </LandedPageFrame>
  );
}
