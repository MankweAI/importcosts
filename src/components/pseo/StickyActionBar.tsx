"use client";

import { Button } from "@/components/ui/button";
import { Download, Save, ArrowRightLeft, Bell, Check } from "lucide-react";
import { useState } from "react";
import { usePSEOCalculatorStore } from "@/store/usePSEOCalculatorStore";

interface SavedDeal {
    id: string;
    savedAt: string;
    url: string;
    productName: string;
    landedCost: number;
    verdict?: string;
    inputs: Record<string, any>;
}

export function StickyActionBar() {
    const [saveState, setSaveState] = useState<"idle" | "saved">("idle");
    const [watchState, setWatchState] = useState<"idle" | "coming_soon">("idle");
    const { result, inputs } = usePSEOCalculatorStore();

    // ── Save Deal to localStorage ──
    const handleSave = () => {
        try {
            const existing: SavedDeal[] = JSON.parse(
                localStorage.getItem("savedDeals") || "[]"
            );

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
            // Keep max 50 deals
            localStorage.setItem(
                "savedDeals",
                JSON.stringify(existing.slice(0, 50))
            );

            setSaveState("saved");
            setTimeout(() => setSaveState("idle"), 2500);
        } catch {
            // localStorage unavailable — silently fail
        }
    };

    // ── Export as PDF via browser print ──
    const handleExport = () => {
        window.print();
    };

    // ── Compare — link to scenario comparison page ──
    const handleCompare = () => {
        window.open("/import-duty-vat-landed-cost/compare", "_blank");
    };

    // ── Watch — placeholder for Phase 2 alerts ──
    const handleWatch = () => {
        setWatchState("coming_soon");
        setTimeout(() => setWatchState("idle"), 3000);
    };

    return (
        <div className="fixed bottom-0 left-0 right-0 border-t border-neutral-200 bg-white/90 backdrop-blur-md p-4 dark:border-neutral-800 dark:bg-neutral-950/90 z-40 print:hidden">
            <div className="container mx-auto max-w-6xl flex justify-between items-center overflow-x-auto gap-4">
                <span className="text-sm font-medium hidden md:inline-block text-neutral-700">
                    Take action:
                </span>

                <div className="flex gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handleSave}
                        className={saveState === "saved" ? "text-emerald-600 border-emerald-300" : ""}
                    >
                        {saveState === "saved" ? (
                            <>
                                <Check className="mr-2 h-4 w-4" />
                                Saved!
                            </>
                        ) : (
                            <>
                                <Save className="mr-2 h-4 w-4" />
                                Save Deal
                            </>
                        )}
                    </Button>
                    <Button variant="outline" size="sm" onClick={handleExport}>
                        <Download className="mr-2 h-4 w-4" />
                        Export PDF
                    </Button>
                    <Button variant="outline" size="sm" onClick={handleCompare}>
                        <ArrowRightLeft className="mr-2 h-4 w-4" />
                        Compare
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handleWatch}
                        className={watchState === "coming_soon" ? "text-amber-600 border-amber-300" : ""}
                    >
                        <Bell className="mr-2 h-4 w-4" />
                        {watchState === "coming_soon" ? "Coming Soon" : "Watch"}
                    </Button>
                </div>
            </div>
        </div>
    );
}
