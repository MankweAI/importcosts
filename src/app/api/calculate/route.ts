import { NextResponse } from 'next/server';
import { CalculationResult } from '@/types/pseo';
import { getHardcodedPreference } from '@/utils/preferenceEngineStub';

export async function POST(request: Request) {
    try {
        const body = await request.json();

        // Simulate processing delay
        await new Promise(resolve => setTimeout(resolve, 500));

        // Mock Response Logic
        // In a real app, this would query your DB/Tariff engine
        const invoiceValue = body.invoice_value || 0;
        const vatRate = 0.15; // 15% standard
        const dutyRate = 0.15; // 15% placeholder

        // 1. Resolve Preference
        const { resolvePreference } = await import("@/lib/calc/preferenceEngine");
        const preference_decision = resolvePreference(body.hsCode || "8703", body.originCountry || "CN", dutyRate);

        // 2. Resolve Compliance Risks
        const { assessRisks } = await import("@/lib/compliance/complianceEngine");
        const compliance_decision = assessRisks({
            hsCode: body.hsCode || "8703",
            originIso: body.originCountry || "CN",
            usedGoods: body.usedGoods,
            importerType: body.importerType
        });

        // Simple ATV Calculation: (Value + 10% uplift + Duty) * VAT? 
        // Simplified:
        const dutyAmount = invoiceValue * dutyRate;
        const vatAmount = (invoiceValue + dutyAmount) * vatRate; // Very simplified
        const totalTaxes = dutyAmount + vatAmount;
        const forexCost = invoiceValue * 0.008;
        const disbursement = 650;
        const totalLanded = invoiceValue + totalTaxes + (body.freight_cost || 0) + (body.insurance_cost || 0) + forexCost + disbursement;

        const response: CalculationResult = {
            summary: {
                total_taxes_zar: totalTaxes,
                total_landed_cost_zar: totalLanded,
                landed_cost_per_unit_zar: totalLanded / (body.quantity || 1),
                origin_country: body.originCountry || 'CN'
            },
            hs: {
                confidence_score: 0.95,
                confidence_bucket: 'high',
                alternatives: [
                    { hs6: "8471.49", label: "Other Data Processing Machines", confidence_score: 0.85 },
                    { hs6: "8517.62", label: "Machines for reception/transmission", confidence_score: 0.60 }
                ]
            },
            tariff: {
                version: "2024.02.01",
                effective_date: "2024-02-01",
                last_updated: "2024-02-08"
            },
            line_items: [
                {
                    key: "duty",
                    label: "Customs Duty",
                    amount_zar: dutyAmount,
                    audit: {
                        formula: `${(dutyRate * 100).toFixed(0)}% of Customs Value`,
                        inputs_used: { val: invoiceValue },
                        rates: { rate: dutyRate },
                        tariff_version: "2024.02.01"
                    }
                },
                {
                    key: "vat",
                    label: "VAT",
                    amount_zar: vatAmount,
                    audit: {
                        formula: "15% of (ATV)",
                        inputs_used: { val: invoiceValue + dutyAmount },
                        rates: { rate: vatRate },
                        tariff_version: "2024.02.01"
                    }
                },
                {
                    key: "forex_spread",
                    label: "Bank Forex Spread & Fees",
                    amount_zar: invoiceValue * 0.008, // 0.8% typical spread
                    audit: {
                        formula: "0.80% estimated spread on Forex",
                        inputs_used: { val: invoiceValue },
                        rates: { rate: 0.008 }
                    }
                },
                {
                    key: "disbursement",
                    label: "Agent Disbursement Fee",
                    amount_zar: 650.00, // Flat estimate
                    audit: {
                        formula: "Fixed agency fee estimate",
                        inputs_used: {},
                        rates: { rate: 650 }
                    }
                },
                {
                    key: "freight",
                    label: "Freight (Est)",
                    amount_zar: body.freightCost || 0,
                    audit: { formula: 'User Input', inputs_used: {}, rates: {}, tariff_version: '' }
                }
            ],
            doc_checklist: {
                always: [
                    { title: "Commercial Invoice", why: "Proof of value for customs." },
                    { title: "Bill of Lading / Airway Bill", why: "Proof of shipment contract." },
                    { title: "SAD500", why: "Customs declaration form." }
                ],
                common: [
                    { title: "Packing List", why: "Details package contents." }
                ],
                conditional: [
                    { title: "Certificate of Origin", why: "Required to claim EUR1/SADC preference.", trigger: "If claiming preference" },
                    { title: "Import Permit", why: "Required for specific controlled goods.", trigger: "If goods are controlled" }
                ]
            },
            // Legacy risk flags - keeping empty array for type compatibility until frontend is fully migrated
            risk_flags: [],
            compliance_risks: compliance_decision,
            preference_decision: preference_decision
        };

        return NextResponse.json(response);
    } catch (error) {
        return NextResponse.json({ error: 'Calculation failed' }, { status: 500 });
    }
}
