"use client";

import { useEffect, useRef, useState } from "react";
import { usePSEOCalculatorStore } from "@/store/usePSEOCalculatorStore";
import { CalculationResult, CalculationInputs } from "@/types/pseo";
import { cn, formatZAR } from "@/lib/utils";
import { CheckCircle2, AlertTriangle, XCircle, Loader2, RefreshCw } from "lucide-react";
import { calculateAction } from "@/app/actions";
import { Slider } from "@/components/ui/slider";

interface InvoiceCalculatorProps {
    initialResult?: CalculationResult;
    initialInputs?: Partial<CalculationInputs>;
}

function InputLabel({ children }: { children: React.ReactNode }) {
    return <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-600">{children}</label>;
}

export function InvoiceCalculator({ initialResult, initialInputs }: InvoiceCalculatorProps) {
    const { result, inputs, status, setInputs, setResult } = usePSEOCalculatorStore();
    const hydrated = useRef(false);
    const [isCalculating, setIsCalculating] = useState(false);

    useEffect(() => {
        if (!hydrated.current && initialResult) {
            if (initialInputs) setInputs(initialInputs);
            setResult(initialResult);
            hydrated.current = true;
        }
    }, [initialResult, initialInputs, setInputs, setResult]);

    const handleInputChange = (field: keyof CalculationInputs, value: string) => {
        const numValue = parseFloat(value) || 0;
        setInputs({ ...inputs, [field]: numValue });
    };

    const handleCalculate = async () => {
        setIsCalculating(true);
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
            targetMarginPercent: inputs.targetMarginPercent,
        };

        const response = await calculateAction(calcInput);
        if (response.success && response.result) {
            setResult(response.result);
        }
        setIsCalculating(false);
    };

    if (!result && status !== "success") {
        return (
            <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-sm">
                <Loader2 className="mx-auto h-8 w-8 animate-spin text-sky-500" />
                <p className="mt-4 text-sm text-slate-500">Building your landed cost workspace...</p>
            </div>
        );
    }

    const getAmount = (key: string) => result?.line_items?.find((i) => i.key === key)?.amount_zar || 0;
    const margin = result?.grossMarginPercent ?? 0;
    const profitValue = (inputs.targetSellingPrice || 0) - (result?.summary.total_landed_cost_zar || 0);

    return (
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:p-6">
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-5">
                <div>
                    <h3 className="text-xl font-semibold text-slate-900">Deal configuration</h3>
                    <p className="mt-1 text-sm text-slate-600">Tune assumptions and instantly refresh landed cost outcomes.</p>
                </div>
                <button
                    onClick={handleCalculate}
                    disabled={isCalculating}
                    className="inline-flex items-center gap-2 rounded-lg bg-sky-600 px-3 py-2 text-sm font-semibold text-white hover:bg-sky-700 disabled:opacity-70"
                >
                    {isCalculating ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
                    Recalculate
                </button>
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
                <div className="space-y-5 lg:col-span-7">
                    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                        <InputLabel>Quantity (units)</InputLabel>
                        <div className="mb-3 flex items-center justify-between">
                            <span className="text-sm text-slate-600">Shipment volume</span>
                            <span className="rounded-md bg-sky-100 px-2 py-0.5 text-sm font-semibold text-sky-700">{inputs.quantity || 1}</span>
                        </div>
                        <div className="flex items-center gap-4">
                            <Slider
                                defaultValue={[inputs.quantity || 1]}
                                max={1000}
                                min={1}
                                step={1}
                                className="flex-1 cursor-pointer"
                                onValueChange={(vals: number[]) => handleInputChange("quantity", vals[0].toString())}
                                onValueCommit={handleCalculate}
                            />
                            <input
                                type="number"
                                className="w-24 rounded-md border border-slate-300 px-3 py-2 text-right text-sm text-slate-900 focus:border-sky-500 focus:outline-none"
                                value={inputs.quantity || 1}
                                onChange={(e) => handleInputChange("quantity", e.target.value)}
                                onBlur={handleCalculate}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <div className="rounded-xl border border-slate-200 p-4">
                            <InputLabel>Total supplier invoice</InputLabel>
                            <div className="relative">
                                <span className="absolute left-3 top-2.5 text-sm text-slate-400">R</span>
                                <input
                                    type="number"
                                    className="w-full rounded-md border border-slate-300 py-2 pl-8 pr-3 text-base font-semibold text-slate-900 focus:border-sky-500 focus:outline-none"
                                    value={inputs.invoiceValue}
                                    onChange={(e) => handleInputChange("invoiceValue", e.target.value)}
                                    onBlur={handleCalculate}
                                />
                            </div>
                        </div>
                        <div className="rounded-xl border border-slate-200 p-4">
                            <InputLabel>Freight and insurance</InputLabel>
                            <div className="relative">
                                <span className="absolute left-3 top-2.5 text-sm text-slate-400">R</span>
                                <input
                                    type="number"
                                    className="w-full rounded-md border border-slate-300 py-2 pl-8 pr-3 text-base font-semibold text-slate-900 focus:border-sky-500 focus:outline-none"
                                    value={inputs.freightCost}
                                    onChange={(e) => handleInputChange("freightCost", e.target.value)}
                                    onBlur={handleCalculate}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="rounded-xl border border-sky-200 bg-sky-50/60 p-4">
                        <InputLabel>Target total revenue</InputLabel>
                        <div className="mb-3 flex items-center justify-between">
                            <span className="text-sm text-slate-600">Selling strategy</span>
                            <span className="text-sm font-semibold text-sky-700">{formatZAR(inputs.targetSellingPrice || 0)}</span>
                        </div>
                        <div className="flex items-center gap-4">
                            <Slider
                                defaultValue={[inputs.targetSellingPrice || 0]}
                                max={(inputs.invoiceValue * 3) || 50000}
                                min={0}
                                step={100}
                                className="flex-1 cursor-pointer"
                                onValueChange={(vals: number[]) => handleInputChange("targetSellingPrice", vals[0].toString())}
                                onValueCommit={handleCalculate}
                            />
                            <input
                                type="number"
                                className="w-28 rounded-md border border-sky-200 bg-white px-3 py-2 text-right text-sm font-semibold text-sky-800 focus:border-sky-500 focus:outline-none"
                                value={inputs.targetSellingPrice || 0}
                                onChange={(e) => handleInputChange("targetSellingPrice", e.target.value)}
                                onBlur={handleCalculate}
                            />
                        </div>
                        <p className="mt-2 text-xs text-slate-500">Use this to see margin and break-even dynamics in real time.</p>
                    </div>
                </div>

                <div className="lg:col-span-5">
                    <div className="sticky top-24 space-y-4">
                        {/* Viability Verdict Card */}
                        {result?.verdict && (
                            <div className={cn(
                                "rounded-xl border p-5 shadow-sm transition-all",
                                result.verdict === "GO" ? "bg-emerald-50 border-emerald-200" :
                                    result.verdict === "CAUTION" ? "bg-amber-50 border-amber-200" :
                                        "bg-red-50 border-red-200"
                            )}>
                                <div className="flex items-start justify-between">
                                    <div>
                                        <h4 className={cn(
                                            "text-lg font-bold tracking-tight",
                                            result.verdict === "GO" ? "text-emerald-900" :
                                                result.verdict === "CAUTION" ? "text-amber-900" :
                                                    "text-red-900"
                                        )}>
                                            {result.verdict === "GO" ? "Viable Opportunity" :
                                                result.verdict === "CAUTION" ? "Proceed with Caution" :
                                                    "High Risk Opportunity"}
                                        </h4>
                                        <p className={cn(
                                            "mt-1 text-sm leading-relaxed",
                                            result.verdict === "GO" ? "text-emerald-700" :
                                                result.verdict === "CAUTION" ? "text-amber-700" :
                                                    "text-red-700"
                                        )}>
                                            {result.verdict === "GO" ? "Current assumptions support a viable import decision." :
                                                result.verdict === "CAUTION" ? "Profitability is sensitive. Validate cost and FX assumptions." :
                                                    "Cost profile is currently too high for target outcomes."}
                                        </p>
                                    </div>
                                    <div className={cn(
                                        "flex h-10 w-10 items-center justify-center rounded-full",
                                        result.verdict === "GO" ? "bg-emerald-200 text-emerald-700" :
                                            result.verdict === "CAUTION" ? "bg-amber-200 text-amber-700" :
                                                "bg-red-200 text-red-700"
                                    )}>
                                        {result.verdict === "GO" ? <CheckCircle2 className="h-5 w-5" /> :
                                            result.verdict === "CAUTION" ? <AlertTriangle className="h-5 w-5" /> :
                                                <XCircle className="h-5 w-5" />
                                        }
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Breakdown Panel */}
                        <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
                            <div className="border-b border-slate-200 bg-slate-50 px-5 py-4">
                                <div className="flex items-center justify-between">
                                    <h4 className="text-base font-semibold text-slate-900">Cost Breakdown</h4>
                                    {isCalculating ? <Loader2 className="h-4 w-4 animate-spin text-sky-600" /> : null}
                                </div>
                                <p className="mt-1 text-xs text-slate-600">Per-unit economics ({inputs.quantity} units)</p>
                            </div>

                            <div className="space-y-3 px-5 py-4">
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-slate-600">Supplier price</span>
                                    <span className="font-medium text-slate-900">{formatZAR(inputs.invoiceValue / (inputs.quantity || 1))}</span>
                                </div>
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-slate-600">Freight and insurance</span>
                                    <span className="font-medium text-slate-900">{formatZAR((inputs.freightCost || 0) / (inputs.quantity || 1))}</span>
                                </div>
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-slate-600">Duty and VAT</span>
                                    <span className="font-medium text-slate-900">
                                        {formatZAR((getAmount("duty") + getAmount("vat")) / (inputs.quantity || 1))}
                                    </span>
                                </div>

                                <div className="my-2 h-px bg-slate-200" />

                                <div className="flex items-end justify-between">
                                    <span className="text-sm font-semibold text-slate-700">Landed cost / unit</span>
                                    <span className="text-2xl font-bold text-slate-900">
                                        {formatZAR(result?.summary.landed_cost_per_unit_zar || 0)}
                                    </span>
                                </div>

                                <div className="rounded-lg border border-sky-200 bg-sky-50 p-3">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-semibold text-sky-700">Gross margin</span>
                                        <span className="text-xl font-bold text-sky-700">{margin.toFixed(1)}%</span>
                                    </div>
                                    <div className="mt-1 flex items-center justify-between text-xs text-slate-600">
                                        <span>Total profit impact</span>
                                        <span>{formatZAR(profitValue)}</span>
                                    </div>
                                </div>

                                <p className="pt-1 text-xs text-slate-500">Tariff and VAT assumptions refresh when you recalculate.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
