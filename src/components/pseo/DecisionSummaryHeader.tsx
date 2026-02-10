"use client";

import { useState } from "react";
import { usePSEOCalculatorStore } from "@/store/usePSEOCalculatorStore";
import { Button } from "@/components/ui/button";
import { AlertTriangle, CheckCircle, ChevronDown, ChevronUp } from "lucide-react";
import { DetailedBreakdownTray } from "./DetailedBreakdownTray";

export function DecisionSummaryHeader() {
    const { result, status } = usePSEOCalculatorStore();
    const [expanded, setExpanded] = useState(false);

    if (status !== 'success' || !result) return null;

    const confidenceColor =
        result.hs.confidence_bucket === 'high' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400' :
            result.hs.confidence_bucket === 'medium' ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400' :
                'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';

    const confidenceLabel =
        result.hs.confidence_bucket === 'high' ? 'High Confidence' :
            result.hs.confidence_bucket === 'medium' ? 'Medium Confidence' :
                'Low Confidence - Review Needed';

    return (
        <div className="space-y-0">
            {/* Summary Card */}
            <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-6 shadow-sm">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-50">Estimated Landed Cost</h2>
                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${confidenceColor} flex items-center gap-1`}>
                                {result.hs.confidence_bucket === 'high' ? <CheckCircle className="h-3 w-3" /> : <AlertTriangle className="h-3 w-3" />}
                                {confidenceLabel}
                            </span>
                        </div>
                        <div className="flex items-baseline gap-2">
                            <span className="text-4xl font-bold text-neutral-900 dark:text-white">
                                R {result.summary.total_landed_cost_zar.toLocaleString('en-ZA', { maximumFractionDigits: 2 })}
                            </span>
                            <span className="text-sm text-neutral-500">
                                (R {result.summary.landed_cost_per_unit_zar.toLocaleString('en-ZA')} / unit)
                            </span>
                        </div>
                        <p className="text-sm text-neutral-500 mt-1">
                            Includes R {result.summary.total_taxes_zar.toLocaleString('en-ZA', { maximumFractionDigits: 0 })} in duties &amp; taxes.
                        </p>
                    </div>

                    <div className="flex gap-3">
                        {result.hs.confidence_bucket !== 'high' && (
                            <Button variant="secondary" className="gap-2">
                                <AlertTriangle className="h-4 w-4" />
                                Verify HS Code
                            </Button>
                        )}

                        <Button
                            variant="outline"
                            className="gap-2"
                            onClick={() => setExpanded(!expanded)}
                        >
                            {expanded ? 'Hide Breakdown' : 'See Breakdown'}
                            {expanded
                                ? <ChevronUp className="h-4 w-4" />
                                : <ChevronDown className="h-4 w-4" />
                            }
                        </Button>
                    </div>
                </div>
            </div>

            {/* Inline Breakdown — slides open below */}
            <div
                className={`overflow-hidden transition-all duration-300 ease-in-out ${expanded ? 'max-h-[2000px] opacity-100 mt-3' : 'max-h-0 opacity-0'}`}
            >
                <DetailedBreakdownTray
                    result={result}
                    onClose={() => setExpanded(false)}
                />
            </div>
        </div>
    );
}
