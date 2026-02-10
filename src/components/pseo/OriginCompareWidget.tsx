"use client";
import { useState } from "react";

import { usePSEOCalculatorStore } from "@/store/usePSEOCalculatorStore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeftRight, Plus, Lock } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export function OriginCompareWidget() {
    const { inputs } = usePSEOCalculatorStore();
    const [comparingOrigin, setComparingOrigin] = useState<string | null>(null);
    const [compareResult, setCompareResult] = useState<import("@/types/pseo").CompareResult | null>(null);
    const [loading, setLoading] = useState(false);

    // Initial mock origins - in a real app these typically come from a reference list
    const allOrigins = [
        { iso: 'US', label: 'United States' },
        { iso: 'CN', label: 'China' },
        { iso: 'DE', label: 'Germany' },
        { iso: 'GB', label: 'United Kingdom' },
        { iso: 'IN', label: 'India' },
        { iso: 'TW', label: 'Taiwan' }
    ];

    const currentOrigin = allOrigins.find(o => o.iso === inputs.originCountry);
    const compareOptions = allOrigins.filter(o => o.iso !== inputs.originCountry);

    const handleCompare = async (originIso: string) => {
        setComparingOrigin(originIso);
        setLoading(true);
        setCompareResult(null);

        try {
            const response = await fetch('/api/compare', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    baseInputs: inputs,
                    compareOrigins: [originIso]
                })
            });

            if (!response.ok) throw new Error("Comparison failed");

            const data = await response.json();
            setCompareResult(data);
        } catch (error) {
            console.error("Compare error", error);
        } finally {
            setLoading(false);
        }
    };

    const resultData = compareResult?.perOriginResults.find(r => r.originIso === comparingOrigin);

    return (
        <Card className="mb-6 border-dashed border-2 bg-neutral-50/50 dark:bg-neutral-900/50">
            <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold flex items-center gap-2 text-neutral-600 dark:text-neutral-400">
                    <ArrowLeftRight className="h-4 w-4" />
                    Compare Origins
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="flex flex-col md:flex-row items-stretch md:items-center gap-4">
                    {/* Current Origin Card */}
                    <div className="flex-1 p-3 bg-white dark:bg-neutral-900 rounded border border-neutral-200 dark:border-neutral-800 shadow-sm relative overflow-hidden">
                        <div className="text-xs text-neutral-500 mb-1">Current Origin</div>
                        <div className="font-semibold text-lg flex items-center gap-2">
                            {currentOrigin?.label || inputs.originCountry}
                            {/* Flag or similar could go here */}
                        </div>
                    </div>

                    <div className="text-neutral-400 font-bold self-center">VS</div>

                    {/* Compare Selector or Result */}
                    <div className="flex-1 relative">
                        {!comparingOrigin ? (
                            <Select onValueChange={handleCompare}>
                                <SelectTrigger className="w-full bg-white dark:bg-neutral-900">
                                    <SelectValue placeholder="Select Origin to Compare..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {compareOptions.map((opt) => (
                                        <SelectItem key={opt.iso} value={opt.iso}>{opt.label}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        ) : (
                            <div className="p-3 bg-white dark:bg-neutral-900 rounded border border-neutral-200 dark:border-neutral-800 shadow-sm relative">
                                <div className="flex justify-between items-start mb-1">
                                    <div className="text-xs text-neutral-500">Comparison</div>
                                    <button
                                        onClick={() => { setComparingOrigin(null); setCompareResult(null); }}
                                        className="text-neutral-400 hover:text-neutral-600"
                                    >
                                        <ArrowLeftRight className="h-3 w-3" />
                                    </button>
                                </div>
                                <div className="font-semibold text-lg mb-2">
                                    {allOrigins.find(o => o.iso === comparingOrigin)?.label || comparingOrigin}
                                </div>

                                {loading ? (
                                    <div className="animate-pulse flex space-y-2 flex-col">
                                        <div className="h-4 bg-neutral-100 rounded w-3/4"></div>
                                        <div className="h-3 bg-neutral-100 rounded w-1/2"></div>
                                    </div>
                                ) : resultData ? (
                                    <div className="space-y-1">
                                        <div className="flex justify-between items-baseline">
                                            <span className="text-sm text-neutral-500">Total Landed:</span>
                                            <span className="font-bold text-emerald-600">
                                                R {resultData.summary.total_landed_cost_zar.toLocaleString('en-ZA', { maximumFractionDigits: 0 })}
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-baseline text-xs">
                                            <span className="text-neutral-400">Duties & Taxes:</span>
                                            <span className="text-neutral-600">
                                                R {resultData.summary.total_taxes_zar.toLocaleString('en-ZA', { maximumFractionDigits: 0 })}
                                            </span>
                                        </div>
                                        {/* Simple Delta Indicator - Logic can be improved */}
                                        {/* Ideally we compare vs Inputs Store but we don't have the current result handy in this widget easily unless passed in */}
                                    </div>
                                ) : (
                                    <div className="text-xs text-red-500">Failed to load data</div>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {!comparingOrigin && (
                    <p className="text-xs text-neutral-400 mt-3 text-center">
                        See how switching origin affects duties (e.g. EU vs China).
                    </p>
                )}
            </CardContent>
        </Card>
    );
}
