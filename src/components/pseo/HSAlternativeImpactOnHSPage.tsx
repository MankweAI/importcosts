"use client";

import { usePSEOCalculatorStore } from "@/store/usePSEOCalculatorStore";
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp, Sparkles, TrendingDown, TrendingUp, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

export function HSAlternativeImpactOnHSPage() {
    const { inputs, status } = usePSEOCalculatorStore();
    const [isExpanded, setIsExpanded] = useState(false);
    const [isLoadingImpact, setIsLoadingImpact] = useState(false);
    const [impactData, setImpactData] = useState<any[] | null>(null);

    // Only render on HS-specific pages (heuristic: we have an HS code input)
    // Real logic would depend on 'pageType' prop or context, but for now we show if status is success
    if (status !== 'success') return null;

    const handleExpand = async () => {
        setIsExpanded(!isExpanded);
        if (!isExpanded && !impactData) {
            setIsLoadingImpact(true);
            try {
                const res = await fetch('/api/hs-impact', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        baseInputs: inputs,
                        hsCandidates: ['8501.10', '8501.20', '8501.31'] // Mock candidates
                    })
                });
                const data = await res.json();
                setImpactData(data.perCandidate);
                import('@/lib/analytics').then(({ trackEvent }) => {
                    trackEvent('hs_alt_impact_loaded', { count: data.perCandidate.length });
                });
            } catch (e) {
                console.error("Failed to fetch HS impact", e);
            } finally {
                setIsLoadingImpact(false);
            }
        } else if (!isExpanded) {
            // Just expanding already loaded data
            import('@/lib/analytics').then(({ trackEvent }) => {
                trackEvent('hs_alt_impact_expanded', {});
            });
        }
    };

    return (
        <Card className="mb-6 border-indigo-100 dark:border-indigo-900 overflow-hidden">
            <div
                className="bg-indigo-50/50 dark:bg-indigo-950/20 px-4 py-3 cursor-pointer flex items-center justify-between hover:bg-indigo-50 transition-colors"
                onClick={handleExpand}
            >
                <div className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-indigo-500" />
                    <span className="text-sm font-medium text-indigo-900 dark:text-indigo-200">
                        Not sure this HS Code fits? See similar items & cost impact.
                    </span>
                </div>
                {isExpanded ? <ChevronUp className="h-4 w-4 text-indigo-400" /> : <ChevronDown className="h-4 w-4 text-indigo-400" />}
            </div>

            {isExpanded && (
                <CardContent className="pt-0 pb-4 bg-indigo-50/30 dark:bg-transparent">
                    <div className="mt-4 space-y-3">
                        {isLoadingImpact ? (
                            <div className="text-xs text-center text-neutral-400 py-4">Calculating impact scenarios...</div>
                        ) : impactData ? (
                            impactData.map((cand) => {
                                const delta = cand.deltas.landed_delta_zar;
                                const isPositive = delta > 0;
                                const isMaterial = Math.abs(delta) > 1000; // Threshold

                                return (
                                    <div key={cand.hs6} className="flex items-center justify-between bg-white dark:bg-neutral-900 p-3 rounded border border-neutral-100 dark:border-neutral-800">
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2">
                                                <span className="font-mono text-xs font-bold bg-neutral-100 dark:bg-neutral-800 px-1.5 py-0.5 rounded">{cand.hs6}</span>
                                                <span className="text-xs text-neutral-600 dark:text-neutral-400">{cand.label || 'Alternative Category'}</span>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className={cn("text-sm font-bold flex items-center justify-end gap-1",
                                                isPositive ? "text-red-600" : "text-emerald-600",
                                                !isMaterial && "text-neutral-500"
                                            )}>
                                                {isMaterial ? (
                                                    isPositive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />
                                                ) : <Minus className="h-3 w-3" />}
                                                {isPositive ? '+' : ''}{Math.round(delta).toLocaleString()} ZAR
                                            </div>
                                            <div className="text-[10px] text-neutral-400">Total Landed Cost Impact</div>
                                        </div>
                                    </div>
                                )
                            })
                        ) : (
                            <div className="text-xs text-neutral-500">No alternatives found.</div>
                        )}

                        <p className="text-[10px] text-neutral-400 italic mt-2">
                            *Comparing against your current selection ({inputs.hsCode}).
                            <span className="underline ml-1 cursor-pointer">Why do these differ?</span>
                        </p>
                    </div>
                </CardContent>
            )}
        </Card>
    );
}
