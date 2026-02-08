import { NextRequest, NextResponse } from "next/server";
import { CalcInputSchema } from "@/lib/calc/schemas";
import { calculateLandedCost } from "@/lib/calc/landedCost";
import { z } from "zod";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();

        // 1. Validate Input
        const input = CalcInputSchema.parse(body);

        // 2. Calculate
        // TODO: extracting userId from session if auth is present
        const result = await calculateLandedCost(input);

        return NextResponse.json(result);
    } catch (e: any) {
        if (e instanceof z.ZodError) {
            console.error("Validation Error Details:", JSON.stringify(e.issues, null, 2));
            return NextResponse.json(
                { error: "Validation Error", details: e.issues },
                { status: 400 }
            );
        }

        console.error("Calculation Error:", e);
        return NextResponse.json(
            { error: e.message || "Internal Server Error" },
            { status: 500 }
        );
    }
}
