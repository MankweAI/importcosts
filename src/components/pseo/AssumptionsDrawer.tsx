
"use client";

import { useState } from "react";
import { ChevronDown, ChevronRight, Info, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";

interface AssumptionsDrawerProps {
    tariffVersion?: string;
    lastUpdated?: string;
    exchangeRate?: number;
    dutyRateUsed?: string;
    vatRecoverable?: boolean;
}

export function AssumptionsDrawer({
    tariffVersion = "2025-01-01",
    lastUpdated = new Date().toISOString(),
    exchangeRate = 18.50,
    dutyRateUsed = "0%",
    vatRecoverable = true
}: AssumptionsDrawerProps) {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="border-t border-neutral-200 bg-neutral-50 px-8 py-4">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 text-xs font-medium text-neutral-500 hover:text-neutral-800 transition-colors uppercase tracking-wider w-full text-left"
            >
                {isOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                Assumptions & Data Sources
            </button>

            {isOpen && (
                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-6 pb-4 animate-in slide-in-from-top-2 fade-in duration-200">
                    {/* Column 1: Sources */}
                    <div className="space-y-3">
                        <h4 className="text-xs font-bold text-neutral-900 flex items-center gap-2">
                            <ShieldCheck className="w-3 h-3 text-emerald-600" />
                            Official Data Sources
                        </h4>
                        <ul className="text-xs text-neutral-600 space-y-1">
                            <li>• Tariff: SARS Version {tariffVersion}</li>
                            <li>• Exchange Rate: Mid-market ({exchangeRate.toFixed(2)} ZAR/USD)</li>
                            <li>• Last Updated: {new Date(lastUpdated).toLocaleDateString()}</li>
                        </ul>
                    </div>

                    {/* Column 2: Formulas */}
                    <div className="space-y-3">
                        <h4 className="text-xs font-bold text-neutral-900 flex items-center gap-2">
                            <Info className="w-3 h-3 text-blue-600" />
                            Calculation Logic
                        </h4>
                        <ul className="text-xs text-neutral-600 space-y-1">
                            <li>• Customs Value (ATV) ≈ FOB × {exchangeRate} × 1.1</li>
                            <li>• Duty Applied: {dutyRateUsed} on FOB Value</li>
                            <li>• VAT: 15% on (ATV + Duty)</li>
                            <li>• Importer Type: {vatRecoverable ? "VAT Registered (Input VAT Claimable)" : "Private (VAT is Cost)"}</li>
                        </ul>
                    </div>
                </div>
            )}
        </div>
    );
}
