"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Download, RefreshCcw, Bell, PencilLine } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { SavedDealRecord } from "@/types/landed-os";
import { getSavedDeal, upsertSavedDeal } from "@/lib/landed/localStorage";
import { CalculationResult } from "@/types/pseo";
import { format } from "date-fns";
import { usePWAInstall } from "@/hooks/usePWAInstall";

function formatZar(value: number): string {
  return new Intl.NumberFormat("en-ZA", {
    style: "currency",
    currency: "ZAR",
    maximumFractionDigits: 0,
  }).format(value);
}

function formatPct(value: number | null): string {
  if (value === null) {
    return "-";
  }
  return `${value.toFixed(1)}%`;
}

interface SavedDealPageProps {
  dealId: string;
}

export function SavedDealPage({ dealId }: SavedDealPageProps) {
  const router = useRouter();
  const [deal, setDeal] = useState<SavedDealRecord | null>(() => (typeof window === "undefined" ? null : getSavedDeal(dealId)));
  const [isReRunning, setIsReRunning] = useState(false);
  const { canInstall, promptInstall } = usePWAInstall();

  const calculatedAt = useMemo(() => {
    if (!deal) {
      return "";
    }
    return format(new Date(deal.savedAt), "dd MMM yyyy HH:mm");
  }, [deal]);

  if (!deal) {
    return (
      <section className="rounded-[16px] border border-[var(--lc-border)] bg-[var(--lc-surface)] p-6">
        <h1 className="text-xl font-semibold">Saved deal not found</h1>
        <p className="mt-2 text-sm text-[var(--lc-muted)]">The deal may have been removed from local storage.</p>
        <Button type="button" className="mt-4" onClick={() => router.push("/")}>
          Back to calculator
        </Button>
      </section>
    );
  }

  const rerunWithLatestData = async () => {
    setIsReRunning(true);
    try {
      const requestBody = {
        invoiceValue: deal.inputs.unitPrice * deal.inputs.quantity,
        quantity: deal.inputs.quantity,
        currency: deal.inputs.currency,
        incoterm: deal.inputs.incoterm,
        freightCost: deal.inputs.freightCost,
        insuranceCost: deal.inputs.insuranceCost,
        otherCharges: deal.inputs.otherCosts,
        exchangeRate: deal.inputs.fxOverride,
        importerType: "VAT_REGISTERED",
        originCountry: "CN",
        hsCode: deal.inputs.hsCode,
        targetSellingPrice: deal.inputs.sellingPricePerUnit,
      };

      const response = await fetch("/api/calculate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        throw new Error("Failed to rerun");
      }

      const nextResult = (await response.json()) as CalculationResult;
      const nextMargin = typeof nextResult.grossMarginPercent === "number" ? nextResult.grossMarginPercent : deal.result.marginPct;
      const nextRecord: SavedDealRecord = {
        ...deal,
        savedAt: new Date().toISOString(),
        tariffVersion: nextResult.tariff.version,
        tariffUpdatedDate: nextResult.tariff.last_updated,
        result: {
          ...deal.result,
          totalLandedCost: nextResult.summary.total_landed_cost_zar,
          landedPerUnit: nextResult.summary.landed_cost_per_unit_zar,
          marginPct: nextMargin,
          breakEvenPerUnit: nextResult.breakEvenPrice ?? deal.result.breakEvenPerUnit,
          lineItems: nextResult.line_items.slice(0, 7).map((item) => ({
            key: item.key,
            label: item.label,
            amount: item.amount_zar,
            formula: item.audit?.formula,
          })),
        },
      };

      upsertSavedDeal(nextRecord);
      setDeal(nextRecord);
    } catch (error) {
      console.error(error);
    } finally {
      setIsReRunning(false);
    }
  };

  return (
    <div className="space-y-4">
      <section className="rounded-[16px] border border-[var(--lc-border)] bg-[var(--lc-surface)] p-5 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.08em] text-[var(--lc-muted)]">Saved deal</p>
            <h1 className="text-xl font-semibold">{deal.label}</h1>
            <p className="mt-1 text-sm text-[var(--lc-muted)]">Last run: {calculatedAt} | {deal.lane}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-[var(--lc-muted)]">Tariff {deal.tariffVersion}</p>
            <p className="text-xs text-[var(--lc-muted)]">FX {deal.fxSource} @ {format(new Date(deal.fxTimestamp), "dd MMM HH:mm")}</p>
          </div>
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl border border-[var(--lc-border)] bg-[var(--lc-subtle)] p-3">
            <p className="text-xs text-[var(--lc-muted)]">Total landed cost</p>
            <p className="mt-1 text-lg font-semibold numeric-value">{formatZar(deal.result.totalLandedCost)}</p>
          </div>
          <div className="rounded-xl border border-[var(--lc-border)] bg-[var(--lc-subtle)] p-3">
            <p className="text-xs text-[var(--lc-muted)]">Per unit</p>
            <p className="mt-1 text-lg font-semibold numeric-value">{formatZar(deal.result.landedPerUnit)}</p>
          </div>
          <div className="rounded-xl border border-[var(--lc-border)] bg-[var(--lc-subtle)] p-3">
            <p className="text-xs text-[var(--lc-muted)]">Margin</p>
            <p className="mt-1 text-lg font-semibold numeric-value">{formatPct(deal.result.marginPct)}</p>
          </div>
          <div className="rounded-xl border border-[var(--lc-border)] bg-[var(--lc-subtle)] p-3">
            <p className="text-xs text-[var(--lc-muted)]">Break-even</p>
            <p className="mt-1 text-lg font-semibold numeric-value">{deal.result.breakEvenPerUnit === null ? "-" : formatZar(deal.result.breakEvenPerUnit)}</p>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <Button type="button" className="rounded-[14px] bg-[var(--lc-accent)] text-white" onClick={() => router.push("/alerts")}>
            <Bell className="mr-1.5 h-4 w-4" />
            Set alerts
          </Button>
          <Button type="button" variant="outline" className="rounded-[14px]" onClick={() => void promptInstall()} disabled={!canInstall}>
            Install app
          </Button>
          <Button type="button" variant="outline" className="rounded-[14px]" onClick={rerunWithLatestData} disabled={isReRunning}>
            <RefreshCcw className="mr-1.5 h-4 w-4" />
            {isReRunning ? "Rerunning..." : "Rerun with latest data"}
          </Button>
          <Button
            type="button"
            variant="outline"
            className="rounded-[14px]"
            onClick={() => {
              const payload = JSON.stringify(deal, null, 2);
              const blob = new Blob([payload], { type: "application/json" });
              const url = URL.createObjectURL(blob);
              const anchor = document.createElement("a");
              anchor.href = url;
              anchor.download = `${deal.label.toLowerCase().replace(/\s+/g, "-")}-brief.json`;
              anchor.click();
              URL.revokeObjectURL(url);
            }}
          >
            <Download className="mr-1.5 h-4 w-4" />
            Export brief
          </Button>
        </div>
      </section>

      <section className="rounded-[16px] border border-[var(--lc-border)] bg-[var(--lc-surface)] p-5 sm:p-6">
        <Accordion type="single" collapsible defaultValue="edit-inputs">
          <AccordionItem value="edit-inputs" className="border-b-0">
            <AccordionTrigger className="py-3 text-sm">
              <span className="inline-flex items-center gap-2">
                <PencilLine className="h-4 w-4" />
                Edit inputs
              </span>
            </AccordionTrigger>
            <AccordionContent>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                <div className="rounded-xl border border-[var(--lc-border)] p-3 text-sm">
                  <p className="text-xs text-[var(--lc-muted)]">Product</p>
                  <p>{deal.inputs.productDescription}</p>
                </div>
                <div className="rounded-xl border border-[var(--lc-border)] p-3 text-sm">
                  <p className="text-xs text-[var(--lc-muted)]">Quantity</p>
                  <p className="numeric-value">{deal.inputs.quantity}</p>
                </div>
                <div className="rounded-xl border border-[var(--lc-border)] p-3 text-sm">
                  <p className="text-xs text-[var(--lc-muted)]">Unit price</p>
                  <p className="numeric-value">{deal.inputs.currency} {deal.inputs.unitPrice}</p>
                </div>
                <div className="rounded-xl border border-[var(--lc-border)] p-3 text-sm">
                  <p className="text-xs text-[var(--lc-muted)]">Freight</p>
                  <p className="numeric-value">{formatZar(deal.inputs.freightCost)}</p>
                </div>
                <div className="rounded-xl border border-[var(--lc-border)] p-3 text-sm">
                  <p className="text-xs text-[var(--lc-muted)]">FX override</p>
                  <p className="numeric-value">{deal.inputs.fxOverride.toFixed(4)}</p>
                </div>
                <div className="rounded-xl border border-[var(--lc-border)] p-3 text-sm">
                  <p className="text-xs text-[var(--lc-muted)]">Selling price</p>
                  <p className="numeric-value">{formatZar(deal.inputs.sellingPricePerUnit)}</p>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </section>

      <section className="rounded-[16px] border border-[var(--lc-border)] bg-[var(--lc-surface)] p-5 sm:p-6">
        <h2 className="text-sm font-semibold uppercase tracking-[0.08em] text-[var(--lc-muted)]">Line items</h2>
        <div className="mt-3 divide-y divide-[var(--lc-border)] rounded-xl border border-[var(--lc-border)]">
          {deal.result.lineItems.map((item) => (
            <div key={item.key} className="grid grid-cols-[1fr_auto] gap-3 px-3 py-2.5 text-sm sm:px-4">
              <span>{item.label}</span>
              <span className="numeric-value">{formatZar(item.amount)}</span>
            </div>
          ))}
        </div>
      </section>

      <div className="text-sm text-[var(--lc-muted)]">
        <Link href="/" className="underline underline-offset-2">Back to calculator</Link>
      </div>
    </div>
  );
}
