"use client";

import { usePSEOCalculatorStore } from "@/store/usePSEOCalculatorStore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ShieldAlert, AlertTriangle, AlertOctagon, Info, CheckCircle } from "lucide-react";

export function RiskRadar() {
    const { result, status } = usePSEOCalculatorStore();

    if (status !== 'success' || !result || !result.detailedRisks || result.detailedRisks.length === 0) return null;

    // Top 3 Margin Killers — show most critical first, limited to 3 per PRD
    const risks = result.detailedRisks.slice(0, 3);
    const totalRisks = result.detailedRisks.length;

    const severityIcon = (svr: string) => {
        switch (svr) {
            case "CRITICAL": return <AlertOctagon className="h-4 w-4 text-red-600" />;
            case "HIGH": return <ShieldAlert className="h-4 w-4 text-orange-500" />;
            case "MEDIUM": return <AlertTriangle className="h-4 w-4 text-amber-500" />;
            default: return <Info className="h-4 w-4 text-blue-500" />;
        }
    };

    const severityColor = (svr: string) => {
        switch (svr) {
            case "CRITICAL": return "bg-red-50 text-red-700 border-red-200";
            case "HIGH": return "bg-orange-50 text-orange-700 border-orange-200";
            case "MEDIUM": return "bg-amber-50 text-amber-700 border-amber-200";
            default: return "bg-blue-50 text-blue-700 border-blue-200";
        }
    };

    return (
        <Card className="border border-neutral-200/80 shadow-sm rounded-2xl overflow-hidden">
            <CardHeader className="pb-3 border-b border-neutral-100 px-6 pt-5">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-[15px] font-semibold flex items-center gap-2 text-neutral-900">
                        <ShieldAlert className="h-4 w-4 text-neutral-500" />
                        Top Margin Killers
                    </CardTitle>
                    {totalRisks > 3 && (
                        <Badge variant="outline" className="text-[10px] uppercase font-bold text-neutral-400 border-neutral-200">
                            +{totalRisks - 3} more
                        </Badge>
                    )}
                </div>
            </CardHeader>
            <CardContent className="p-4">
                <div className="space-y-3">
                    {risks.map((risk, index) => (
                        <div key={index} className="flex gap-3 p-3.5 rounded-xl border border-neutral-100 bg-neutral-50/50 hover:bg-neutral-50 transition-colors">
                            <div className="mt-0.5 flex-shrink-0">
                                {severityIcon(risk.severity)}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-center mb-1 gap-2">
                                    <h4 className="font-medium text-sm text-neutral-900 truncate">{risk.title}</h4>
                                    <Badge variant="outline" className={`${severityColor(risk.severity)} border text-[9px] uppercase font-bold flex-shrink-0`}>
                                        {risk.severity}
                                    </Badge>
                                </div>
                                <p className="text-xs text-neutral-500 leading-relaxed">
                                    {risk.description}
                                </p>
                                {risk.mitigation && (
                                    <div className="flex items-start gap-1.5 mt-2.5 p-2 rounded-lg bg-white border border-neutral-100">
                                        <CheckCircle className="h-3 w-3 text-emerald-500 mt-0.5 flex-shrink-0" />
                                        <span className="text-[11px] text-neutral-600">{risk.mitigation}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
