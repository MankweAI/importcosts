import { NextResponse } from 'next/server';
import { HSImpactRequest, HSImpactResponse } from '@/types/pseo';

export async function POST(request: Request) {
    const body: HSImpactRequest = await request.json();

    // Mock impact logic

    const response: HSImpactResponse = {
        impactPreview: {
            mode: 'delta',
            deltas: body.hsCandidates.map(hs => ({
                hs6: hs,
                dutyDeltaZar: 500,
                taxesDeltaZar: 575,
                landedDeltaZar: 575
            }))
        }
    };

    return NextResponse.json(response);
}
