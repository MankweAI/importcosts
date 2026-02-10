import { NextResponse } from 'next/server';
import { findBetterOrigins } from '@/lib/calc/smartRateHunter';
import { calculateLandedCost } from '@/lib/calc/landedCost';

/**
 * POST /api/rate-hunter
 * 
 * Runs the Smart Rate Hunter for a given set of inputs.
 * This is designed to be called AFTER the primary calculation,
 * or in parallel by the frontend.
 * 
 * Request body: Same as /api/calculate (CalculationInputs from the store)
 * Response: SmartRateResult
 */
export async function POST(request: Request) {
    try {
        const body = await request.json();

        // Map frontend inputs to CalcInput (same logic as /api/calculate)
        const exchangeRate = body.exchangeRate || 18.50;
        const invoiceValue = Number(body.invoiceValue || body.invoice_value) || 0;
        const customsValue = invoiceValue * exchangeRate;

        const calcInput = {
            hsCode: body.hsCode || "87032390",
            customsValue,
            invoiceValue,
            exchangeRate,
            originCountry: body.originCountry || "CN",
            destinationCountry: "ZA",
            importerType: (body.importerType === 'PRIVATE' ? 'NON_VENDOR' : 'VAT_REGISTERED') as "VAT_REGISTERED" | "NON_VENDOR",
            freightCost: Number(body.freightCost || body.freight_cost) || 0,
            insuranceCost: Number(body.insuranceCost || body.insurance_cost) || 0,
            freightInsuranceCost: (Number(body.freightCost || body.freight_cost) || 0) + (Number(body.insuranceCost || body.insurance_cost) || 0),
            quantity: Number(body.quantity) || 1,
            incoterm: (body.incoterm || "FOB") as "FOB" | "CIF" | "EXW",
            usedGoods: body.usedGoods || false,
        };

        // 1. Run the base calculation first (or accept a pre-computed result)
        const baseResult = await calculateLandedCost(calcInput, "ssr-rate-hunter-base");

        // 2. Run the Smart Rate Hunter
        const hunterResult = await findBetterOrigins(calcInput, baseResult);

        return NextResponse.json(hunterResult);

    } catch (error) {
        console.error("Rate Hunter API Error:", error);
        return NextResponse.json({
            error: 'Rate hunter failed',
            details: error instanceof Error ? error.message : "Unknown error"
        }, { status: 500 });
    }
}
