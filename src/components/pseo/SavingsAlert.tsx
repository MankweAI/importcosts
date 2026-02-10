"use client";

import { SmartRateResult, AlternativeOrigin } from "@/lib/calc/smartRateHunter";
import { AlertTriangle, TrendingDown, Shield, FileText, ArrowRight, X } from "lucide-react";
import { useState } from "react";

interface SavingsAlertProps {
    rateHunterResult: SmartRateResult | null;
    loading: boolean;
    onViewComparison: () => void;
}

/**
 * A prominent alert banner that shows when the Smart Rate Hunter 
 * finds a cheaper alternative origin.
 */
export function SavingsAlert({ rateHunterResult, loading, onViewComparison }: SavingsAlertProps) {
    const [dismissed, setDismissed] = useState(false);

    if (dismissed || loading || !rateHunterResult) return null;

    const best = rateHunterResult.bestAlternative;
    if (!best || best.savingsVsBase <= 0) return null;

    const savingsFormatted = best.savingsVsBase.toLocaleString('en-ZA', { maximumFractionDigits: 0 });
    const savingsPctFormatted = best.savingsPct.toFixed(1);

    return (
        <div className="mb-6 relative overflow-hidden rounded-lg border-2 border-emerald-200 dark:border-emerald-800 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/50 dark:to-teal-950/50 p-4">
            {/* Dismiss button */}
            <button
                onClick={() => setDismissed(true)}
                className="absolute top-2 right-2 p-1 rounded-full hover:bg-emerald-100 dark:hover:bg-emerald-900 text-neutral-400 hover:text-neutral-600 transition-colors"
                aria-label="Dismiss"
            >
                <X className="h-4 w-4" />
            </button>

            <div className="flex items-start gap-3">
                <div className="flex-shrink-0 p-2 bg-emerald-100 dark:bg-emerald-900 rounded-lg">
                    <TrendingDown className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-emerald-800 dark:text-emerald-200 text-sm">
                        💡 Savings Opportunity Detected
                    </h4>
                    <p className="text-sm text-emerald-700 dark:text-emerald-300 mt-1">
                        Sourcing from <strong>{best.originLabel}</strong> ({best.zone}) could save you{' '}
                        <strong className="text-emerald-600 dark:text-emerald-400">R{savingsFormatted}</strong>{' '}
                        ({savingsPctFormatted}% less) on landed cost.
                    </p>

                    {/* Friction warning */}
                    {best.frictionLevel === "medium" && (
                        <p className="text-xs text-amber-600 dark:text-amber-400 mt-1 flex items-center gap-1">
                            <FileText className="h-3 w-3" /> Requires additional documentation (e.g. Certificate of Origin)
                        </p>
                    )}
                    {best.frictionLevel === "high" && (
                        <p className="text-xs text-red-600 dark:text-red-400 mt-1 flex items-center gap-1">
                            <AlertTriangle className="h-3 w-3" /> High compliance complexity — permits may be required
                        </p>
                    )}

                    <button
                        onClick={onViewComparison}
                        className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-emerald-700 dark:text-emerald-300 hover:text-emerald-900 dark:hover:text-emerald-100 underline underline-offset-2"
                    >
                        View Full Comparison <ArrowRight className="h-3 w-3" />
                    </button>
                </div>
            </div>
        </div>
    );
}

/**
 * Full comparison matrix showing all strategy origins side-by-side.
 */
interface ComparisonMatrixProps {
    rateHunterResult: SmartRateResult;
}

