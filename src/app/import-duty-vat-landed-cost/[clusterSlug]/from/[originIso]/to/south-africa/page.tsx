import { PageShell } from "@/components/pseo/PageShell";
import { SEOPageHeader } from "@/components/pseo/SEOPageHeader";
import { ResultsPanel } from "@/components/pseo/ResultsPanel";
import { FAQSection } from "@/components/pseo/FAQSection";
import { InternalLinksGrid } from "@/components/pseo/InternalLinksGrid";
import { JsonLdSchema } from "@/components/pseo/JsonLdSchema";
import { DealSummaryCard } from "@/components/pseo/DealSummaryCard";
import { VATFormulaExplainer } from "@/components/pseo/VATFormulaExplainer";
import { SensitivityAnalysis } from "@/components/pseo/SensitivityAnalysis";
import { MarketPriceBenchmark } from "@/components/pseo/MarketPriceBenchmark";
import { ImportTimeline } from "@/components/pseo/ImportTimeline";
import { ComplianceTimeline } from "@/components/pseo/ComplianceTimeline";
import { ExampleScenariosTable } from "@/components/pseo/ExampleScenariosTable";
import { RiskBullets } from "@/components/pseo/RiskBullets";
import { AssumptionsAndFreshnessBox } from "@/components/pseo/AssumptionsAndFreshnessBox";
import { DisclaimerBanner } from "@/components/pseo/DisclaimerBanner";
import { StickyActionBar } from "@/components/pseo/StickyActionBar";
import { RouteContext, CalculationResult } from "@/types/pseo";
import { StoreHydrator } from "@/components/pseo/StoreHydrator";
import { Metadata } from "next";
import { generateFAQs, getCountryName } from "@/lib/seo/faqData";
import { getRelatedPages } from "@/lib/seo/interlinking.service";
import { generateProductScenarios } from "@/lib/seo/scenarioData";
import { generateProductRiskBullets } from "@/lib/seo/riskBulletData";

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

    const title = `Import ${productName} from ${originName}: Profitability, Costs & Risks | ImportCosts`;
    const description = `Determine if importing ${productName} from ${originName} makes financial sense. Enter your unit price, quantity, and shipping terms to see the full landed cost (duties + 15% VAT + freight). We'll highlight margin pitfalls and necessary documents.`;

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

    const cluster = await getClusterWithHsCodes(clusterSlug);
    const bestHsMap = cluster?.hsMaps?.[0];
    const bestHs6 = bestHsMap?.hsCode?.hs6;

    const defaultInputs = {
        hsCode: bestHs6 || "87032390",
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
        clusterSlug,
    };

    // Run SSR calculation
    let ssrResult: CalculationResult | undefined = undefined;
    let dutyAmount = 0;
    let vatAmount = 0;
    let dutyPct = 20;

    if (bestHs6) {
        try {
            const rawResult = await calculateLandedCost(defaultInputs, "ssr-pseo");

            // Extract duty and VAT amounts from breakdown
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
                verdict: rawResult.verdict,
                grossMarginPercent: rawResult.grossMarginPercent,
                breakEvenPrice: rawResult.breakEvenPrice,
                detailedRisks: rawResult.detailedRisks,
            };
        } catch (e) {
            console.error("SSR Calculation Failed for cluster:", clusterSlug, e);
        }
    }

    // ─── SEO & Content Data ───
    const productName = clusterSlug.replace(/-/g, " ");
    const originCountryName = getCountryName(originIso);
    const canonicalUrl = `${BASE_URL}/import-duty-vat-landed-cost/${clusterSlug}/from/${originIso.toLowerCase()}/to/south-africa`;

    const faqs = generateFAQs(routeContext, ssrResult);
    const relatedPages = await getRelatedPages(routeContext);

    // Generate scenario & risk content
    const scenarios = generateProductScenarios(productName, dutyPct, 10000);
    const riskBullets = generateProductRiskBullets(productName, originIso.toUpperCase(), dutyPct);

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

            {/* GAP-01: Deal Summary Card — verdict + margin + break-even + risk score */}
            {ssrResult && (
                <DealSummaryCard
                    invoiceValue={10000}
                    dutyAmount={dutyAmount}
                    vatAmount={vatAmount}
                    freightCost={1550}
                    landedCost={ssrResult.summary.total_landed_cost_zar}
                    landedCostPerUnit={ssrResult.summary.landed_cost_per_unit_zar}
                    verdict={ssrResult.verdict}
                    grossMarginPct={ssrResult.grossMarginPercent}
                    breakEvenPrice={ssrResult.breakEvenPrice}
                    riskScore={ssrResult.compliance_risks?.overall_risk_score ? ssrResult.compliance_risks.overall_risk_score * 10 : undefined}
                    productName={productName}
                    originName={originCountryName}
                />
            )}

            <StoreHydrator initialResult={ssrResult} initialInputs={defaultInputs} />
            <ResultsPanel />

            {/* GAP-06: VAT Formula Explainer — shows SARS ATV calculation */}
            <VATFormulaExplainer
                customsValue={10000}
                dutyAmount={dutyAmount}
                vatAmount={vatAmount}
            />

            {/* GAP-07: Sensitivity Analysis — FX and duty what-ifs */}
            {ssrResult && (
                <SensitivityAnalysis
                    landedCost={ssrResult.summary.total_landed_cost_zar}
                    customsValue={10000}
                    dutyRate={dutyPct}
                    dutyAmount={dutyAmount}
                    exchangeRate={defaultInputs.exchangeRate}
                    invoiceValue={10000}
                />
            )}

            {/* Importer POV: Market Benchmark */}
            <MarketPriceBenchmark />

            {/* Importer POV: Timeline & Cashflow */}
            <ImportTimeline />

            {/* H2: Example Scenarios — 3 pre-computed deals */}
            <ExampleScenariosTable
                scenarios={scenarios}
                title="Structuring Your Order"
                subtitle={`See how volume and shipping mode affect profitability when importing ${productName} from ${originCountryName}.`}
            />

            {/* H2: Risk Bullets — product-specific risks */}
            <RiskBullets
                bullets={riskBullets}
                title="Top Risks to Monitor"
                subtitle={`Key factors that could impact your ${productName} import from ${originCountryName}.`}
            />

            {/* Importer POV: Compliance Journey */}
            <ComplianceTimeline />

            {/* GAP-08: Data Freshness + Assumptions */}
            <AssumptionsAndFreshnessBox />

            <InternalLinksGrid
                data={relatedPages}
                originCountryName={originCountryName}
                productName={productName}
            />

            <FAQSection faqs={faqs} productName={productName} />

            {/* GAP-08: Legal Disclaimer */}
            <DisclaimerBanner
                tariffVersion={ssrResult?.tariff?.version}
                lastUpdated={ssrResult?.tariff?.last_updated}
            />

            {/* GAP-03: Save / Export / Compare / Watch */}
            <StickyActionBar />
        </PageShell>
    );
}
