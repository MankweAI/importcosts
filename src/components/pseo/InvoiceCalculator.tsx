
"use client";

import { useEffect, useRef, useState } from "react";
import { usePSEOCalculatorStore } from "@/store/usePSEOCalculatorStore";
import { CalculationResult, CalculationInputs } from "@/types/pseo";
import { formatZAR, cn } from "@/lib/utils";
import { Loader2, RefreshCw } from "lucide-react";
import { calculateAction } from "@/app/actions";

interface InvoiceCalculatorProps {
    initialResult?: CalculationResult;
    initialInputs?: Partial<CalculationInputs>;
}

export function InvoiceCalculator({ initialResult, initialInputs }: InvoiceCalculatorProps) {
    const {
        result,
        inputs,
        status,
        setInputs,
        setResult,
        // calculate removed
    } = usePSEOCalculatorStore();

    const hydrated = useRef(false);
    const [isCalculating, setIsCalculating] = useState(false); // Local loading state for UX

    // 1. Hydrate Store on Mount
    useEffect(() => {
        if (!hydrated.current && initialResult) {
            if (initialInputs) setInputs(initialInputs);
            setResult(initialResult);
            hydrated.current = true;
        }
    }, [initialResult, initialInputs, setInputs, setResult]);

    // 2. Handle Input Changes
    const handleInputChange = (field: keyof CalculationInputs, value: string) => {
        const numValue = parseFloat(value) || 0;
        setInputs({ ...inputs, [field]: numValue });
    };

    // 3. Trigger Recalculation (Debounced or on Blur)
    const handleCalculate = async () => {
        setIsCalculating(true);

        // Derived Customs Value (ATV Base Approx)
        const derivedCustomsValue = (inputs.invoiceValue * inputs.exchangeRate) + (inputs.freightCost || 0);

        const calcInput = {
            hsCode: inputs.hsCode,
            customsValue: derivedCustomsValue,
            invoiceValue: inputs.invoiceValue,
            currency: inputs.currency,
            exchangeRate: inputs.exchangeRate,
            freightCost: inputs.freightCost,
            insuranceCost: inputs.insuranceCost,
            otherCharges: inputs.otherCharges,
            quantity: inputs.quantity,
            incoterm: inputs.incoterm as "FOB" | "CIF" | "EXW",
            importerType: (inputs.importerType === "PRIVATE" ? "NON_VENDOR" : "VAT_REGISTERED") as "VAT_REGISTERED" | "NON_VENDOR",
            originCountry: inputs.originCountry,
            clusterSlug: inputs.clusterSlug,
            targetSellingPrice: inputs.targetSellingPrice,
            targetMarginPercent: inputs.targetMarginPercent
        };

        // Call Server Action
        const response = await calculateAction(calcInput);
        if (response.success && response.result) {
            setResult(response.result); // Update global store
        }
        setIsCalculating(false);
    };

    if (!result && status !== "success") {
        return (
            <div className="p-12 text-center">
                <Loader2 className="w-8 h-8 animate-spin mx-auto text-neutral-300" />
                <p className="text-sm text-neutral-400 mt-4">Generating Invoice...</p>
            </div>
        );
    }

    const { summary, line_items } = result || {};

    // Helper to find amount
    const getAmount = (key: string) => line_items?.find(i => i.key === key)?.amount_zar || 0;

    return (
        <div className="px-8 pb-12">
            {/* INVOICE TABLE */}
            <table className="w-full text-sm">
                <thead>
                    <tr className="border-b-2 border-neutral-100 text-left">
                        <th className="py-3 font-semibold text-neutral-500 w-1/2">Description</th>
                        <th className="py-3 font-semibold text-neutral-500 text-right w-1/4">Basis / Rate</th>
                        <th className="py-3 font-semibold text-neutral-500 text-right w-1/4">Amount (ZAR)</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-neutral-50 text-neutral-700">

                    {/* ROW 1: INVOICE VALUE (Editable) */}
                    <tr className="group hover:bg-neutral-50 transition-colors">
                        <td className="py-4 font-medium text-neutral-900">
                            Supplier Invoice Value
                            <span className="block text-xs text-neutral-400 font-normal mt-1">
                                FOB Value of Goods
                            </span>
                        </td>
                        <td className="py-4 text-right">
                            <div className="relative inline-block w-32">
                                <span className="absolute left-3 top-2 text-neutral-400">R</span>
                                <input
                                    type="number"
                                    className="w-full pl-6 pr-2 py-1 text-right border border-neutral-200 rounded-sm focus:ring-1 focus:ring-neutral-900 focus:border-neutral-900 text-neutral-900 bg-white"
                                    value={inputs.invoiceValue}
                                    onChange={(e) => handleInputChange('invoiceValue', e.target.value)}
                                    onBlur={handleCalculate}
                                />
                            </div>
                        </td>
                        <td className="py-4 text-right font-medium text-neutral-900">
                            {formatZAR(inputs.invoiceValue)}
                        </td>
                    </tr>

                    {/* ROW 2: FREIGHT (Editable) */}
                    <tr className="group hover:bg-neutral-50 transition-colors">
                        <td className="py-4">
                            Freight & Insurance
                            <span className="block text-xs text-neutral-400 font-normal mt-1">
                                Est. shipping to South Africa
                            </span>
                        </td>
                        <td className="py-4 text-right">
                            <div className="relative inline-block w-32">
                                <span className="absolute left-3 top-2 text-neutral-400">R</span>
                                <input
                                    type="number"
                                    className="w-full pl-6 pr-2 py-1 text-right border border-neutral-200 rounded-sm focus:ring-1 focus:ring-neutral-900 focus:border-neutral-900 text-neutral-900 bg-white"
                                    value={inputs.freightCost} // simplified for now
                                    onChange={(e) => handleInputChange('freightCost', e.target.value)}
                                    onBlur={handleCalculate}
                                />
                            </div>
                        </td>
                        <td className="py-4 text-right text-neutral-600">
                            {formatZAR(inputs.freightCost)}
                        </td>
                    </tr>

                    {/* ROW 3: CUSTOMS VALUE (Calculated) */}
                    <tr className="bg-neutral-50/50">
                        <td className="py-3 text-neutral-500 text-xs uppercase tracking-wider pl-4 border-l-2 border-neutral-200">
                            Customs Value (ATV)
                        </td>
                        <td className="py-3 text-right text-neutral-400 text-xs">
                            (FOB + 154) @ {inputs.exchangeRate.toFixed(2)}
                        </td>
                        <td className="py-3 text-right text-neutral-500 font-mono text-xs">
                            {formatZAR((inputs.invoiceValue * inputs.exchangeRate) + (inputs.freightCost || 0) * 1.0)}
                            {/* Note: Logic simplified for UI demo, real logic in engine */}
                        </td>
                    </tr>


                    {/* ROW 4: DUTIES (Read-Only) */}
                    <tr className="group">
                        <td className="py-4">
                            Customs Duties
                            <span className="block text-xs text-neutral-400 font-normal mt-1">
                                Tariff: {line_items?.find(i => i.key === 'duty')?.audit?.rates?.rate || "N/A"}
                            </span>
                        </td>
                        <td className="py-4 text-right text-neutral-500 font-mono text-xs">
                            {isCalculating ? <Loader2 className="w-4 h-4 animate-spin ml-auto" /> : "Calculated"}
                        </td>
                        <td className="py-4 text-right text-neutral-900">
                            {formatZAR(getAmount('duty'))}
                        </td>
                    </tr>

                    {/* ROW 5: VAT (Read-Only) */}
                    <tr className="group">
                        <td className="py-4">
                            VAT (Import)
                            <span className="block text-xs text-neutral-400 font-normal mt-1">
                                15% on (ATV + Duty + 10%)
                            </span>
                        </td>
                        <td className="py-4 text-right text-neutral-500 font-mono text-xs">
                            15%
                        </td>
                        <td className="py-4 text-right text-neutral-900">
                            {formatZAR(getAmount('vat'))}
                        </td>
                    </tr>

                </tbody>

                <tfoot>
                    {/* TOTAL */}
                    <tr className="border-t-2 border-neutral-900">
                        <td className="pt-6 pb-2 text-lg font-bold text-neutral-900">
                            Total Landed Cost
                        </td>
                        <td className="pt-6 pb-2 text-right">
                            <button
                                onClick={handleCalculate}
                                disabled={isCalculating}
                                className="text-xs text-neutral-400 hover:text-neutral-900 flex items-center justify-end gap-1 ml-auto"
                            >
                                <RefreshCw className={cn("w-3 h-3", isCalculating && "animate-spin")} />
                                {isCalculating ? "Updating..." : "Recalculate"}
                            </button>
                        </td>
                        <td className="pt-6 pb-2 text-2xl font-bold text-neutral-900 text-right">
                            {formatZAR(result?.summary.total_landed_cost_zar || 0)}
                        </td>
                    </tr>
                    <tr>
                        <td className="pt-1 text-xs text-neutral-500">
                            Per Unit ({inputs.quantity}): <span className="font-medium text-neutral-900">{formatZAR((result?.summary.total_landed_cost_zar || 0) / inputs.quantity)}</span>
                        </td>
                        <td></td>
                        <td></td>
                    </tr>
                </tfoot>
            </table>
        </div>
    );
}
