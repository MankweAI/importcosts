"use client";

import { useState } from "react";
import { usePSEOCalculatorStore } from "@/store/usePSEOCalculatorStore";
import { useCalculateLandedCost } from "@/hooks/useCalculateLandedCost";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { Zap, ChevronRight, Loader2, Target, TrendingUp } from "lucide-react";

type CalcMode = "basic" | "professional";

const CURRENCIES = [
    { value: "USD", label: "USD ($)" },
    { value: "EUR", label: "EUR (€)" },
    { value: "GBP", label: "GBP (£)" },
    { value: "CNY", label: "CNY (¥)" },
    { value: "ZAR", label: "ZAR (R)" },
];

const COUNTRIES = [
    { value: "CN", label: "China" },
    { value: "US", label: "United States" },
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
        if (mode === "basic") {
            if (!inputs.freightCost || inputs.freightCost === 0) {
                updateInput("freightCost", 1500);
            }
            if (!inputs.insuranceCost || inputs.insuranceCost === 0) {
                updateInput("insuranceCost", 50);
            }
        }
        setTimeout(() => calculate(), 50);
    };

    return (
        <div className="bg-white rounded-2xl border border-neutral-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.04)] overflow-hidden">

            {/* ─── Header ─── */}
            <div className="px-6 py-5 border-b border-neutral-100">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-br from-neutral-900 to-neutral-700 shadow-sm">
                            <Zap className="h-4 w-4 text-white" />
                        </div>
                        <div>
                            <h3 className="text-[15px] font-semibold text-neutral-900 leading-tight">Deal Viability Scanner</h3>
                            <p className="text-xs text-neutral-400 mt-0.5">Know your margin before you commit</p>
                        </div>
                    </div>

                    {/* Mode Toggle */}
                    <div className="flex rounded-lg bg-neutral-100 p-0.5">
                        <button
                            onClick={() => setMode("basic")}
                            className={cn(
                                "px-3 py-1.5 text-xs font-medium rounded-md transition-all",
                                mode === "basic"
                                    ? "bg-white text-neutral-900 shadow-sm"
                                    : "text-neutral-500 hover:text-neutral-700"
                            )}
                        >
                            Quick Scan
                        </button>
                        <button
                            onClick={() => setMode("professional")}
                            className={cn(
                                "px-3 py-1.5 text-xs font-medium rounded-md transition-all",
                                mode === "professional"
                                    ? "bg-white text-neutral-900 shadow-sm"
                                    : "text-neutral-500 hover:text-neutral-700"
                            )}
                        >
                            Full Control
                        </button>
                    </div>
                </div>
            </div>

            {/* ─── Form Body ─── */}
            <div className="px-6 py-5">

                {mode === "basic" ? (
                    /* ─── BASIC MODE ─── */
                    <div className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {/* Product Value with inline currency */}
                            <div className="space-y-1.5">
                                <Label htmlFor="basic-value" className="text-xs text-neutral-500 font-medium">Supplier Price</Label>
                                <div className="flex gap-2">
                                    <Input
                                        id="basic-value"
                                        type="number"
                                        placeholder="e.g. 10,000"
                                        value={inputs.invoiceValue || ""}
                                        onChange={(e) => updateInput("invoiceValue", parseFloat(e.target.value) || 0)}
                                        className="flex-1 placeholder:text-neutral-300 h-11"
                                    />
                                    <Select value={inputs.currency} onValueChange={(val) => updateInput("currency", val)}>
                                        <SelectTrigger className="w-24 h-11">
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
                                <Label htmlFor="basic-origin" className="text-xs text-neutral-500 font-medium">Shipping From</Label>
                                <Select value={inputs.originCountry} onValueChange={(val) => updateInput("originCountry", val)}>
                                    <SelectTrigger id="basic-origin" className="h-11">
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

                        {/* Target Selling Price — The Blueprint-Critical Field */}
                        <div className="space-y-1.5">
                            <Label htmlFor="basic-selling" className="text-xs text-neutral-500 font-medium flex items-center gap-1.5">
                                <Target className="h-3 w-3" />
                                My Selling Price (ZAR per unit)
                            </Label>
                            <Input
                                id="basic-selling"
                                type="number"
                                placeholder="What will you sell each unit for?"
                                value={inputs.targetSellingPrice || ""}
                                onChange={(e) => updateInput("targetSellingPrice", parseFloat(e.target.value) || 0)}
                                className="placeholder:text-neutral-300 h-11"
                            />
                            <p className="text-[10px] text-neutral-400">Enter your planned retail/wholesale ZAR price per unit to get a margin verdict.</p>
                        </div>

                        {/* Importer Type Toggle */}
                        <div className="space-y-1.5">
                            <Label className="text-xs text-neutral-500 font-medium">I am a...</Label>
                            <div className="grid grid-cols-2 gap-2">
                                <button
                                    onClick={() => updateInput("importerType", "VAT_REGISTERED")}
                                    className={cn(
                                        "py-2.5 px-3 text-sm rounded-lg border transition-all text-center",
                                        inputs.importerType === "VAT_REGISTERED"
                                            ? "border-neutral-900 bg-neutral-900 text-white font-medium"
                                            : "border-neutral-200 text-neutral-600 hover:border-neutral-400"
                                    )}
                                >
                                    VAT-Registered Business
                                </button>
                                <button
                                    onClick={() => updateInput("importerType", "PRIVATE")}
                                    className={cn(
                                        "py-2.5 px-3 text-sm rounded-lg border transition-all text-center",
                                        inputs.importerType === "PRIVATE"
                                            ? "border-neutral-900 bg-neutral-900 text-white font-medium"
                                            : "border-neutral-200 text-neutral-600 hover:border-neutral-400"
                                    )}
                                >
                                    Private / Individual
                                </button>
                            </div>
                        </div>

                        <p className="text-[11px] text-neutral-400">
                            HS code auto-detected from page. Freight est. R1,500. Switch to Full Control for overrides.
                        </p>
                    </div>
                ) : (
                    /* ─── PROFESSIONAL MODE ─── */
                    <div className="space-y-5">
                        {/* Row 1: Value, Currency, Exchange Rate */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div className="space-y-1.5">
                                <Label htmlFor="pro-value" className="text-xs text-neutral-500 font-medium">Invoice Value</Label>
                                <Input
                                    id="pro-value"
                                    type="number"
                                    placeholder="e.g. 5,000"
                                    value={inputs.invoiceValue || ""}
                                    onChange={(e) => updateInput("invoiceValue", parseFloat(e.target.value) || 0)}
                                    className="placeholder:text-neutral-300 h-11"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <Label htmlFor="pro-currency" className="text-xs text-neutral-500 font-medium">Currency</Label>
                                <Select value={inputs.currency} onValueChange={(val) => updateInput("currency", val)}>
                                    <SelectTrigger id="pro-currency" className="h-11">
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
                                <Label htmlFor="pro-rate" className="text-xs text-neutral-500 font-medium">Exchange Rate (→ ZAR)</Label>
                                <Input
                                    id="pro-rate"
                                    type="number"
                                    step="0.01"
                                    placeholder="e.g. 18.50"
                                    value={inputs.exchangeRate}
                                    onChange={(e) => updateInput("exchangeRate", parseFloat(e.target.value) || 0)}
                                    className="placeholder:text-neutral-300 h-11"
                                />
                            </div>
                        </div>

                        {/* Row 2: Origin, Incoterm, Importer Type */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div className="space-y-1.5">
                                <Label htmlFor="pro-origin" className="text-xs text-neutral-500 font-medium">Origin Country</Label>
                                <Select value={inputs.originCountry} onValueChange={(val) => updateInput("originCountry", val)}>
                                    <SelectTrigger id="pro-origin" className="h-11">
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
                                <Label className="text-xs text-neutral-500 font-medium">Incoterm</Label>
                                <div className="grid grid-cols-4 gap-1 rounded-lg bg-neutral-100 p-0.5">
                                    {INCOTERMS.map((term) => (
                                        <button
                                            key={term}
                                            onClick={() => updateInput("incoterm", term)}
                                            className={cn(
                                                "text-xs font-medium py-2 rounded-md transition-all",
                                                inputs.incoterm === term
                                                    ? "bg-white text-neutral-900 shadow-sm"
                                                    : "text-neutral-500 hover:text-neutral-900"
                                            )}
                                        >
                                            {term}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div className="space-y-1.5">
                                <Label htmlFor="pro-importer" className="text-xs text-neutral-500 font-medium">Importer Type</Label>
                                <Select value={inputs.importerType} onValueChange={(val: any) => updateInput("importerType", val)}>
                                    <SelectTrigger id="pro-importer" className="h-11">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="VAT_REGISTERED">VAT Vendor (Business)</SelectItem>
                                        <SelectItem value="PRIVATE">Private / Individual</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        {/* Row 3: HS Code, Freight, Insurance */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div className="space-y-1.5">
                                <Label htmlFor="pro-hs" className="text-xs text-neutral-500 font-medium">HS Code</Label>
                                <Input
                                    id="pro-hs"
                                    value={inputs.hsCode}
                                    onChange={(e) => updateInput("hsCode", e.target.value)}
                                    placeholder="e.g. 870323"
                                    className="font-mono placeholder:text-neutral-300 h-11"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <Label htmlFor="pro-freight" className="text-xs text-neutral-500 font-medium">Freight Cost ({inputs.currency})</Label>
                                <Input
                                    id="pro-freight"
                                    type="number"
                                    placeholder="e.g. 1,500"
                                    value={inputs.freightCost || ""}
                                    onChange={(e) => updateInput("freightCost", parseFloat(e.target.value) || 0)}
                                    className="placeholder:text-neutral-300 h-11"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <Label htmlFor="pro-insurance" className="text-xs text-neutral-500 font-medium">Insurance Cost ({inputs.currency})</Label>
                                <Input
                                    id="pro-insurance"
                                    type="number"
                                    placeholder="e.g. 50"
                                    value={inputs.insuranceCost || ""}
                                    onChange={(e) => updateInput("insuranceCost", parseFloat(e.target.value) || 0)}
                                    className="placeholder:text-neutral-300 h-11"
                                />
                            </div>
                        </div>

                        {/* Row 4: Quantity, Other Charges, Selling Price */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div className="space-y-1.5">
                                <Label htmlFor="pro-qty" className="text-xs text-neutral-500 font-medium">Quantity</Label>
                                <Input
                                    id="pro-qty"
                                    type="number"
                                    placeholder="e.g. 100"
                                    value={inputs.quantity}
                                    onChange={(e) => updateInput("quantity", parseFloat(e.target.value) || 1)}
                                    className="placeholder:text-neutral-300 h-11"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <Label htmlFor="pro-other" className="text-xs text-neutral-500 font-medium">Other Charges ({inputs.currency})</Label>
                                <Input
                                    id="pro-other"
                                    type="number"
                                    placeholder="e.g. 0"
                                    value={inputs.otherCharges || ""}
                                    onChange={(e) => updateInput("otherCharges", parseFloat(e.target.value) || 0)}
                                    className="placeholder:text-neutral-300 h-11"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <Label htmlFor="pro-selling" className="text-xs text-neutral-500 font-medium flex items-center gap-1.5">
                                    <Target className="h-3 w-3" />
                                    Target Selling Price (ZAR/unit)
                                </Label>
                                <Input
                                    id="pro-selling"
                                    type="number"
                                    placeholder="Your planned ZAR price per unit"
                                    value={inputs.targetSellingPrice || ""}
                                    onChange={(e) => updateInput("targetSellingPrice", parseFloat(e.target.value) || 0)}
                                    className="placeholder:text-neutral-300 h-11"
                                />
                            </div>
                        </div>

                        {/* Row 5: Target Margin (optional alternative) */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div className="space-y-1.5">
                                <Label htmlFor="pro-margin" className="text-xs text-neutral-500 font-medium flex items-center gap-1.5">
                                    <TrendingUp className="h-3 w-3" />
                                    OR Target Margin %
                                </Label>
                                <Input
                                    id="pro-margin"
                                    type="number"
                                    placeholder="e.g. 30"
                                    value={inputs.targetMarginPercent || ""}
                                    onChange={(e) => updateInput("targetMarginPercent", parseFloat(e.target.value) || 0)}
                                    className="placeholder:text-neutral-300 h-11"
                                    disabled={!!inputs.targetSellingPrice && inputs.targetSellingPrice > 0}
                                />
                                <p className="text-[10px] text-neutral-400">Disabled if selling price is set. Used to derive break-even.</p>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* ─── CTA ─── */}
            <div className="px-6 pb-5">
                <Button
                    size="lg"
                    className="w-full h-12 text-base font-semibold gap-2 bg-neutral-900 hover:bg-neutral-800 text-white rounded-xl transition-all"
                    onClick={handleCalculate}
                    disabled={isLoading || !inputs.invoiceValue}
                >
                    {isLoading ? (
                        <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Scanning...
                        </>
                    ) : (
                        <>
                            <Zap className="h-4 w-4" />
                            Scan Deal Viability
                            <ChevronRight className="h-4 w-4" />
                        </>
                    )}
                </Button>
            </div>
        </div>
    );
}
