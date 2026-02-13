"use client";

import { usePSEOCalculatorStore } from "@/store/usePSEOCalculatorStore";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, ChevronRight, Calculator, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export function DealFeed() {
    const { inputs, result } = usePSEOCalculatorStore();

    return (
        <div className="p-4 space-y-4">
            {/* 1. Header Date/Context */}
            <div className="flex justify-between items-end pb-2">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-slate-900">Your Feed</h1>
                    <p className="text-xs text-slate-500 font-medium uppercase tracking-wide">
                        {inputs.clusterSlug || "General Import"} • {new Date().toLocaleDateString()}
                    </p>
                </div>
                <div className="h-8 w-8 bg-slate-100 rounded-full flex items-center justify-center">
                    <span className="text-xs font-bold text-slate-600">JP</span>
                </div>
            </div>

            {/* 2. Primary KPI Card (The "Stripe" Card) */}
            <Card className="bg-white border border-slate-200 shadow-sm p-5 relative overflow-hidden group active:scale-[0.99] transition-transform">
                <div className="flex justify-between items-start mb-4">
                    <div>
                        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                            Net Viability
                        </p>
                        <h2 className="text-3xl font-bold text-slate-900 tracking-tight">
                            {result?.verdict === "GO" ? "Viable" : "Caution"}
                        </h2>
                    </div>
                    <Badge variant="outline" className={`
                        ${result?.verdict === "GO" ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-amber-50 text-amber-700 border-amber-200"}
                    `}>
                        {result?.grossMarginPercent?.toFixed(1)}% Margin
                    </Badge>
                </div>

                {/* Mini Graph Placeholder */}
                <div className="h-16 w-full bg-slate-50 rounded-lg border border-dashed border-slate-200 flex items-center justify-center mb-4">
                    <span className="text-[10px] text-slate-400">Sparkline Visualization</span>
                </div>

                <div className="flex justify-between items-center text-sm border-t border-slate-100 pt-3">
                    <span className="text-slate-500">Landed Cost</span>
                    <span className="font-mono font-medium text-slate-900">
                        R {result?.summary.landed_cost_per_unit_zar.toFixed(2)}
                    </span>
                </div>
            </Card>

            {/* 3. Action Rows (Bloomberg List) */}
            <div className="space-y-2">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider pl-1">
                    Live Variables
                </p>

                <ActionRow
                    label="Exchange Rate"
                    value={`R ${inputs.exchangeRate.toFixed(2)}`}
                    sub="USD/ZAR • Live"
                />

                <ActionRow
                    label="Freight Method"
                    value={inputs.incoterm}
                    sub="Sea Freight • FCL"
                />

                <ActionRow
                    label="Duty Rate"
                    value="0%"
                    sub="Solar Panels • Free"
                    alert={true}
                />
            </div>

            {/* 4. Calculator CTA */}
            <Button className="w-full h-12 bg-slate-900 hover:bg-slate-800 text-white rounded-xl shadow-lg shadow-slate-900/10 flex items-center justify-between px-6 mt-4">
                <span className="font-semibold">Edit Inputs</span>
                <Calculator className="w-5 h-5 opacity-80" />
            </Button>
        </div>
    );
}

function ActionRow({ label, value, sub, alert }: any) {
    return (
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex justify-between items-center active:bg-slate-50 transition-colors">
            <div className="flex items-center gap-3">
                {alert && <AlertCircle className="w-4 h-4 text-amber-500" />}
                <div>
                    <h3 className="text-sm font-semibold text-slate-900">{label}</h3>
                    <p className="text-[10px] text-slate-500 font-medium">{sub}</p>
                </div>
            </div>
            <div className="flex items-center gap-2">
                <span className="text-sm font-mono text-slate-700">{value}</span>
                <ChevronRight className="w-4 h-4 text-slate-300" />
            </div>
        </div>
    );
}
