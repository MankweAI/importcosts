"use client";

import { SmartRateResult } from "@/lib/calc/smartRateHunter";
import { CheckCircle2, TrendingDown, AlertTriangle, FileText, Globe } from "lucide-react";

interface Props {
    rateHunterResult: SmartRateResult;
}

export function SourcingRecommendations({ rateHunterResult }: Props) {
    const { insight } = rateHunterResult;

    if (insight.type === "best_rate") {
        return <BestRateCard headline={insight.headline} explanation={insight.explanation} originsChecked={insight.originsChecked} />;
    }

    return <SavingsCard insight={insight} />;
}

/* ─── Best Rate (No Savings) ─── */
function BestRateCard({ headline, explanation, originsChecked }: { headline: string; explanation: string; originsChecked: number }) {
    return (
        <div className="rounded-xl border-2 border-emerald-200 dark:border-emerald-800 bg-gradient-to-br from-emerald-50 via-white to-teal-50 dark:from-emerald-950/40 dark:via-neutral-900 dark:to-teal-950/40 p-6">
            <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-900 flex items-center justify-center">
                    <CheckCircle2 className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div>
                    <h3 className="text-lg font-bold text-emerald-800 dark:text-emerald-200">
                        {headline}
                    </h3>
                    <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1 leading-relaxed">
                        {explanation}
                    </p>
                    <p className="text-xs text-neutral-400 mt-3">
                        Based on analysis of {originsChecked} alternative sourcing origins
                    </p>
                </div>
            </div>
        </div>
    );
}

/* ─── Savings Found ─── */
function SavingsCard({ insight }: { insight: SmartRateResult["insight"] }) {
    if (insight.type !== "savings_found" || !insight.comparison) return null;
    const { current, better } = insight.comparison;

    const frictionLabel: Record<string, { text: string; color: string }> = {
        low: { text: "Easy switch", color: "text-emerald-600" },
        medium: { text: "Extra paperwork needed", color: "text-amber-600" },
        high: { text: "Complex — permits may apply", color: "text-red-600" },
    };
    const friction = frictionLabel[better.frictionLevel] || frictionLabel.medium;

    return (
        <div className="rounded-xl border-2 border-blue-200 dark:border-blue-800 bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-blue-950/40 dark:via-neutral-900 dark:to-indigo-950/40 overflow-hidden">
            {/* Header */}
            <div className="p-5 pb-4">
                <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                        <TrendingDown className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-blue-900 dark:text-blue-100">
                            💡 {insight.headline}
                        </h3>
                        <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1 leading-relaxed">
                            {insight.explanation}
                        </p>
                    </div>
                </div>
            </div>

            {/* Comparison Table */}
            <div className="mx-5 mb-5 rounded-lg overflow-hidden border border-neutral-200 dark:border-neutral-700">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="bg-neutral-100 dark:bg-neutral-800">
                            <th className="text-left py-2.5 px-4 text-xs font-medium text-neutral-500 uppercase tracking-wide w-[35%]"></th>
                            <th className="text-center py-2.5 px-4 text-xs font-medium text-neutral-500 uppercase tracking-wide">
                                {current.label} <span className="text-[10px] normal-case opacity-60">({current.iso})</span>
                            </th>
                            <th className="text-center py-2.5 px-4 text-xs font-medium uppercase tracking-wide text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/30">
                                {better.label} <span className="text-[10px] normal-case opacity-60">({better.iso})</span>
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
                        <ComparisonRow
                            label="Landed Cost"
                            current={`R ${current.landedCost.toLocaleString("en-ZA", { maximumFractionDigits: 0 })}`}
                            better={`R ${better.landedCost.toLocaleString("en-ZA", { maximumFractionDigits: 0 })}`}
                            highlight
                        />
                        <ComparisonRow label="Duty Rate" current={current.dutyRate} better={better.dutyRate} />
                        <ComparisonRow
                            label="You Save"
                            current="—"
                            better={`R ${better.savingsAmount.toLocaleString("en-ZA", { maximumFractionDigits: 0 })} (${better.savingsPct.toFixed(1)}%)`}
                            highlight
                        />
                        <ComparisonRow label="Trade Agreement" current="None" better={better.tradeAgreement} />
                        {better.extraDocs.length > 0 && (
                            <ComparisonRow label="Extra Paperwork" current="—" better={better.extraDocs.join(", ")} />
                        )}
                    </tbody>
                </table>
            </div>

            {/* Footer */}
            <div className="px-5 pb-4 flex items-center justify-between text-xs text-neutral-400">
                <div className="flex items-center gap-2">
                    {better.frictionLevel === "medium" && <FileText className="w-3.5 h-3.5" />}
                    {better.frictionLevel === "high" && <AlertTriangle className="w-3.5 h-3.5" />}
                    <span className={friction.color}>{friction.text}</span>
                </div>
                <span className="flex items-center gap-1">
                    <Globe className="w-3 h-3" /> {insight.originsChecked} origins analyzed
                </span>
            </div>
        </div>
    );
}

function ComparisonRow({
    label, current, better, highlight,
}: {
    label: string; current: string; better: string; highlight?: boolean;
}) {
    return (
        <tr>
            <td className="py-2.5 px-4 text-xs font-medium text-neutral-500">{label}</td>
            <td className="py-2.5 px-4 text-center text-neutral-600 dark:text-neutral-400">{current}</td>
            <td className={`py-2.5 px-4 text-center bg-blue-50/50 dark:bg-blue-950/20 ${highlight ? "font-semibold text-blue-700 dark:text-blue-300" : "text-neutral-700 dark:text-neutral-300"}`}>
                {better}
            </td>
        </tr>
    );
}
