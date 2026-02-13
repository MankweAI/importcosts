import { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageShell } from "@/components/pseo/PageShell";
import { FAQSection } from "@/components/pseo/FAQSection";
import { JsonLdSchema } from "@/components/pseo/JsonLdSchema";
import { InvoiceCalculator } from "@/components/pseo/InvoiceCalculator";
import { SensitivityAnalysis } from "@/components/pseo/SensitivityAnalysis";
import { MarketPriceBenchmark } from "@/components/pseo/MarketPriceBenchmark";
import { ImportTimeline } from "@/components/pseo/ImportTimeline";
import { ExampleScenariosTable } from "@/components/pseo/ExampleScenariosTable";
import { RiskBullets } from "@/components/pseo/RiskBullets";
import { DisclaimerBanner } from "@/components/pseo/DisclaimerBanner";
import { StickyActionBar } from "@/components/pseo/StickyActionBar";
import { RouteContext, CalculationResult } from "@/types/pseo";
import { generateFAQs, getCountryName } from "@/lib/seo/faqData";
import { generateProductScenarios } from "@/lib/seo/scenarioData";
import { BASE_URL } from "@/lib/seo/canonical";
import { calculateLandedCost } from "@/lib/calc/landedCost";
import { CalcInput } from "@/lib/calc/types";
import { getClusterWithHsCodes } from "@/lib/db/services/productCluster.service";
import { ScenarioSelector } from "@/components/pivot/ScenarioSelector";
import { SOLAR_PANEL_GOLDEN_DATA } from "@/data/golden-scenarios/solar-panels";

interface PageProps {
  params: Promise<RouteContext>;
}

function isChinaInput(value: string): boolean {
  const normalized = value.toLowerCase();
  return normalized === "china" || normalized === "cn";
}

function normalizeOrigin(value: string): "CN" {
  if (!isChinaInput(value)) {
    return "CN";
  }
  return "CN";
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { clusterSlug, originIso } = await params;
  if (clusterSlug !== "solar-panels" || !isChinaInput(originIso)) {
    return {
      title: "ImportCosts MVP",
      robots: "noindex, nofollow",
    };
  }

  const canonical = `${BASE_URL}/import-duty-vat-landed-cost/solar-panels/from/china/to/south-africa`;
  return {
    title:
      "Import Solar Panels from China: Profitability & Duty Calculator (2026)",
    description:
      "Calculate landed cost, margin, duties, VAT, and import risks for solar panels from China to South Africa.",
    alternates: { canonical },
  };
}

