import { useState } from 'react';
import { usePSEOCalculatorStore } from "@/store/usePSEOCalculatorStore";
import { CalculationResult } from '@/types/pseo';

export function useCalculateLandedCost() {
    const { setStatus, setResult } = usePSEOCalculatorStore();
    const [isLoading, setIsLoading] = useState(false);

    const calculate = async () => {
        const currentInputs = usePSEOCalculatorStore.getState().inputs;
        setIsLoading(true);
        setStatus('calculating');

        try {
            const response = await fetch('/api/calculate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(currentInputs),
            });

            if (!response.ok) {
                throw new Error('Calculation failed');
            }

            const data: CalculationResult = await response.json();
            setResult(data);
        } catch (error) {
            console.error(error);
            setStatus('error');
        } finally {
            setIsLoading(false);
        }
    };

    return { calculate, isLoading };
}
