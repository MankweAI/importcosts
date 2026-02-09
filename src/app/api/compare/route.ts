import { NextResponse } from 'next/server';
import { CompareRequest, CompareResult } from '@/types/pseo';
import { getHardcodedPreference } from '@/utils/preferenceEngineStub';

export async function POST(request: Request) {
    const body: CompareRequest = await request.json();

    // Mock comparison logic
    // In reality, this would run 2+ full calculations

    // Stub response
    const mockResult: CompareResult = {
        perOriginResults: body.compareOrigins.map(origin => ({
            originIso: origin,
            summary: {
                total_taxes_zar: 2500,
                total_landed_cost_zar: 15000,
                landed_cost_per_unit_zar: 150
            },
            risk_flags_top: [],
            preference_decision: getHardcodedPreference(body.baseInputs.hsCode, origin)
        })),
        deltas: {
            // simplified delta logic
            "CN_vs_US": { saved: 200 }
        }
    };

    return NextResponse.json(mockResult);
}
