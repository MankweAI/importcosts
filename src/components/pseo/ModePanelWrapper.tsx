"use client";

import { usePSEOCalculatorStore } from "@/store/usePSEOCalculatorStore";
import { ProfessionalQuickFillPanel } from "./ProfessionalQuickFillPanel";
import { AssistedWizardPanel } from "./AssistedWizardPanel";
import { useEffect } from "react";

export function ModePanelWrapper() {
    const { mode } = usePSEOCalculatorStore();

    // Reset or initialize logic could go here

    return (
        <div className="min-h-[400px]">
            {mode === 'professional' ? (
                <ProfessionalQuickFillPanel />
            ) : (
                <AssistedWizardPanel />
            )}
        </div>
    );
}
