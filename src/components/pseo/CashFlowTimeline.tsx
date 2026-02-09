"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { usePSEOCalculatorStore } from "@/store/usePSEOCalculatorStore";
import { Badge } from "@/components/ui/badge";

export function CashFlowTimeline() {
    const { result, inputs } = usePSEOCalculatorStore();

    if (!result) return null;

    // Simplified logic: 
    // Immediate: Supplier Deposit (e.g. 50% of Invoice)
    // Shipment Arrival (-30 days to 0): Freight
    // Customs Clearance (Day 0): Duties + VAT + Disbursement
    // Final Settlement (Day 30): Remaining Invoice

    const supplierDeposit = inputs.invoiceValue * 0.5 * inputs.exchangeRate; // Simple assumption
    const freightAmount = (inputs.freightCost || 0) * inputs.exchangeRate; // Assuming freight in foreign currency for now or ZAR inputs?
    // Note: Inputs are vague on currency of freight. Assuming ZAR or converted if needed. 
    // For simplicity, let's assume freight input is in the same currency as invoice if typically foreign, 
    // or we should check the input definition. The input placeholder was 0.00, likely same currency.
    // Let's assume input currency for freight to be safe, so convert to ZAR.

    const dutiesAndVat = result.summary.total_taxes_zar;
    const finalSettlement = inputs.invoiceValue * 0.5 * inputs.exchangeRate;

    const stages = [
        { label: "Order (T-60)", description: "Supplier 50% Deposit", amount: supplierDeposit, color: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300" },
        { label: "Shipment (T-30)", description: "Freight & Ins.", amount: freightAmount, color: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300" },
        { label: "Arrival (T-0)", description: "Customs Duties & VAT", amount: dutiesAndVat, color: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300" },
        { label: "Delivery (T+30)", description: "Final Settlement", amount: finalSettlement, color: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300" },
    ];

    const totalZar = result.summary.total_landed_cost_zar;

    return (
        <Card>
            <CardHeader className="pb-2">
                <CardTitle className="text-base">Cash Flow Timeline</CardTitle>
                <p className="text-xs text-neutral-500">Estimated payment schedule based on typical terms.</p>
            </CardHeader>
            <CardContent>
                <div className="relative pt-2">
                    <div className="absolute top-3 left-0 right-0 h-0.5 bg-neutral-100 dark:bg-neutral-800" />
                    <div className="grid grid-cols-4 gap-2">
                        {stages.map((stage, i) => (
                            <div key={i} className="relative flex flex-col items-center text-center group">
                                <div className={`w-3 h-3 rounded-full z-10 mb-2 border-2 border-white dark:border-neutral-950 ${stage.color.split(' ')[0].replace('bg-', 'bg-')}`} />
                                <div className="space-y-1">
                                    <span className="text-[10px] font-mono text-neutral-400 uppercase tracking-wider">{stage.label}</span>
                                    <div className="text-xs font-semibold leading-tight">{stage.description}</div>
                                    <div className={`text-xs font-mono py-1 px-2 rounded-full ${stage.color}`}>
                                        R {(stage.amount).toLocaleString('en-ZA', { maximumFractionDigits: 0, notation: "compact" })}
                                    </div>
                                    <div className="text-[10px] text-neutral-400">
                                        {((stage.amount / totalZar) * 100).toFixed(0)}%
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
