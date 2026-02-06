"use client";

import React, { useState } from "react";
import { CalcOutput, CalcLineItem } from "@/lib/calc/types";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { WhyDrawer } from "./WhyDrawer";
import { Info } from "lucide-react";

interface ResultBreakdownProps {
    result: CalcOutput;
}

export function ResultBreakdown({ result }: ResultBreakdownProps) {
    const [selectedItem, setSelectedItem] = useState<CalcLineItem | null>(null);

    // Helper to safely add items
    // We want to show: Value, Duty, VAT, (Freight/Ins?), Total
    // The result.breakdown has Duty and VAT.
    // We should construct a view that includes the base value for clarity?
    // Phase 3 `breakdown` has Duty and VAT.
    // Let's iterate result.breakdown.

    return (
        <div className="w-full space-y-4">
            <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
                <div className="p-6">
                    <h3 className="text-lg font-semibold leading-none tracking-tight mb-4">Landed Cost Breakdown</h3>

                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Component</TableHead>
                                <TableHead className="text-right">Rate</TableHead>
                                <TableHead className="text-right">Amount</TableHead>
                                <TableHead className="w-[110px]"></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {result.breakdown.map((item) => (
                                <TableRow key={item.id} className="cursor-pointer hover:bg-muted/50" onClick={() => setSelectedItem(item)}>
                                    <TableCell className="font-medium">{item.label}</TableCell>
                                    <TableCell className="text-right text-muted-foreground">{item.rateApplied}</TableCell>
                                    <TableCell className="text-right font-medium">
                                        {item.currency} {item.amount.toFixed(2)}
                                    </TableCell>
                                    <TableCell>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="h-7 text-xs gap-2 text-primary border-primary/20 hover:bg-primary/5 hover:text-primary"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setSelectedItem(item);
                                            }}
                                        >
                                            <Info className="h-3 w-3" />
                                            Explain
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}

                            {/* Total Row */}
                            <TableRow className="bg-muted/50 font-bold hover:bg-muted/50">
                                <TableCell colSpan={2}>Est. Landed Cost Total</TableCell>
                                <TableCell className="text-right text-lg">
                                    {result.currency} {result.landedCostTotal.toFixed(2)}
                                </TableCell>
                                <TableCell></TableCell>
                            </TableRow>
                        </TableBody>
                    </Table>
                </div>
            </div>

            <WhyDrawer
                isOpen={!!selectedItem}
                onClose={() => setSelectedItem(null)}
                item={selectedItem}
                context={result}
            />
        </div>
    );
}
