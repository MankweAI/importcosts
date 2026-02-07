"use client";

import React, { useState } from "react";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { ResultBreakdown } from "./ResultBreakdown";
import { HsHelper } from "@/components/hs/HsHelper";
import { CalcInputSchema } from "@/lib/calc/schemas"; // Validated types
import { CalcOutput } from "@/lib/calc/types";
import { Loader2 } from "lucide-react";

interface CalcCardProps {
    defaultHsCode?: string;
    className?: string;
}

export function CalcCard({ defaultHsCode = "854143", className }: CalcCardProps) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [result, setResult] = useState<CalcOutput | null>(null);
    const [referenceResult, setReferenceResult] = useState<CalcOutput | null>(null);

    // Form State
    const [form, setForm] = useState({
        hsCode: defaultHsCode,
        customsValue: "",
        originCountry: "",
        importerType: "VAT_REGISTERED" as const,
        freightInsuranceCost: "",
        quantity: "1",
        weightKg: "",
        volumeLitres: "",
        incoterm: "CIF" as const
    });

    // Reset when prop changes
    React.useEffect(() => {
        setForm(prev => ({ ...prev, hsCode: defaultHsCode }));
    }, [defaultHsCode]);

    React.useEffect(() => {
        if (!result) return;
        const timer = setTimeout(() => {
            const summary = document.getElementById("result-summary");
            summary?.scrollIntoView({ behavior: "smooth", block: "start" });
        }, 100);
        return () => clearTimeout(timer);
    }, [result]);

    const handleCalculate = async () => {
        setLoading(true);
        setError(null);
        setResult(null);

        try {
            const val = parseFloat(form.customsValue);
            const qty = parseInt(form.quantity);
            const freightVal = parseFloat(form.freightInsuranceCost);
            const weightVal = parseFloat(form.weightKg);
            const volumeVal = parseFloat(form.volumeLitres);
            if (isNaN(val)) throw new Error("Please enter a valid customs value");
            if (form.incoterm !== "CIF" && form.freightInsuranceCost && isNaN(freightVal)) {
                throw new Error("Please enter a valid freight/insurance value");
            }

            const payload = {
                hsCode: form.hsCode,
                customsValue: val,
                originCountry: form.originCountry?.trim() || undefined,
                importerType: form.importerType,
                quantity: isNaN(qty) ? 1 : qty,
                weightKg: !isNaN(weightVal) ? weightVal : undefined,
                volumeLitres: !isNaN(volumeVal) ? volumeVal : undefined,
                incoterm: form.incoterm,
                freightInsuranceCost: form.incoterm !== "CIF" && !isNaN(freightVal) ? freightVal : undefined
            };

            // Validate locally first? Or just send.

            const res = await fetch("/api/calculate", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });

            if (!res.ok) {
                const errData = await res.json();
                throw new Error(errData.error || "Calculation failed");
            }

            const data = await res.json();

            // Auto-Comparison Logic: 
            // If we already have a result, set it as reference for the new one.
            if (result) {
                setReferenceResult(result);
            }

            setResult(data);

        } catch (e: any) {
            setError(e.message);
        } finally {
            setLoading(false);
        }
    };

    const applyPreset = (val: number) => {
        setForm(prev => ({ ...prev, customsValue: val.toString() }));
    };

    return (
        <div className={`space-y-6 max-w-4xl mx-auto ${className}`}>
            <Card className="w-full shadow-lg border-muted/40">
                <CardHeader>
                    <CardTitle>Import Cost Calculator</CardTitle>
                    <CardDescription>Estimate landed cost for verified HS Codes.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="hsCode">HS Code</Label>
                        <HsHelper
                            value={form.hsCode}
                            onSelect={(code) => setForm(prev => ({ ...prev, hsCode: code }))}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="originCountry">Origin Country</Label>
                        <Input
                            id="originCountry"
                            value={form.originCountry}
                            onChange={e => setForm({ ...form, originCountry: e.target.value })}
                            placeholder="e.g. China"
                        />
                        <p className="text-xs text-muted-foreground">
                            Destination assumed South Africa. Origin affects duty preferences and compliance.
                        </p>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="value">Customs Value (ZAR)</Label>
                        <Input
                            id="value"
                            type="number"
                            value={form.customsValue}
                            onChange={e => setForm({ ...form, customsValue: e.target.value })}
                            placeholder="e.g. 10000"
                        />
                        <p className="text-xs text-muted-foreground">
                            If incoterm is CIF, include freight/insurance in this value. Otherwise enter invoice value and add freight below.
                        </p>
                        <div className="flex gap-2 mt-1">
                            {[10000, 50000, 250000].map(val => (
                                <Button
                                    key={val}
                                    variant="outline"
                                    size="sm"
                                    className="h-7 text-xs"
                                    onClick={() => applyPreset(val)}
                                >
                                    R{val / 1000}k
                                </Button>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label>Importer Type</Label>
                        <div className="grid grid-cols-2 gap-2">
                            <Button
                                type="button"
                                variant={form.importerType === "VAT_REGISTERED" ? "default" : "outline"}
                                onClick={() => setForm({ ...form, importerType: "VAT_REGISTERED" })}
                            >
                                VAT-Registered
                            </Button>
                            <Button
                                type="button"
                                variant={form.importerType === "NON_VENDOR" ? "default" : "outline"}
                                onClick={() => setForm({ ...form, importerType: "NON_VENDOR" })}
                            >
                                Non-Vendor
                            </Button>
                        </div>
                        <p className="text-xs text-muted-foreground">
                            VAT-registered importers may recover VAT; we show both totals after calculation.
                        </p>
                    </div>

                    <div className="space-y-2">
                        <Label>Incoterm</Label>
                        <div className="grid grid-cols-3 gap-2">
                            {(["CIF", "FOB", "EXW"] as const).map(term => (
                                <Button
                                    key={term}
                                    type="button"
                                    variant={form.incoterm === term ? "default" : "outline"}
                                    onClick={() => setForm({ ...form, incoterm: term })}
                                >
                                    {term}
                                </Button>
                            ))}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Incoterm determines whether freight/insurance is included in customs value.
                        </p>
                    </div>

                    {form.incoterm !== "CIF" && (
                        <div className="space-y-2">
                            <Label htmlFor="freightInsurance">Freight & Insurance (ZAR)</Label>
                            <Input
                                id="freightInsurance"
                                type="number"
                                value={form.freightInsuranceCost}
                                onChange={e => setForm({ ...form, freightInsuranceCost: e.target.value })}
                                placeholder="e.g. 2500"
                            />
                        </div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="qty">Quantity</Label>
                            <Input
                                id="qty"
                                type="number"
                                value={form.quantity}
                                onChange={e => setForm({ ...form, quantity: e.target.value })}
                                placeholder="1"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="weight">Weight (kg)</Label>
                            <Input
                                id="weight"
                                type="number"
                                value={form.weightKg}
                                onChange={e => setForm({ ...form, weightKg: e.target.value })}
                                placeholder="Optional"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="volume">Volume (litres)</Label>
                            <Input
                                id="volume"
                                type="number"
                                value={form.volumeLitres}
                                onChange={e => setForm({ ...form, volumeLitres: e.target.value })}
                                placeholder="Optional"
                            />
                        </div>
                    </div>

                    {error && (
                        <div className="p-3 text-sm text-red-500 bg-red-50 dark:bg-red-900/10 rounded-md">
                            {error}
                        </div>
                    )}
                </CardContent>
                <CardFooter>
                    <Button className="w-full" onClick={handleCalculate} disabled={loading}>
                        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Calculate Landed Cost
                    </Button>
                </CardFooter>
            </Card>

            {result && (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <ResultBreakdown
                        result={result}
                        referenceResult={referenceResult}
                        onCompare={() => setReferenceResult(result)}
                        onClearCompare={() => setReferenceResult(null)}
                    />
                </div>
            )}
        </div>
    );
}
