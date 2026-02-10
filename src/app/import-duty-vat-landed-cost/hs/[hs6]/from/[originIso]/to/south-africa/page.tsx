import { PageShell } from "@/components/pseo/PageShell";
import { SEOPageHeader } from "@/components/pseo/SEOPageHeader";
import { ResultsPanel } from "@/components/pseo/ResultsPanel";
import { FAQSection } from "@/components/pseo/FAQSection";
import { InternalLinksGrid } from "@/components/pseo/InternalLinksGrid";
import { JsonLdSchema } from "@/components/pseo/JsonLdSchema";
import { RouteContext } from "@/types/pseo";
import { StoreHydrator } from "@/components/pseo/StoreHydrator";
import { Metadata } from "next";
import { generateFAQs, getCountryName } from "@/lib/seo/faqData";
import { getRelatedPages } from "@/lib/seo/interlinking.service";

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || "https://importcosts.co.za";

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
    const originName = getCountryName(originIso);
    const canonicalUrl = `${BASE_URL}/import-duty-vat-landed-cost/hs/${hs6}/from/${originIso.toLowerCase()}/to/south-africa`;

    const title = `Import Duty for HS Code ${hs6} from ${originName} to South Africa | ImportCosts`;
    const description = `Calculate the landed cost for HS code ${hs6} imports from ${originName} to South Africa. Instant duty rates, 15% VAT, preferential trade agreement checks, and compliance risk assessment using the latest SARS tariff book.`;

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

    // Server-Side Default Calculation (SSR)
    const { calculateLandedCost } = await import("@/lib/calc/landedCost");

    // Default Scenario: R10,000 Invoice Value
    const defaultInputs = {
        hsCode: hs6,
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
        usedGoods: false
    };

    let ssrResult: import("@/types/pseo").CalculationResult | undefined = undefined;
    try {
        const rawResult = await calculateLandedCost(defaultInputs, "ssr-pseo");

        ssrResult = {
            summary: {
                total_taxes_zar: rawResult.breakdown
                    .filter(i => ["duty", "vat", "excise"].includes(i.id))
                    .reduce((sum, i) => sum + i.amount, 0),
                total_landed_cost_zar: rawResult.landedCostTotal,
                landed_cost_per_unit_zar: rawResult.landedCostPerUnit || rawResult.landedCostTotal,
                origin_country: originIso.toUpperCase()
            },
            hs: {
                confidence_score: 0.95,
                confidence_bucket: 'high',
                alternatives: []
            },
            tariff: {
                version: rawResult.tariffVersionLabel,
                effective_date: rawResult.tariffVersionEffectiveFrom || new Date().toISOString(),
                last_updated: new Date().toISOString()
            },
            line_items: rawResult.breakdown.map(item => ({
                key: item.id,
                label: item.label,
                amount_zar: item.amount,
                audit: {
                    formula: item.formula || "",
                    inputs_used: {},
                    rates: { rate: item.rateApplied },
                    tariff_version: rawResult.tariffVersionId
                }
            })),
            doc_checklist: {
                always: [
                    { title: "Commercial Invoice", why: "Proof of value for customs." },
                    { title: "Bill of Lading / Airway Bill", why: "Proof of shipment contract." },
                    { title: "SAD500", why: "Customs declaration form." }
                ],
                common: [],
                conditional: rawResult.preference_decision?.proof_checklist?.map((p: string) => ({
                    title: p,
                    why: "Required for Preferential Rate",
                    trigger: "Preference Claimed"
                })) || []
            },
            risk_flags: [],
            compliance_risks: rawResult.compliance_risks,
            preference_decision: rawResult.preference_decision
        };

    } catch (e) {
        console.error("SSR Calculation Failed:", e);
    }

    // ─── SEO Data ───
    const productName = `HS ${hs6}`;
    const originCountryName = getCountryName(originIso);
    const canonicalUrl = `${BASE_URL}/import-duty-vat-landed-cost/hs/${hs6}/from/${originIso.toLowerCase()}/to/south-africa`;

    // Generate FAQs from route context + SSR result
    const faqs = generateFAQs(routeContext, ssrResult);

    // Fetch related pages for interlinking
    const relatedPages = await getRelatedPages(routeContext);

    return (
        <PageShell
            routeContext={routeContext}
            isIndexable={true}
            canonicalUrl={canonicalUrl}
            title={`Import Cost: HS ${hs6} from ${originIso}`}
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
                bestHs6={hs6}
            />

            <StoreHydrator initialResult={ssrResult} initialInputs={defaultInputs} />
            <ResultsPanel />

            <FAQSection faqs={faqs} productName={productName} />
            <InternalLinksGrid
                data={relatedPages}
                originCountryName={originCountryName}
                productName={productName}
            />
        </PageShell>
    );
}
