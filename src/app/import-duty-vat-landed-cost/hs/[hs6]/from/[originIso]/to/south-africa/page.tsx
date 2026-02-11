import { PageShell } from "@/components/pseo/PageShell";
import { SEOPageHeader } from "@/components/pseo/SEOPageHeader";
import { ResultsPanel } from "@/components/pseo/ResultsPanel";
import { FAQSection } from "@/components/pseo/FAQSection";
import { InternalLinksGrid } from "@/components/pseo/InternalLinksGrid";
import { JsonLdSchema } from "@/components/pseo/JsonLdSchema";
import { DealOverviewSection } from "@/components/pseo/DealOverviewSection";
import { ExampleScenariosTable } from "@/components/pseo/ExampleScenariosTable";
import { RiskBullets } from "@/components/pseo/RiskBullets";
import { RouteContext } from "@/types/pseo";
import { StoreHydrator } from "@/components/pseo/StoreHydrator";
import { Metadata } from "next";
import { generateFAQs, getCountryName } from "@/lib/seo/faqData";
import { getRelatedPages } from "@/lib/seo/interlinking.service";
import { generateHsScenarios } from "@/lib/seo/scenarioData";
import { generateHsRiskBullets } from "@/lib/seo/riskBulletData";

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

    const title = `Import Duty Guide: HS ${hs6} from ${originName} to South Africa | ImportCosts`;
    const description = `Calculate duties and VAT for HS ${hs6} goods imported from ${originName} into South Africa. Compute the duty rate plus 15% VAT, flag classification risks, and check compliance requirements using the latest SARS tariff schedule.`;

    return {
        title,
        description,
        alternates: { canonical: canonicalUrl },
        robots: "index, follow",
        openGraph: {
            title,
            description,
            url: canonicalUrl,
            siteName: "ImportCosts",
            type: "website",
            locale: "en_ZA",
        },
        other: { "geo.region": "ZA" },
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

    // SSR Calculation
    const { calculateLandedCost } = await import("@/lib/calc/landedCost");

    const defaultInputs = {
        hsCode: hs6,
        customsValue: 5000,
        invoiceValue: 5000,
        exchangeRate: 1,
        currency: "ZAR",
        originCountry: originIso.toUpperCase(),
        destinationCountry: "ZA",
        importerType: "VAT_REGISTERED" as const,
        freightCost: 750,
        insuranceCost: 25,
        freightInsuranceCost: 775,
        otherCharges: 0,
        quantity: 1,
        incoterm: "FOB" as const,
        usedGoods: false,
    };

    let ssrResult: import("@/types/pseo").CalculationResult | undefined = undefined;
    let dutyAmount = 0;
    let vatAmount = 0;
    let dutyPct = 20;

    try {
        const rawResult = await calculateLandedCost(defaultInputs, "ssr-pseo");

        const dutyLine = rawResult.breakdown.find(i => i.id === "duty");
        const vatLine = rawResult.breakdown.find(i => i.id === "vat");
        dutyAmount = dutyLine?.amount || 0;
        vatAmount = vatLine?.amount || 0;
        if (dutyLine?.rateApplied) dutyPct = Number(dutyLine.rateApplied);

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
                confidence_score: 0.95,
                confidence_bucket: "high",
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
            verdict: rawResult.verdict,
            grossMarginPercent: rawResult.grossMarginPercent,
            breakEvenPrice: rawResult.breakEvenPrice,
            detailedRisks: rawResult.detailedRisks,
        };
    } catch (e) {
        console.error("SSR Calculation Failed:", e);
    }

    // ─── SEO & Content Data ───
    const productName = `HS ${hs6}`;
    const originCountryName = getCountryName(originIso);
    const canonicalUrl = `${BASE_URL}/import-duty-vat-landed-cost/hs/${hs6}/from/${originIso.toLowerCase()}/to/south-africa`;

    const faqs = generateFAQs(routeContext, ssrResult);
    const relatedPages = await getRelatedPages(routeContext);

    // Generate scenario & risk content
    const scenarios = generateHsScenarios(hs6, dutyPct, 5000);
    const riskBullets = generateHsRiskBullets(hs6, originIso.toUpperCase(), dutyPct);

    return (
        <PageShell
            routeContext={routeContext}
            isIndexable={true}
            canonicalUrl={canonicalUrl}
            title={`Import Duty Guide: HS ${hs6} from ${originIso}`}
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

            {/* H2: Duty & VAT Example */}
            {ssrResult && (
                <DealOverviewSection
                    invoiceValue={5000}
                    dutyAmount={dutyAmount}
                    vatAmount={vatAmount}
                    freightCost={775}
                    landedCost={ssrResult.summary.total_landed_cost_zar}
                    productName={productName}
                    originName={originCountryName}
                />
            )}

            <StoreHydrator initialResult={ssrResult} initialInputs={defaultInputs} />
            <ResultsPanel />

            {/* H2: Duty Scenarios — vary value and compare codes */}
            <ExampleScenariosTable
                scenarios={scenarios}
                title="Duty & VAT Scenarios"
                subtitle={`See how invoice value and code classification affect total duties for HS ${hs6} imports from ${originCountryName}.`}
            />

            {/* H2: Classification Risks */}
            <RiskBullets
                bullets={riskBullets}
                title="Classification & Compliance Risks"
                subtitle={`Key risks when importing HS ${hs6} goods from ${originCountryName}.`}
            />

            <FAQSection faqs={faqs} productName={productName} />
            <InternalLinksGrid
                data={relatedPages}
                originCountryName={originCountryName}
                productName={productName}
            />
        </PageShell>
    );
}
