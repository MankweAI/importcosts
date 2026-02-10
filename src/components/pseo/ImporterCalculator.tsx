"use client";

import { useState } from "react";
import { usePSEOCalculatorStore } from "@/store/usePSEOCalculatorStore";
import { useCalculateLandedCost } from "@/hooks/useCalculateLandedCost";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { Calculator, ChevronRight, Loader2 } from "lucide-react";

type CalcMode = "basic" | "professional";

const CURRENCIES = [
    { value: "USD", label: "USD" },
    { value: "EUR", label: "EUR" },
    { value: "GBP", label: "GBP" },
    { value: "CNY", label: "CNY" },
    { value: "ZAR", label: "ZAR" },
];

const COUNTRIES = [
    { value: "US", label: "United States" },
    { value: "CN", label: "China" },
    { value: "DE", label: "Germany" },
    { value: "GB", label: "United Kingdom" },
    { value: "JP", label: "Japan" },
    { value: "IN", label: "India" },
    { value: "KR", label: "South Korea" },
    { value: "TW", label: "Taiwan" },
    { value: "IT", label: "Italy" },
    { value: "FR", label: "France" },
    { value: "TR", label: "Turkey" },
    { value: "TH", label: "Thailand" },
    { value: "BR", label: "Brazil" },
    { value: "MX", label: "Mexico" },
];

const INCOTERMS = ["FOB", "CIF", "EXW", "DAP"];

