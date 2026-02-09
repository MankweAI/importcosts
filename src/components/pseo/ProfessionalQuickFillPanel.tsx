"use client";

import { usePSEOCalculatorStore } from "@/store/usePSEOCalculatorStore";
import { useCalculateLandedCost } from "@/hooks/useCalculateLandedCost";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { HSSelector } from "./HSSelector"; // Assuming HSSelector is built
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";

export function ProfessionalQuickFillPanel() {
    const { inputs, updateInput } = usePSEOCalculatorStore();
    const { calculate, isLoading } = useCalculateLandedCost();

    const handleCalculate = () => {
        calculate();
    };

    return (
        <Card className="border-t-4 border-t-neutral-900 shadow-lg mb-8 dark:border-t-neutral-100">
            <CardHeader>
                <CardTitle>Quick-Fill Calculator</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                {/* Row 1: Invoice & Currency */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="invoice-value">Invoice Value</Label>
                        <Input
                            id="invoice-value"
                            type="number"
                            placeholder="0.00"
                            value={inputs.invoiceValue || ''}
                            onChange={(e) => updateInput('invoiceValue', parseFloat(e.target.value))}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="currency">Currency</Label>
                        <Select value={inputs.currency} onValueChange={(val) => updateInput('currency', val)}>
                            <SelectTrigger id="currency">
                                <SelectValue placeholder="Select" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="USD">USD - US Dollar</SelectItem>
                                <SelectItem value="EUR">EUR - Euro</SelectItem>
                                <SelectItem value="GBP">GBP - British Pound</SelectItem>
                                <SelectItem value="CNY">CNY - Chinese Yuan</SelectItem>
                                <SelectItem value="ZAR">ZAR - SA Rand</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="exchange-rate">Exchange Rate (ZAR)</Label>
                        <Input
                            id="exchange-rate"
                            type="number"
                            value={inputs.exchangeRate}
                            onChange={(e) => updateInput('exchangeRate', parseFloat(e.target.value))}
                        />
                    </div>
                </div>

                {/* Row 2: Origin & Destination (Fixed) & Terms */}


                {/* Scenario Presets - Chips */}
                <div className="flex gap-2 flex-wrap items-center">
                    <span className="text-xs text-neutral-500 mr-2">Quick Presets:</span>
                    {[10000, 50000, 250000].map((val) => (
                        <Button
                            key={val}
                            variant="outline"
                            size="sm"
                            onClick={() => updateInput('invoiceValue', val)}
                            className="h-7 text-xs"
                        >
                            R {val.toLocaleString('en-ZA')}
                        </Button>
                    ))}
                </div>

                {/* Row 2: Origin & Destination (Fixed) & Terms & Importer Type */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="origin-country">Origin</Label>
                        <Select value={inputs.originCountry} onValueChange={(val) => updateInput('originCountry', val)}>
                            <SelectTrigger id="origin-country">
                                <SelectValue placeholder="Select Origin" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="US">United States</SelectItem>
                                <SelectItem value="CN">China</SelectItem>
                                <SelectItem value="DE">Germany</SelectItem>
                                <SelectItem value="GB">United Kingdom</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label>Incoterm</Label>
                        <div className="grid grid-cols-2 gap-1 rounded-md bg-neutral-100 p-1 dark:bg-neutral-800">
                            {['FOB', 'CIF', 'EXW', 'DAP'].map(term => (
                                <button
                                    key={term}
                                    onClick={() => { updateInput('incoterm', term); setTimeout(calculate, 0); }}
                                    className={cn(
                                        "text-xs font-medium py-1.5 rounded-sm transition-all",
                                        inputs.incoterm === term
                                            ? "bg-white text-neutral-900 shadow-sm dark:bg-neutral-600 dark:text-neutral-50"
                                            : "text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-200"
                                    )}
                                >
                                    {term}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="importer-type">Importer Type</Label>
                        <Select value={inputs.importerType} onValueChange={(val: any) => updateInput('importerType', val)}>
                            <SelectTrigger id="importer-type">
                                <SelectValue placeholder="Select Type" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="VAT_REGISTERED">VAT Vendor (Business)</SelectItem>
                                <SelectItem value="PRIVATE">Private / Individual</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <Separator />

                {/* Row 3: HS Code using specialized component */}
                <HSSelector />

                <Separator />

                {/* Row 4: Freight & Insurance */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="freight-cost">Freight Cost (in Currency)</Label>
                        <Input
                            id="freight-cost"
                            type="number"
                            placeholder="0.00"
                            value={inputs.freightCost || ''}
                            onChange={(e) => updateInput('freightCost', parseFloat(e.target.value))}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="insurance-cost">Insurance Cost (in Currency)</Label>
                        <Input
                            id="insurance-cost"
                            type="number"
                            placeholder="0.00"
                            value={inputs.insuranceCost || ''}
                            onChange={(e) => updateInput('insuranceCost', parseFloat(e.target.value))}
                        />
                    </div>
                </div>

                {/* Advanced Toggle */}
                <Accordion type="single" collapsible>
                    <AccordionItem value="advanced" className="border-none">
                        <AccordionTrigger className="text-sm text-neutral-500 py-2">Add volume / quantity info (optional)</AccordionTrigger>
                        <AccordionContent>
                            <div className="pt-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="quantity">Quantity</Label>
                                    <Input
                                        id="quantity"
                                        type="number"
                                        value={inputs.quantity}
                                        onChange={(e) => updateInput('quantity', parseFloat(e.target.value))}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="other-charges">Other Charges</Label>
                                    <Input
                                        id="other-charges"
                                        type="number"
                                        value={inputs.otherCharges}
                                        onChange={(e) => updateInput('otherCharges', parseFloat(e.target.value))}
                                    />
                                </div>
                            </div>
                        </AccordionContent>
                    </AccordionItem>
                </Accordion>

                <Button size="lg" className="w-full" onClick={handleCalculate}>Calculate Landed Cost</Button>
                <p className="text-xs text-center text-neutral-500">
                    Results are free. Save/export/compare requires an account.
                </p>
            </CardContent>
        </Card>
    );
}

