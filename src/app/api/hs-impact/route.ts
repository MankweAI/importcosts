import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
    const body = await req.json();
    const { baseInputs, hsCandidates } = body;

    // Mock Impact Calculation
    // In reality, run calculation for each candidate
    const perCandidate = hsCandidates.map((hs: string) => {
        const isHigher = Math.random() > 0.5;
        const impact = Math.floor(Math.random() * 5000) * (isHigher ? 1 : -1);

        return {
            hs6: hs,
            label: "Alternative Item Description",
            summary: {},
            deltas: {
                taxes_delta_zar: impact * 0.2,
                landed_delta_zar: impact,
                per_unit_delta_zar: impact / (baseInputs.quantity || 1)
            }
        };
    });

    return NextResponse.json({
        mode: 'delta',
        perCandidate,
        material_delta_flag: perCandidate.some((c: any) => Math.abs(c.deltas.landed_delta_zar) > 2000)
    });
}
