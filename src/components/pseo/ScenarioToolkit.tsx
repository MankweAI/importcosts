"use client";

import { usePSEOCalculatorStore } from "@/store/usePSEOCalculatorStore";
import { useCalculateLandedCost } from "@/hooks/useCalculateLandedCost";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SlidersHorizontal, ArrowRightLeft, Ship, Plane } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";

export function ScenarioToolkit() {
    const { inputs, updateInput } = usePSEOCalculatorStore();

    const { calculate } = useCalculateLandedCost();

    const presets = [10000, 50000, 250000];

    const applyPreset = (val: number) => {
        updateInput('invoiceValue', val);
        setTimeout(calculate, 0); // Defer to calculation loop/hook or wait for state update? 
        // Note: Zustand state update is synchronous but we want to ensure we calculate with new values.
        // Actually, calculate() reads from store state. 
        // If updateInput runs synchronously, calling calculate() immediately after might use old state 
        // depending on how useCalculateLandedCost gets 'inputs'.
        // It gets inputs from usePSEOCalculatorStore(), which is a hook.
        // The closure of 'calculate' might have stale 'inputs' if defined in the hook.
        // The hook uses 'inputs' from the store. 
        // We should fix the hook to use getState() or pass inputs.
    };

    const applyFreightProfile = (type: 'sea' | 'air') => {
        const rate = type === 'sea' ? 0.05 : 0.15;
        const cost = inputs.invoiceValue * rate;
        updateInput('freightCost', cost);
        setTimeout(calculate, 0);
    };

    return (
        <Card className="mb-6 border-neutral-200 dark:border-neutral-800">
            <CardHeader className="pb-3 border-b border-neutral-100 dark:border-neutral-800">
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                    <SlidersHorizontal className="h-5 w-5 text-neutral-500" />
                    Scenario Builder
                </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-6">

                {/* 1. Value Presets */}
                <div>
                    <Label className="text-xs text-neutral-500 uppercase tracking-wider mb-2 block">Quick Value Test</Label>
                    <div className="flex flex-wrap gap-2">
                        {presets.map((val) => (
                            <Button
                                key={val}
                                variant="outline"
                                size="sm"
                                onClick={() => applyPreset(val)}
                                className={inputs.invoiceValue === val ? "bg-neutral-100 dark:bg-neutral-800 border-neutral-400" : ""}
                            >
                                R {val.toLocaleString('en-ZA')}
                            </Button>
                        ))}
                    </div>
                </div>

                <Separator />

                {/* 2. Incoterm Toggle */}
                <div>
                    <Label className="text-xs text-neutral-500 uppercase tracking-wider mb-2 block">Shipping Terms (Incoterm)</Label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                        {['FOB', 'CIF', 'EXW', 'DAP'].map((term) => (
                            <Button
                                key={term}
                                variant={inputs.incoterm === term ? "default" : "outline"}
                                size="sm"
                                onClick={() => { updateInput('incoterm', term); setTimeout(calculate, 0); }}
                                className="text-xs"
                            >
                                {term}
                            </Button>
                        ))}
                    </div>
                </div>

                <Separator />

                {/* 3. Freight Sensitivity */}
                <div>
                    <Label className="text-xs text-neutral-500 uppercase tracking-wider mb-2 block">Freight Estimator</Label>
                    <div className="grid grid-cols-2 gap-3">
                        <Button variant="outline" size="sm" className="justify-start gap-2 h-auto py-2" onClick={() => applyFreightProfile('sea')}>
                            <Ship className="h-4 w-4 text-blue-500" />
                            <div className="text-left">
                                <span className="block text-xs font-semibold">Sea Freight</span>
                                <span className="block text-[10px] text-neutral-400">~5% of value</span>
                            </div>
                        </Button>
                        <Button variant="outline" size="sm" className="justify-start gap-2 h-auto py-2" onClick={() => applyFreightProfile('air')}>
                            <Plane className="h-4 w-4 text-sky-500" />
                            <div className="text-left">
                                <span className="block text-xs font-semibold">Air Freight</span>
                                <span className="block text-[10px] text-neutral-400">~15% of value</span>
                            </div>
                        </Button>
                    </div>
                </div>

            </CardContent>
        </Card>
    );
}
