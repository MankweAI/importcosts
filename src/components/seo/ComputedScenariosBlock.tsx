import { calculateLandedCost } from "@/lib/calc/landedCost";
import { formatCurrency } from "@/lib/utils";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ComputedScenariosBlockProps {
    clusterName: string;
    hsCode: string;
}

export async function ComputedScenariosBlock({ clusterName, hsCode }: ComputedScenariosBlockProps) {
    // Define scenarios
    const scenarios = [
        { label: "Small Shipment", value: 10000 },
        { label: "Medium Shipment", value: 50000 },
        { label: "Commercial Order", value: 250000 },
    ];

    // Compute all in parallel
    const results = await Promise.all(
        scenarios.map(async (s) => {
            try {
                const res = await calculateLandedCost({
                    hsCode,
                    customsValue: s.value,
                    quantity: 1,
                    incoterm: "CIF"
                });
                return {
                    ...s,
                    success: true,
                    duty: res.breakdown.find(i => i.id === "duty")?.amount || 0,
                    vat: res.breakdown.find(i => i.id === "vat")?.amount || 0,
                    total: res.landedCostTotal
                };
            } catch (e) {
                return { ...s, success: false, duty: 0, vat: 0, total: 0 };
            }
        })
    );

    // If all failed, don't render anything (safe fallback)
    if (results.every(r => !r.success)) return null;

    return (
        <Card className="w-full shadow-sm border-2">
            <CardHeader className="pb-3">
                <CardTitle className="text-xl">
                    Import Cost Scenarios: {clusterName}
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="rounded-md border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[180px]">Scenario</TableHead>
                                <TableHead>Customs Value</TableHead>
                                <TableHead>Duty (Approx)</TableHead>
                                <TableHead>VAT (15%)</TableHead>
                                <TableHead className="text-right font-bold">Total Landed Cost</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {results.map((r, i) => (
                                <TableRow key={i}>
                                    <TableCell className="font-medium">{r.label}</TableCell>
                                    <TableCell>{formatCurrency(r.value)}</TableCell>
                                    <TableCell>
                                        {r.success ? formatCurrency(r.duty) : "-"}
                                    </TableCell>
                                    <TableCell>
                                        {r.success ? formatCurrency(r.vat) : "-"}
                                    </TableCell>
                                    <TableCell className="text-right font-bold text-primary">
                                        {r.success ? formatCurrency(r.total) : "Calc Failed"}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
                <p className="text-xs text-muted-foreground mt-4">
                    * Estimated costs based on HS Code {hsCode}. Values include Customs Duty and VAT (15%).
                    Actual costs may vary due to exchange rates and freight charges.
                </p>
            </CardContent>
        </Card>
    );
}
