"use client";

import { Button } from "@/components/ui/button";
import { Download, Save, Check, RefreshCw } from "lucide-react";
import { useState } from "react";
import { usePSEOCalculatorStore } from "@/store/usePSEOCalculatorStore";
import { calculateAction } from "@/app/actions";

interface SavedDeal {
    id: string;
    savedAt: string;
    url: string;
    productName: string;
    landedCost: number;
    verdict?: string;
    inputs: Record<string, unknown>;
}

export function StickyActionBar() {
    const [saveState, setSaveState] = useState<"idle" | "saved">("idle");
    const [recalcState, setRecalcState] = useState<"idle" | "running">("idle");
    const { result, inputs, setResult } = usePSEOCalculatorStore();

    const handleSave = () => {
        try {
            const existing: SavedDeal[] = JSON.parse(localStorage.getItem("savedDeals") || "[]");
            const newDeal: SavedDeal = {
                id: `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
                savedAt: new Date().toISOString(),
                url: window.location.href,
                productName: document.title.split(":")[0]?.trim() || "Import Deal",
                landedCost: result?.summary.total_landed_cost_zar || 0,
                verdict: result?.verdict,
                inputs: { ...inputs },
            };
            existing.unshift(newDeal);
            localStorage.setItem("savedDeals", JSON.stringify(existing.slice(0, 50)));
            setSaveState("saved");
            setTimeout(() => setSaveState("idle"), 2200);
        } catch {
            // localStorage unavailable
        }
    };

    const handleExport = () => {
        window.print();
    };

    const handleRefresh = async () => {
        setRecalcState("running");
        try {
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
        } finally {
            setRecalcState("idle");
        }
    };

    return (
        <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-slate-200 bg-white/95 p-4 backdrop-blur-md print:hidden">
            <div className="container mx-auto flex max-w-6xl items-center justify-between gap-3 overflow-x-auto">
                <span className="hidden text-sm font-medium text-slate-700 md:inline-block">Actions:</span>
                <div className="flex gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handleSave}
                        className={saveState === "saved" ? "border-sky-300 text-sky-700" : "border-slate-300 text-slate-700"}
                    >
                        {saveState === "saved" ? (
                            <>
                                <Check className="mr-2 h-4 w-4" />
                                Saved
                            </>
                        ) : (
                            <>
                                <Save className="mr-2 h-4 w-4" />
                                Save Deal
                            </>
                        )}
                    </Button>
                    <Button variant="outline" size="sm" onClick={handleExport} className="border-slate-300 text-slate-700">
                        <Download className="mr-2 h-4 w-4" />
                        Export PDF
                    </Button>
                    <Button variant="default" size="sm" onClick={handleRefresh} className="bg-sky-600 hover:bg-sky-700 text-white">
                        <RefreshCw className={`mr-2 h-4 w-4 ${recalcState === "running" ? "animate-spin" : ""}`} />
                        {recalcState === "running" ? "Refreshing..." : "Refresh Result"}
                    </Button>
                </div>
            </div>
        </div>
    );
}
