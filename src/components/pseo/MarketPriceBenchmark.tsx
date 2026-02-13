"use client";

import { usePSEOCalculatorStore } from "@/store/usePSEOCalculatorStore";
import { getMarketBenchmark } from "@/lib/seo/marketData";

export function MarketPriceBenchmark() {
    const { result, inputs } = usePSEOCalculatorStore();

    const benchmark = inputs?.clusterSlug
        ? getMarketBenchmark(inputs.clusterSlug, result?.summary.landed_cost_per_unit_zar)
        : null;

    if (!result || !benchmark) return null;

    const landedCost = result.summary.landed_cost_per_unit_zar;
    const { retailLow, retailAverage, retailHigh } = benchmark;
    const maxValue = Math.max(landedCost, retailHigh) * 1.1;
    const getPct = (value: number) => Math.min((value / maxValue) * 100, 100);

    const verdict = landedCost > retailAverage ? "Uncompetitive" : landedCost > retailLow ? "Tight Margin" : "Competitive";
    const verdictStyle =
        verdict === "Competitive"
            ? "bg-sky-600 text-white"
            : verdict === "Tight Margin"
                ? "bg-sky-700 text-white"
                : "bg-sky-800 text-white";

    return (
        <section className="my-8" aria-labelledby="market-benchmark-heading">
            <div className="mb-4">
                <h2 id="market-benchmark-heading" className="text-xl font-bold tracking-tight text-slate-900 md:text-2xl">
                    Market benchmark
                </h2>
                <p className="mt-1 text-sm text-slate-600">
                    Compare calculated landed cost to expected retail price range in South Africa.
                </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className={`mb-4 inline-flex rounded-full px-3 py-1 text-xs font-semibold tracking-wide ${verdictStyle}`}>
                    {verdict}
                </div>

                <p className="mb-6 max-w-xl text-sm text-slate-600">
                    Landed cost is <span className="font-semibold text-slate-900">R{Math.round(landedCost).toLocaleString("en-ZA")}</span> per unit against
                    market range <span className="font-semibold text-slate-900">R{retailLow.toLocaleString("en-ZA")} - R{retailHigh.toLocaleString("en-ZA")}</span>.
                </p>

                <div className="relative h-24 w-full">
                    <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2">
                        <div className="relative h-4 overflow-hidden rounded-full bg-slate-100">
                            <div
                                className="absolute h-full bg-sky-100"
                                style={{ left: `${getPct(retailLow)}%`, width: `${getPct(retailHigh) - getPct(retailLow)}%` }}
                            />
                        </div>
                    </div>

                    <div
                        className="absolute top-1/2 flex -translate-y-1/2 flex-col items-center"
                        style={{ left: `${getPct(landedCost)}%`, transform: "translate(-50%, -50%)" }}
                    >
                        <div className="mb-1 rounded bg-sky-600 px-2 py-1 text-xs font-semibold text-white shadow-sm">
                            You: R{Math.round(landedCost).toLocaleString("en-ZA")}
                        </div>
                        <div className="h-4 w-1 rounded-full bg-sky-600" />
                    </div>

                    {[{ label: "Low", value: retailLow }, { label: "Avg", value: retailAverage }, { label: "High", value: retailHigh }].map((marker) => (
                        <div
                            key={marker.label}
                            className="absolute top-10 flex -translate-x-1/2 flex-col items-center"
                            style={{ left: `${getPct(marker.value)}%` }}
                        >
                            <div className="mb-1 h-3 w-0.5 bg-slate-400" />
                            <span className="text-[11px] font-medium text-slate-500">
                                {marker.label}: R{marker.value.toLocaleString("en-ZA")}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
