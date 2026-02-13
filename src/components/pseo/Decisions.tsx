
"use client";

import { AlertTriangle, ShieldAlert, FileText, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface Risk {
    title: string;
    description?: string;
    severity: "low" | "medium" | "high" | "critical";
    mitigation?: string;
}

interface RiskRadarPanelProps {
    risks: Risk[];
    onSeeAllClick?: () => void;
}

export function RiskRadarPanel({ risks, onSeeAllClick }: RiskRadarPanelProps) {
    // Sort by severity
    const severityOrder = { "critical": 0, "high": 1, "medium": 2, "low": 3 };
    const sortedRisks = [...risks].sort((a, b) =>
        (severityOrder[a.severity] ?? 9) - (severityOrder[b.severity] ?? 9)
    );

    const top3 = sortedRisks.slice(0, 3);
    const criticalCount = risks.filter(r => r.severity === "critical" || r.severity === "high").length;

    return (
        <div className="bg-white border border-neutral-200 rounded-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-neutral-100 flex items-center justify-between bg-neutral-50/50">
                <h3 className="font-bold text-neutral-900 flex items-center gap-2">
                    <ShieldAlert className={cn("w-5 h-5", criticalCount > 0 ? "text-verdict-nogo" : "text-neutral-500")} />
                    Risk Radar
                </h3>
                {criticalCount > 0 && (
                    <span className="bg-verdict-nogo/10 text-verdict-nogo text-xs font-bold px-2 py-1 rounded-full animate-pulse">
                        {criticalCount} Critical
                    </span>
                )}
            </div>

            <div className="divide-y divide-neutral-100">
                {top3.map((risk, idx) => (
                    <div key={idx} className="p-4 hover:bg-neutral-50 transition-colors">
                        <div className="flex items-start gap-3">
                            <div className={cn(
                                "w-2 h-2 rounded-full mt-2 shrink-0",
                                risk.severity === "critical" || risk.severity === "high" ? "bg-verdict-nogo" :
                                    risk.severity === "medium" ? "bg-verdict-caution" : "bg-neutral-300"
                            )} />
                            <div>
                                <h4 className="text-sm font-bold text-neutral-800 leading-tight">
                                    {risk.title}
                                </h4>
                                {risk.mitigation && (
                                    <p className="text-xs text-neutral-500 mt-1">
                                        <span className="font-semibold text-neutral-700">Mitigation:</span> {risk.mitigation}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {risks.length > 3 && onSeeAllClick && (
                <button
                    onClick={onSeeAllClick}
                    className="w-full py-3 text-xs font-bold text-neutral-500 hover:text-neutral-900 border-t border-neutral-100 transition-colors uppercase tracking-wider"
                >
                    View {risks.length - 3} More Risks
                </button>
            )}
        </div>
    );
}

// ─── CHECKLIST COMPONENT ───

interface ChecklistItem {
    label: string;
    owner: "Importer" | "Supplier" | "Agent";
    when: "Pre-shipment" | "Arrival" | "Clearance";
    isChecked?: boolean;
}

interface ImportReadinessChecklistProps {
    items: ChecklistItem[];
}

export function ImportReadinessChecklist({ items }: ImportReadinessChecklistProps) {
    const topItems = items.slice(0, 5);

    return (
        <div className="bg-white border border-neutral-200 rounded-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-neutral-100 flex items-center justify-between bg-neutral-50/50">
                <h3 className="font-bold text-neutral-900 flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    Readiness Checklist
                </h3>
            </div>

            <div className="p-2">
                {topItems.map((item, idx) => (
                    <label key={idx} className="flex items-center gap-3 p-3 hover:bg-neutral-50 rounded cursor-pointer group transition-colors">
                        <div className="relative flex items-center justify-center w-5 h-5 border-2 border-neutral-300 rounded group-hover:border-emerald-500 transition-colors">
                            {/* Checkbox visual placeholder */}
                        </div>
                        <div className="flex-1">
                            <span className="text-sm font-medium text-neutral-700 block group-hover:text-neutral-900">
                                {item.label}
                            </span>
                            <div className="flex items-center gap-2 mt-0.5">
                                <span className="text-[10px] uppercase font-bold text-neutral-400 bg-neutral-100 px-1.5 py-0.5 rounded">
                                    {item.owner}
                                </span>
                                <span className="text-[10px] text-neutral-400">
                                    {item.when}
                                </span>
                            </div>
                        </div>
                    </label>
                ))}
            </div>
            <button className="w-full py-3 text-xs font-bold text-neutral-500 hover:text-neutral-900 border-t border-neutral-100 transition-colors uppercase tracking-wider">
                Full Comparison Checklist
            </button>
        </div>
    );
}
