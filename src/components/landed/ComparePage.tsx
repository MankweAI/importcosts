"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { getSavedDeals } from "@/lib/landed/localStorage";
import { SavedDealRecord } from "@/types/landed-os";

function formatZar(value: number): string {
  return new Intl.NumberFormat("en-ZA", {
    style: "currency",
    currency: "ZAR",
    maximumFractionDigits: 0,
  }).format(value);
}

export function ComparePage() {
  const [deals] = useState<SavedDealRecord[]>(() => (typeof window === "undefined" ? [] : getSavedDeals()));

  const baseline = useMemo(() => deals[0], [deals]);

  return (
    <section className="rounded-[16px] border border-[var(--lc-border)] bg-[var(--lc-surface)] p-5 sm:p-6">
      <h1 className="text-xl font-semibold">Scenario comparison</h1>
      <p className="mt-1 text-sm text-[var(--lc-muted)]">Compare saved deals across landed cost, margin, and break-even.</p>

      {deals.length === 0 ? (
        <div className="mt-6 rounded-xl border border-dashed border-[var(--lc-border)] p-6 text-sm text-[var(--lc-muted)]">
          No saved deals yet. Create one from the <Link href="/" className="underline underline-offset-2">calculator</Link>.
        </div>
      ) : (
        <div className="mt-5 overflow-x-auto rounded-xl border border-[var(--lc-border)]">
          <table className="w-full min-w-[760px] text-sm">
            <thead>
              <tr className="border-b border-[var(--lc-border)] text-left text-xs uppercase tracking-[0.08em] text-[var(--lc-muted)]">
                <th className="px-4 py-3">Deal</th>
                <th className="px-4 py-3">Total landed</th>
                <th className="px-4 py-3">Per unit</th>
                <th className="px-4 py-3">Margin</th>
                <th className="px-4 py-3">Break-even</th>
                <th className="px-4 py-3">Delta vs baseline</th>
              </tr>
            </thead>
            <tbody>
              {deals.map((deal) => {
                const delta = baseline ? deal.result.totalLandedCost - baseline.result.totalLandedCost : 0;
                return (
                  <tr key={deal.id} className="border-b border-[var(--lc-border)] last:border-b-0">
                    <td className="px-4 py-3">
                      <Link href={`/deal/${deal.id}`} className="font-medium underline-offset-2 hover:underline">
                        {deal.label}
                      </Link>
                    </td>
                    <td className="px-4 py-3 numeric-value">{formatZar(deal.result.totalLandedCost)}</td>
                    <td className="px-4 py-3 numeric-value">{formatZar(deal.result.landedPerUnit)}</td>
                    <td className="px-4 py-3 numeric-value">{deal.result.marginPct === null ? "-" : `${deal.result.marginPct.toFixed(1)}%`}</td>
                    <td className="px-4 py-3 numeric-value">{deal.result.breakEvenPerUnit === null ? "-" : formatZar(deal.result.breakEvenPerUnit)}</td>
                    <td className="px-4 py-3 numeric-value">
                      {delta >= 0 ? "+" : ""}
                      {formatZar(delta)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
