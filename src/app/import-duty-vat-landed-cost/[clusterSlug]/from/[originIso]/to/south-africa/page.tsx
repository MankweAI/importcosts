
import { PageShell } from "@/components/pseo/PageShell"; // Keeping PageShell for SEO structure, but content wrapped in DocumentContainer
import { DocumentContainer } from "@/components/pseo/DocumentContainer";
// SEOPageHeader removed
import { FAQSection } from "@/components/pseo/FAQSection";
import { InternalLinksGrid } from "@/components/pseo/InternalLinksGrid";
import { JsonLdSchema } from "@/components/pseo/JsonLdSchema";
import { DealSummaryCard } from "@/components/pseo/DealSummaryCard";
import { InvoiceCalculator } from "@/components/pseo/InvoiceCalculator";
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
import { Metadata } from "next";
import { generateFAQs, getCountryName } from "@/lib/seo/faqData";
import { getRelatedPages } from "@/lib/seo/interlinking.service";
import { generateProductScenarios } from "@/lib/seo/scenarioData";
import { generateProductRiskBullets } from "@/lib/seo/riskBulletData";
import { BASE_URL } from "@/lib/seo/canonical";
import { calculateLandedCost } from "@/lib/calc/landedCost";
import { getClusterWithHsCodes } from "@/lib/db/services/productCluster.service";

interface PageProps {
    params: Promise<RouteContext>;
}

// 1. Generate SEO Metadata
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { clusterSlug, originIso } = await params;
    if (!clusterSlug) return { title: "Error" }; // Should never happen in this route
    const productName = clusterSlug.replace(/-/g, " ");
    const originCountryName = getCountryName(originIso);

    return {
        title: `Import Duty on ${productName} (2026): Calculator & Invoice`,
        description: `How much does it cost to import ${productName} from ${originCountryName} to South Africa? Generate a free pro forma invoice with customs duties and VAT.`,
        alternates: {
            canonical: `${BASE_URL}/import-duty-vat-landed-cost/${clusterSlug}/from/${originIso.toLowerCase()}/to/south-africa`,
        },
    };
}

