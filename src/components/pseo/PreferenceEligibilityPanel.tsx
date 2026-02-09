"use client";

import { usePSEOCalculatorStore } from "@/store/usePSEOCalculatorStore";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Check, CircleAlert, Flag, Info, FileText, ChevronDown, ExternalLink, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { AgreementOption, PreferenceDecision } from "@/types/pseo";

export function PreferenceEligibilityPanel() {
    const { result, status } = usePSEOCalculatorStore();

    if (status !== 'success' || !result) return null;

    // Use preference_decision if available, else fallback to safe default
    const decision: PreferenceDecision | null = result.preference_decision || null;

    if (!decision) return null;

    const isEligible = decision.status === 'eligible';
    const isUnknown = decision.status === 'unknown';
    const isNotEligible = decision.status === 'not_eligible';

    const bestOption = decision.best_option;

    return (
        <Card className="mb-6 border-indigo-100 dark:border-indigo-900 bg-white dark:bg-slate-950 shadow-sm overflow-hidden">
            {/* Header: Value Proposition First */}
            <div className={cn(
                "px-6 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b",
                isEligible ? "bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-100 dark:border-emerald-900"
                    : "bg-slate-50/50 dark:bg-slate-900/50 border-slate-100 dark:border-slate-800"
            )}>
                <div className="flex items-start gap-4">
                    <div className={cn(
                        "p-2 rounded-lg shrink-0",
                        isEligible ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300"
                            : "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400"
                    )}>
                        {isEligible ? <ShieldCheck className="h-6 w-6" /> : <Flag className="h-6 w-6" />}
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                            {isEligible ? "Preferential Rate Available" : "Standard Duty Rate Applies"}
                            {isEligible && <Badge className="bg-emerald-600 hover:bg-emerald-700">Recommended</Badge>}
                        </h3>
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                            {isEligible
                                ? `Importing from ${result.summary.origin_country} via ${bestOption?.agreement_name}`
                                : isUnknown
                                    ? "We could not verify a trade agreement for this specific route."
                                    : "No preferential agreement found for this route."}
                        </p>
                    </div>
                </div>

                {/* Rate & Savings Box */}
                <div className="flex items-center gap-6 bg-white dark:bg-slate-900 p-3 rounded-lg border border-slate-100 dark:border-slate-800 shadow-sm">
                    <div className="text-right">
                        <div className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Your Duty Rate</div>
                        <div className={cn(
                            "text-2xl font-black tabular-nums",
                            isEligible ? "text-emerald-600 dark:text-emerald-400" : "text-slate-900 dark:text-slate-100"
                        )}>
                            {bestOption?.preferential_rate.rate_value != null
                                ? `${(bestOption.preferential_rate.rate_value * 100).toFixed(1)}%`
                                : `${((decision.mfn_rate.rate_value || 0) * 100).toFixed(1)}%`}
                        </div>
                    </div>

                    {isEligible && bestOption?.savings_vs_mfn.savings_pct && (
                        <div className="pl-6 border-l border-slate-100 dark:border-slate-800 text-right">
                            <div className="text-xs text-emerald-600 dark:text-emerald-500 uppercase tracking-wider font-semibold">
                                You Save
                            </div>
                            <div className="text-lg font-bold text-emerald-700 dark:text-emerald-400 tabular-nums">
                                {(bestOption.savings_vs_mfn.savings_pct * 100).toFixed(1)}%
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <CardContent className="p-0">
                {isEligible && bestOption && (
                    <div className="divide-y divide-slate-100 dark:divide-slate-800">
                        {/* Actionable Checklist */}
                        <div className="p-6">
                            <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-200 mb-4 flex items-center gap-2">
                                <FileText className="h-4 w-4 text-indigo-500" />
                                Required Documents to Claim Period
                            </h4>
                            <div className="grid gap-3 md:grid-cols-2">
                                {decision.proof_checklist.map((item, idx) => (
                                    <div key={idx} className="flex items-start gap-3 p-3 rounded bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
                                        <div className="mt-0.5 h-4 w-4 rounded-full border border-slate-300 dark:border-slate-600 flex items-center justify-center shrink-0">
                                            <div className="h-2 w-2 rounded-full bg-slate-300 dark:bg-slate-600" />
                                        </div>
                                        <span className="text-sm text-slate-700 dark:text-slate-300 leading-snug">{item}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Accordion for Agreement Details */}
                        <Accordion type="single" collapsible className="w-full">
                            <AccordionItem value="details" className="border-b-0">
                                <AccordionTrigger className="px-6 py-3 text-sm text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:no-underline">
                                    View Agreement Details & Rules of Origin
                                </AccordionTrigger>
                                <AccordionContent className="px-6 pb-6">
                                    <div className="rounded-lg border border-slate-200 dark:border-slate-800 p-4 bg-slate-50 dark:bg-slate-900/50 space-y-4">
                                        <div>
                                            <div className="text-xs font-semibold uppercase text-slate-500 mb-1">Agreement</div>
                                            <div className="text-sm font-medium text-slate-900 dark:text-slate-200">{bestOption.agreement_name}</div>
                                        </div>

                                        <div>
                                            <div className="text-xs font-semibold uppercase text-slate-500 mb-1">Eligibility Reason</div>
                                            <div className="text-sm text-slate-700 dark:text-slate-300">{bestOption.eligibility_signal.reason}</div>
                                        </div>

                                        {bestOption.savings_vs_mfn.notes && (
                                            <div className="flex items-start gap-2 text-sm text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 p-2 rounded">
                                                <Info className="h-4 w-4 shrink-0 mt-0.5" />
                                                {bestOption.savings_vs_mfn.notes}
                                            </div>
                                        )}
                                    </div>
                                </AccordionContent>
                            </AccordionItem>
                        </Accordion>
                    </div>
                )}

                {(isUnknown || isNotEligible) && (
                    <div className="p-6 bg-slate-50 dark:bg-slate-900/30">
                        <div className="flex items-start gap-3">
                            <CircleAlert className="h-5 w-5 text-amber-500 mt-0.5" />
                            <div className="space-y-2">
                                <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                                    {decision.unknown_or_block_reason || "Standard duties apply as no active preferential trade agreement allows for duty-free import on this specific product."}
                                </p>
                                {isUnknown && (
                                    <Button variant="link" className="p-0 h-auto text-indigo-600 dark:text-indigo-400 font-semibold">
                                        Check if my product qualifies?
                                    </Button>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </CardContent>

            {/* Audit Footer */}
            <CardFooter className="bg-slate-50 dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 px-6 py-2 flex justify-between items-center text-[10px] text-slate-400 dark:text-slate-500">
                <div className="flex items-center gap-2">
                    <span>Data Source: SARS Tariff Book</span>
                    <span className="w-1 h-1 rounded-full bg-slate-300" />
                    <span>Ver: {decision.tariff_version_id}</span>
                </div>

                {decision.mfn_rate.source_ref?.url && (
                    <a
                        href={decision.mfn_rate.source_ref.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 hover:text-indigo-500 transition-colors"
                    >
                        View Official Schedule <ExternalLink className="h-3 w-3" />
                    </a>
                )}
            </CardFooter>
        </Card>
    );
}
