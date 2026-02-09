"use client";

import { usePSEOCalculatorStore } from "@/store/usePSEOCalculatorStore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeftRight, Plus, Lock } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export function OriginCompareWidget() {
    const { inputs, updateInput } = usePSEOCalculatorStore();

    // Mock compare options (excluding current origin)
    const allOrigins = [
        { iso: 'US', label: 'United States' },
        { iso: 'CN', label: 'China' },
        { iso: 'DE', label: 'Germany' },
        { iso: 'GB', label: 'United Kingdom' }
    ];

    const currentOrigin = allOrigins.find(o => o.iso === inputs.originCountry);
    const compareOptions = allOrigins.filter(o => o.iso !== inputs.originCountry);

    return (
        <Card className="mb-6 border-dashed border-2 bg-neutral-50/50 dark:bg-neutral-900/50">
            <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold flex items-center gap-2 text-neutral-600 dark:text-neutral-400">
                    <ArrowLeftRight className="h-4 w-4" />
                    Compare Origins
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="flex items-center gap-4">
                    {/* Current Origin Card */}
                    <div className="flex-1 p-3 bg-white dark:bg-neutral-900 rounded border border-neutral-200 dark:border-neutral-800 shadow-sm">
                        <div className="text-xs text-neutral-500 mb-1">Current Origin</div>
                        <div className="font-semibold text-lg">{currentOrigin?.label || inputs.originCountry}</div>
                        {/* Placeholder for results */}
                        <div className="mt-2 h-2 w-16 bg-neutral-100 dark:bg-neutral-800 rounded"></div>
                    </div>

                    <div className="text-neutral-400 font-bold">VS</div>

                    {/* Compare Selector */}
                    <div className="flex-1">
                        <Select onValueChange={(val) => {
                            // Logic to trigger comparison mode would go here
                            console.log("Compare with", val);
                        }}>
                            <SelectTrigger className="w-full bg-white dark:bg-neutral-900">
                                <SelectValue placeholder="Add Origin..." />
                            </SelectTrigger>
                            <SelectContent>
                                {compareOptions.map((opt) => (
                                    <SelectItem key={opt.iso} value={opt.iso}>{opt.label}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Pro Upsell for Multi-Compare */}
                    <Button variant="ghost" size="icon" className="shrink-0 text-neutral-400 hover:text-indigo-500">
                        <Lock className="h-4 w-4" />
                    </Button>
                </div>
                <p className="text-xs text-neutral-400 mt-2 text-center">
                    See which route offers better duty rates or preferential agreements.
                </p>
            </CardContent>
        </Card>
    );
}
