"use client";

import { useState, useEffect, useRef } from "react";
import { usePSEOCalculatorStore } from "@/store/usePSEOCalculatorStore";
import { CircleHelp } from "lucide-react";
import { DecisionSummaryHeader } from "./DecisionSummaryHeader";
import { FreightInclusionBanner } from "./FreightInclusionBanner";
import { RiskFlagsPanel } from "./RiskFlagsPanel";
import { DocumentChecklistPanel } from "./DocumentChecklistPanel";
import { PreferenceEligibilityPanel } from "./PreferenceEligibilityPanel";
import { AssumptionsAndFreshnessBox } from "./AssumptionsAndFreshnessBox";
import { SourcingRecommendations } from "./SourcingRecommendations";
import type { SmartRateResult } from "@/lib/calc/smartRateHunter";

import { ImporterCalculator } from "./ImporterCalculator";

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
        <div className="space-y-8">
            {/* 0. CALCULATOR — Always visible */}
            <ImporterCalculator />

            {/* Loading state */}
            {status === 'calculating' && (
                <div className="p-8 rounded-xl border-2 border-dashed border-neutral-200 dark:border-neutral-800 text-center animate-pulse">
                    <p className="text-sm text-neutral-500">Calculating your landed cost...</p>
                </div>
            )}

            {/* Results — only when calculation is done */}
            {status === 'success' && result && (
                <div id="results" className="space-y-8 scroll-mt-20">

                    {/* 1. THE NUMBER */}
                    <DecisionSummaryHeader />

                    {/* 2. Sourcing Insight — Could I do better? */}
                    {rateHunterResult ? (
                        <SourcingRecommendations rateHunterResult={rateHunterResult} />
                    ) : rateHunterLoading ? (
                        <div className="p-6 rounded-xl border-2 border-dashed border-neutral-200 dark:border-neutral-800 text-center animate-pulse">
                            <p className="text-sm text-neutral-500">Analyzing sourcing options across 5 global origins...</p>
                        </div>
                    ) : null}

                    {/* 3. Contextual Warning — Freight mismatch? */}
                    <FreightInclusionBanner />

                    {/* 4. Two-column: Compliance (left) + Checklist (right) */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-2 space-y-6">
                            <RiskFlagsPanel />
                            <PreferenceEligibilityPanel />
                        </div>
                        <div className="space-y-6">
                            <DocumentChecklistPanel />
                        </div>
                    </div>

                    {/* 5. Fine Print — Assumptions & data freshness */}
                    <AssumptionsAndFreshnessBox />
                </div>
            )}
        </div>
    );
}
