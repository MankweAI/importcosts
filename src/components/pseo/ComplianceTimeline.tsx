/**
 * ComplianceTimeline.tsx
 *
 * Visual timeline of required documents mapped to import stages.
 * Answers: "How do I not screw it up?"
 */

"use client";

import { FileText, AlertTriangle } from "lucide-react";

interface ComplianceStep {
    stage: string;
    items: string[];
    criticalWarning?: string;
}

const COMPLIANCE_STEPS: ComplianceStep[] = [
    {
        stage: "Before Booking Freight",
        items: [
            "Proforma Invoice (for financing/planning)",
            "Import Code (IEC) registration check"
        ]
    },
    {
        stage: "Before Sailing (Supplier side)",
        items: [
            "Commercial Invoice (Check HS codes match!)",
            "Packing List (Check weights!)",
            "Certificate of Origin (if SADC/EU preference)"
        ]
    },
    {
        stage: "Before Arrival (7 days out)",
        items: [
            "Bill of Lading / Airway Bill (Originals needed?)",
            "LOA / Compliance Certs (NRCS, ICASA)"
        ],
        criticalWarning: "Missing LOA at this stage = Port Detention (Demurrage costs apply!)"
    },
    {
        stage: "Upon Arrival",
        items: [
            "SAD500 (Customs Worksheet)",
            "Release Order"
        ]
    }
];

export function ComplianceTimeline() {
    return (
        <section className="mt-12 mb-8" aria-labelledby="compliance-heading">
            <h2 id="compliance-heading" className="text-xl font-bold tracking-tight text-neutral-900 md:text-2xl">
                How do I not screw it up?
            </h2>
            <p className="mt-1 text-sm text-neutral-500 max-w-2xl mb-6">
                Prepare these documents at the right time to avoid customs delays.
            </p>

            <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
                <div className="relative">
                    {/* Vertical connector line */}
                    <div className="absolute top-4 bottom-4 left-[19px] w-0.5 bg-neutral-100"></div>

                    <div className="space-y-8 relative">
                        {COMPLIANCE_STEPS.map((step, i) => (
                            <div key={i} className="flex gap-4 group">
                                {/* Connector Dot */}
                                <div className="z-10 flex-shrink-0 relative mt-1.5">
                                    <div className="h-4 w-4 rounded-full bg-blue-100 border-2 border-white ring-2 ring-blue-50 flex items-center justify-center">
                                        <div className="h-1.5 w-1.5 rounded-full bg-blue-600"></div>
                                    </div>
                                </div>

                                <div className="flex-1 pb-2">
                                    <h3 className="text-sm font-bold text-neutral-900 mb-3">{step.stage}</h3>

                                    <div className="space-y-2 mb-3">
                                        {step.items.map((item, j) => (
                                            <div key={j} className="flex items-start gap-2.5 p-2 rounded-lg hover:bg-neutral-50 border border-transparent hover:border-neutral-100 transition-colors">
                                                <FileText className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                                                <span className="text-sm text-neutral-700">{item}</span>
                                            </div>
                                        ))}
                                    </div>

                                    {step.criticalWarning && (
                                        <div className="flex items-start gap-2 p-3 rounded-lg bg-red-50 border border-red-100">
                                            <AlertTriangle className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
                                            <p className="text-xs font-semibold text-red-700 leading-relaxed">
                                                {step.criticalWarning}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}
