import { NextRequest, NextResponse } from "next/server";
import { searchHsCodes } from "@/lib/db/services/hsCode.service";

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get("q");

    if (!query || query.length < 2) {
        return NextResponse.json({ results: [] });
    }

    try {
        const results = await searchHsCodes(query, 10);

        // Format for frontend
        const formatted = results.map(r => ({
            hs6: r.hs6,
            title: r.title,
            label: `${r.hs6} - ${r.title.substring(0, 60)}...`
        }));

        return NextResponse.json({ results: formatted });
    } catch (e) {
        console.error("HS Search Error:", e);
        return NextResponse.json({ error: "Failed to search HS codes" }, { status: 500 });
    }
}
