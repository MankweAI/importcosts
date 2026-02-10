import { NextResponse } from 'next/server';
import { CompareRequest, CompareResult } from '@/types/pseo';
import { getHardcodedPreference } from '@/utils/preferenceEngineStub';

export async function POST(request: Request) {
    const body: CompareRequest = await request.json();

    try {
        // Import calculation engine
        const { calculateLandedCost } = await import("@/lib/calc/landedCost");


        // We act as an anonymous user for public access
        const userId = "public-compare";

        // Parallel execution for all requested origins
        const results = await Promise.all(body.compareOrigins.map(async (originIso) => {
            // Merge base inputs with new origin
            // Re-map the raw inputs akin to the calculate API to ensure type safety
            const calcInput: import("@/lib/calc/types").CalcInput = {
                ...body.baseInputs,
                // Ensure number types for safety
                customsValue: Number(body.baseInputs.invoiceValue) * Number(body.baseInputs.exchangeRate),
                invoiceValue: Number(body.baseInputs.invoiceValue),
                freightCost: Number(body.baseInputs.freightCost),
                insuranceCost: Number(body.baseInputs.insuranceCost),
                freightInsuranceCost: Number(body.baseInputs.freightCost) + Number(body.baseInputs.insuranceCost),
                quantity: Number(body.baseInputs.quantity) || 1,
                // Map importer type
                importerType: (body.baseInputs.importerType === 'PRIVATE' ? 'NON_VENDOR' : 'VAT_REGISTERED') as "VAT_REGISTERED" | "NON_VENDOR",
                usedGoods: false,
                // Overrides
                incoterm: (body.baseInputs.incoterm || "FOB") as "FOB" | "CIF" | "EXW",
                originCountry: originIso,
                destinationCountry: "ZA"
            };

            const result = await calculateLandedCost(calcInput, userId);

            return {
                originIso,
                summary: {
                    total_taxes_zar: result.breakdown
                        .filter(i => ["duty", "vat", "excise"].includes(i.id))
                        .reduce((sum, i) => sum + i.amount, 0),
                    total_landed_cost_zar: result.landedCostTotal,
                    landed_cost_per_unit_zar: result.landedCostPerUnit || result.landedCostTotal,
                    origin_country: originIso
                },
                risk_flags_top: [], // Detailed risks might be too heavy, skip for summary? Or include?
                preference_decision: result.preference_decision
            };
        }));

        // Calculate Deltas (vs the first one or a provided base? The type suggests a map key)
        // For MVP, if we have >1 result, we can compare them? 
        // Or if the FE sent a "base origin" we could compare vs that.
        // The mock had "CN_vs_US".
        // Let's just return the per-origin results. The FE can compute deltas if needed.
        const response: CompareResult = {
            perOriginResults: results,
            deltas: {} // Computed consistently on frontend or here if needed
        };

        return NextResponse.json(response);

    } catch (error) {
        console.error("Comparison API Error:", error);
        return NextResponse.json({
            error: "Comparison failed",
            details: error instanceof Error ? error.message : "Unknown error"
        }, { status: 500 });
    }
}
