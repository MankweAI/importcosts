import { PageShell } from "@/components/pseo/PageShell";
import { SEOPageHeader } from "@/components/pseo/SEOPageHeader";
import { ResultsPanel } from "@/components/pseo/ResultsPanel";
import { FAQSection } from "@/components/pseo/FAQSection";
import { InternalLinksGrid } from "@/components/pseo/InternalLinksGrid";
import { JsonLdSchema } from "@/components/pseo/JsonLdSchema";
import { RouteContext, CalculationResult } from "@/types/pseo";
import { StoreHydrator } from "@/components/pseo/StoreHydrator";
import { Metadata } from "next";
import { generateFAQs, getCountryName } from "@/lib/seo/faqData";
import { getRelatedPages } from "@/lib/seo/interlinking.service";

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || "https://importcosts.co.za";

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
    const productName = clusterSlug.replace(/-/g, " ");
    const originName = getCountryName(originIso);
    const canonicalUrl = `${BASE_URL}/import-duty-vat-landed-cost/${clusterSlug}/from/${originIso.toLowerCase()}/to/south-africa`;

    const title = `Import Duty & VAT for ${productName} from ${originName} to South Africa | ImportCosts`;
    const description = `Calculate the exact landed cost for importing ${productName} from ${originName} to South Africa. Instant customs duty rates, 15% VAT, freight estimates, and preferential trade agreement checks using the latest SARS tariff schedule.`;

    return {
        title,
        description,
        alternates: {
            canonical: canonicalUrl,
        },
        robots: "index, follow",
        openGraph: {
            title,
            description,
            url: canonicalUrl,
            siteName: "ImportCosts",
            type: "website",
            locale: "en_ZA",
        },
        other: {
            "geo.region": "ZA",
        },
    };
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

    // ─── SSR: Resolve Cluster → HS Code → Default Calculation ───
    const { getClusterWithHsCodes } = await import("@/lib/db/services/productCluster.service");
    const { calculateLandedCost } = await import("@/lib/calc/landedCost");

    // 1. Resolve the cluster slug to its best HS code
    const cluster = await getClusterWithHsCodes(clusterSlug);
    const bestHsMap = cluster?.hsMaps?.[0]; // Ordered by confidence DESC
    const bestHs6 = bestHsMap?.hsCode?.hs6;

    // 2. Build default inputs for a R10,000 scenario
    const defaultInputs = {
        hsCode: bestHs6 || "87032390", // Fallback to a known vehicle code
        customsValue: 10000,
        invoiceValue: 10000,
        exchangeRate: 1,
        currency: "ZAR",
        originCountry: originIso.toUpperCase(),
        destinationCountry: "ZA",
        importerType: "VAT_REGISTERED" as const,
        freightCost: 1500,
        insuranceCost: 50,
        freightInsuranceCost: 1550,
        otherCharges: 0,
        quantity: 1,
        incoterm: "FOB" as const,
        usedGoods: false,
    };

    // 3. Run the calculation server-side
    let ssrResult: CalculationResult | undefined = undefined;
    if (bestHs6) {
        try {
            const rawResult = await calculateLandedCost(defaultInputs, "ssr-pseo");

            ssrResult = {
                summary: {
                    total_taxes_zar: rawResult.breakdown
                        .filter(i => ["duty", "vat", "excise"].includes(i.id))
                        .reduce((sum, i) => sum + i.amount, 0),
                    total_landed_cost_zar: rawResult.landedCostTotal,
                    landed_cost_per_unit_zar: rawResult.landedCostPerUnit || rawResult.landedCostTotal,
                    origin_country: originIso.toUpperCase(),
                },
                hs: {
                    confidence_score: (bestHsMap?.confidence || 50) / 100,
                    confidence_bucket: (bestHsMap?.confidence || 50) >= 80 ? "high" : "medium",
                    alternatives: [],
                },
                tariff: {
                    version: rawResult.tariffVersionLabel,
                    effective_date: rawResult.tariffVersionEffectiveFrom || new Date().toISOString(),
                    last_updated: new Date().toISOString(),
                },
                line_items: rawResult.breakdown.map(item => ({
                    key: item.id,
                    label: item.label,
                    amount_zar: item.amount,
                    audit: {
                        formula: item.formula || "",
                        inputs_used: {},
                        rates: { rate: item.rateApplied },
                        tariff_version: rawResult.tariffVersionId,
                    },
                })),
                doc_checklist: {
                    always: [
                        { title: "Commercial Invoice", why: "Proof of value for customs." },
                        { title: "Bill of Lading / Airway Bill", why: "Proof of shipment contract." },
                        { title: "SAD500", why: "Customs declaration form." },
                    ],
                    common: [],
                    conditional: rawResult.preference_decision?.proof_checklist?.map((p: string) => ({
                        title: p,
                        why: "Required for Preferential Rate",
                        trigger: "Preference Claimed",
                    })) || [],
                },
                risk_flags: [],
                compliance_risks: rawResult.compliance_risks,
                preference_decision: rawResult.preference_decision,
            };
        } catch (e) {
            console.error("SSR Calculation Failed for cluster:", clusterSlug, e);
        }
    }

    // ─── SEO Data ───
    const productName = clusterSlug.replace(/-/g, " ");
    const originCountryName = getCountryName(originIso);
    const canonicalUrl = `${BASE_URL}/import-duty-vat-landed-cost/${clusterSlug}/from/${originIso.toLowerCase()}/to/south-africa`;

    // Generate FAQs from route context + SSR result
    const faqs = generateFAQs(routeContext, ssrResult);

    // Fetch related pages for interlinking (gracefully returns empty if no data)
    const relatedPages = await getRelatedPages(routeContext);

    return (
        <PageShell
            routeContext={routeContext}
            isIndexable={true}
            canonicalUrl={canonicalUrl}
            title={`Import Cost: ${productName} from ${originIso}`}
        >
            <JsonLdSchema
                routeContext={routeContext}
                result={ssrResult}
                faqs={faqs}
                canonicalUrl={canonicalUrl}
                productName={productName}
                originCountryName={originCountryName}
            />

            <SEOPageHeader
                routeContext={routeContext}
                productName={productName}
                originCountryName={originCountryName}
                tariffVersionLabel={ssrResult?.tariff?.version}
                bestHs6={bestHs6}
            />

            <StoreHydrator initialResult={ssrResult} initialInputs={defaultInputs} />
            <ResultsPanel />
            <InternalLinksGrid
                data={relatedPages}
                originCountryName={originCountryName}
                productName={productName}
            />

            <FAQSection faqs={faqs} productName={productName} />

        </PageShell>
    );
}
