"use client";

import { usePSEOCalculatorStore } from "@/store/usePSEOCalculatorStore";
import { Info, Calendar, RefreshCw } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

export function AssumptionsAndFreshnessBox() {
    const { result, status, inputs } = usePSEOCalculatorStore();

    if (status !== 'success' || !result) return null;

    return (
        <Card className="bg-neutral-50 dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 mb-6">
            <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-neutral-500 flex items-center gap-2">
                    <Info className="h-4 w-4" />
                    Basis of Calculation
                </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                <div>
                    <span className="block text-neutral-400">Exchange Rate</span>
                    <span className="font-mono font-medium">1 USD = {inputs.exchangeRate.toFixed(2)} ZAR</span>
                </div>
                <div>
                    <span className="block text-neutral-400">Incoterm</span>
                    <span className="font-medium">{inputs.incoterm}</span>
                </div>
                <div>
                    <span className="block text-neutral-400">Importer Type</span>
                    <span className="font-medium">{inputs.importerType === 'VAT_REGISTERED' ? 'VAT Vendor' : 'Private'}</span>
                </div>
                <div>
                    <span className="block text-neutral-400">Tariff Version</span>
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger className="flex items-center gap-1 font-medium underline decoration-dotted">
                                {result.tariff.version}
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>Effective: {result.tariff.effective_date}</p>
                                <p>Last Updated: {result.tariff.last_updated}</p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                </div>
            </CardContent>
        </Card>
    );
}
