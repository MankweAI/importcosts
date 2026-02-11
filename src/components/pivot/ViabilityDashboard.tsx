"use client";

import { usePSEOCalculatorStore } from "@/store/usePSEOCalculatorStore";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, AlertTriangle, XCircle, TrendingUp, DollarSign, BarChart3, Shield } from "lucide-react";
import { Progress } from "@/components/ui/progress";

export function ViabilityDashboard() {
    const { result, status, inputs } = usePSEOCalculatorStore();

    if (status !== 'success' || !result) return null;

    const { verdict, breakEvenPrice, summary, grossMarginPercent } = result;
    const activeVerdict = verdict || "CAUTION";

    const variantConfig = {
        GO: {
            gradient: "from-emerald-50 to-emerald-100/50",
            border: "border-emerald-200",
            badge: "bg-emerald-600",
            text: "text-emerald-800",
            icon: CheckCircle,
            label: "Viable Deal",
            sublabel: "Margins are healthy. Proceed with confidence."
        },
        CAUTION: {
            gradient: "from-amber-50 to-amber-100/50",
            border: "border-amber-200",
            badge: "bg-amber-500",
            text: "text-amber-800",
            icon: AlertTriangle,
            label: "Proceed with Caution",
            sublabel: "Margins are thin or risks elevated. Review before committing."
        },
        NOGO: {
            gradient: "from-red-50 to-red-100/50",
            border: "border-red-200",
            badge: "bg-red-600",
            text: "text-red-800",
            icon: XCircle,
            label: "High Risk",
            sublabel: "This deal is likely unprofitable or has critical blockers."
        }
    };

    const config = variantConfig[activeVerdict];
    const Icon = config.icon;

    const hasMargin = grossMarginPercent !== undefined && grossMarginPercent !== null;
    const marginDisplay = hasMargin ? `${grossMarginPercent!.toFixed(1)}%` : "—";
    const marginPositive = hasMargin && grossMarginPercent! > 0;

    return (
        <Card className={`overflow-hidden border-2 ${config.border} shadow-sm`}>
            {/* Verdict Banner */}
            <div className={`bg-gradient-to-r ${config.gradient} px-6 py-5`}>
                <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                        <div className={`flex items-center justify-center w-12 h-12 rounded-2xl ${config.badge} shadow-lg`}>
                            <Icon className="h-6 w-6 text-white" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-neutral-900">{config.label}</h2>
                            <p className="text-sm text-neutral-600 mt-0.5">{config.sublabel}</p>
                        </div>
                    </div>
                    <Badge className={`${config.badge} text-white px-3 py-1.5 text-xs font-bold uppercase tracking-wider shadow-sm`}>
                        {activeVerdict === "GO" ? "GO" : activeVerdict === "CAUTION" ? "CAUTION" : "NO-GO"}
                    </Badge>
                </div>
            </div>

            {/* Metrics Grid */}
            <CardContent className="p-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">

                    {/* Metric 1: Landed Cost */}
                    <div className="bg-neutral-50 p-4 rounded-xl border border-neutral-100">
                        <div className="flex items-center gap-1.5 mb-2">
                            <DollarSign className="h-3.5 w-3.5 text-neutral-400" />
                            <span className="text-[10px] font-semibold uppercase tracking-wider text-neutral-400">Landed Cost / Unit</span>
                        </div>
                        <div className="text-xl font-bold text-neutral-900 tabular-nums">
                            R {summary.landed_cost_per_unit_zar.toLocaleString('en-ZA', { maximumFractionDigits: 2 })}
                        </div>
                    </div>

                    {/* Metric 2: Break-Even */}
                    <div className="bg-neutral-50 p-4 rounded-xl border border-neutral-100">
                        <div className="flex items-center gap-1.5 mb-2">
                            <TrendingUp className="h-3.5 w-3.5 text-neutral-400" />
                            <span className="text-[10px] font-semibold uppercase tracking-wider text-neutral-400">Break-Even</span>
                        </div>
                        <div className="text-xl font-bold text-neutral-900 tabular-nums">
                            R {breakEvenPrice?.toLocaleString('en-ZA', { maximumFractionDigits: 2 }) || "—"}
                        </div>
                        <p className="text-[10px] text-neutral-400 mt-1">
                            {inputs.importerType === "VAT_REGISTERED" ? "Excl. recoverable VAT" : "Total recovery needed"}
                        </p>
                    </div>

                    {/* Metric 3: Gross Margin */}
                    <div className={`p-4 rounded-xl border ${hasMargin && marginPositive ? 'bg-emerald-50/50 border-emerald-100' : hasMargin ? 'bg-red-50/50 border-red-100' : 'bg-neutral-50 border-neutral-100'}`}>
                        <div className="flex items-center gap-1.5 mb-2">
                            <BarChart3 className="h-3.5 w-3.5 text-neutral-400" />
                            <span className="text-[10px] font-semibold uppercase tracking-wider text-neutral-400">Gross Margin</span>
                        </div>
                        <div className={`text-xl font-bold tabular-nums ${hasMargin && marginPositive ? 'text-emerald-700' : hasMargin ? 'text-red-700' : 'text-neutral-400'}`}>
                            {marginDisplay}
                        </div>
                        {!hasMargin && (
                            <p className="text-[10px] text-neutral-400 mt-1">Enter selling price to see margin</p>
                        )}
                    </div>

                    {/* Metric 4: Confidence */}
                    <div className="bg-neutral-50 p-4 rounded-xl border border-neutral-100">
                        <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-1.5">
                                <Shield className="h-3.5 w-3.5 text-neutral-400" />
                                <span className="text-[10px] font-semibold uppercase tracking-wider text-neutral-400">Confidence</span>
                            </div>
                            <span className={`text-[10px] font-bold uppercase ${result.hs.confidence_bucket === 'high' ? 'text-emerald-600' : 'text-amber-600'}`}>
                                {result.hs.confidence_bucket}
                            </span>
                        </div>
                        <Progress value={result.hs.confidence_score * 100} className="h-1.5 mb-1.5" />
                        <p className="text-[10px] text-neutral-400">HS accuracy + tariff freshness</p>
                    </div>

                </div>
            </CardContent>
        </Card>
    );
}
