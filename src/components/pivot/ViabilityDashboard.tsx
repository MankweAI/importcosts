"use client";

import { usePSEOCalculatorStore } from "@/store/usePSEOCalculatorStore";
import { CheckCircle2, AlertTriangle, XCircle, TrendingUp, DollarSign, BarChart3, Shield } from "lucide-react";
import { Progress } from "@/components/ui/progress";

function formatMoney(value: number): string {
    return `R ${value.toLocaleString("en-ZA", { maximumFractionDigits: 2 })}`;
}

export function ViabilityDashboard() {
    const { result, status, inputs } = usePSEOCalculatorStore();
    if (status !== "success" || !result) return null;

    const margin = result.grossMarginPercent ?? null;
    const verdict = result.verdict || "CAUTION";

    const verdictConfig = {
        GO: {
            icon: CheckCircle2,
            title: "GO",
            message: "Current assumptions support a viable import decision.",
            chip: "bg-sky-600 text-white",
        },
        CAUTION: {
            icon: AlertTriangle,
            title: "CAUTION",
            message: "Profitability is sensitive. Validate cost and FX assumptions.",
            chip: "bg-sky-700 text-white",
        },
        NOGO: {
            icon: XCircle,
            title: "NO-GO",
            message: "Cost profile is currently too high for target outcomes.",
            chip: "bg-sky-800 text-white",
        },
    }[verdict];

    const Icon = verdictConfig.icon;

    return (
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:p-6">
            <div className="mb-5 flex flex-col gap-4 border-b border-slate-100 pb-5 md:flex-row md:items-start md:justify-between">
                <div>
                    <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold tracking-wide ${verdictConfig.chip}`}>
                        Verdict: {verdictConfig.title}
                    </span>
                    <h2 className="mt-3 text-2xl font-bold tracking-tight text-slate-900">Viability snapshot</h2>
                    <p className="mt-1 text-sm text-slate-600">{verdictConfig.message}</p>
                </div>
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl border border-sky-200 bg-sky-50 text-sky-700">
                    <Icon className="h-6 w-6" />
                </div>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
                <article className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                    <div className="mb-2 flex items-center gap-2 text-slate-500">
                        <DollarSign className="h-4 w-4" />
                        <span className="text-xs font-semibold uppercase tracking-wide">Landed / Unit</span>
                    </div>
                    <p className="text-2xl font-bold text-slate-900">{formatMoney(result.summary.landed_cost_per_unit_zar)}</p>
                </article>

                <article className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                    <div className="mb-2 flex items-center gap-2 text-slate-500">
                        <BarChart3 className="h-4 w-4" />
                        <span className="text-xs font-semibold uppercase tracking-wide">Gross Margin</span>
                    </div>
                    <p className="text-2xl font-bold text-slate-900">{margin === null ? "-" : `${margin.toFixed(1)}%`}</p>
                    <p className="mt-1 text-xs text-slate-500">{margin === null ? "Set target price to unlock" : "Based on target selling price"}</p>
                </article>

                <article className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                    <div className="mb-2 flex items-center gap-2 text-slate-500">
                        <TrendingUp className="h-4 w-4" />
                        <span className="text-xs font-semibold uppercase tracking-wide">Break-even</span>
                    </div>
                    <p className="text-2xl font-bold text-slate-900">
                        {result.breakEvenPrice ? formatMoney(result.breakEvenPrice) : "-"}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                        {inputs.importerType === "VAT_REGISTERED" ? "VAT vendor assumptions" : "Private importer assumptions"}
                    </p>
                </article>

                <article className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                    <div className="mb-2 flex items-center gap-2 text-slate-500">
                        <Shield className="h-4 w-4" />
                        <span className="text-xs font-semibold uppercase tracking-wide">HS Confidence</span>
                    </div>
                    <div className="flex items-end gap-2">
                        <p className="text-2xl font-bold text-slate-900">{(result.hs.confidence_score * 100).toFixed(0)}%</p>
                        <p className="mb-1 text-sm capitalize text-slate-600">{result.hs.confidence_bucket}</p>
                    </div>
                    <Progress value={result.hs.confidence_score * 100} className="mt-2 h-1.5 bg-slate-200" />
                </article>
            </div>
        </section>
    );
}
