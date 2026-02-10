"use client";

import { useEffect, useRef } from "react";
import { usePSEOCalculatorStore } from "@/store/usePSEOCalculatorStore";
import { CalculationResult, CalculationInputs } from "@/types/pseo";

interface StoreHydratorProps {
    initialResult?: CalculationResult;
    initialInputs?: Partial<CalculationInputs>;
}

/**
 * Hydrates the Zustand calculator store with SSR-generated data on mount.
 * This ensures child components (DecisionSummaryHeader, RiskFlagsPanel, etc.)
 * that read from the store see the pre-calculated results immediately.
 */
export function StoreHydrator({ initialResult, initialInputs }: StoreHydratorProps) {
    const { setResult, setInputs, status } = usePSEOCalculatorStore();
    const hydrated = useRef(false);

    useEffect(() => {
        // Only hydrate once, and only if the store is idle (user hasn't interacted yet)
        if (!hydrated.current && status === "idle" && initialResult) {
            if (initialInputs) {
                setInputs(initialInputs);
            }
            setResult(initialResult); // This also sets status to 'success'
            hydrated.current = true;
        }
    }, [initialResult, initialInputs, setResult, setInputs, status]);

    return null; // This component renders nothing — it just hydrates the store
}
