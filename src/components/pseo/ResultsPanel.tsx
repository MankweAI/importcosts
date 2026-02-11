"use client";

import { useState, useEffect, useRef } from "react";
import { usePSEOCalculatorStore } from "@/store/usePSEOCalculatorStore";
import { FreightInclusionBanner } from "./FreightInclusionBanner";
import { RiskFlagsPanel } from "./RiskFlagsPanel";
import { DocumentChecklistPanel } from "./DocumentChecklistPanel";
import { PreferenceEligibilityPanel } from "./PreferenceEligibilityPanel";
import { AssumptionsAndFreshnessBox } from "./AssumptionsAndFreshnessBox";
import { SourcingRecommendations } from "./SourcingRecommendations";
import type { SmartRateResult } from "@/lib/calc/smartRateHunter";

import { ImporterCalculator } from "./ImporterCalculator";

import { ViabilityDashboard } from "@/components/pivot/ViabilityDashboard";
import { RiskRadar } from "@/components/pivot/RiskRadar";
import { DealActions } from "@/components/pivot/DealActions";
import { BrokerHandoffCTA } from "@/components/pivot/BrokerHandoffCTA";

export function ResultsPanel() {
    const { result, status, inputs } = usePSEOCalculatorStore();
    const [rateHunterResult, setRateHunterResult] = useState<SmartRateResult | null>(null);
    const [rateHunterLoading, setRateHunterLoading] = useState(false);
    const lastHunterKey = useRef<string>("");

    // Auto-fire the Smart Rate Hunter when results change
    useEffect(() => {
        if (status !== 'success' || !result || !inputs.hsCode) return;

        const key = `${inputs.hsCode}-${inputs.originCountry}-${inputs.invoiceValue}-${inputs.exchangeRate}`;
        if (key === lastHunterKey.current) return;
        lastHunterKey.current = key;

        setRateHunterLoading(true);
        setRateHunterResult(null);

        fetch('/api/rate-hunter', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(inputs),
        })
            .then(res => res.ok ? res.json() : null)
            .then(data => setRateHunterResult(data))
            .catch(err => console.warn('[RateHunter] Failed:', err))
            .finally(() => setRateHunterLoading(false));
    }, [status, result, inputs]);

    return (
        <div className="space-y-6">
            {/* 0. CALCULATOR — Always visible */}
            <ImporterCalculator />

            {/* Loading state */}
            {status === 'calculating' && (
                <div className="p-8 rounded-2xl border-2 border-dashed border-neutral-200 text-center animate-pulse">
                    <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-neutral-100 mb-3">
                        <div className="w-5 h-5 border-2 border-neutral-400 border-t-transparent rounded-full animate-spin" />
                    </div>
                    <p className="text-sm text-neutral-500 font-medium">Scanning deal viability...</p>
                    <p className="text-xs text-neutral-400 mt-1">Checking tariffs, risks, and trade agreements</p>
                </div>
            )}

            {/* Results — only when calculation is done */}
            {status === 'success' && result && (
                <div id="results" className="space-y-6 scroll-mt-20">

                    {/* 1. VERDICT — The Hero (Viability Dashboard) */}
                    <div className="relative">
                        <div className="absolute top-5 right-5 z-10">
                            <DealActions />
                        </div>
                        <ViabilityDashboard />
                    </div>

                    {/* 2. RISK RADAR — Top 3 Margin Killers */}
                    <RiskRadar />

                    {/* 3. BROKER HANDOFF CTA — Lead Gen */}
                    <BrokerHandoffCTA />

                    {/* 4. SOURCING — Could I do better? */}
                    {rateHunterResult ? (
                        <SourcingRecommendations rateHunterResult={rateHunterResult} />
                    ) : rateHunterLoading ? (
                        <div className="p-6 rounded-2xl border-2 border-dashed border-neutral-200 text-center animate-pulse">
                            <p className="text-sm text-neutral-500">Analyzing sourcing options across 5 global origins...</p>
                        </div>
                    ) : null}

                    {/* 5. Freight Mismatch Warning */}
                    <FreightInclusionBanner />

                    {/* 6. Two-column: Compliance + Checklist */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="lg:col-span-2 space-y-6">
                            <RiskFlagsPanel />
                            <PreferenceEligibilityPanel />
                        </div>
                        <div className="space-y-6">
                            <DocumentChecklistPanel />
                        </div>
                    </div>

                    {/* 7. Fine Print */}
                    <AssumptionsAndFreshnessBox />
                </div>
            )}
        </div>
    );
}
