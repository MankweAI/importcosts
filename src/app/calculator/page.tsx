import React from "react";
import { CalcCard } from "@/components/calc/CalcCard";

export default function CalculatorPage() {
    return (
        <main className="min-h-screen p-4 md:p-8 lg:p-12 bg-gray-50 dark:bg-neutral-950 flex flex-col items-center">
            <div className="w-full max-w-4xl space-y-8">
                <div className="text-center space-y-2">
                    <h1 className="text-3xl font-bold tracking-tight">LandedCost OS</h1>
                    <p className="text-muted-foreground">
                        Phase 4: Calculator-First Verification
                    </p>
                </div>

                <CalcCard defaultHsCode="854143" />

                <div className="text-center text-xs text-muted-foreground mt-12">
                    <p>Running on Tariff Version: MVP-2026-02</p>
                </div>
            </div>
        </main>
    );
}
