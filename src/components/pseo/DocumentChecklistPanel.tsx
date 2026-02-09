"use client";

import { usePSEOCalculatorStore } from "@/store/usePSEOCalculatorStore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckSquare, FileText, AlertCircle, HelpCircle } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

export function DocumentChecklistPanel() {
    const { result, status, inputs } = usePSEOCalculatorStore();

    if (status !== 'success' || !result) return null;

    const { always, common, conditional } = result.doc_checklist;
    const isVatVendor = inputs.importerType === 'VAT_REGISTERED';

    return (
        <Card className="mb-6 h-fit">
            <CardHeader className="pb-3 border-b border-neutral-100 dark:border-neutral-800">
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                    <CheckSquare className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    Clearance Checklist
                </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-6">

                {/* Mandatory */}
                <div>
                    <h4 className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-red-500"></span>
                        Mandatory
                    </h4>
                    <ul className="space-y-3">
                        {always.map((item, index) => {
                            return <ChecklistItem key={`${item.title}-${index}`} item={item} />;
                        })}
                    </ul>
                </div>

                {/* Conditional (Prioritized if relevant) */}
                {conditional.length > 0 && (
                    <div>
                        <h4 className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                            Conditional
                        </h4>
                        <ul className="space-y-3">
                            {conditional.map((item, index) => (
                                <ChecklistItem key={`${item.title}-${index}`} item={item} isConditional />
                            ))}
                        </ul>
                    </div>
                )}

                {/* Common */}
                {common.length > 0 && (
                    <div>
                        <h4 className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                            Often Required
                        </h4>
                        <ul className="space-y-3">
                            {common.map((item, index) => (
                                <ChecklistItem key={`${item.title}-${index}`} item={item} />
                            ))}
                        </ul>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

function ChecklistItem({ item, isConditional = false }: { item: any; isConditional?: boolean }) {
    return (
        <li className="flex items-start gap-3 group">
            <div className={`mt-0.5 rounded border p-0.5 ${isConditional ? 'border-amber-200 bg-amber-50 text-amber-600' : 'border-neutral-200 bg-neutral-50 text-neutral-400'}`}>
                <FileText className="h-3.5 w-3.5" />
            </div>
            <div className="flex-1">
                <div className="flex items-center gap-1.5">
                    <span className="text-sm font-medium text-neutral-900 dark:text-neutral-100 group-hover:underline decoration-neutral-300 underline-offset-2 decoration-dotted cursor-help">
                        <TooltipProvider>
                            <Tooltip delayDuration={0}>
                                <TooltipTrigger asChild>
                                    <span>{item.title}</span>
                                </TooltipTrigger>
                                <TooltipContent side="right" className="max-w-[250px]">
                                    <p className="font-semibold mb-1">{item.title}</p>
                                    <p className="text-xs opacity-90">{item.why}</p>
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    </span>
                    {isConditional && (
                        <AlertCircle className="h-3 w-3 text-amber-500" />
                    )}
                </div>
                {isConditional && item.trigger && (
                    <p className="text-xs text-amber-600/90 dark:text-amber-500 mt-0.5 italic">
                        Required if: {item.trigger}
                    </p>
                )}
            </div>
        </li>
    );
}
