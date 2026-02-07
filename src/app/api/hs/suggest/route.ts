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

        // Format for frontend with Confidence Score (B3)
        const formatted = results.map(r => {
            let confidence = 0.5; // Default fuzzy
            const qLower = query.toLowerCase();

            if (r.hs6 === query) {
                confidence = 0.95; // Exact Code Match
            } else if (r.title.toLowerCase() === qLower) {
                confidence = 0.90; // Exact Title Match
            } else if (r.title.toLowerCase().includes(qLower)) {
                confidence = 0.80; // Strong Keyword Match
            }

            return {
                hs6: r.hs6,
                title: r.title,
                label: `${r.hs6} - ${r.title.substring(0, 60)}...`,
                confidence
            };
        });

        return NextResponse.json({ results: formatted });
    } catch (e) {
        console.error("HS Search Error:", e);
        return NextResponse.json({ error: "Failed to search HS codes" }, { status: 500 });
    }
}
