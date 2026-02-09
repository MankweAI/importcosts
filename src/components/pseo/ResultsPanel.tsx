"use client";

import { usePSEOCalculatorStore } from "@/store/usePSEOCalculatorStore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CircleHelp, TriangleAlert, FileText, Wallet, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CashFlowTimeline } from "./CashFlowTimeline";
import { ForexSensitivity } from "./ForexSensitivity";
import { DecisionSummaryHeader } from "./DecisionSummaryHeader";
import { AssumptionsAndFreshnessBox } from "./AssumptionsAndFreshnessBox";
import { HSConfidencePanel } from "./HSConfidencePanel";
import { RiskFlagsPanel } from "./RiskFlagsPanel";
import { DocumentChecklistPanel } from "./DocumentChecklistPanel";
import { PreferenceEligibilityPanel } from "./PreferenceEligibilityPanel";
import { ScenarioToolkit } from "./ScenarioToolkit";
import { OriginCompareWidget } from "./OriginCompareWidget";

export function ResultsPanel() {
    const { result, status, inputs } = usePSEOCalculatorStore();

    if (status !== 'success' || !result) return null;

    return (
        <div id="results" className="space-y-8 scroll-mt-20">

            {/* 1. Decision Summary (Sticky-ish) */}
            <DecisionSummaryHeader />

            {/* 2. Metadata & Assumptions */}
            <AssumptionsAndFreshnessBox />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* LEFT COLUMN: Decision Support Blocks (Compliance & Risk) */}
                <div className="lg:col-span-2 space-y-6">
                    <HSConfidencePanel />
                    <RiskFlagsPanel />
                    <PreferenceEligibilityPanel />

                    {/* Financial Deep Dive (Cashflow & Sensitivity) */}
                    <div className="grid md:grid-cols-2 gap-6">
                        <CashFlowTimeline />
                        <ForexSensitivity />
                    </div>

                    {/* Simulation & Comparison Tools */}
                    <ScenarioToolkit />
                    <OriginCompareWidget />
                </div>

                {/* RIGHT COLUMN: Actionable Checklist & Breakdown Summary */}
                <div className="space-y-6">
                    <DocumentChecklistPanel />

                    {/* Recap of Costs (Mini Breakdown) */}
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-neutral-500">Cost Breakdown Summary</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {/* Simple Line Items */}
                            <div className="space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span>FOB Invoice Value</span>
                                    <span>R {(inputs.invoiceValue * inputs.exchangeRate).toLocaleString('en-ZA', { maximumFractionDigits: 0 })}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span>Freight & Insurance</span>
                                    <span>R {(inputs.freightCost + inputs.insuranceCost).toLocaleString('en-ZA', { maximumFractionDigits: 0 })}</span>
                                </div>
                                <div className="border-t pt-2 mt-2">
                                    <div className="flex justify-between font-bold text-neutral-800 dark:text-neutral-200">
                                        <span>Total Duties & Taxes</span>
                                        <span>R {result.summary.total_taxes_zar.toLocaleString('en-ZA', { maximumFractionDigits: 0 })}</span>
                                    </div>
                                    <div className="text-xs text-neutral-400 text-right mt-0.5">
                                        Effective Rate: {((result.summary.total_taxes_zar / (result.summary.total_landed_cost_zar - result.summary.total_taxes_zar)) * 100).toFixed(1)}%
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* 3. Detailed Breakdown (Why Drawer & Line Items) - Kept at bottom for auditability */}
            <div className="border-t border-neutral-200 dark:border-neutral-800 pt-8">
                <h3 className="text-xl font-bold mb-6 text-neutral-900 dark:text-neutral-100">Detailed Cost Breakdown</h3>
                <div className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 overflow-hidden">
                    <div className="divide-y divide-neutral-100 dark:divide-neutral-800">
                        {result.line_items.map((item: any) => (
                            <div key={item.key} className="p-4 flex items-center justify-between hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors group">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 rounded bg-neutral-100 dark:bg-neutral-800 text-neutral-500">
                                        <CircleHelp className="h-4 w-4" />
                                    </div>
                                    <div>
                                        <div className="font-medium text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
                                            {item.label}
                                            {item.key === 'vat' && (
                                                <span className="text-[10px] bg-neutral-100 dark:bg-neutral-800 px-1.5 py-0.5 rounded text-neutral-500">15%</span>
                                            )}
                                        </div>
                                        {item.formula && (
                                            <div className="text-xs text-neutral-400 font-mono mt-0.5 hidden group-hover:block">
                                                {item.formula}
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <span className="font-mono font-medium">R {item.amount_zar.toLocaleString('en-ZA', { minimumFractionDigits: 2 })}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
