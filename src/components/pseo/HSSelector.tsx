"use client";

import { usePSEOCalculatorStore } from "@/store/usePSEOCalculatorStore";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertCircle, CheckCircle2 } from "lucide-react";

export function HSSelector() {
    const { inputs, updateInput } = usePSEOCalculatorStore();

    // Mock confidence logic for now (real app would fetch this)
    const confidence = inputs.hsCode.length === 6 ? 'high' : 'unknown';
    const confidenceScore = 0.85;

    return (
        <div className="space-y-2">
            <Label htmlFor="hs-code">HS Code (Harmonized System)</Label>
            <div className="relative">
                <Input
                    id="hs-code"
                    placeholder="e.g. 8504.40"
                    value={inputs.hsCode}
                    onChange={(e) => updateInput('hsCode', e.target.value)}
                    className="pr-20 font-mono"
                />
                <div className="absolute right-2 top-2">
                    {confidence === 'high' && (
                        <Badge variant="outline" className="text-green-600 border-green-200 bg-green-50">
                            <CheckCircle2 className="h-3 w-3 mr-1" />
                            {Math.round(confidenceScore * 100)}%
                        </Badge>
                    )}
                </div>
            </div>
            {confidence === 'unknown' && inputs.hsCode.length > 0 && (
                <div className="flex items-center gap-2 text-xs text-amber-600 bg-amber-50 p-2 rounded-md border border-amber-100">
                    <AlertCircle className="h-4 w-4" />
                    <span>Confidence low. Verify this code to ensure accuracy.</span>
                    <Button variant="link" size="sm" className="h-auto p-0 text-amber-700 font-semibold">
                        Verify HS Logic
                    </Button>
                </div>
            )}
        </div>
    );
}
