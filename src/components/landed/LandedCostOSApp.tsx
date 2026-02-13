"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, ChevronDown, ChevronRight, Download, Loader2, Save, Shield, Signal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { usePSEOCalculatorStore } from "@/store/usePSEOCalculatorStore";
import { useCalculateLandedCost } from "@/hooks/useCalculateLandedCost";
import { CalculationResult } from "@/types/pseo";
import { LocalDealInputs, SavedDealRecord, StressResult } from "@/types/landed-os";
import { LandedTopBar } from "@/components/landed/LandedTopBar";
import { seedAlertsFromDeal, trackSuccessfulCalculation, upsertSavedDeal } from "@/lib/landed/localStorage";
import { usePWAInstall } from "@/hooks/usePWAInstall";
import { cn } from "@/lib/utils";

type Verdict = "GO" | "CAUTION" | "NO-GO";
type DensityMode = "D1" | "D2";
type DrawerTarget = "RISKS" | "CHECKLIST" | "ASSUMPTIONS" | null;

const FX_SOURCE = "ECB snapshot";
const CURRENCIES = ["USD", "CNY", "ZAR"] as const;
const INCOTERMS = ["FOB", "CIF"] as const;

const FREIGHT_PRESETS = {
  SEA: { LOW: 900, TYPICAL: 1500, HIGH: 2800 },
  AIR: { LOW: 2500, TYPICAL: 4000, HIGH: 7000 },
} as const;

function formatZar(value: number): string {
  return new Intl.NumberFormat("en-ZA", {
    style: "currency",
    currency: "ZAR",
    maximumFractionDigits: 0,
  }).format(value);
}

function formatPct(value: number): string {
  return `${value.toFixed(1)}%`;
}

function normalizeVerdict(raw: CalculationResult["verdict"], marginPct: number | null): Verdict {
  if (raw === "GO") return "GO";
  if (raw === "CAUTION") return "CAUTION";
  if (raw === "NOGO") return "NO-GO";
  if (marginPct === null) return "CAUTION";
  if (marginPct >= 20) return "GO";
  if (marginPct >= 8) return "CAUTION";
  return "NO-GO";
}

function getVerdictColor(verdict: Verdict): string {
  if (verdict === "GO") return "var(--lc-go)";
  if (verdict === "CAUTION") return "var(--lc-caution)";
  return "var(--lc-no-go)";
}

function computeMargin(result: CalculationResult | null, sellingPrice: number): number | null {
  if (!result) return null;
  if (typeof result.grossMarginPercent === "number") return result.grossMarginPercent;
  if (!sellingPrice || sellingPrice <= 0) return null;
  return ((sellingPrice - result.summary.landed_cost_per_unit_zar) / sellingPrice) * 100;
}

function toChecklistRows(result: CalculationResult | null): Array<{ title: string; why: string; owner: string; when: string }> {
  if (!result) return [];
  const all = [...result.doc_checklist.always, ...result.doc_checklist.common, ...result.doc_checklist.conditional];
  return all.slice(0, 8).map((item, index) => {
    if (index < 2) return { title: item.title, why: item.why, owner: "Supplier", when: "Before shipment" };
    if (index < 5) return { title: item.title, why: item.why, owner: "Importer", when: "At shipment" };
    return { title: item.title, why: item.why, owner: "Broker", when: "Before clearance" };
  });
}

function toTopRisks(result: CalculationResult | null): Array<{ title: string; why: string; mitigation: string }> {
  if (!result) return [];
  if (result.detailedRisks && result.detailedRisks.length > 0) {
    return result.detailedRisks.slice(0, 6).map((risk) => ({
      title: risk.title,
      why: risk.description,
      mitigation: risk.mitigation ?? "Validate assumptions with your broker before booking.",
    }));
  }
  if (result.risk_flags.length > 0) {
    return result.risk_flags.slice(0, 6).map((risk) => ({
      title: risk.title,
      why: risk.summary,
      mitigation: risk.recommended_action,
    }));
  }
  return [
    { title: "FX volatility", why: "A weaker ZAR can rapidly increase customs value and VAT.", mitigation: "Set FX thresholds and re-run before committing payment." },
    { title: "Freight quote drift", why: "Spot rates can shift after booking windows close.", mitigation: "Run a +20% and +50% freight stress check before final PO." },
    { title: "Classification confidence", why: "Ambiguous HS coding can change duty and permit requirements.", mitigation: "Capture broker confirmation before clearance." },
  ];
}

function buildCondensedRows(result: CalculationResult | null, freight: number, insurance: number, otherCosts: number): Array<{ key: string; label: string; amount: number; formula?: string }> {
  if (!result) return [];
  const duty = result.line_items.find((item) => item.key.toLowerCase().includes("duty"));
  const vat = result.line_items.find((item) => item.key.toLowerCase().includes("vat"));
  const customs = result.line_items.find((item) => item.key.toLowerCase().includes("customs"));
  return [
    { key: "customs", label: "Customs value", amount: customs?.amount_zar ?? Math.max(result.summary.total_landed_cost_zar - result.summary.total_taxes_zar, 0), formula: customs?.audit?.formula },
    { key: "freight", label: "Freight", amount: freight },
    { key: "insurance", label: "Insurance", amount: insurance },
    { key: "duty", label: "Duty", amount: duty?.amount_zar ?? 0, formula: duty?.audit?.formula },
    { key: "vat", label: "VAT", amount: vat?.amount_zar ?? 0, formula: vat?.audit?.formula },
    { key: "other", label: "Other fees", amount: otherCosts },
    { key: "total", label: "TOTAL", amount: result.summary.total_landed_cost_zar },
  ];
}