export function ImporterCalculator() {
    const [mode, setMode] = useState<CalcMode>("basic");
    const { inputs, updateInput } = usePSEOCalculatorStore();
    const { calculate, isLoading } = useCalculateLandedCost();

    const handleCalculate = () => {
        // In basic mode, apply smart defaults for missing fields
        if (mode === "basic") {
            if (!inputs.freightCost || inputs.freightCost === 0) {
                updateInput("freightCost", 1500);
            }
            if (!inputs.insuranceCost || inputs.insuranceCost === 0) {
                updateInput("insuranceCost", 50);
            }
        }
        // Small delay to let store update, then calculate
        setTimeout(() => calculate(), 50);
    };

    return (
        <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl shadow-sm overflow-hidden mb-8">

            {/* Header with mode toggle */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-100 dark:border-neutral-800">
                <div className="flex items-center gap-2">
                    <Calculator className="h-4 w-4 text-neutral-500" />
                    <span className="font-semibold text-sm text-neutral-900 dark:text-neutral-100">Calculate Your Costs</span>
                </div>

                {/* Mode Toggle */}
                <div className="flex rounded-lg bg-neutral-100 dark:bg-neutral-800 p-0.5">
                    <button
                        onClick={() => setMode("basic")}
                        className={cn(
                            "px-3 py-1.5 text-xs font-medium rounded-md transition-all",
                            mode === "basic"
                                ? "bg-white dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100 shadow-sm"
                                : "text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300"
                        )}
                    >
                        Basic
                    </button>
                    <button
                        onClick={() => setMode("professional")}
                        className={cn(
                            "px-3 py-1.5 text-xs font-medium rounded-md transition-all",
                            mode === "professional"
                                ? "bg-white dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100 shadow-sm"
                                : "text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300"
                        )}
                    >
                        Professional
                    </button>
                </div>
            </div>

            {/* Form Body */}
            <div className="px-6 py-5">

                {mode === "basic" ? (
                    /* ─── BASIC MODE ─── */
                    <div className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {/* Product Value with inline currency */}
                            <div className="space-y-1.5">
                                <Label htmlFor="basic-value" className="text-xs text-neutral-500">Product Value</Label>
                                <div className="flex gap-2">
                                    <Input
                                        id="basic-value"
                                        type="number"
                                        placeholder="e.g. 10,000"
                                        value={inputs.invoiceValue || ""}
                                        onChange={(e) => updateInput("invoiceValue", parseFloat(e.target.value) || 0)}
                                        className="flex-1 placeholder:text-neutral-400"
                                    />
                                    <Select value={inputs.currency} onValueChange={(val) => updateInput("currency", val)}>
                                        <SelectTrigger className="w-20">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {CURRENCIES.map((c) => (
                                                <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            {/* Origin Country */}
                            <div className="space-y-1.5">
                                <Label htmlFor="basic-origin" className="text-xs text-neutral-500">Shipping From</Label>
                                <Select value={inputs.originCountry} onValueChange={(val) => updateInput("originCountry", val)}>
                                    <SelectTrigger id="basic-origin">
                                        <SelectValue placeholder="Select country" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {COUNTRIES.map((c) => (
                                            <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        {/* Importer Type Toggle */}
                        <div className="space-y-1.5">
                            <Label className="text-xs text-neutral-500">I am a...</Label>
                            <div className="grid grid-cols-2 gap-2">
                                <button
                                    onClick={() => updateInput("importerType", "VAT_REGISTERED")}
                                    className={cn(
                                        "py-2.5 px-3 text-sm rounded-lg border transition-all text-center",
                                        inputs.importerType === "VAT_REGISTERED"
                                            ? "border-neutral-900 dark:border-neutral-100 bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 font-medium"
                                            : "border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-400 hover:border-neutral-400"
                                    )}
                                >
                                    VAT-Registered Business
                                </button>
                                <button
                                    onClick={() => updateInput("importerType", "PRIVATE")}
                                    className={cn(
                                        "py-2.5 px-3 text-sm rounded-lg border transition-all text-center",
                                        inputs.importerType === "PRIVATE"
                                            ? "border-neutral-900 dark:border-neutral-100 bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 font-medium"
                                            : "border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-400 hover:border-neutral-400"
                                    )}
                                >
                                    Private / Individual
                                </button>
                            </div>
                        </div>

                        <p className="text-[11px] text-neutral-400">
                            HS code auto-detected from this page. Freight estimated at R1,500. Switch to Professional for full control.
                        </p>
                    </div>
                ) : (
                    /* ─── PROFESSIONAL MODE ─── */
                    <div className="space-y-5">
                        {/* Row 1: Value, Currency, Exchange Rate */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div className="space-y-1.5">
                                <Label htmlFor="pro-value" className="text-xs text-neutral-500">Invoice Value</Label>
                                <Input
                                    id="pro-value"
                                    type="number"
                                    placeholder="e.g. 5,000"
                                    value={inputs.invoiceValue || ""}
                                    onChange={(e) => updateInput("invoiceValue", parseFloat(e.target.value) || 0)}
                                    className="placeholder:text-neutral-400"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <Label htmlFor="pro-currency" className="text-xs text-neutral-500">Currency</Label>
                                <Select value={inputs.currency} onValueChange={(val) => updateInput("currency", val)}>
                                    <SelectTrigger id="pro-currency">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {CURRENCIES.map((c) => (
                                            <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-1.5">
                                <Label htmlFor="pro-rate" className="text-xs text-neutral-500">Exchange Rate (→ ZAR)</Label>
                                <Input
                                    id="pro-rate"
                                    type="number"
                                    step="0.01"
                                    placeholder="e.g. 18.50"
                                    value={inputs.exchangeRate}
                                    onChange={(e) => updateInput("exchangeRate", parseFloat(e.target.value) || 0)}
                                    className="placeholder:text-neutral-400"
                                />
                            </div>
                        </div>

                        {/* Row 2: Origin, Incoterm, Importer Type */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div className="space-y-1.5">
                                <Label htmlFor="pro-origin" className="text-xs text-neutral-500">Origin Country</Label>
                                <Select value={inputs.originCountry} onValueChange={(val) => updateInput("originCountry", val)}>
                                    <SelectTrigger id="pro-origin">
                                        <SelectValue placeholder="Select Country" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {COUNTRIES.map((c) => (
                                            <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-xs text-neutral-500">Incoterm</Label>
                                <div className="grid grid-cols-4 gap-1 rounded-lg bg-neutral-100 dark:bg-neutral-800 p-0.5">
                                    {INCOTERMS.map((term) => (
                                        <button
                                            key={term}
                                            onClick={() => updateInput("incoterm", term)}
                                            className={cn(
                                                "text-xs font-medium py-2 rounded-md transition-all",
                                                inputs.incoterm === term
                                                    ? "bg-white dark:bg-neutral-600 text-neutral-900 dark:text-neutral-50 shadow-sm"
                                                    : "text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-200"
                                            )}
                                        >
                                            {term}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div className="space-y-1.5">
                                <Label htmlFor="pro-importer" className="text-xs text-neutral-500">Importer Type</Label>
                                <Select value={inputs.importerType} onValueChange={(val: any) => updateInput("importerType", val)}>
                                    <SelectTrigger id="pro-importer">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="VAT_REGISTERED">VAT Vendor (Business)</SelectItem>
                                        <SelectItem value="PRIVATE">Private / Individual</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        {/* Row 3: HS Code (read-only, from page) */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div className="space-y-1.5">
                                <Label htmlFor="pro-hs" className="text-xs text-neutral-500">HS Code</Label>
                                <Input
                                    id="pro-hs"
                                    value={inputs.hsCode}
                                    onChange={(e) => updateInput("hsCode", e.target.value)}
                                    placeholder="e.g. 870323"
                                    className="font-mono placeholder:text-neutral-400"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <Label htmlFor="pro-freight" className="text-xs text-neutral-500">Freight Cost ({inputs.currency})</Label>
                                <Input
                                    id="pro-freight"
                                    type="number"
                                    placeholder="e.g. 1,500.00"
                                    value={inputs.freightCost || ""}
                                    onChange={(e) => updateInput("freightCost", parseFloat(e.target.value) || 0)}
                                    className="placeholder:text-neutral-400"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <Label htmlFor="pro-insurance" className="text-xs text-neutral-500">Insurance Cost ({inputs.currency})</Label>
                                <Input
                                    id="pro-insurance"
                                    type="number"
                                    placeholder="e.g. 50.00"
                                    value={inputs.insuranceCost || ""}
                                    onChange={(e) => updateInput("insuranceCost", parseFloat(e.target.value) || 0)}
                                    className="placeholder:text-neutral-400"
                                />
                            </div>
                        </div>

                        {/* Row 4: Quantity + Other */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div className="space-y-1.5">
                                <Label htmlFor="pro-qty" className="text-xs text-neutral-500">Quantity</Label>
                                <Input
                                    id="pro-qty"
                                    type="number"
                                    placeholder="e.g. 1"
                                    value={inputs.quantity}
                                    onChange={(e) => updateInput("quantity", parseFloat(e.target.value) || 1)}
                                    className="placeholder:text-neutral-400"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <Label htmlFor="pro-other" className="text-xs text-neutral-500">Other Charges ({inputs.currency})</Label>
                                <Input
                                    id="pro-other"
                                    type="number"
                                    placeholder="e.g. 0.00"
                                    value={inputs.otherCharges || ""}
                                    onChange={(e) => updateInput("otherCharges", parseFloat(e.target.value) || 0)}
                                    className="placeholder:text-neutral-400"
                                />
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Calculate CTA */}
            <div className="px-6 pb-5">
                <Button
                    size="lg"
                    className="w-full h-12 text-base font-semibold gap-2"
                    onClick={handleCalculate}
                    disabled={isLoading || !inputs.invoiceValue}
                >
                    {isLoading ? (
                        <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Calculating...
                        </>
                    ) : (
                        <>
                            Calculate Landed Cost
                            <ChevronRight className="h-4 w-4" />
                        </>
                    )}
                </Button>
            </div>
        </div>
    );
}
