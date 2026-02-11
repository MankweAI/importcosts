/**
 * MarketPriceBenchmark.tsx
 *
 * Visual bar chart comparing the calculated Landed Cost vs. estimated Retail Price range.
 * Answers: "Is this deal competitive?"
 */

"use client";

import { usePSEOCalculatorStore } from "@/store/usePSEOCalculatorStore";
import { useMemo } from "react";
import { getMarketBenchmark } from "@/lib/seo/marketData";

export function MarketPriceBenchmark() {
    const { result, inputs } = usePSEOCalculatorStore();

    const benchmark = useMemo(() => {
        if (!inputs?.clusterSlug) return null;
        // Pass the landed cost to get a fallback if no hardcoded data exists
        return getMarketBenchmark(inputs.clusterSlug, result?.summary.landed_cost_per_unit_zar);
    }, [inputs?.clusterSlug, result?.summary.landed_cost_per_unit_zar]);

    if (!result || !benchmark) return null;

    const landedCost = result.summary.landed_cost_per_unit_zar;
    const { retailLow, retailAverage, retailHigh } = benchmark;

    // Calculate position percentages for the bar chart (clamped 0-100)
    const maxValue = Math.max(landedCost, retailHigh) * 1.1; // 10% buffer
    const getPct = (val: number) => Math.min((val / maxValue) * 100, 100);

    // Determine competitiveness verdict
    let verdictDetails = {
        label: "Competitive",
        color: "text-emerald-700 bg-emerald-50 border-emerald-200",
        text: "You have a healthy margin against the market average."
    };

    if (landedCost > retailAverage) {
        verdictDetails = {
            label: "Uncompetitive",
            color: "text-red-700 bg-red-50 border-red-200",
            text: "Your landed cost exceeds the average retail price. Re-negotiate or check freight."
        };
    } else if (landedCost > retailLow) {
        verdictDetails = {
            label: "Tight Margin",
            color: "text-amber-700 bg-amber-50 border-amber-200",
            text: "You are consistent with aggressive sellers, but margins are thin."
        };
    }

    return (
        <section className="mt-12 mb-8" aria-labelledby="market-benchmark-heading">
            <h2 id="market-benchmark-heading" className="text-xl font-bold tracking-tight text-neutral-900 md:text-2xl">
                Is it worth it?
            </h2>
            <p className="mt-1 text-sm text-neutral-500 max-w-2xl mb-6">
                Compare your landed cost against estimated South African retail prices for similar products.
            </p>

            <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
                <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-semibold border mb-6 ${verdictDetails.color}`}>
                    {verdictDetails.label}
                </div>
                <p className="text-sm text-neutral-600 mb-6 max-w-xl">
                    {verdictDetails.text}
                </p>

                {/* Bar Chart Container */}
                <div className="relative h-24 w-full mt-4">
                    {/* Background Tracks */}
                    <div className="absolute top-0 bottom-0 left-0 w-full flex flex-col justify-center space-y-6">
                        {/* Market Range Bar */}
                        <div className="relative h-4 w-full bg-neutral-100 rounded-full overflow-hidden">
                            <div
                                className="absolute h-full bg-neutral-200"
                                style={{
                                    left: `${getPct(retailLow)}%`,
                                    width: `${getPct(retailHigh) - getPct(retailLow)}%`
                                }}
                            />
                        </div>
                    </div>

                    {/* Markers */}
                    {/* Landed Cost (You) */}
                    <div
                        className="absolute top-1/2 -translate-y-1/2 flex flex-col items-center transition-all duration-500"
                        style={{ left: `${getPct(landedCost)}%`, transform: "translate(-50%, -50%)" }}
                    >
                        <div className="bg-blue-600 text-white text-xs font-bold px-2 py-1 rounded mb-1 whitespace-nowrap shadow-sm">
                            You: R{Math.round(landedCost).toLocaleString()}
                        </div>
                        <div className="h-4 w-1 bg-blue-600 rounded-full"></div>
                    </div>

                    {/* Market Low */}
                    <div
                        className="absolute top-10 flex flex-col items-center"
                        style={{ left: `${getPct(retailLow)}%`, transform: "translateX(-50%)" }}
                    >
                        <div className="h-3 w-0.5 bg-neutral-400 mb-1"></div>
                        <span className="text-[10px] sm:text-xs text-neutral-500 font-medium">Low: R{retailLow.toLocaleString()}</span>
                    </div>

                    {/* Market Avg */}
                    <div
                        className="absolute top-10 flex flex-col items-center"
                        style={{ left: `${getPct(retailAverage)}%`, transform: "translateX(-50%)" }}
                    >
                        <div className="h-3 w-0.5 bg-neutral-400 mb-1"></div>
                        <span className="text-[10px] sm:text-xs text-neutral-500 font-medium">Avg: R{retailAverage.toLocaleString()}</span>
                    </div>

                    {/* Market High */}
                    <div
                        className="absolute top-10 flex flex-col items-center"
                        style={{ left: `${getPct(retailHigh)}%`, transform: "translateX(-50%)" }}
                    >
                        <div className="h-3 w-0.5 bg-neutral-400 mb-1"></div>
                        <span className="text-[10px] sm:text-xs text-neutral-500 font-medium">High: R{retailHigh.toLocaleString()}</span>
                    </div>
                </div>
            </div>
        </section>
    );
}