export default async function Page({ params }: PageProps) {
  const routeContext = await params;
  const { clusterSlug, originIso } = routeContext;

  if (clusterSlug !== "solar-panels" || !isChinaInput(originIso)) {
    notFound();
  }

  const normalizedOrigin = normalizeOrigin(originIso);
  const originCountryName = getCountryName(normalizedOrigin);

  const cluster = await getClusterWithHsCodes(clusterSlug);
  const bestHsMap = cluster?.hsMaps?.[0];
  const bestHs6 = bestHsMap?.hsCode?.hs6;

  const defaultInputs = {
    hsCode: SOLAR_PANEL_GOLDEN_DATA.hsCode || bestHs6 || "854143",
    customsValue: 120000,
    invoiceValue: 120000,
    exchangeRate: 18.5,
    currency: "ZAR",
    originCountry: normalizedOrigin,
    destinationCountry: "ZA",
    importerType: "VAT_REGISTERED" as const,
    freightCost: 15000,
    insuranceCost: 1200,
    freightInsuranceCost: 16200,
    otherCharges: 2500,
    quantity: 100,
    incoterm: "FOB" as const,
    usedGoods: false,
    clusterSlug,
    targetSellingPrice: 220000,
  };

  let ssrResult: CalculationResult | undefined = undefined;
  let dutyPct = 0;

  try {
    const seededInputs = {
      ...defaultInputs,
      ...SOLAR_PANEL_GOLDEN_DATA.scenarios[1].inputs,
      originCountry: normalizedOrigin,
    };

    const incoterm: "FOB" | "CIF" | "EXW" =
      seededInputs.incoterm === "CIF" || seededInputs.incoterm === "EXW"
        ? seededInputs.incoterm
        : "FOB";

    const calcInputs: CalcInput = {
      hsCode: seededInputs.hsCode,
      customsValue: seededInputs.customsValue,
      invoiceValue: seededInputs.invoiceValue,
      currency: seededInputs.currency,
      exchangeRate: seededInputs.exchangeRate,
      originCountry: normalizedOrigin,
      destinationCountry: "ZA",
      importerType: "VAT_REGISTERED",
      freightCost: seededInputs.freightCost,
      insuranceCost: seededInputs.insuranceCost,
      otherCharges: seededInputs.otherCharges,
      quantity: seededInputs.quantity,
      incoterm,
      freightInsuranceCost: seededInputs.freightInsuranceCost,
      usedGoods: false,
      clusterSlug,
      targetSellingPrice: seededInputs.targetSellingPrice,
      targetMarginPercent: seededInputs.targetMarginPercent,
    };

    const rawResult = await calculateLandedCost(calcInputs, "ssr-pseo");
    const dutyLine = rawResult.breakdown.find((i) => i.id === "duty");
    if (dutyLine?.rateApplied) dutyPct = Number(dutyLine.rateApplied);

    ssrResult = {
      summary: {
        total_taxes_zar: rawResult.breakdown
          .filter((i) => ["duty", "vat", "excise"].includes(i.id))
          .reduce((sum, i) => sum + i.amount, 0),
        total_landed_cost_zar: rawResult.landedCostTotal,
        landed_cost_per_unit_zar:
          rawResult.landedCostPerUnit || rawResult.landedCostTotal,
        origin_country: normalizedOrigin,
      },
      hs: {
        confidence_score: 1.0,
        confidence_bucket: "high",
        alternatives: [],
      },
      tariff: {
        version: rawResult.tariffVersionLabel,
        effective_date:
          rawResult.tariffVersionEffectiveFrom || new Date().toISOString(),
        last_updated: new Date().toISOString(),
      },
      line_items: rawResult.breakdown.map((item) => ({
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
      doc_checklist: SOLAR_PANEL_GOLDEN_DATA.checklist,
      risk_flags: SOLAR_PANEL_GOLDEN_DATA.risks,
      compliance_risks: rawResult.compliance_risks,
      preference_decision: rawResult.preference_decision,
      verdict: rawResult.verdict,
      grossMarginPercent: rawResult.grossMarginPercent,
      breakEvenPrice: rawResult.breakEvenPrice,
      detailedRisks: rawResult.detailedRisks,
    };
  } catch (error) {
    console.error("SSR Calculation Failed for solar panels route:", error);
  }

  const canonicalUrl = `${BASE_URL}/import-duty-vat-landed-cost/solar-panels/from/china/to/south-africa`;
  const fullRouteContext: RouteContext = {
    clusterSlug,
    originIso: normalizedOrigin,
    destinationIso: "ZA",
    pageType: "product_origin_money_page",
    hs6: null,
  };

  const faqs = generateFAQs(fullRouteContext, ssrResult);
  const scenarios = generateProductScenarios("solar panels", dutyPct, 10000);
  const riskBullets = SOLAR_PANEL_GOLDEN_DATA.risks.map((risk) => ({
    icon: "compliance" as const,
    title: risk.title,
    detail: risk.summary,
  }));

  const hydrationInputs = {
    ...defaultInputs,
    ...SOLAR_PANEL_GOLDEN_DATA.scenarios[1].inputs,
    originCountry: normalizedOrigin,
  };

  return (
    <PageShell
      routeContext={fullRouteContext}
      isIndexable={true}
      canonicalUrl={canonicalUrl}
      title="Profitability Model: solar panels"
      className="space-y-6 pb-24"
    >
      <JsonLdSchema
        routeContext={fullRouteContext}
        result={ssrResult}
        faqs={faqs}
        canonicalUrl={canonicalUrl}
        productName="solar panels"
        originCountryName={originCountryName}
      />

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:p-6">
        <div className="border-b border-slate-100 pb-5">
          <div className="mb-3 inline-flex rounded-full bg-sky-600 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-white">
            Profitability Decision Workspace
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            Import solar panels from China
          </h1>
          <p className="mt-2 max-w-3xl text-sm leading-relaxed text-slate-600">
            This MVP route gives a clean profitability verdict with
            tariff-backed assumptions. Start with scenario presets, tune the
            deal, and review risk and sensitivity blocks below.
          </p>
        </div>

        <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs uppercase tracking-wide text-slate-500">
              Trade lane
            </p>
            <p className="mt-1 text-sm font-semibold text-slate-900">
              China to South Africa
            </p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs uppercase tracking-wide text-slate-500">
              Tariff version
            </p>
            <p className="mt-1 text-sm font-semibold text-slate-900">
              {ssrResult?.tariff.version || "Live snapshot"}
            </p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs uppercase tracking-wide text-slate-500">
              HS confidence
            </p>
            <p className="mt-1 text-sm font-semibold text-slate-900">
              {ssrResult?.hs.confidence_bucket || "high"}
            </p>
          </div>
        </div>
      </section>

      <ScenarioSelector scenarios={SOLAR_PANEL_GOLDEN_DATA.scenarios} />

      <InvoiceCalculator
        initialResult={ssrResult}
        initialInputs={hydrationInputs}
      />

      <section className="space-y-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:p-6">
        <div className="border-b border-slate-100 pb-4">
          <h2 className="text-xl font-semibold text-slate-900">
            Decision support blocks
          </h2>
          <p className="mt-1 text-sm text-slate-600">
            Review downside exposure, market competitiveness, and comparative
            scenarios.
          </p>
        </div>

        <RiskBullets
          bullets={riskBullets}
          title="Top compliance and execution risks"
          subtitle="Priority issues to resolve before confirming supplier terms."
        />

        {ssrResult && (
          <SensitivityAnalysis
            landedCost={ssrResult.summary.total_landed_cost_zar}
            customsValue={defaultInputs.customsValue}
            dutyRate={dutyPct}
            dutyAmount={
              ssrResult.line_items.find((i) => i.key === "duty")?.amount_zar ||
              0
            }
            exchangeRate={defaultInputs.exchangeRate}
            invoiceValue={defaultInputs.invoiceValue}
          />
        )}

        <MarketPriceBenchmark />
        <ExampleScenariosTable
          scenarios={scenarios}
          title="Optimization scenarios"
          subtitle="Use this to compare price and logistics strategies before purchase order release."
        />
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:p-6">
        <h2 className="text-xl font-semibold text-slate-900">
          Importer playbook
        </h2>
        <ImportTimeline />
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:p-6">
        <FAQSection faqs={faqs} productName="solar panels" />
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:p-6">
        <DisclaimerBanner />
      </section>

      <StickyActionBar />
    </PageShell>
  );
}
