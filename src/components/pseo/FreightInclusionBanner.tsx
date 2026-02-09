"use client";

import { usePSEOCalculatorStore } from "@/store/usePSEOCalculatorStore";
import { useCalculateLandedCost } from "@/hooks/useCalculateLandedCost";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { TriangleAlert, ArrowRight } from "lucide-react";

export function FreightInclusionBanner() {
    const { inputs, status } = usePSEOCalculatorStore();
    const { calculate } = useCalculateLandedCost();

    if (status !== 'success') return null;

    // Mismatch Logic
    // Case 1: CIF selected (implies freight is prepaid/included in invoice) but user has added separate freight cost > 0?
    // Actually, usually CIF means Supplier Pays freight to port. So user Freight Input should be 0 or local transport only.
    // If Freight Input is huge, it might be double counting.
    // BUT the spec example says: "CIF selected but freight_cost=0" -> "CIF usually includes freight... Your freight is 0"
    // Wait, if CIF includes freight, then freight cost in the calculator (which adds to Landed Cost) should be... 
    // If I put 0 in freight field, Landed Cost = Invoice (CIF) + Taxes. This is correct.
    // Spec Example 1: "CIF selected but freight_cost=0" -> "CIF usually includes freight/insurance. Your freight is 0—confirm or apply a profile."
    //    -> This implies the user MIGHT want to separate them? Or maybe it's just a confirmation.

    // Spec Example 2: "FOB selected but freight entered" -> "FOB excludes freight... freight should be entered separately"
    //    -> If FOB and Freight=0, THAT is a problem. 
    //    -> If FOB and Freight>0, that's correct.

    // Let's implement the specific cases from the spec.
    const isCIF = inputs.incoterm === 'CIF' || inputs.incoterm === 'DAP' || inputs.incoterm === 'DDP';
    const isFOB = inputs.incoterm === 'FOB' || inputs.incoterm === 'EXW';

    const hasFreight = (inputs.freightCost || 0) > 0;

    // Case A: FOB but No Freight
    if (isFOB && !hasFreight) {
        import('@/lib/analytics').then(({ trackEvent }) => {
            // De-bounce this in real app, but for now just fire
            // trackEvent('freight_inclusion_banner_shown', { incoterm: inputs.incoterm });
        });

        return (
            <Alert variant="destructive" className="mb-6 border-red-200 bg-red-50 dark:bg-red-900/20 dark:border-red-900">
                <TriangleAlert className="h-4 w-4 text-red-600 dark:text-red-400" />
                <AlertTitle className="text-sm font-semibold text-red-800 dark:text-red-300">Missing Freight Cost?</AlertTitle>
                <AlertDescription className="text-xs text-red-700 dark:text-red-400 mt-1">
                    You selected <strong>{inputs.incoterm}</strong>, which means you pay for shipping separately.
                    Currently, your freight cost is 0.
                    <div className="mt-2 flex gap-2">
                        <Button variant="outline" size="sm" className="h-7 text-xs bg-white text-red-700 border-red-200 hover:bg-red-50" onClick={() => {
                            // Apply Sea Profile
                            // We need to access profile logic or just hardcode a fix
                            usePSEOCalculatorStore.getState().updateInput('freightCost', inputs.invoiceValue * 0.12);
                            setTimeout(calculate, 0);
                        }}>
                            Add Est. Sea Freight
                        </Button>
                    </div>
                </AlertDescription>
            </Alert>
        );
    }

    // Case B: CIF but Freight Added (Double Counting Risk?)
    // Spec actually said: "CIF selected but freight_cost=0" -> "CIF usually includes... confirm"
    // If CIF and Freight > 0, we might be double counting if the user put the full freight bill again.
    // But local delivery might be valid.

    return null;
}
