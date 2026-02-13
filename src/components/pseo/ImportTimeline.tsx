"use client";

import { useState } from "react";
import { Clock3, Ship, Plane, CircleDollarSign } from "lucide-react";
import { getImportTimeline } from "@/lib/seo/timelineData";
import type { FreightMode } from "@/lib/seo/timelineData";

export function ImportTimeline() {
    const [mode, setMode] = useState<FreightMode>("Sea");
    const timeline = getImportTimeline(mode);

    return (
        <section className="my-8" aria-labelledby="timeline-heading">
            <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h2 id="timeline-heading" className="text-xl font-bold tracking-tight text-slate-900 md:text-2xl">
                        Delivery timeline
                    </h2>
                    <p className="mt-1 text-sm text-slate-600">Estimate key milestones from deposit to delivery.</p>
                </div>

                <div className="inline-flex rounded-lg border border-slate-200 bg-slate-50 p-1">
                    <button
                        onClick={() => setMode("Sea")}
                        className={`inline-flex items-center gap-1.5 rounded-md px-4 py-1.5 text-sm font-medium ${mode === "Sea" ? "bg-sky-600 text-white" : "text-slate-600 hover:bg-white"}`}
                    >
                        <Ship className="h-3.5 w-3.5" />
                        Sea
                    </button>
                    <button
                        onClick={() => setMode("Air")}
                        className={`inline-flex items-center gap-1.5 rounded-md px-4 py-1.5 text-sm font-medium ${mode === "Air" ? "bg-sky-600 text-white" : "text-slate-600 hover:bg-white"}`}
                    >
                        <Plane className="h-3.5 w-3.5" />
                        Air
                    </button>
                </div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="relative space-y-5">
                    <div className="absolute bottom-4 left-[18px] top-4 w-0.5 bg-slate-200 md:left-[116px]" />

                    {timeline.stages.map((stage, index) => (
                        <article key={index} className="relative grid grid-cols-1 gap-3 md:grid-cols-[88px_32px_1fr] md:gap-4">
                            <div className="hidden pt-1 text-right md:block">
                                <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Day {stage.daysOffsetEnd}</span>
                            </div>

                            <div className="z-10 flex">
                                <div className={`flex h-9 w-9 items-center justify-center rounded-full border ${stage.cashflowEvent?.isPainPoint ? "border-slate-900 bg-slate-900 text-white" : "border-sky-200 bg-sky-50 text-sky-700"}`}>
                                    <Clock3 className="h-4 w-4" />
                                </div>
                            </div>

                            <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                                <div className="mb-1 flex items-center justify-between gap-2">
                                    <h3 className="text-sm font-semibold text-slate-900">{stage.label}</h3>
                                    <span className="text-xs font-medium uppercase tracking-wide text-slate-500 md:hidden">Day {stage.daysOffsetEnd}</span>
                                </div>
                                <p className="text-sm leading-relaxed text-slate-600">{stage.description}</p>

                                {stage.cashflowEvent ? (
                                    <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-sky-100 px-2.5 py-1 text-xs text-sky-800">
                                        <CircleDollarSign className="h-3.5 w-3.5" />
                                        <span className="font-semibold">{stage.cashflowEvent.label}</span>
                                        <span>{stage.cashflowEvent.amountLabel}</span>
                                    </div>
                                ) : null}
                            </div>
                        </article>
                    ))}
                </div>
            </div>
        </section>
    );
}
