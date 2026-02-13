
"use client";

import { cn } from "@/lib/utils";
import { ArrowUpRight, Ship, Plane, Package } from "lucide-react";

interface Scenario {
    label: string;
    mode: "SEA" | "AIR";
    incoterm: "FOB" | "CIF";
    quantity: number;
    totalLandedCost: number;
    perUnit: number;
    isBaseline?: boolean;
}

interface ScenarioStripProps {
    scenarios: Scenario[];
    onCompareClick?: () => void;
}

export function ScenarioStrip({ scenarios, onCompareClick }: ScenarioStripProps) {
    const baseline = scenarios.find(s => s.isBaseline) || scenarios[0];

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {scenarios.slice(0, 3).map((scenario, idx) => {
                const delta = scenario.totalLandedCost - baseline.totalLandedCost;
                const deltaPct = (delta / baseline.totalLandedCost) * 100;

                return (
                    <div
                        key={idx}
                        className={cn(
                            "relative p-4 rounded-lg border transition-all hover:shadow-md cursor-pointer group",
                            scenario.isBaseline
                                ? "bg-white border-neutral-300 ring-1 ring-neutral-200"
                                : "bg-neutral-50 border-neutral-100 opacity-90 hover:opacity-100"
                        )}
                        onClick={onCompareClick}
                    >
                        {scenario.isBaseline && (
                            <span className="absolute -top-2 right-4 bg-neutral-900 text-white text-[10px] uppercase font-bold px-2 py-0.5 rounded-full">
                                Current
                            </span>
                        )}

                        <div className="flex items-center justify-between mb-3">
                            <h4 className="font-bold text-sm text-neutral-700 flex items-center gap-2">
                                {scenario.mode === "SEA" ? <Ship className="w-3 h-3" /> : <Plane className="w-3 h-3" />}
                                {scenario.label}
                            </h4>
                            <span className="text-[10px] font-mono text-neutral-400 bg-white px-1.5 py-0.5 rounded border border-neutral-200">
                                {scenario.incoterm}
                            </span>
                        </div>

                        <div className="flex items-baseline justify-between">
                            <div className="text-lg font-bold text-neutral-900">
                                <span className="text-xs text-neutral-400 font-normal mr-1">R</span>
                                {scenario.perUnit.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                                <span className="text-xs text-neutral-400 font-normal ml-1">/unit</span>
                            </div>
                        </div>

                        {!scenario.isBaseline && (
                            <div className={cn(
                                "text-xs mt-1 font-medium flex items-center gap-1",
                                delta > 0 ? "text-verdict-nogo" : "text-verdict-go"
                            )}>
                                {delta > 0 ? "+" : ""}{deltaPct.toFixed(0)}% vs Baseline
                            </div>
                        )}
                        {scenario.isBaseline && (
                            <div className="text-xs mt-1 text-neutral-400">
                                Assuming {scenario.quantity} units
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
}
