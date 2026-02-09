"use client";

import { usePSEOCalculatorStore } from "@/store/usePSEOCalculatorStore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, ShieldAlert, ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

export function RiskFlagsPanel() {
    const { result, status } = usePSEOCalculatorStore();
    const [expanded, setExpanded] = useState(false);

    if (status !== 'success' || !result || result.risk_flags.length === 0) return null;

    // Sort by severity (high -> medium -> low)
    const sortedFlags = [...result.risk_flags].sort((a, b) => {
        const severityMap = { high: 3, medium: 2, low: 1 };
        return severityMap[b.severity] - severityMap[a.severity];
    });

    const topFlags = expanded ? sortedFlags : sortedFlags.slice(0, 3);
    const hasMore = sortedFlags.length > 3;

    return (
        <Card className="mb-6 border-l-4 border-l-amber-500 dark:border-l-amber-700">
            <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold flex items-center gap-2 text-amber-900 dark:text-amber-100">
                    <ShieldAlert className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                    Compliance Risks & Alerts
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-3">
                    {topFlags.map((flag) => (
                        <div key={flag.key} className={`p-3 rounded-lg border ${flag.severity === 'high' ? 'bg-red-50 border-red-100 dark:bg-red-900/20 dark:border-red-800' :
                                flag.severity === 'medium' ? 'bg-amber-50 border-amber-100 dark:bg-amber-900/20 dark:border-amber-800' :
                                    'bg-blue-50 border-blue-100 dark:bg-blue-900/20 dark:border-blue-800'
                            }`}>
                            <div className="flex justify-between items-start mb-1">
                                <h4 className="font-semibold text-sm">{flag.title}</h4>
                                <span className={`text-[10px] uppercase font-bold px-1.5 py-0.5 rounded ${flag.severity === 'high' ? 'bg-red-200 text-red-800' :
                                        flag.severity === 'medium' ? 'bg-amber-200 text-amber-800' :
                                            'bg-blue-200 text-blue-800'
                                    }`}>{flag.severity}</span>
                            </div>
                            <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-2">{flag.summary}</p>
                            <div className="text-xs font-medium flex items-center gap-1.5 text-neutral-500 dark:text-neutral-500 bg-white dark:bg-black/20 p-2 rounded">
                                <AlertTriangle className="h-3 w-3" />
                                <span>Action: {flag.recommended_action}</span>
                            </div>
                        </div>
                    ))}

                    {hasMore && (
                        <Button
                            variant="ghost"
                            size="sm"
                            className="w-full text-xs text-neutral-500 h-8"
                            onClick={() => setExpanded(!expanded)}
                        >
                            {expanded ? <><ChevronUp className="h-3 w-3 mr-1" /> Show Less</> : <><ChevronDown className="h-3 w-3 mr-1" /> Show {sortedFlags.length - 3} More Risks</>}
                        </Button>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
