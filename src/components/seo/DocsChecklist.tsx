"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, AlertTriangle, FileText } from "lucide-react";

interface DocsChecklistProps {
    hsCode: string;
    originCountry: string;
}

export function DocsChecklist({ hsCode, originCountry }: DocsChecklistProps) {
    // Phase 8c Logic: Hardcoded rules for MVP verification
    // In production, this would query a proper compliance rules engine.

    const requiredDocs = [
        { label: "Commercial Invoice", note: "Must include HS Code & Incoterms" },
        { label: "Packing List", note: "Match invoice details exactly" },
        { label: "SAD 500", note: "Customs Declaration (DA 500)" },
    ];

    const riskFlags = [];

    // Example Logic: Solar Panels (8541/8501) often have no duty but VAT risk
    // Example: China origin often has Valuation/Reference Pricing checks
    if (originCountry.toLowerCase() === "china") {
        riskFlags.push("Valuation Check: SARS Reference Pricing may apply");
    }

    // Example logic for Textiles/Clothing (Chapters 50-63)
    if (hsCode.startsWith("61") || hsCode.startsWith("62")) {
        riskFlags.push("Level 1 Stop: Likely physical inspection");
    }

    return (
        <div className="grid gap-6 md:grid-cols-2">
            {/* Required Documents */}
            <Card>
                <CardHeader className="pb-2">
                    <CardTitle className="text-lg flex items-center gap-2">
                        <FileText className="h-5 w-5 text-blue-600" />
                        Required Documents
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <ul className="space-y-3">
                        {requiredDocs.map((doc, i) => (
                            <li key={i} className="flex items-start gap-2">
                                <CheckCircle2 className="h-4 w-4 text-green-600 mt-1 shrink-0" />
                                <div className="flex flex-col">
                                    <span className="text-sm font-medium">{doc.label}</span>
                                    <span className="text-xs text-muted-foreground">{doc.note}</span>
                                </div>
                            </li>
                        ))}
                    </ul>
                </CardContent>
            </Card>

            {/* Compliance Risks */}
            <Card className="border-orange-200 bg-orange-50/50">
                <CardHeader className="pb-2">
                    <CardTitle className="text-lg flex items-center gap-2 text-orange-800">
                        <AlertTriangle className="h-5 w-5 text-orange-600" />
                        Compliance Risks
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {riskFlags.length > 0 ? (
                        <ul className="space-y-2">
                            {riskFlags.map((flag, i) => (
                                <li key={i} className="flex items-center gap-2 text-sm text-orange-900">
                                    <span className="h-1.5 w-1.5 rounded-full bg-orange-600" />
                                    {flag}
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-sm text-muted-foreground">No high-priority risk flags for this route.</p>
                    )}

                    <div className="mt-4 pt-4 border-t border-orange-200">
                        <p className="text-xs text-orange-800/70 italic">
                            Disclaimer: This is an automated compliance check. Always verify with your clearing agent.
                        </p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