export default async function Page({ params }: PageProps) {
    const routeContext = await params;
    const { clusterSlug, originIso } = routeContext;
    if (!clusterSlug) return null; // Should never happen
    const originCountryName = getCountryName(originIso);

    // ─── Data Fetching ───
    const cluster = await getClusterWithHsCodes(clusterSlug);
    // Moved getRelatedPages call down to use routeContext
    const bestHsMap = cluster?.hsMaps?.[0];
    const bestHs6 = bestHsMap?.hsCode?.hs6;

    const defaultInputs = {
        hsCode: bestHs6 || "87032390",
        customsValue: 10000,
        invoiceValue: 10000,
        exchangeRate: 18.5, // Good default
        currency: "ZAR",
        originCountry: originIso.toUpperCase(),
        destinationCountry: "ZA",
        importerType: "VAT_REGISTERED" as const,
        freightCost: 1500,
        insuranceCost: 50,
        freightInsuranceCost: 1550,
        otherCharges: 0,
        quantity: 1,
        incoterm: "FOB" as const, // Standard for imports
        usedGoods: false,
        clusterSlug,
    };

    // Run SSR calculation
    let ssrResult: CalculationResult | undefined = undefined;
    let dutyPct = 0;

    if (bestHs6) {
        try {
            const rawResult = await calculateLandedCost(defaultInputs, "ssr-pseo");

            // Extract duty %
            const dutyLine = rawResult.breakdown.find(i => i.id === "duty");
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
                    alternatives: []
                },
                tariff: {
                    version: rawResult.tariffVersionLabel,
                    effective_date: rawResult.tariffVersionEffectiveFrom || new Date().toISOString(),
                    last_updated: new Date().toISOString(),
                },
                line_items: rawResult.breakdown.map((item: any) => ({
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
                    always: [],
                    common: [],
                    conditional: []
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

    const productName = clusterSlug.replace(/-/g, " ");
    const canonicalUrl = `${BASE_URL}/import-duty-vat-landed-cost/${clusterSlug}/from/${originIso.toLowerCase()}/to/south-africa`;

    const fullRouteContext: RouteContext = {
        clusterSlug: clusterSlug,
        originIso: originIso,
        destinationIso: "ZA",
        pageType: "product_origin_money_page",
        hs6: null
    };

    // Correctly call getRelatedPages with the context object
    const relatedPages = await getRelatedPages(fullRouteContext);

    const faqs = generateFAQs(fullRouteContext, ssrResult);
    const scenarios = generateProductScenarios(productName, dutyPct, 10000);
    const riskBullets = generateProductRiskBullets(productName, originIso.toUpperCase(), dutyPct);

    return (
        <PageShell
            routeContext={routeContext}
            isIndexable={true}
            canonicalUrl={canonicalUrl}
            title={`Pro Forma Invoice: ${productName} from ${originCountryName}`}
        >
            <JsonLdSchema
                routeContext={routeContext}
                result={ssrResult}
                faqs={faqs}
                canonicalUrl={canonicalUrl}
                productName={productName}
                originCountryName={originCountryName}
            />

            {/* ── THE INVOICE UI ───────────────────────────────────────────── */}
            <DocumentContainer className="mb-20">
                {/* 1. HEADER (Static Invoice Meta) */}
                {ssrResult && (
                    <DealSummaryCard
                        invoiceValue={defaultInputs.invoiceValue}
                        dutyAmount={0} // Handled by InvoiceCalculator
                        vatAmount={0}  // Handled by InvoiceCalculator
                        freightCost={defaultInputs.freightCost}
                        landedCost={ssrResult.summary.total_landed_cost_zar}
                        landedCostPerUnit={ssrResult.summary.landed_cost_per_unit_zar}
                        units={defaultInputs.quantity}
                        verdict={ssrResult.verdict}
                        grossMarginPct={ssrResult.grossMarginPercent}
                        breakEvenPrice={ssrResult.breakEvenPrice}
                        riskScore={50} // Placeholder
                        productName={productName}
                        originName={originCountryName}
                    />
                )}

                {/* 2. BODY (Editable Line Items) */}
                <InvoiceCalculator
                    initialResult={ssrResult}
                    initialInputs={defaultInputs}
                />

                {/* 3. ATTACHMENTS (Deep Content / The "Curtain") */}
                <div className="border-t-4 border-double border-neutral-200 pt-12 px-8 pb-12 bg-neutral-50/50">
                    <h3 className="text-sm font-bold uppercase tracking-widest text-neutral-400 mb-8 flex items-center gap-2">
                        <span>Attached Reports & Analysis</span>
                        <div className="h-px bg-neutral-200 flex-1"></div>
                    </h3>

                    {/* Attachment A: Risks */}
                    <section className="mb-12">
                        <h4 className="font-bold text-neutral-900 mb-4">A. Compliance & Risk Assessment</h4>
                        <RiskBullets
                            bullets={riskBullets}
                            title="Classification & Compliance Risks"
                            subtitle={`Key risks when importing ${productName} from ${originCountryName}.`}
                        />
                    </section>

                    {/* Attachment B: Sensitivity */}
                    <section className="mb-12">
                        <h4 className="font-bold text-neutral-900 mb-4">B. Sensitivity Analysis (FX Volatility)</h4>
                        {ssrResult && (
                            <SensitivityAnalysis
                                landedCost={ssrResult.summary.total_landed_cost_zar}
                                customsValue={defaultInputs.customsValue}
                                dutyRate={dutyPct}
                                dutyAmount={ssrResult.line_items.find(i => i.key === "duty")?.amount_zar || 0}
                                exchangeRate={defaultInputs.exchangeRate}
                                invoiceValue={defaultInputs.invoiceValue}
                            />
                        )}
                    </section>

                    {/* Attachment C: Market Benchmark - "Market Research Report" */}
                    <section className="mb-12">
                        <h4 className="font-bold text-neutral-900 mb-4">C. Market Price Benchmark</h4>
                        <MarketPriceBenchmark />
                    </section>

                    {/* Attachment D: Scenarios */}
                    <section className="mb-12">
                        <h4 className="font-bold text-neutral-900 mb-4">D. Optimization Scenarios</h4>
                        <ExampleScenariosTable
                            scenarios={scenarios}
                        />
                    </section>
                </div>
            </DocumentContainer>

            {/* ── FOOTER CONTENT (Below the Invoice) ────────────────────── */}
            <div className="max-w-4xl mx-auto px-4 mb-20 space-y-20">
                <section>
                    <h2 className="text-2xl font-bold mb-8">Importer Playbook</h2>
                    <ImportTimeline />
                </section>

                <section>
                    <h2 className="text-2xl font-bold mb-8">Frequently Asked Questions</h2>
                    <FAQSection faqs={faqs} productName={productName} />
                </section>

                <InternalLinksGrid
                    data={relatedPages}
                    originCountryName={originCountryName}
                    productName={productName}
                />

                <DisclaimerBanner />
            </div>

            <StickyActionBar />
        </PageShell>
    );
}
