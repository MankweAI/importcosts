"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { usePSEOCalculatorStore } from "@/store/usePSEOCalculatorStore";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState } from "react";
import { TrendingUp, TrendingDown } from "lucide-react";

export function ForexSensitivity() {
    const { result, inputs } = usePSEOCalculatorStore();
    const [scenario, setScenario] = useState<"optimistic" | "base" | "pessimistic">("base");

    if (!result) return null;

    // Logic:
    // Base: standard calculation
    // Optimistic: -5% ZAR strength (Exchange Rate lower)
    // Pessimistic: +10% ZAR weakness (Exchange Rate higher)

    const baseCost = result.summary.total_landed_cost_zar;

    // Quick approximation: if exchange rate changes, everything proportional to currency input changes.
    // Assuming invoice + freight + insurance are the currency components.
    // The duties/vat scale linearly with customs value.
    // So roughly, the entire landed cost scales with exchange rate (excluding local fixed charges which we don't separate yet).
    // Let's assume 95% of cost is currency driven for now.

    const derivedTotal = (scenario === 'base') ? baseCost :
        (scenario === 'optimistic') ? baseCost * 0.95 :
            baseCost * 1.10;

    const delta = derivedTotal - baseCost;

    return (
        <Card>
            <CardHeader className="pb-2">
                <CardTitle className="text-base">Forex Sensitivity</CardTitle>
                <p className="text-xs text-neutral-500">Stress-test your margins against currency volatility.</p>
            </CardHeader>
            <CardContent className="space-y-4">
                <Tabs defaultValue="base" onValueChange={(v: string) => setScenario(v as any)} className="w-full">
                    <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="optimistic" className="text-xs data-[state=active]:bg-green-100 data-[state=active]:text-green-900">
                            -5% (Stronger)
                        </TabsTrigger>
                        <TabsTrigger value="base" className="text-xs">
                            Current
                        </TabsTrigger>
                        <TabsTrigger value="pessimistic" className="text-xs data-[state=active]:bg-red-100 data-[state=active]:text-red-900">
                            +10% (Weaker)
                        </TabsTrigger>
                    </TabsList>
                </Tabs>

                <div className="flex items-center justify-between p-3 bg-neutral-50 rounded dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800">
                    <div className="space-y-1">
                        <span className="text-xs text-neutral-500">Projected Landed Cost</span>
                        <div className="text-xl font-bold font-mono">
                            R {derivedTotal.toLocaleString('en-ZA', { maximumFractionDigits: 0 })}
                        </div>
                    </div>
                    {scenario !== 'base' && (
                        <div className={`flex items-center gap-1 text-sm font-semibold ${delta > 0 ? 'text-red-600' : 'text-green-600'}`}>
                            {delta > 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                            <span>R {Math.abs(delta).toLocaleString('en-ZA', { maximumFractionDigits: 0 })}</span>
                        </div>
                    )}
                </div>

                {scenario !== 'base' && (
                    <p className="text-[10px] text-neutral-400 text-center">
                        *Estimates impact on Customs Value, Duty, and VAT.
                    </p>
                )}
            </CardContent>
        </Card>
    );
}
