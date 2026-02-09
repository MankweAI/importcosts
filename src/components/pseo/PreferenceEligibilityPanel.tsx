"use client";

import { usePSEOCalculatorStore } from "@/store/usePSEOCalculatorStore";
import { Card, CardContent } from "@/components/ui/card";
import { Gem, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";

export function PreferenceEligibilityPanel() {
    const { result, status } = usePSEOCalculatorStore();

    if (status !== 'success' || !result || !result.preference_summary) return null;

    const { eligible, agreement_name, savings_estimate } = result.preference_summary;

    if (!eligible) {
        return (
            <Card className="mb-6 bg-neutral-100 dark:bg-neutral-900 border-none shadow-none">
                <CardContent className="py-4 px-4 flex items-center justify-between opacity-60 grayscale hover:grayscale-0 transition-all">
                    <div className="flex items-center gap-3">
                        <Lock className="h-5 w-5 text-neutral-400" />
                        <div>
                            <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100">Trade Preference Unavailable</p>
                            <p className="text-xs text-neutral-500">Standard MFN duties apply.</p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="mb-6 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-950/30 dark:to-purple-950/30 border-indigo-200 dark:border-indigo-800">
            <CardContent className="py-4 px-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="bg-white dark:bg-black/20 p-2 rounded-full shadow-sm">
                        <Gem className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <div>
                        <p className="text-sm font-bold text-indigo-900 dark:text-indigo-100">
                            Potential Savings Available
                        </p>
                        <p className="text-xs text-indigo-700 dark:text-indigo-300">
                            Eligible for {agreement_name} preference.
                        </p>
                    </div>
                </div>
                {savings_estimate && (
                    <div className="text-right">
                        <div className="text-sm font-bold text-indigo-600 dark:text-indigo-400">
                            Save R {savings_estimate.toLocaleString('en-ZA')}
                        </div>
                        <Button variant="link" size="sm" className="h-auto p-0 text-xs text-indigo-500">
                            See Requirements
                        </Button>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
