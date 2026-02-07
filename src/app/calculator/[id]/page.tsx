import { auth } from "@clerk/nextjs/server";
import { redirect, notFound } from "next/navigation";
import { getCalcRunById } from "@/lib/db/services/calcRun.service";
import { ResultBreakdown } from "@/components/calc/ResultBreakdown";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft, Calendar, FileText } from "lucide-react";
import { CalcOutput } from "@/lib/calc/types";

export default async function SavedCalculationPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const { userId } = await auth();

    if (!userId) {
        redirect("/sign-in");
    }

    const calcRun = await getCalcRunById(id);

    if (!calcRun) {
        notFound();
    }

    // Security Check: Ensure the calculation belongs to the user
    if (calcRun.userId !== userId) {
        return (
            <div className="container mx-auto py-12 px-4 text-center">
                <h1 className="text-2xl font-bold text-red-600 mb-4">Unauthorized</h1>
                <p className="mb-8">You do not have permission to view this calculation.</p>
                <Button asChild>
                    <Link href="/">Back to Dashboard</Link>
                </Button>
            </div>
        );
    }

    const inputs = calcRun.inputs as any;
    const rawOutputs = calcRun.outputs as any;

    // Map DB structure to CalcOutput interface
    const result: CalcOutput = {
        ...rawOutputs,
        landedCostTotal: rawOutputs.total ?? rawOutputs.landedCostTotal ?? 0,
        currency: rawOutputs.currency || "ZAR",
        // Ensure other required fields are present if missing
        breakdown: rawOutputs.breakdown || [],
        tariffVersionId: calcRun.tariffVersionId,
        tariffVersionLabel: (calcRun as any).tariffVersion?.label || "Unknown",
        confidence: calcRun.confidence,
        auditTrace: [], // or recover if saved
    };

    return (
        <main className="min-h-screen p-4 md:p-8 lg:p-12 bg-gray-50 dark:bg-neutral-950">
            <div className="max-w-4xl mx-auto space-y-8">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" asChild>
                        <Link href="/">
                            <ArrowLeft className="h-4 w-4" />
                        </Link>
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Calculation Details</h1>
                        <p className="text-muted-foreground flex items-center gap-2 text-sm">
                            <Calendar className="h-3 w-3" />
                            {new Date(calcRun.createdAt).toLocaleDateString()} at {new Date(calcRun.createdAt).toLocaleTimeString()}
                        </p>
                    </div>
                </div>

                <div className="grid md:grid-cols-3 gap-6">
                    {/* Inputs Summary */}
                    <Card className="md:col-span-1 h-fit">
                        <CardHeader>
                            <CardTitle className="text-lg flex items-center gap-2">
                                <FileText className="h-4 w-4" />
                                Inputs
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider">HS Code</p>
                                <p className="font-mono text-lg">{inputs.hsCode}</p>
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Customs Value</p>
                                <p className="font-medium">R {Number(inputs.customsValue).toFixed(2)}</p>
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Quantity</p>
                                <p className="font-medium">{inputs.quantity}</p>
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Incoterm</p>
                                <p className="font-medium">{inputs.incoterm || "CIF"}</p>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Results */}
                    <div className="md:col-span-2">
                        <ResultBreakdown result={result} />
                    </div>
                </div>
            </div>
        </main>
    );
}
