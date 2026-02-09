import { PageShell } from "@/components/pseo/PageShell";
import { ContextHero } from "@/components/pseo/ContextHero";
import { ModeEntryCards } from "@/components/pseo/ModeEntryCards";
import { ResultsPanel } from "@/components/pseo/ResultsPanel";
import { StickyActionBar } from "@/components/pseo/StickyActionBar";
import { RelatedLinksFooter } from "@/components/pseo/RelatedLinksFooter";
import { ModePanelWrapper } from "@/components/pseo/ModePanelWrapper";
import { RouteContext } from "@/types/pseo";
import { Metadata } from "next";

// Wrapper component to handle client-side store logic for mode switching
// We can't use store directly in server component for rendering, but we can pass initial state if needed.
// Actually, it's better to make the ModePanel a client component that reads from store.

interface PageProps {
    params: Promise<{
        clusterSlug: string;
        originIso: string;
    }>;
}

export async function generateMetadata(
    { params }: PageProps
): Promise<Metadata> {
    const resolvedParams = await params;
    const { clusterSlug, originIso } = resolvedParams;
    const productName = clusterSlug.replace(/-/g, " "); // Simple formatting

    return {
        title: `Import Duty & VAT for ${productName} from ${originIso} to South Africa`,
        description: `Calculate accurate landed cost for importing ${productName} from ${originIso} to South Africa. Includes customs duties, VAT, and complex tariff codes.`,
    }
}

export default async function ProductOriginPage({ params }: PageProps) {
    const resolvedParams = await params;
    const { clusterSlug, originIso } = resolvedParams;

    const routeContext: RouteContext = {
        clusterSlug,
        hs6: null,
        originIso: originIso.toUpperCase(),
        destinationIso: "ZA",
        pageType: "product_origin_money_page"
    };

    // Logic to determine indexability (Mocked for now)
    const isIndexable = true;

    return (
        <PageShell
            routeContext={routeContext}
            isIndexable={isIndexable}
            canonicalUrl={`https://importcosts.co.za/import-duty-vat-landed-cost/${clusterSlug}/from/${originIso}/to/south-africa`}
            title={`Import Cost: ${clusterSlug} from ${originIso}`} // Fallback props

        >
            <ContextHero
                title={`Import Duty & VAT: ${clusterSlug.replace(/-/g, ' ')} from ${originIso}`}
                subtitle="Calculate accurate landed costs including Customs Duty, VAT, and Freight in seconds."
                routeContext={routeContext}
            />

            <ModeEntryCards />

            {/* 
        This section needs to be client-side dynamic. 
        I'll create a 'ModePanelWrapper.tsx' to handle `usePSEOCalculatorStore` and render the correct panel. 
      */}
            <ModePanelWrapper />

            <ResultsPanel />

            <RelatedLinksFooter />

            <StickyActionBar />
        </PageShell>
    );
}
