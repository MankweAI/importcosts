import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { calculateLandedCost } from "@/lib/calc/landedCost";
import { formatCurrency } from "@/lib/utils";
import { ArrowRight, Plane, Ship } from "lucide-react";

interface OriginComparisonBlockProps {
    clusterSlug: string;
    currentOriginIso: string;
    hsCode: string;
}

const TRADING_PARTNERS = [
    { iso: "CN", name: "China" },
    { iso: "US", name: "USA" },
    { iso: "DE", name: "Germany" },
    { iso: "UK", name: "United Kingdom" },
    { iso: "IN", name: "India" },
];

export async function OriginComparisonBlock({ clusterSlug, currentOriginIso, hsCode }: OriginComparisonBlockProps) {
    // Filter out current origin
    const alternativeOrigins = TRADING_PARTNERS.filter(p => p.iso !== currentOriginIso);

    // Standard Scenario: R100,000 via Sea Freight (CIF)
    const SCENARIO_VALUE = 100000;

    // Calculate in parallel (although currently MFN rates are identical, this prepares for origin-based tariffs)
    const results = await Promise.all(
        alternativeOrigins.map(async (origin) => {
            try {
                const res = await calculateLandedCost({
                    hsCode,
                    customsValue: SCENARIO_VALUE,
                    quantity: 1, // Unit irrelevant for total
                    incoterm: "CIF"
                });
                return {
                    ...origin,
                    success: true,
                    total: res.landedCostTotal,
                    duty: res.breakdown.find(i => i.id === "duty")?.amount || 0
                };
            } catch (e) {
                return { ...origin, success: false, total: 0, duty: 0 };
            }
        })
    );

    if (results.every(r => !r.success)) return null;

    return (
        <Card className="w-full shadow-sm border-2 border-muted bg-muted/10">
            <CardHeader className="pb-3">
                <CardTitle className="text-xl flex items-center gap-2">
                    <Plane className="h-5 w-5 text-primary" />
                    Compare Sources: Import Costs from Other Countries
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    {results.map((r) => (
                        <Card key={r.iso} className="overflow-hidden hover:shadow-md transition-shadow">
                            <CardContent className="p-4 space-y-3">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h4 className="font-semibold text-lg">{r.name}</h4>
                                        <p className="text-xs text-muted-foreground">Est. Landed Cost</p>
                                    </div>
                                    <div className="bg-primary/10 text-primary text-xs font-bold px-2 py-1 rounded">
                                        {r.iso}
                                    </div>
                                </div>

                                <div className="space-y-1">
                                    <div className="text-xl font-bold text-primary">
                                        {r.success ? formatCurrency(r.total) : "N/A"}
                                    </div>
                                    <p className="text-xs text-muted-foreground">
                                        (Base: {formatCurrency(SCENARIO_VALUE)})
                                    </p>
                                </div>

                                <Button asChild variant="outline" size="sm" className="w-full group">
                                    <Link href={`/import-duty-vat-landed-cost/${clusterSlug}/from/${r.iso.toLowerCase()}/to/za`}>
                                        View Breakdown
                                        <ArrowRight className="ml-2 h-3 w-3 group-hover:translate-x-1 transition-transform" />
                                    </Link>
                                </Button>
                            </CardContent>
                        </Card>
                    ))}
                </div>
                <p className="text-xs text-muted-foreground mt-4 text-center">
                    * Costs calculated based on a standardized R100,000 shipment value.
                    Comparison helps identify potential duty savings via trade agreements (if applicable).
                </p>
            </CardContent>
        </Card>
    );
}
