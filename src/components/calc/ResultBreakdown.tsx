"use client";

import React, { useState } from "react";
import { CalcOutput, CalcLineItem } from "@/lib/calc/types";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { WhyDrawer } from "./WhyDrawer";
import { ReportCTA } from "./ReportCTA";
import { AlertTriangle } from "lucide-react";

interface ResultBreakdownProps {
    result: CalcOutput;
    referenceResult?: CalcOutput | null;
    onCompare?: () => void;
    onClearCompare?: () => void;
}

export function ResultBreakdown({ result, referenceResult, onCompare, onClearCompare }: ResultBreakdownProps) {
    const [selectedItem, setSelectedItem] = useState<CalcLineItem | null>(null);
    const dutyAmount = result.breakdown.find(i => i.id === "duty")?.amount || 0;
    const vatAmount = result.breakdown.find(i => i.id === "vat")?.amount || 0;
    const totalTaxes = dutyAmount + vatAmount;

    // Comparison View Logic
    const comparisonCard = referenceResult ? (
        <Card className="border-l-4 border-l-blue-500 bg-blue-50/50 mb-6">
            <CardHeader className="pb-2">
                <div className="flex justify-between items-center">
                    <CardTitle>Comparison Analysis</CardTitle>
                    <Button variant="ghost" size="sm" onClick={onClearCompare}>Close Comparison</Button>
                </div>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-3 gap-4 text-sm">
                    <div className="font-semibold text-muted-foreground">Metric</div>
                    <div className="font-semibold">Reference</div>
                    <div className="font-semibold text-primary">Current</div>

                    <div>Total Landed Cost</div>
                    <div className="text-muted-foreground">{result.currency} {referenceResult.landedCostTotal.toFixed(2)}</div>
                    <div className="font-bold">{result.currency} {result.landedCostTotal.toFixed(2)}</div>

                    <div>Unit Cost</div>
                    <div className="text-muted-foreground">
                        {referenceResult.landedCostPerUnit ? `${result.currency} ${referenceResult.landedCostPerUnit.toFixed(2)}` : "-"}
                    </div>
                    <div className="font-bold">
                        {result.landedCostPerUnit ? `${result.currency} ${result.landedCostPerUnit.toFixed(2)}` : "-"}
                    </div>

                    <div className="col-span-3 border-t my-2"></div>

                    <div className="font-bold">Difference</div>
                    <div className="col-span-2 font-mono text-lg font-bold flex items-center gap-2">
                        {/* Recalculate diffs here for render safety */}
                        {(result.landedCostTotal - referenceResult.landedCostTotal) > 0 ? "+" : ""}{result.currency} {(result.landedCostTotal - referenceResult.landedCostTotal).toFixed(2)}
                        <span className={`text-xs px-2 py-1 rounded-full ${(result.landedCostTotal - referenceResult.landedCostTotal) > 0 ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"}`}>
                            {(result.landedCostTotal - referenceResult.landedCostTotal) > 0 ? "More Expensive" : "Cheaper"}
                        </span>
                    </div>
                </div>
            </CardContent>
        </Card>
    ) : null;

    return (
        <div className="w-full space-y-4">
            {/* Summary (Decision-First) */}
            <div id="result-summary" className="rounded-lg border bg-card text-card-foreground shadow-sm">
                <div className="p-6">
                    <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                        <h2 className="text-xl font-semibold">Summary</h2>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <span>HS Confidence</span>
                            <Badge variant="secondary">{result.confidence}</Badge>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="rounded-md border bg-muted/30 p-4">
                            <p className="text-xs text-muted-foreground uppercase tracking-wider">Total Taxes</p>
                            <p className="text-2xl font-bold">{result.currency} {totalTaxes.toFixed(2)}</p>
                        </div>
                        <div className="rounded-md border bg-muted/30 p-4">
                            <p className="text-xs text-muted-foreground uppercase tracking-wider">Total Landed Cost</p>
                            <p className="text-2xl font-bold">{result.currency} {result.landedCostTotal.toFixed(2)}</p>
                        </div>
                        <div className="rounded-md border bg-muted/30 p-4">
                            <p className="text-xs text-muted-foreground uppercase tracking-wider">Cost Per Unit</p>
                            <p className="text-2xl font-bold">
                                {result.landedCostPerUnit ? `${result.currency} ${result.landedCostPerUnit.toFixed(2)}` : "-"}
                            </p>
                        </div>
                    </div>

                    {typeof result.landedCostExVat === "number" && (
                        <div className="mt-4 text-sm text-muted-foreground">
                            VAT-registered view: Net landed cost (ex VAT) = <span className="font-semibold text-foreground">{result.currency} {result.landedCostExVat.toFixed(2)}</span>
                        </div>
                    )}

                    <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                        <span>Tariff Version: <span className="font-medium text-foreground">{result.tariffVersionLabel}</span></span>
                        {result.tariffVersionEffectiveFrom && (
                            <span>Effective: <span className="font-medium text-foreground">{new Date(result.tariffVersionEffectiveFrom).toLocaleDateString()}</span></span>
                        )}
                    </div>
                </div>
            </div>

            {/* Comparison Display - Force Render Update */}
            <div key="comparison-section-v2" className="animate-in fade-in slide-in-from-top-4 duration-500">
                {comparisonCard}
            </div>

            {/* Assumptions Text (Subtle) */}
            <div className="flex justify-end gap-4 text-xs text-muted-foreground px-1">
                {result.assumptions?.dutyRateUsed && <span>Duty Rate: <span className="font-medium">{result.assumptions.dutyRateUsed}</span></span>}
                {result.assumptions?.exchangeRate && <span>Exch. Rate: <span className="font-medium">R {result.assumptions.exchangeRate.toFixed(2)}</span></span>}
            </div>

            {/* 2. Risk Banner (B4) */}
            {result.risks && result.risks.length > 0 && (
                <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-r-md dark:bg-amber-950/20 animate-in fade-in slide-in-from-top-2">
                    <div className="flex">
                        <div className="flex-shrink-0">
                            <AlertTriangle className="h-5 w-5 text-amber-500" aria-hidden="true" />
                        </div>
                        <div className="ml-3">
                            <h3 className="text-sm font-medium text-amber-800 dark:text-amber-200">
                                Trade Risks Identified
                            </h3>
                            <div className="mt-2 text-sm text-amber-700 dark:text-amber-300">
                                <ul className="list-disc pl-5 space-y-1">
                                    {result.risks.map((risk, i) => (
                                        <li key={i}>{risk}</li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
                <div className="p-6">
                    <h3 className="text-lg font-semibold leading-none tracking-tight mb-4">Detailed Breakdown</h3>

                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Component</TableHead>
                                <TableHead className="text-right hidden sm:table-cell">Rate</TableHead>
                                <TableHead className="text-right">Amount</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {result.breakdown.map((item) => (
                                <TableRow key={item.id} className="cursor-pointer hover:bg-muted/50" onClick={() => setSelectedItem(item)}>
                                    <TableCell className="font-medium">{item.label}</TableCell>
                                    <TableCell className="text-right text-muted-foreground hidden sm:table-cell">{item.rateApplied}</TableCell>
                                    <TableCell className="text-right font-medium">
                                        {item.currency} {item.amount.toFixed(2)}
                                    </TableCell>
                                </TableRow>
                            ))}

                            {/* Total Row */}
                            <TableRow className="bg-muted/50 font-bold hover:bg-muted/50 border-b-2 border-primary/10">
                                <TableCell>Est. Landed Cost Total</TableCell>
                                <TableCell className="hidden sm:table-cell"></TableCell>
                                <TableCell className="text-right text-lg text-primary">
                                    {result.currency} {(result.landedCostTotal || 0).toFixed(2)}
                                </TableCell>
                            </TableRow>
                            {/* Unit Cost Row */}
                            <TableRow className="hover:bg-transparent text-muted-foreground">
                                <TableCell className="py-2 text-sm">Cost Per Unit</TableCell>
                                <TableCell className="hidden sm:table-cell py-2"></TableCell>
                                <TableCell className="text-right py-2 text-sm font-semibold">
                                    {result.landedCostPerUnit
                                        ? `${result.currency} ${result.landedCostPerUnit.toFixed(2)}`
                                        : "-"}
                                </TableCell>
                            </TableRow>
                        </TableBody>
                    </Table>
                </div>
            </div>

            <ReportCTA result={result} />

            <WhyDrawer
                isOpen={!!selectedItem}
                onClose={() => setSelectedItem(null)}
                item={selectedItem}
                context={result}
            />
        </div>
    );
}
