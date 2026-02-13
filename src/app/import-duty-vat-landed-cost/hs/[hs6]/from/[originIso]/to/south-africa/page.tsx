
import { PageShell } from "@/components/pseo/PageShell";
import { DocumentContainer } from "@/components/pseo/DocumentContainer";
// Removed SEOPageHeader import
import { FAQSection } from "@/components/pseo/FAQSection";
import { InternalLinksGrid } from "@/components/pseo/InternalLinksGrid";
import { JsonLdSchema } from "@/components/pseo/JsonLdSchema";

import { InvoiceCalculator } from "@/components/pseo/InvoiceCalculator";
import { StickyActionBar } from "@/components/pseo/StickyActionBar";
import { ImportTimeline } from "@/components/pseo/ImportTimeline";
import { ComplianceTimeline } from "@/components/pseo/ComplianceTimeline";
import { AssumptionsDrawer } from "@/components/pseo/AssumptionsDrawer";
import { CashTimelinePlanner } from "@/components/pseo/CashTimelinePlanner";
import { ScenarioStrip } from "@/components/pseo/ScenarioStrip";
import { RiskRadarPanel, ImportReadinessChecklist } from "@/components/pseo/Decisions";
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

                    {/* NEW: Component Grid for Decisions */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
                        {/* A. Risk Radar */}
                        <div className="space-y-4">
                            <RiskRadarPanel
                                risks={riskBullets.map(r => ({
                                    title: r.title,
                                    description: r.detail,
                                    severity: r.icon === "compliance" || r.icon === "dumping" ? "high" : "medium",
                                }))}
                            />
                        </div>

                        {/* B. Checklist */}
                        <div className="space-y-4">
                            <ImportReadinessChecklist
                                items={[
                                    { label: "Commercial Invoice", owner: "Supplier", when: "Pre-shipment" },
                                    { label: "Bill of Lading", owner: "Supplier", when: "Pre-shipment" },
                                    { label: "SAD500 Declaration", owner: "Agent", when: "Clearance" },
                                    { label: "Import Permit (if applicable)", owner: "Importer", when: "Pre-shipment" },
                                ]}
                            />
                        </div>
                    </div>

                    {/* C. Cash Flow (Full Width) */}
                    <div className="mb-12">
                        <CashTimelinePlanner
                            totalLandedCost={ssrResult?.summary.total_landed_cost_zar || 0}
                            dutyAmount={dutyAmount}
                            vatAmount={vatAmount}
                            freightAmount={defaultInputs.freightCost}
                        />
                    </div>

                    {/* D. Scenarios (Strip) */}
                    <div className="mb-12">
                        <h4 className="font-bold text-neutral-900 mb-4">Optimization Scenarios</h4>
                        <ScenarioStrip
                            scenarios={scenarios.map((s, idx) => ({
                                label: s.label,
                                mode: s.freightMode === "Sea" ? "SEA" : "AIR",
                                incoterm: "FOB",
                                quantity: s.quantity,
                                totalLandedCost: s.landedCostPerUnit,
                                perUnit: s.landedCostPerUnit,
                                isBaseline: idx === 0
                            }))}
                        />
                    </div>

                    {/* E. Assumptions Drawer (Bottom) */}
                    <AssumptionsDrawer
                        tariffVersion={ssrResult?.tariff?.version}
                        lastUpdated={ssrResult?.tariff?.last_updated}
                        exchangeRate={defaultInputs.exchangeRate}
                        dutyRateUsed={`${dutyPct}%`}
                    />

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


            </div>

            <StickyActionBar />
        </PageShell>
    );
}
