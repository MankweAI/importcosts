import { NextResponse } from 'next/server';
import { CalculationResult } from '@/types/pseo';
import { getHardcodedPreference } from '@/utils/preferenceEngineStub';

export async function POST(request: Request) {
    try {
        const body = await request.json();

        // Simulate processing delay (UX)
        await new Promise(resolve => setTimeout(resolve, 500));

        // Import the real calculation engine
        const { calculateLandedCost } = await import("@/lib/calc/landedCost");
        const { ConfidenceLabel } = await import("@prisma/client"); // Ensure we have this

        // Map Request to CalcInput
        const exchangeRate = body.exchangeRate || 18.50;
        const invoiceValue = Number(body.invoiceValue) || Number(body.invoice_value) || 0;

        // Calculate Customs Value (ZAR)
        const customsValue = invoiceValue * exchangeRate;

        const calcInput = {
            hsCode: body.hsCode || "87032390",
            customsValue: customsValue,
            invoiceValue: invoiceValue,
            exchangeRate: exchangeRate,
            originCountry: body.originCountry || "CN",
            destinationCountry: "ZA",
            importerType: body.importerType as "VAT_REGISTERED" | "NON_VENDOR",
            freightCost: Number(body.freightCost) || Number(body.freight_cost) || 0,
            insuranceCost: Number(body.insuranceCost) || Number(body.insurance_cost) || 0,
            freightInsuranceCost: (Number(body.freightCost) || Number(body.freight_cost) || 0) + (Number(body.insuranceCost) || Number(body.insurance_cost) || 0),
            quantity: Number(body.quantity) || 1,
            incoterm: body.incoterm || "FOB",
            usedGoods: body.usedGoods,
            clusterSlug: body.clusterSlug,
            targetSellingPrice: Number(body.targetSellingPrice) || undefined,
            targetMarginPercent: Number(body.targetMarginPercent) || undefined,
        };

        // Perform Calculation
        const result = await calculateLandedCost(calcInput, undefined);

        // Map CalcOutput to API Response (CalculationResult)
        const response: CalculationResult = {
            summary: {
                total_taxes_zar: result.breakdown
                    .filter(i => ["duty", "vat", "excise"].includes(i.id))
                    .reduce((sum, i) => sum + i.amount, 0),
                total_landed_cost_zar: result.landedCostTotal,
                landed_cost_per_unit_zar: result.landedCostPerUnit || result.landedCostTotal,
                origin_country: body.originCountry || 'CN'
            },
            hs: {
                confidence_score: 0.95,
                confidence_bucket: 'high',
                alternatives: []
            },
            tariff: {
                version: result.tariffVersionLabel,
                effective_date: result.tariffVersionEffectiveFrom || new Date().toISOString(),
                last_updated: new Date().toISOString()
            },
            line_items: result.breakdown.map(item => ({
                key: item.id,
                label: item.label,
                amount_zar: item.amount,
                audit: {
                    formula: item.formula || "",
                    inputs_used: {},
                    rates: { rate: item.rateApplied },
                    tariff_version: result.tariffVersionId
                }
            })),
            doc_checklist: {
                always: [
                    { title: "Commercial Invoice", why: "Proof of value for customs." },
                    { title: "Bill of Lading / Airway Bill", why: "Proof of shipment contract." },
                    { title: "SAD500", why: "Customs declaration form." }
                ],
                common: [],
                conditional: result.preference_decision?.proof_checklist?.map((p: string) => ({
                    title: p,
                    why: "Required for Preferential Rate",
                    trigger: "Preference Claimed"
                })) || []
            },
            risk_flags: [],
            compliance_risks: result.compliance_risks,
            preference_decision: result.preference_decision,

            // Decision Fields
            verdict: result.verdict,
            grossMarginPercent: result.grossMarginPercent,
            breakEvenPrice: result.breakEvenPrice,
            detailedRisks: result.detailedRisks,
        };

        return NextResponse.json(response);
    } catch (error) {
        console.error("Calculation API Error:", error);
        return NextResponse.json({
            error: 'Calculation failed',
            details: error instanceof Error ? error.message : "Unknown error"
        }, { status: 500 });
    }
}