function exportBrief(dealLabel: string, verdict: Verdict, result: CalculationResult, marginPct: number | null): void {
  if (typeof window === "undefined") return;
  const lines = [
    "LandedCost OS - Decision Brief",
    `Deal: ${dealLabel}`,
    `Verdict: ${verdict}`,
    `Total landed cost: ${formatZar(result.summary.total_landed_cost_zar)}`,
    `Landed per unit: ${formatZar(result.summary.landed_cost_per_unit_zar)}`,
    `Margin: ${marginPct === null ? "N/A" : formatPct(marginPct)}`,
    `Break-even: ${typeof result.breakEvenPrice === "number" ? formatZar(result.breakEvenPrice) : "N/A"}`,
    `Tariff version: ${result.tariff.version}`,
    `Tariff updated: ${new Date(result.tariff.last_updated).toLocaleString("en-ZA")}`,
    `Generated: ${new Date().toLocaleString("en-ZA")}`,
  ].join("\n");
  const blob = new Blob([lines], { type: "text/plain;charset=utf-8" });
  const href = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = href;
  anchor.download = `decision-brief-${dealLabel.replace(/\s+/g, "-").toLowerCase()}.txt`;
  anchor.click();
  URL.revokeObjectURL(href);
}

export function LandedCostOSApp() {
  const router = useRouter();
  const { calculate, isLoading } = useCalculateLandedCost();
  const { inputs, updateInput, setInputs, result, status, setResult } = usePSEOCalculatorStore();
  const { isOffline, canInstall, promptInstall, refreshEligibility } = usePWAInstall();

  const [productDescription, setProductDescription] = useState("Solar panel kits");
  const [unitPrice, setUnitPrice] = useState(250);
  const [mode, setMode] = useState<"SEA" | "AIR">("SEA");
  const [freightPreset, setFreightPreset] = useState<"LOW" | "TYPICAL" | "HIGH">("TYPICAL");
  const [density, setDensity] = useState<DensityMode>("D1");
  const [darkMode, setDarkMode] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [drawerTarget, setDrawerTarget] = useState<DrawerTarget>(null);
  const [showFormulaNotes, setShowFormulaNotes] = useState(false);
  const [stressResult, setStressResult] = useState<StressResult | null>(null);
  const [stressLoading, setStressLoading] = useState<string | null>(null);
  const [installNudge, setInstallNudge] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    if (!inputs.originCountry) {
      setInputs({
        originCountry: "CN",
        currency: "USD",
        incoterm: "FOB",
        quantity: 100,
        freightCost: FREIGHT_PRESETS.SEA.TYPICAL,
        insuranceCost: 50,
        otherCharges: 0,
        exchangeRate: 18.5,
        importerType: "VAT_REGISTERED",
        hsCode: "854143",
        targetSellingPrice: 7200,
      });
    }
  }, [inputs.originCountry, setInputs]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const mq = window.matchMedia("(max-width: 767px)");
    const update = () => setIsMobile(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    const invoiceValue = Number((unitPrice * Math.max(inputs.quantity || 1, 1)).toFixed(2));
    if (inputs.invoiceValue !== invoiceValue) updateInput("invoiceValue", invoiceValue);
  }, [inputs.invoiceValue, inputs.quantity, unitPrice, updateInput]);

  useEffect(() => {
    const freightCost = FREIGHT_PRESETS[mode][freightPreset];
    if (inputs.freightCost !== freightCost) updateInput("freightCost", freightCost);
  }, [freightPreset, inputs.freightCost, mode, updateInput]);

  useEffect(() => {
    if (typeof document === "undefined") return;
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [darkMode]);

  const marginPct = computeMargin(result, inputs.targetSellingPrice ?? 0);
  const verdict = normalizeVerdict(result?.verdict, marginPct);

  const profitPerUnit = useMemo(() => {
    if (!result || !(inputs.targetSellingPrice && inputs.targetSellingPrice > 0)) return null;
    return inputs.targetSellingPrice - result.summary.landed_cost_per_unit_zar;
  }, [inputs.targetSellingPrice, result]);

  const breakEvenPerUnit = useMemo(() => {
    if (result?.breakEvenPrice) return result.breakEvenPrice;
    if (!result || !marginPct) return result?.summary.landed_cost_per_unit_zar ?? null;
    return result.summary.landed_cost_per_unit_zar / (1 - marginPct / 100);
  }, [marginPct, result]);

  const topRisks = useMemo(() => toTopRisks(result), [result]);
  const checklistRows = useMemo(() => toChecklistRows(result), [result]);
  const condensedRows = useMemo(
    () => buildCondensedRows(result, inputs.freightCost, inputs.insuranceCost, inputs.otherCharges),
    [inputs.freightCost, inputs.insuranceCost, inputs.otherCharges, result]
  );

  const hasResult = status === "success" && result !== null;

  const runStressTest = async (label: string, payload: { fxUpPct?: number; freightUpPct?: number; hsAlternative?: boolean }) => {
    if (!result) return;
    setStressLoading(label);
    try {
      const requestBody = {
        ...inputs,
        exchangeRate: payload.fxUpPct ? Number((inputs.exchangeRate * (1 + payload.fxUpPct / 100)).toFixed(4)) : inputs.exchangeRate,
        freightCost: payload.freightUpPct ? Number((inputs.freightCost * (1 + payload.freightUpPct / 100)).toFixed(2)) : inputs.freightCost,
        hsCode: payload.hsAlternative && result.hs.alternatives[0] ? result.hs.alternatives[0].hs6 : inputs.hsCode,
      };
      const response = await fetch("/api/calculate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      });
      if (!response.ok) throw new Error("stress test failed");
      const stressed = (await response.json()) as CalculationResult;
      const stressedMargin = computeMargin(stressed, inputs.targetSellingPrice ?? 0);
      setStressResult({
        label,
        deltaTotal: stressed.summary.total_landed_cost_zar - result.summary.total_landed_cost_zar,
        deltaMargin: stressedMargin !== null && marginPct !== null ? stressedMargin - marginPct : null,
      });
    } catch (error) {
      console.error(error);
      setStressResult(null);
    } finally {
      setStressLoading(null);
    }
  };

  const handleCalculate = async () => {
    await calculate();
    const successful = trackSuccessfulCalculation();
    refreshEligibility();
    if (successful >= 2) setInstallNudge(true);
    setDensity("D1");
    setShowDetails(false);
  };

  const saveDeal = () => {
    if (!result) return;
    const now = new Date().toISOString();
    const margin = computeMargin(result, inputs.targetSellingPrice ?? 0);
    const record: SavedDealRecord = {
      id: typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : `${Date.now()}`,
      label: productDescription || "Untitled deal",
      lane: "CN -> ZA",
      savedAt: now,
      tariffVersion: result.tariff.version,
      tariffUpdatedDate: result.tariff.last_updated,
      fxSource: FX_SOURCE,
      fxTimestamp: now,
      inputs: {
        productDescription,
        quantity: inputs.quantity,
        unitPrice,
        currency: inputs.currency as LocalDealInputs["currency"],
        incoterm: inputs.incoterm as LocalDealInputs["incoterm"],
        mode,
        freightPreset,
        freightCost: inputs.freightCost,
        sellingPricePerUnit: inputs.targetSellingPrice ?? 0,
        insuranceCost: inputs.insuranceCost,
        fxOverride: inputs.exchangeRate,
        otherCosts: inputs.otherCharges,
        hsCode: inputs.hsCode,
      },
      result: {
        totalLandedCost: result.summary.total_landed_cost_zar,
        landedPerUnit: result.summary.landed_cost_per_unit_zar,
        marginPct: margin,
        profitPerUnit,
        breakEvenPerUnit,
        verdict: normalizeVerdict(result.verdict, margin),
        lineItems: condensedRows.map((row) => ({ key: row.key, label: row.label, amount: row.amount, formula: row.formula })),
        topRisks: topRisks.slice(0, 6),
        checklist: checklistRows.slice(0, 8),
      },
    };
    upsertSavedDeal(record);
    seedAlertsFromDeal(record);
    refreshEligibility();
    router.push(`/deal/${record.id}`);
  };

  const rerunScenario = (scenario: "Baseline" | "Bulk" | "Fast") => {
    if (scenario === "Baseline") return;
    if (scenario === "Bulk") {
      updateInput("quantity", Math.max(200, Math.round(inputs.quantity * 1.8)));
      updateInput("freightCost", Math.max(800, Math.round(inputs.freightCost * 0.7)));
      return;
    }
    updateInput("freightCost", Math.round(inputs.freightCost * 1.45));
  };

  const currentDealLabel = `${productDescription || "Untitled"} (${inputs.originCountry || "CN"}->ZA)`;
  const trustLine = `Tariff ${result?.tariff.version ?? "latest"} | FX ${FX_SOURCE} | ${new Date().toLocaleString("en-ZA")}`;

  return (
    <div className="min-h-screen bg-[var(--lc-bg)] text-[var(--lc-text)] transition-colors duration-200">
      <LandedTopBar
        darkMode={darkMode}
        onToggleDarkMode={() => setDarkMode((prev) => !prev)}
        onInstall={async () => {
          await promptInstall();
        }}
        canInstall={canInstall}
        showInstallNudge={installNudge}
      />

      <main className="mx-auto w-full max-w-[1120px] px-4 pb-28 pt-6 sm:px-6">
        {!hasResult && (
          <section className="rounded-[16px] border border-[var(--lc-border)] bg-[var(--lc-surface)] p-5 shadow-[0_12px_36px_-30px_rgba(12,26,70,0.45)] sm:p-7">
            <div className="mb-5">
              <h1 className="text-2xl font-semibold tracking-tight">Instant landed cost verdict</h1>
              <p className="mt-1 text-sm text-[var(--lc-muted)]">Enter a deal in under 60 seconds. Details stay collapsed until you need them.</p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <div className="space-y-1.5 sm:col-span-2 lg:col-span-1">
                <Label htmlFor="product-description">Product description</Label>
                <Input
                  id="product-description"
                  value={productDescription}
                  onChange={(event) => setProductDescription(event.target.value)}
                  placeholder="e.g. Solar panel kits"
                  className="h-11 rounded-xl border-[var(--lc-border)]"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="quantity">Quantity</Label>
                <Input
                  id="quantity"
                  type="number"
                  min={1}
                  value={inputs.quantity || ""}
                  onChange={(event) => updateInput("quantity", Math.max(1, Number(event.target.value) || 1))}
                  className="h-11 rounded-xl border-[var(--lc-border)] numeric-value"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="unit-price">Unit price</Label>
                <div className="flex gap-2">
                  <Input
                    id="unit-price"
                    type="number"
                    value={unitPrice || ""}
                    onChange={(event) => setUnitPrice(Number(event.target.value) || 0)}
                    className="h-11 rounded-xl border-[var(--lc-border)] numeric-value"
                  />
                  <Select value={inputs.currency} onValueChange={(value) => updateInput("currency", value)}>
                    <SelectTrigger className="h-11 w-24 rounded-xl border-[var(--lc-border)]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {CURRENCIES.map((currency) => (
                        <SelectItem key={currency} value={currency}>
                          {currency}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="incoterm">Incoterm</Label>
                <Select value={inputs.incoterm} onValueChange={(value) => updateInput("incoterm", value)}>
                  <SelectTrigger id="incoterm" className="h-11 rounded-xl border-[var(--lc-border)]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {INCOTERMS.map((term) => (
                      <SelectItem key={term} value={term}>
                        {term}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label>Mode</Label>
                <div className="grid h-11 grid-cols-2 rounded-xl border border-[var(--lc-border)] bg-[var(--lc-subtle)] p-1">
                  <button
                    type="button"
                    className={cn("rounded-lg text-sm", mode === "SEA" ? "bg-[var(--lc-surface)] shadow-sm" : "text-[var(--lc-muted)]")}
                    onClick={() => setMode("SEA")}
                  >
                    Sea
                  </button>
                  <button
                    type="button"
                    className={cn("rounded-lg text-sm", mode === "AIR" ? "bg-[var(--lc-surface)] shadow-sm" : "text-[var(--lc-muted)]")}
                    onClick={() => setMode("AIR")}
                  >
                    Air
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="freight-preset">Freight estimate</Label>
                <Select value={freightPreset} onValueChange={(value) => setFreightPreset(value as LocalDealInputs["freightPreset"])}>
                  <SelectTrigger id="freight-preset" className="h-11 rounded-xl border-[var(--lc-border)]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="LOW">Low</SelectItem>
                    <SelectItem value="TYPICAL">Typical</SelectItem>
                    <SelectItem value="HIGH">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5 sm:col-span-2 lg:col-span-1">
                <Label htmlFor="selling-price">Selling price (ZAR / unit)</Label>
                <Input
                  id="selling-price"
                  type="number"
                  value={inputs.targetSellingPrice || ""}
                  onChange={(event) => updateInput("targetSellingPrice", Number(event.target.value) || 0)}
                  placeholder="Optional"
                  className="h-11 rounded-xl border-[var(--lc-border)] numeric-value"
                />
                <p className="text-xs text-[var(--lc-muted)]">Selling price unlocks profitability metrics.</p>
              </div>
            </div>

            <Accordion type="single" collapsible className="mt-4 rounded-xl border border-[var(--lc-border)] px-4">
              <AccordionItem value="advanced" className="border-b-0">
                <AccordionTrigger className="py-3 text-sm">Advanced inputs</AccordionTrigger>
                <AccordionContent>
                  <div className="grid gap-4 pb-2 sm:grid-cols-3">
                    <div className="space-y-1.5">
                      <Label htmlFor="insurance">Insurance</Label>
                      <Input
                        id="insurance"
                        type="number"
                        value={inputs.insuranceCost || ""}
                        onChange={(event) => updateInput("insuranceCost", Number(event.target.value) || 0)}
                        className="h-10 rounded-xl border-[var(--lc-border)] numeric-value"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="fx-override">FX override</Label>
                      <Input
                        id="fx-override"
                        type="number"
                        step="0.0001"
                        value={inputs.exchangeRate || ""}
                        onChange={(event) => updateInput("exchangeRate", Number(event.target.value) || 18.5)}
                        className="h-10 rounded-xl border-[var(--lc-border)] numeric-value"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="other-costs">Other costs</Label>
                      <Input
                        id="other-costs"
                        type="number"
                        value={inputs.otherCharges || ""}
                        onChange={(event) => updateInput("otherCharges", Number(event.target.value) || 0)}
                        className="h-10 rounded-xl border-[var(--lc-border)] numeric-value"
                      />
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>

            <div className="mt-5 flex items-center justify-between gap-3">
              <p className="text-xs text-[var(--lc-muted)]">Route: CN -&gt; ZA | Tariff snapshot used on calculation.</p>
              <Button
                type="button"
                onClick={handleCalculate}
                className="h-11 rounded-[14px] bg-[var(--lc-accent)] px-6 text-white hover:bg-[color-mix(in_srgb,var(--lc-accent)_88%,black)]"
                disabled={isLoading || !inputs.quantity || !unitPrice}
              >
                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Calculate
              </Button>
            </div>
          </section>
        )}

        {hasResult && result && (
          <>
            <section className="rounded-[16px] border border-[var(--lc-border)] bg-[var(--lc-surface)] p-5 sm:p-6">
              <div className="flex flex-wrap items-center gap-2 text-xs text-[var(--lc-muted)]">
                <span>{currentDealLabel}</span>
                <span>-</span>
                <span>HS {result.hs.confidence_bucket === "high" ? "confirmed" : "review needed"}</span>
                <span>-</span>
                <span>Tariff {result.tariff.version}</span>
              </div>

              <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                <div
                  className="inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-semibold"
                  style={{
                    backgroundColor: `color-mix(in srgb, ${getVerdictColor(verdict)} 16%, transparent)`,
                    color: getVerdictColor(verdict),
                  }}
                >
                  <Signal className="h-4 w-4" />
                  {verdict}
                </div>
                <button
                  type="button"
                  className="text-xs text-[var(--lc-muted)] underline-offset-2 hover:underline"
                  onClick={() => setDrawerTarget("ASSUMPTIONS")}
                >
                  {trustLine}
                </button>
              </div>

              <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <div className="rounded-xl border border-[var(--lc-border)] bg-[var(--lc-subtle)] p-3">
                  <p className="text-xs text-[var(--lc-muted)]">Total landed cost</p>
                  <p className="mt-1 text-lg font-semibold numeric-value">{formatZar(result.summary.total_landed_cost_zar)}</p>
                </div>
                <div className="rounded-xl border border-[var(--lc-border)] bg-[var(--lc-subtle)] p-3">
                  <p className="text-xs text-[var(--lc-muted)]">Landed cost / unit</p>
                  <p className="mt-1 text-lg font-semibold numeric-value">{formatZar(result.summary.landed_cost_per_unit_zar)}</p>
                </div>
                <div className="rounded-xl border border-[var(--lc-border)] bg-[var(--lc-subtle)] p-3">
                  <p className="text-xs text-[var(--lc-muted)]">Margin + profit / unit</p>
                  {marginPct === null ? (
                    <p className="mt-1 text-xs text-[var(--lc-muted)]">Add selling price to see margin</p>
                  ) : (
                    <p className="mt-1 text-lg font-semibold numeric-value">
                      {formatPct(marginPct)} / {profitPerUnit === null ? "-" : formatZar(profitPerUnit)}
                    </p>
                  )}
                </div>
                <div className="rounded-xl border border-[var(--lc-border)] bg-[var(--lc-subtle)] p-3">
                  <p className="text-xs text-[var(--lc-muted)]">Break-even / unit</p>
                  <p className="mt-1 text-lg font-semibold numeric-value">{breakEvenPerUnit === null ? "-" : formatZar(breakEvenPerUnit)}</p>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap items-center gap-2">
                <span className="rounded-full border border-[var(--lc-border)] px-2.5 py-1 text-xs text-[var(--lc-muted)]">
                  {verdict === "GO" ? "Healthy margin buffer" : verdict === "CAUTION" ? "Margin sensitive to shocks" : "Unprofitable without changes"}
                </span>
                <Button
                  type="button"
                  variant="ghost"
                  className="h-8 rounded-lg px-2.5 text-xs"
                  onClick={() => {
                    setShowDetails((prev) => !prev);
                    setDensity((prev) => (prev === "D1" ? "D2" : "D1"));
                  }}
                >
                  {showDetails ? "Hide details" : "Open details"}
                  <ChevronRight className={cn("ml-1 h-3.5 w-3.5 transition-transform", showDetails ? "rotate-90" : "rotate-0")} />
                </Button>
              </div>
            </section>

            <section className="mt-4 rounded-[16px] border border-[var(--lc-border)] bg-[var(--lc-surface)] p-5 sm:p-6">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold uppercase tracking-[0.08em] text-[var(--lc-muted)]">Condensed line items</h2>
                <button
                  type="button"
                  className="inline-flex items-center gap-1 text-xs text-[var(--lc-muted)] hover:text-[var(--lc-text)]"
                  onClick={() => setShowFormulaNotes((prev) => !prev)}
                >
                  Show details
                  <ChevronDown className={cn("h-3.5 w-3.5 transition-transform", showFormulaNotes ? "rotate-180" : "rotate-0")} />
                </button>
              </div>

              <div className="mt-3 divide-y divide-[var(--lc-border)] rounded-xl border border-[var(--lc-border)]">
                {condensedRows.map((row) => (
                  <div key={row.key} className="grid grid-cols-[1fr_auto] gap-4 px-3 py-2.5 text-sm sm:px-4">
                    <div>
                      <p className={cn("font-medium", row.key === "total" && "font-semibold")}>{row.label}</p>
                      {showFormulaNotes && row.formula ? <p className="mt-0.5 text-xs text-[var(--lc-muted)]">{row.formula}</p> : null}
                    </div>
                    <p className={cn("numeric-value", row.key === "total" && "font-semibold")}>{formatZar(row.amount)}</p>
                  </div>
                ))}
              </div>

              <div className="mt-4">
                <h3 className="text-xs font-medium uppercase tracking-[0.08em] text-[var(--lc-muted)]">1-click stress tests</h3>
                <div className="mt-2 flex flex-wrap gap-2">
                  <Button type="button" variant="outline" size="sm" className="rounded-full" disabled={stressLoading !== null} onClick={() => runStressTest("FX +5%", { fxUpPct: 5 })}>FX +5%</Button>
                  <Button type="button" variant="outline" size="sm" className="rounded-full" disabled={stressLoading !== null} onClick={() => runStressTest("FX +10%", { fxUpPct: 10 })}>FX +10%</Button>
                  <Button type="button" variant="outline" size="sm" className="rounded-full" disabled={stressLoading !== null} onClick={() => runStressTest("Freight +20%", { freightUpPct: 20 })}>Freight +20%</Button>
                  <Button type="button" variant="outline" size="sm" className="rounded-full" disabled={stressLoading !== null} onClick={() => runStressTest("Freight +50%", { freightUpPct: 50 })}>Freight +50%</Button>
                  {result.hs.confidence_bucket !== "high" ? (
                    <Button type="button" variant="outline" size="sm" className="rounded-full" disabled={stressLoading !== null} onClick={() => runStressTest("Alt HS (range)", { hsAlternative: true })}>Alt HS (range)</Button>
                  ) : null}
                </div>
                {stressLoading ? <p className="mt-2 text-xs text-[var(--lc-muted)]">Recomputing {stressLoading}...</p> : null}
                {stressResult ? (
                  <p className="mt-2 text-xs text-[var(--lc-muted)]">
                    {stressResult.label}: total {stressResult.deltaTotal >= 0 ? "+" : ""}
                    {formatZar(stressResult.deltaTotal)}
                    {stressResult.deltaMargin !== null ? `, margin ${stressResult.deltaMargin >= 0 ? "+" : ""}${formatPct(stressResult.deltaMargin)}` : ""}
                  </p>
                ) : null}
              </div>

              <div className="mt-4 grid gap-3 md:grid-cols-2">
                <button
                  type="button"
                  className="rounded-xl border border-[var(--lc-border)] bg-[var(--lc-subtle)] p-3 text-left"
                  onClick={() => setDrawerTarget("RISKS")}
                >
                  <p className="text-xs font-semibold uppercase tracking-[0.08em] text-[var(--lc-muted)]">Top 3 risks</p>
                  <div className="mt-2 space-y-2 text-sm">
                    {topRisks.slice(0, 3).map((risk) => (
                      <div key={risk.title}>
                        <p className="font-medium">{risk.title}</p>
                        <p className="text-xs text-[var(--lc-muted)]">{risk.why}</p>
                      </div>
                    ))}
                  </div>
                </button>

                <button
                  type="button"
                  className="rounded-xl border border-[var(--lc-border)] bg-[var(--lc-subtle)] p-3 text-left"
                  onClick={() => setDrawerTarget("CHECKLIST")}
                >
                  <p className="text-xs font-semibold uppercase tracking-[0.08em] text-[var(--lc-muted)]">Top 5 checklist</p>
                  <div className="mt-2 space-y-1.5 text-sm">
                    {checklistRows.slice(0, 5).map((item) => (
                      <p key={item.title} className="line-clamp-1">{item.title}</p>
                    ))}
                  </div>
                </button>
              </div>

              <div className="mt-5 flex flex-wrap items-center gap-2">
                <Button type="button" className="h-10 rounded-[14px] bg-[var(--lc-accent)] text-white hover:bg-[color-mix(in_srgb,var(--lc-accent)_88%,black)]" onClick={saveDeal}>
                  <Save className="mr-1.5 h-4 w-4" />
                  Save deal
                </Button>
                <Button type="button" variant="outline" className="h-10 rounded-[14px]" onClick={() => exportBrief(currentDealLabel, verdict, result, marginPct)}>
                  <Download className="mr-1.5 h-4 w-4" />
                  Export brief
                </Button>
                <Button type="button" variant="ghost" className="h-10 rounded-[14px]" onClick={() => router.push("/alerts")}>Set alerts</Button>
              </div>

              <button
                type="button"
                className="mt-3 inline-flex items-center gap-1 text-xs text-[var(--lc-muted)] hover:text-[var(--lc-text)]"
                onClick={() => setDrawerTarget("ASSUMPTIONS")}
              >
                <Shield className="h-3.5 w-3.5" />
                {trustLine}
              </button>
            </section>

            {showDetails && (
              <section className="mt-4 rounded-[16px] border border-[var(--lc-border)] bg-[var(--lc-surface)] p-5 sm:p-6">
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="text-sm font-semibold uppercase tracking-[0.08em] text-[var(--lc-muted)]">Results details ({density})</h2>
                  <span className="text-xs text-[var(--lc-muted)]">Only one dense section expanded at a time.</span>
                </div>

                <div className="grid gap-3 sm:grid-cols-3">
                  {[
                    { name: "Baseline", total: result.summary.total_landed_cost_zar, perUnit: result.summary.landed_cost_per_unit_zar },
                    { name: "Bulk", total: result.summary.total_landed_cost_zar * 0.93, perUnit: result.summary.landed_cost_per_unit_zar * 0.9 },
                    { name: "Fast", total: result.summary.total_landed_cost_zar * 1.17, perUnit: result.summary.landed_cost_per_unit_zar * 1.14 },
                  ].map((scenario) => (
                    <button
                      key={scenario.name}
                      type="button"
                      className="rounded-xl border border-[var(--lc-border)] p-3 text-left"
                      onClick={() => rerunScenario(scenario.name as "Baseline" | "Bulk" | "Fast")}
                    >
                      <p className="text-xs text-[var(--lc-muted)]">{scenario.name}</p>
                      <p className="mt-1 text-sm font-semibold numeric-value">{formatZar(scenario.total)}</p>
                      <p className="text-xs text-[var(--lc-muted)]">{formatZar(scenario.perUnit)} / unit</p>
                    </button>
                  ))}
                </div>

                <Accordion type="single" collapsible className="mt-4 rounded-xl border border-[var(--lc-border)] px-4">
                  <AccordionItem value="compare-table" className="border-b-0">
                    <AccordionTrigger className="py-3 text-sm">Scenario comparison table</AccordionTrigger>
                    <AccordionContent>
                      <div className="overflow-x-auto">
                        <table className="w-full min-w-[520px] text-sm">
                          <thead>
                            <tr className="text-left text-xs uppercase tracking-[0.08em] text-[var(--lc-muted)]">
                              <th className="py-2">Scenario</th>
                              <th className="py-2">Total</th>
                              <th className="py-2">Per-unit</th>
                              <th className="py-2">Margin</th>
                              <th className="py-2">Delta</th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr className="border-t border-[var(--lc-border)]">
                              <td className="py-2">Baseline</td>
                              <td className="py-2 numeric-value">{formatZar(result.summary.total_landed_cost_zar)}</td>
                              <td className="py-2 numeric-value">{formatZar(result.summary.landed_cost_per_unit_zar)}</td>
                              <td className="py-2 numeric-value">{marginPct === null ? "-" : formatPct(marginPct)}</td>
                              <td className="py-2">-</td>
                            </tr>
                            <tr className="border-t border-[var(--lc-border)]">
                              <td className="py-2">Bulk</td>
                              <td className="py-2 numeric-value">{formatZar(result.summary.total_landed_cost_zar * 0.93)}</td>
                              <td className="py-2 numeric-value">{formatZar(result.summary.landed_cost_per_unit_zar * 0.9)}</td>
                              <td className="py-2 numeric-value">{marginPct === null ? "-" : formatPct(marginPct + 3.8)}</td>
                              <td className="py-2">-7.0%</td>
                            </tr>
                            <tr className="border-t border-[var(--lc-border)]">
                              <td className="py-2">Fast</td>
                              <td className="py-2 numeric-value">{formatZar(result.summary.total_landed_cost_zar * 1.17)}</td>
                              <td className="py-2 numeric-value">{formatZar(result.summary.landed_cost_per_unit_zar * 1.14)}</td>
                              <td className="py-2 numeric-value">{marginPct === null ? "-" : formatPct(marginPct - 4.4)}</td>
                              <td className="py-2">+17.0%</td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </section>
            )}
          </>
        )}

        <section className="mt-8 space-y-6" aria-label="Educational content">
          <div className="rounded-[16px] border border-[var(--lc-border)] bg-[var(--lc-surface)] p-5">
            <h2 className="text-lg font-semibold">Worked examples</h2>
            <p className="mt-2 text-sm text-[var(--lc-muted)]">
              Example 1: FOB sea freight on 300 units generally lowers per-unit landed cost. Example 2: Air freight improves lead time but can reduce margin by 4-10 points.
            </p>
          </div>
          <div className="rounded-[16px] border border-[var(--lc-border)] bg-[var(--lc-surface)] p-5">
            <h2 className="text-lg font-semibold">FAQ</h2>
            <div className="mt-3 space-y-3 text-sm text-[var(--lc-muted)]">
              <p><strong className="text-[var(--lc-text)]">Does this work offline?</strong> Yes, with your latest cached tariff and FX snapshot.</p>
              <p><strong className="text-[var(--lc-text)]">How accurate are duties?</strong> Duty output depends on HS confidence and tariff version freshness.</p>
              <p><strong className="text-[var(--lc-text)]">When should I use details mode?</strong> Use it before final PO approval or when margins are in caution range.</p>
            </div>
          </div>
          <div className="rounded-[16px] border border-[var(--lc-border)] bg-[var(--lc-surface)] p-5">
            <h2 className="text-lg font-semibold">Risk and checklist guide</h2>
            <p className="mt-2 text-sm text-[var(--lc-muted)]">Top risks and action checklists are condensed by default and fully available inside drawers.</p>
          </div>
        </section>
      </main>

      {isMobile && (
        <div className="fixed bottom-0 left-0 right-0 z-40 h-16 border-t border-[var(--lc-border)] bg-[var(--lc-surface)]/95 px-4 py-2 backdrop-blur">
          <div className="mx-auto flex h-full w-full max-w-[1120px] items-center justify-between gap-2">
            {hasResult ? (
              <>
                <Button type="button" variant="outline" className="h-10 flex-1 rounded-[14px]" onClick={() => setResult(null)}>
                  Edit inputs
                </Button>
                <Button type="button" className="h-10 flex-1 rounded-[14px] bg-[var(--lc-accent)] text-white" onClick={saveDeal}>
                  Save deal
                </Button>
              </>
            ) : (
              <Button
                type="button"
                className="h-10 w-full rounded-[14px] bg-[var(--lc-accent)] text-white"
                onClick={handleCalculate}
                disabled={isLoading || !inputs.quantity || !unitPrice}
              >
                {isLoading ? "Calculating..." : "Calculate"}
              </Button>
            )}
          </div>
        </div>
      )}

      {(isOffline || status === "error") && (
        <div className="fixed bottom-20 left-4 right-4 z-40 mx-auto max-w-[1120px] rounded-xl border border-[color:color-mix(in_srgb,var(--lc-caution)_40%,var(--lc-border))] bg-[color:color-mix(in_srgb,var(--lc-caution)_14%,var(--lc-surface))] px-3 py-2 text-xs text-[var(--lc-text)]">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            <span>Offline mode active. Cached tariff/FX data may be stale.</span>
          </div>
        </div>
      )}

      <Sheet open={drawerTarget !== null} onOpenChange={(open) => (open ? undefined : setDrawerTarget(null))}>
        <SheetContent side={isMobile ? "bottom" : "right"} className="h-[85vh] overflow-y-auto border-[var(--lc-border)] sm:max-w-[460px]">
          {drawerTarget === "RISKS" ? (
            <>
              <SheetHeader>
                <SheetTitle>Risks</SheetTitle>
                <SheetDescription>Full risk list across classification, compliance, and delay impact.</SheetDescription>
              </SheetHeader>
              <div className="mt-4 space-y-3">
                {topRisks.map((risk) => (
                  <div key={risk.title} className="rounded-xl border border-[var(--lc-border)] p-3">
                    <p className="font-medium">{risk.title}</p>
                    <p className="mt-1 text-sm text-[var(--lc-muted)]">{risk.why}</p>
                    <p className="mt-1 text-xs text-[var(--lc-muted)]">Mitigation: {risk.mitigation}</p>
                  </div>
                ))}
              </div>
            </>
          ) : null}

          {drawerTarget === "CHECKLIST" ? (
            <>
              <SheetHeader>
                <SheetTitle>Checklist</SheetTitle>
                <SheetDescription>Grouped by timing with owner accountability.</SheetDescription>
              </SheetHeader>
              <div className="mt-4 space-y-3">
                {checklistRows.map((item) => (
                  <div key={`${item.title}-${item.when}`} className="rounded-xl border border-[var(--lc-border)] p-3">
                    <p className="font-medium">{item.title}</p>
                    <p className="mt-1 text-sm text-[var(--lc-muted)]">{item.why}</p>
                    <div className="mt-2 flex gap-2 text-xs text-[var(--lc-muted)]">
                      <span className="rounded-full border border-[var(--lc-border)] px-2 py-0.5">Owner: {item.owner}</span>
                      <span className="rounded-full border border-[var(--lc-border)] px-2 py-0.5">When: {item.when}</span>
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : null}

          {drawerTarget === "ASSUMPTIONS" ? (
            <>
              <SheetHeader>
                <SheetTitle>Assumptions and Freshness</SheetTitle>
                <SheetDescription>Formulas and data freshness details used for your decision.</SheetDescription>
              </SheetHeader>
              <div className="mt-4 space-y-3 text-sm">
                <div className="rounded-xl border border-[var(--lc-border)] p-3">
                  <p className="font-medium">VAT formula</p>
                  <p className="mt-1 text-[var(--lc-muted)]">VAT = 15% x (customs value + duty + freight + insurance + other costs).</p>
                </div>
                <div className="rounded-xl border border-[var(--lc-border)] p-3">
                  <p className="font-medium">Duty basis</p>
                  <p className="mt-1 text-[var(--lc-muted)]">Duty rate based on selected HS code and latest cached tariff version.</p>
                </div>
                <div className="rounded-xl border border-[var(--lc-border)] p-3">
                  <p className="font-medium">FX details</p>
                  <p className="mt-1 text-[var(--lc-muted)]">Source: {FX_SOURCE}</p>
                  <p className="mt-1 text-[var(--lc-muted)]">Applied rate: {inputs.exchangeRate.toFixed(4)}</p>
                </div>
                <div className="rounded-xl border border-[var(--lc-border)] p-3">
                  <p className="font-medium">Freight assumption</p>
                  <p className="mt-1 text-[var(--lc-muted)]">Mode {mode}, preset {freightPreset}, amount {formatZar(inputs.freightCost)}.</p>
                </div>
                <div className="rounded-xl border border-[var(--lc-border)] p-3">
                  <p className="font-medium">Known exclusions</p>
                  <p className="mt-1 text-[var(--lc-muted)]">Demurrage, storage, and post-clearance trucking are not automatically included.</p>
                </div>
              </div>
            </>
          ) : null}
        </SheetContent>
      </Sheet>

      <div className="sr-only" aria-live="polite">
        {status === "calculating" ? "Calculating landed cost" : null}
        {status === "success" ? "Calculation complete" : null}
      </div>

      <style jsx global>{`
        @media (prefers-reduced-motion: reduce) {
          *,
          *::before,
          *::after {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
            scroll-behavior: auto !important;
          }
        }
      `}</style>
    </div>
  );
}