export function ComparisonMatrix({ rateHunterResult }: ComparisonMatrixProps) {
    const { alternatives, baseLandedCost, baseOrigin } = rateHunterResult;

    if (alternatives.length === 0) {
        return (
            <div className="text-sm text-neutral-500 text-center py-4">
                No alternative origins available for comparison.
            </div>
        );
    }

    const frictionColors = {
        low: "text-emerald-600 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-950",
        medium: "text-amber-600 bg-amber-50 dark:text-amber-400 dark:bg-amber-950",
        high: "text-red-600 bg-red-50 dark:text-red-400 dark:bg-red-950",
    };

    const frictionLabels = {
        low: "Easy Switch",
        medium: "Docs Required",
        high: "Complex",
    };

    return (
        <div className="overflow-x-auto rounded-lg border border-neutral-200 dark:border-neutral-800">
            <table className="w-full text-sm">
                <thead>
                    <tr className="bg-neutral-50 dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-800">
                        <th className="text-left py-2 px-3 font-medium text-neutral-500 text-xs uppercase tracking-wide">Origin</th>
                        <th className="text-right py-2 px-3 font-medium text-neutral-500 text-xs uppercase tracking-wide">Landed Cost</th>
                        <th className="text-right py-2 px-3 font-medium text-neutral-500 text-xs uppercase tracking-wide">Duty Rate</th>
                        <th className="text-right py-2 px-3 font-medium text-neutral-500 text-xs uppercase tracking-wide">Savings</th>
                        <th className="text-center py-2 px-3 font-medium text-neutral-500 text-xs uppercase tracking-wide">Risk</th>
                        <th className="text-center py-2 px-3 font-medium text-neutral-500 text-xs uppercase tracking-wide">Friction</th>
                    </tr>
                </thead>
                <tbody>
                    {/* Base origin row */}
                    <tr className="border-b border-neutral-100 dark:border-neutral-800 bg-blue-50/50 dark:bg-blue-950/20">
                        <td className="py-2.5 px-3">
                            <div className="font-semibold text-neutral-900 dark:text-neutral-100">{baseOrigin}</div>
                            <div className="text-xs text-blue-600 dark:text-blue-400">Your selection</div>
                        </td>
                        <td className="text-right py-2.5 px-3 font-semibold text-neutral-900 dark:text-neutral-100">
                            R {baseLandedCost.toLocaleString('en-ZA', { maximumFractionDigits: 0 })}
                        </td>
                        <td className="text-right py-2.5 px-3 text-neutral-500">—</td>
                        <td className="text-right py-2.5 px-3 text-neutral-400">Baseline</td>
                        <td className="text-center py-2.5 px-3">—</td>
                        <td className="text-center py-2.5 px-3">—</td>
                    </tr>

                    {/* Alternative rows */}
                    {alternatives.map((alt) => {
                        const isCheaper = alt.savingsVsBase > 0;
                        return (
                            <tr key={alt.originIso} className="border-b border-neutral-100 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-900/50 transition-colors">
                                <td className="py-2.5 px-3">
                                    <div className="font-medium text-neutral-800 dark:text-neutral-200">{alt.originLabel}</div>
                                    <div className="text-xs text-neutral-400">{alt.zone}</div>
                                </td>
                                <td className={`text-right py-2.5 px-3 font-semibold ${isCheaper ? 'text-emerald-600 dark:text-emerald-400' : 'text-neutral-600 dark:text-neutral-400'}`}>
                                    R {alt.landedCostTotal.toLocaleString('en-ZA', { maximumFractionDigits: 0 })}
                                </td>
                                <td className="text-right py-2.5 px-3 text-neutral-600 dark:text-neutral-400">
                                    {alt.dutyRate}
                                </td>
                                <td className={`text-right py-2.5 px-3 font-medium ${isCheaper ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500 dark:text-red-400'}`}>
                                    {isCheaper ? '↓' : '↑'} R {Math.abs(alt.savingsVsBase).toLocaleString('en-ZA', { maximumFractionDigits: 0 })}
                                    <span className="text-xs ml-1 opacity-70">({Math.abs(alt.savingsPct).toFixed(1)}%)</span>
                                </td>
                                <td className="text-center py-2.5 px-3">
                                    <RiskBadge score={alt.complianceRiskScore} />
                                </td>
                                <td className="text-center py-2.5 px-3">
                                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${frictionColors[alt.frictionLevel]}`}>
                                        {frictionLabels[alt.frictionLevel]}
                                    </span>
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
}

function RiskBadge({ score }: { score: number }) {
    let color = "text-emerald-600 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-950";
    let label = "Low";

    if (score >= 7) {
        color = "text-red-600 bg-red-50 dark:text-red-400 dark:bg-red-950";
        label = "High";
    } else if (score >= 4) {
        color = "text-amber-600 bg-amber-50 dark:text-amber-400 dark:bg-amber-950";
        label = "Med";
    }

    return (
        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${color}`}>
            {label} ({score})
        </span>
    );
}
