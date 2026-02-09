import { PageShell } from "@/components/pseo/PageShell";
import { ContextHero } from "@/components/pseo/ContextHero";
import { ModeEntryCards } from "@/components/pseo/ModeEntryCards";
import { ResultsPanel } from "@/components/pseo/ResultsPanel";
import { StickyActionBar } from "@/components/pseo/StickyActionBar";
import { RelatedLinksFooter } from "@/components/pseo/RelatedLinksFooter";
import { ModePanelWrapper } from "@/components/pseo/ModePanelWrapper";
import { RouteContext } from "@/types/pseo";
import { Metadata } from "next";

interface PageProps {
    params: Promise<{
        hs6: string;
        originIso: string;
    }>;
}

export async function generateMetadata(
    { params }: PageProps
): Promise<Metadata> {
    const resolvedParams = await params;
    const { hs6, originIso } = resolvedParams;

    return {
        title: `Import Duty for HS Code ${hs6} from ${originIso}`,
        description: `Calculate landed cost for HS Code ${hs6} imports from ${originIso} to South Africa. Check accurate duty rates and VAT.`,
    }
}

export default async function HSOriginPage({ params }: PageProps) {
    const resolvedParams = await params;
    const { hs6, originIso } = resolvedParams;

    const routeContext: RouteContext = {
        clusterSlug: null,
        hs6: hs6,
        originIso: originIso.toUpperCase(),
        destinationIso: "ZA",
        pageType: "hs_origin_money_page"
    };

    const isIndexable = true;

    return (
        <PageShell
            routeContext={routeContext}
            isIndexable={isIndexable}
            canonicalUrl={`https://importcosts.co.za/import-duty-vat-landed-cost/hs/${hs6}/from/${originIso}/to/south-africa`}
            title={`Import Cost: HS ${hs6} from ${originIso}`}

        >
            <ContextHero
                title={`Import Duty: HS ${hs6} from ${originIso}`}
                subtitle="Professional landed cost calculator for this specific Harmonized System code."
                routeContext={routeContext}
            />

            <ModeEntryCards />

            <ModePanelWrapper />

            <ResultsPanel />

            <RelatedLinksFooter />

            <StickyActionBar />
        </PageShell>
    );
}
