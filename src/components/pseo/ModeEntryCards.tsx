"use client";

import { usePSEOCalculatorStore } from "@/store/usePSEOCalculatorStore";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PSEO_Mode } from "@/types/pseo";
import { cn } from "@/lib/utils";
import { Calculator, Sparkles } from "lucide-react";

export function ModeEntryCards() {
    const { mode, setMode } = usePSEOCalculatorStore();

    const handleModeSelect = (newMode: PSEO_Mode) => {
        setMode(newMode);
        // Persist to URL logic would happen here or in a useEffect in the page wrapper
    };

    return (
        <div className="grid gap-6 md:grid-cols-2 mb-10">
            <Card
                className={cn(
                    "cursor-pointer transition-all hover:border-neutral-400",
                    mode === 'professional' ? "border-neutral-900 ring-1 ring-neutral-900 dark:border-neutral-100 dark:ring-neutral-100" : ""
                )}
                onClick={() => handleModeSelect('professional')}
            >
                <CardHeader>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-neutral-100 rounded-md dark:bg-neutral-800">
                            <Calculator className="h-5 w-5" />
                        </div>
                        <CardTitle>I have shipment details</CardTitle>
                    </div>
                    <CardDescription>
                        Enter invoice value, FX rate, and freight costs to get a precise landed cost calculation.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Button
                        variant={mode === 'professional' ? 'default' : 'secondary'}
                        className="w-full"
                        onClick={(e) => {
                            e.stopPropagation();
                            handleModeSelect('professional');
                        }}
                    >
                        Open Quick-Fill Calculator
                    </Button>
                </CardContent>
            </Card>

            <Card
                className={cn(
                    "cursor-pointer transition-all hover:border-neutral-400",
                    mode === 'assisted' ? "border-neutral-900 ring-1 ring-neutral-900 dark:border-neutral-100 dark:ring-neutral-100" : ""
                )}
                onClick={() => handleModeSelect('assisted')}
            >
                <CardHeader>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-neutral-100 rounded-md dark:bg-neutral-800">
                            <Sparkles className="h-5 w-5" />
                        </div>
                        <CardTitle>Help me estimate costs</CardTitle>
                    </div>
                    <CardDescription>
                        Not sure about the details? We'll guide you through HS codes and estimate freight insurance.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Button
                        variant={mode === 'assisted' ? 'default' : 'secondary'}
                        className="w-full"
                        onClick={(e) => {
                            e.stopPropagation();
                            handleModeSelect('assisted');
                        }}
                    >
                        Start Guided Wizard
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}
