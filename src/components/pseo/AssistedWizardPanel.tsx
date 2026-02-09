"use client";

import { usePSEOCalculatorStore } from "@/store/usePSEOCalculatorStore";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { HSSelector } from "./HSSelector";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function AssistedWizardPanel() {
    const [step, setStep] = useState(1);
    const { setResult } = usePSEOCalculatorStore();

    const handleCalculate = async () => {
        // Mock result for wizard
        setResult({
            summary: {
                total_taxes_zar: 2500,
                total_landed_cost_zar: 15000,
                landed_cost_per_unit_zar: 15000
            },
            hs: {
                confidence_score: 0.7,
                confidence_bucket: 'medium',
                alternatives: []
            },
            tariff: {
                version: "2024.1",
                effective_date: "2024-01-01",
                last_updated: "2024-02-01"
            },
            line_items: [
                { key: 'duty', label: 'Import Duty', amount_zar: 1000, audit: { formula: '10%', inputs_used: {}, rates: {} } },
                { key: 'vat', label: 'VAT', amount_zar: 1500, audit: { formula: '15%', inputs_used: {}, rates: {} } }
            ],
            doc_checklist: { always: ["Invoice"], common: [], conditional: [] },
            risk_flags: []
        });
    };

    const nextStep = () => setStep(s => Math.min(s + 1, 3));
    const prevStep = () => setStep(s => Math.max(s - 1, 1));

    return (
        <Card className="mb-8 border-t-4 border-t-blue-600 dark:border-t-blue-400">
            <CardHeader>
                <div className="flex justify-between items-center mb-2">
                    <CardTitle>Assisted Calculation Wizard</CardTitle>
                    <span className="text-sm text-neutral-500 font-mono">Step {step} of 3</span>
                </div>
                <div className="h-2 w-full bg-neutral-100 rounded-full overflow-hidden dark:bg-neutral-800">
                    <div
                        className="h-full bg-blue-600 transition-all duration-300"
                        style={{ width: `${(step / 3) * 100}%` }}
                    />
                </div>
            </CardHeader>
            <CardContent className="py-6 min-h-[300px]">
                {step === 1 && (
                    <div className="space-y-4 animate-in fade-in slide-in-from-right-4">
                        <h3 className="text-lg font-medium">What are you importing?</h3>
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label>Product Description</Label>
                                <Input placeholder="e.g. Leather handbags" />
                            </div>
                            <div className="p-4 bg-neutral-50 border border-neutral-100 rounded-md dark:bg-neutral-900 dark:border-neutral-800">
                                <p className="text-sm font-medium mb-2">We'll use this HS code:</p>
                                <HSSelector />
                            </div>
                        </div>
                    </div>
                )}

                {step === 2 && (
                    <div className="space-y-4 animate-in fade-in slide-in-from-right-4">
                        <h3 className="text-lg font-medium">Where is it coming from?</h3>
                        <div className="grid gap-4">
                            <div className="space-y-2">
                                <Label>Origin Country</Label>
                                <Input placeholder="Search country..." />
                            </div>
                            <div className="space-y-2">
                                <Label>Estimated Value (ZAR estimate)</Label>
                                <Input type="number" placeholder="R 10000" />
                            </div>
                        </div>
                    </div>
                )}

                {step === 3 && (
                    <div className="space-y-4 animate-in fade-in slide-in-from-right-4">
                        <h3 className="text-lg font-medium">Review & Calculate</h3>
                        <div className="bg-neutral-50 p-4 rounded text-sm space-y-2 dark:bg-neutral-900">
                            <p><strong>Product:</strong> Leather Handbags (4202.21)</p>
                            <p><strong>Origin:</strong> China</p>
                            <p><strong>Value:</strong> R 10,000</p>
                        </div>
                    </div>
                )}
            </CardContent>
            <CardFooter className="flex justify-between">
                <Button variant="outline" onClick={prevStep} disabled={step === 1}>Back</Button>
                {step < 3 ? (
                    <Button onClick={nextStep}>Next Step</Button>
                ) : (
                    <Button onClick={handleCalculate} className="bg-blue-600 hover:bg-blue-700 text-white dark:bg-blue-600 dark:text-neutral-50">View Results</Button>
                )}
            </CardFooter>
        </Card>
    );
}
