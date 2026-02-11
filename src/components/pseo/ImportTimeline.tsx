"use client";

import { usePSEOCalculatorStore } from "@/store/usePSEOCalculatorStore";
import { useState } from "react";
import { getImportTimeline } from "@/lib/seo/timelineData";
import type { FreightMode } from "@/lib/seo/timelineData";

export function ImportTimeline() {
    const { result } = usePSEOCalculatorStore();
    const [mode, setMode] = useState<FreightMode>("Sea");

    const timeline = getImportTimeline(mode);

    // If no result yet, we can either hide or show generic timeline.
    // Let's show generic timeline so the page isn't empty.

    return (
        <section className="mt-12 mb-8" aria-labelledby="timeline-heading">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div>
                    <h2 id="timeline-heading" className="text-xl font-bold tracking-tight text-neutral-900 md:text-2xl">
                        When do I get it?
                    </h2>
                    <p className="mt-1 text-sm text-neutral-500">
                        Estimated timeline from deposit to delivery.
                    </p>
                </div>

                {/* Mode Toggle */}
                <div className="flex bg-neutral-100 p-1 rounded-lg self-start sm:self-center">
                    <button
                        onClick={() => setMode("Sea")}
                        className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${mode === "Sea" ? "bg-white shadow text-blue-700" : "text-neutral-500 hover:text-neutral-700"}`}
                    >
                        Sea Freight
                    </button>
                    <button
                        onClick={() => setMode("Air")}
                        className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${mode === "Air" ? "bg-white shadow text-blue-700" : "text-neutral-500 hover:text-neutral-700"}`}
                    >
                        Air Freight
                    </button>
                </div>
            </div>

            <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm overflow-hidden">
                <div className="space-y-0 relative">
                    {/* Vertical connector line */}
                    <div className="absolute top-6 bottom-6 left-[19px] w-0.5 bg-neutral-100 md:hidden"></div>

                    {timeline.stages.map((stage, i) => (
                        <div key={i} className="relative flex flex-col md:flex-row gap-4 md:gap-8 group pb-8 last:pb-0">
                            {/* Connector Line Desktop */}
                            {i !== timeline.stages.length - 1 && (
                                <div className="hidden md:block absolute left-[5.5rem] top-8 bottom-0 w-0.5 bg-neutral-100"></div>
                            )}

                            {/* Days Marker (Desktop) */}
                            <div className="flex-shrink-0 w-16 text-right hidden md:block pt-2">
                                <span className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Day {stage.daysOffsetEnd}</span>
                            </div>

                            {/* Circle Indicator */}
                            <div className="z-10 flex-shrink-0 relative">
                                <div className={`h-10 w-10 rounded-full flex items-center justify-center border-2 transition-colors ${stage.cashflowEvent?.isPainPoint ? "bg-red-50 border-red-200 text-red-600 shadow-sm" : "bg-blue-50 border-blue-200 text-blue-600"}`}>
                                    <span className="text-sm font-bold">{i + 1}</span>
                                </div>
                            </div>

                            {/* Content Card */}
                            <div className="flex-1 md:pt-1 pl-12 md:pl-0 -mt-10 md:mt-0">
                                <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4 p-4 rounded-xl hover:bg-neutral-50 border border-transparent hover:border-neutral-100 transition-all">
                                    <div className="flex-1">
                                        <div className="flex items-center justify-between md:hidden mb-2">
                                            <span className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Day {stage.daysOffsetEnd}</span>
                                        </div>
                                        <h3 className="font-semibold text-neutral-900 text-base">
                                            {stage.label}
                                        </h3>
                                        <p className="text-sm text-neutral-500 mt-1 max-w-sm leading-relaxed">
                                            {stage.description}
                                        </p>
                                    </div>

                                    {/* Cashflow Pain Point Badge */}
                                    {stage.cashflowEvent && (
                                        <div className="md:w-48 flex-shrink-0">
                                            <div className={`p-3 rounded-lg border flex items-center gap-3 ${stage.cashflowEvent.isPainPoint ? "bg-red-50 border-red-100" : "bg-neutral-50 border-neutral-100"}`}>
                                                <div className={`h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0 ${stage.cashflowEvent.isPainPoint ? "bg-red-100 text-red-600" : "bg-neutral-200 text-neutral-600"}`}>
                                                    <span className="text-xs font-bold">$</span>
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className={`text-[10px] font-bold uppercase tracking-wider ${stage.cashflowEvent.isPainPoint ? "text-red-500" : "text-neutral-500"}`}>
                                                        {stage.cashflowEvent.label}
                                                    </span>
                                                    <span className={`text-xs font-bold ${stage.cashflowEvent.isPainPoint ? "text-red-700" : "text-neutral-700"}`}>
                                                        {stage.cashflowEvent.amountLabel}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
