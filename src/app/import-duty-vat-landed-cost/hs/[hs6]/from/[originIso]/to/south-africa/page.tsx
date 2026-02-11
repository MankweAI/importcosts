
import { PageShell } from "@/components/pseo/PageShell";
import { DocumentContainer } from "@/components/pseo/DocumentContainer";
// Removed SEOPageHeader import
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
import { RouteContext } from "@/types/pseo";
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

    const title = `Pro Forma Invoice: HS ${hs6} from ${originName}`;
    const description = `Generate a free pro forma invoice for importing commodities under HS Code ${hs6} from ${originName} to South Africa. Calculate duties, VAT, and estimated landed cost.`;

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
        exchangeRate: 18.5,
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
    let dutyPct = 0;

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

    const relatedPages = await getRelatedPages(routeContext);
    const faqs = generateFAQs(routeContext, ssrResult);
    const scenarios = generateHsScenarios(hs6, dutyPct, 5000);
    const riskBullets = generateHsRiskBullets(hs6, originIso.toUpperCase(), dutyPct);

    return (
        <PageShell
            routeContext={routeContext}
            isIndexable={true}
            canonicalUrl={canonicalUrl}
            title={`Pro Forma Invoice: HS ${hs6} from ${originCountryName}`}
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
                        dutyAmount={0}
                        vatAmount={0}
                        freightCost={defaultInputs.freightCost}
                        landedCost={ssrResult.summary.total_landed_cost_zar}
                        landedCostPerUnit={ssrResult.summary.landed_cost_per_unit_zar}
                        units={defaultInputs.quantity}
                        verdict={ssrResult.verdict}
                        grossMarginPct={ssrResult.grossMarginPercent}
                        breakEvenPrice={ssrResult.breakEvenPrice}
                        riskScore={50}
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
                            subtitle={`Key risks when importing HS ${hs6} goods from ${originCountryName}.`}
                        />
                    </section>

                    {/* Attachment B: Sensitivity */}
                    <section className="mb-12">
                        <h4 className="font-bold text-neutral-900 mb-4">B. Sensitivity Analysis (FX Volatility)</h4>
                        {ssrResult && (
                            <SensitivityAnalysis
                                landedCost={ssrResult.summary.total_landed_cost_zar}
                                customsValue={5000}
                                dutyRate={dutyPct}
                                dutyAmount={dutyAmount}
                                exchangeRate={defaultInputs.exchangeRate}
                                invoiceValue={5000}
                            />
                        )}
                    </section>

                    {/* Attachment C: Scenarios */}
                    <section className="mb-12">
                        <h4 className="font-bold text-neutral-900 mb-4">C. Optimization Scenarios</h4>
                        <ExampleScenariosTable
                            scenarios={scenarios}
                        />
                    </section>

                    {/* Attachment D: VAT Formula */}
                    <section className="mb-12">
                        <h4 className="font-bold text-neutral-900 mb-4">D. VAT Calculation Formula</h4>
                        <VATFormulaExplainer
                            customsValue={5000}
                            dutyAmount={dutyAmount}
                            vatAmount={vatAmount}
                        />
                    </section>
                </div>
            </DocumentContainer>

            {/* ── FOOTER CONTENT (Below the Invoice) ────────────────────── */}
            <div className="max-w-4xl mx-auto px-4 mb-20 space-y-20">
                <section>
                    <h2 className="text-2xl font-bold mb-8">Importer Playbook</h2>
                    <ComplianceTimeline />
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

                <DisclaimerBanner
                    tariffVersion={ssrResult?.tariff?.version}
                    lastUpdated={ssrResult?.tariff?.last_updated}
                />
            </div>

            <StickyActionBar />
        </PageShell>
    );
}
