"use client";

import React from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Download, FileCheck, ShieldCheck } from "lucide-react";
import { CalcOutput } from "@/lib/calc/types";

interface ReportPreviewDialogProps {
    isOpen: boolean;
    onClose: () => void;
    result: CalcOutput;
    hsCode: string;
    originCountry: string;
}

export function ReportPreviewDialog({ isOpen, onClose, result, hsCode, originCountry }: ReportPreviewDialogProps) {

    const handleDownload = () => {
        // Phase 9: Real PDF Generation
        alert("This feature will download the Official PDF in the Production version.");
        onClose();
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="max-w-[800px] h-[90vh] flex flex-col p-0 gap-0">
                {/* Header / Toolbar */}
                <div className="p-4 border-b flex items-center justify-between bg-muted/20">
                    <div className="flex items-center gap-2">
                        <FileCheck className="h-5 w-5 text-primary" />
                        <span className="font-semibold">Report Preview</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" onClick={onClose}>Cancel</Button>
                        <Button size="sm" onClick={handleDownload} className="gap-2">
                            <Download className="h-4 w-4" />
                            Download PDF
                        </Button>
                    </div>
                </div>

                {/* Document View (Paper Styling) */}
                <ScrollArea className="flex-1 bg-gray-100/50 p-4 sm:p-8">
                    <div className="mx-auto max-w-[210mm] min-h-[297mm] bg-white shadow-lg p-8 sm:p-12 text-sm border">
                        {/* Report Header */}
                        <div className="flex justify-between items-start mb-8">
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">Import Cost Analysis</h1>
                                <p className="text-muted-foreground mt-1">Official Landed Cost Estimate</p>
                            </div>
                            <div className="text-right">
                                <div className="font-bold text-primary">ImportCosts.co.za</div>
                                <div className="text-xs text-muted-foreground">{new Date().toLocaleDateString()}</div>
                                <div className="text-xs text-muted-foreground">Ref: {result.tariffVersionId.substring(0, 8)}</div>
                            </div>
                        </div>

                        <Separator className="my-6" />

                        {/* Executive Summary */}
                        <section className="mb-8">
                            <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                                <ShieldCheck className="h-4 w-4 text-green-600" />
                                Executive Summary
                            </h2>
                            <div className="grid grid-cols-2 gap-x-8 gap-y-4">
                                <div>
                                    <span className="block text-xs text-muted-foreground uppercase">Commodity</span>
                                    <span className="font-medium text-base">HS {hsCode}</span>
                                </div>
                                <div>
                                    <span className="block text-xs text-muted-foreground uppercase">Route</span>
                                    <span className="font-medium text-base">{originCountry} → South Africa</span>
                                </div>
                                <div>
                                    <span className="block text-xs text-muted-foreground uppercase">Total Landed Cost</span>
                                    <span className="font-bold text-xl">{result.currency} {result.landedCostTotal.toFixed(2)}</span>
                                </div>
                                <div>
                                    <span className="block text-xs text-muted-foreground uppercase">Confidence</span>
                                    <Badge variant="outline" className="mt-1">{result.confidence}</Badge>
                                </div>
                                <div className="col-span-2 mt-2 pt-2 border-t border-dashed">
                                    <span className="block text-xs text-muted-foreground uppercase">Est. Unit Cost</span>
                                    <span className="font-mono text-lg">{result.currency} {(result.landedCostPerUnit || 0).toFixed(2)} <span className="text-xs text-gray-400">/ unit</span></span>
                                </div>
                            </div>
                        </section>

                        {/* Risk Section (B4) */}
                        {result.risks && result.risks.length > 0 && (
                            <section className="mb-8 bg-amber-50 p-4 border border-amber-200 rounded-sm">
                                <h3 className="font-bold text-amber-800 mb-2 flex items-center gap-2">
                                    <ShieldCheck className="h-4 w-4" />
                                    Risk & Compliance Alerts
                                </h3>
                                <ul className="list-disc pl-5 text-amber-900 space-y-1">
                                    {result.risks.map((r, i) => <li key={i}>{r}</li>)}
                                </ul>
                            </section>
                        )}

                        {/* Assumptions (B1) */}
                        <section className="mb-8">
                            <h3 className="font-bold mb-3 border-b pb-1">Calculation Assumptions</h3>
                            <div className="grid grid-cols-2 gap-4 text-xs">
                                <div><span className="text-gray-500">Exchange Rate Ref:</span> R {result.assumptions?.exchangeRate?.toFixed(2) || "N/A"}</div>
                                <div><span className="text-gray-500">Duty Rate Applied:</span> {result.assumptions?.dutyRateUsed || "N/A"}</div>
                            </div>
                        </section>

                        {/* Cost Breakdown */}
                        <section className="mb-8">
                            <h3 className="font-bold mb-3 border-b pb-1">Cost Structure</h3>
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="text-xs text-muted-foreground border-b">
                                        <th className="pb-2 font-medium">Item</th>
                                        <th className="pb-2 font-medium text-right">Rate</th>
                                        <th className="pb-2 font-medium text-right">Value</th>
                                    </tr>
                                </thead>
                                <tbody className="text-sm">
                                    <tr className="border-b border-dashed">
                                        <td className="py-2">Customs Value (CIF)</td>
                                        <td className="py-2 text-right">-</td>
                                        <td className="py-2 text-right">R {((result.breakdown[0].amount / (parseFloat(result.breakdown[0].rateApplied?.replace('%', '') || '0') / 100)) || 0).toFixed(2)} *Est</td>
                                        {/* Reverse calc for display only, simplistic */}
                                    </tr>
                                    {result.breakdown.map((item) => (
                                        <tr key={item.id} className="border-b border-gray-100">
                                            <td className="py-2">{item.label}</td>
                                            <td className="py-2 text-right text-muted-foreground text-xs">{item.rateApplied}</td>
                                            <td className="py-2 text-right font-medium">{item.currency} {item.amount.toFixed(2)}</td>
                                        </tr>
                                    ))}
                                    <tr className="font-bold bg-gray-50">
                                        <td className="py-3 pl-2">Total Landed Cost</td>
                                        <td></td>
                                        <td className="py-3 text-right pr-2">{result.currency} {result.landedCostTotal.toFixed(2)}</td>
                                    </tr>
                                </tbody>
                            </table>
                        </section>

                        {/* Audit Trace Extract */}
                        <section className="mb-8">
                            <h3 className="font-bold mb-3 border-b pb-1">Audit Trace & Compliance</h3>
                            <div className="text-xs font-mono bg-gray-50 p-4 rounded border">
                                {result.auditTrace.slice(0, 5).map((step, i) => (
                                    <div key={i} className="mb-1">
                                        <span className="text-gray-400">[{new Date(step.timestamp).toLocaleTimeString()}]</span> {step.step}: {step.description}
                                    </div>
                                ))}
                                <div className="text-gray-400 mt-2">... {result.auditTrace.length - 5} more steps in full report.</div>
                            </div>
                        </section>

                        {/* Footer Disclaimer */}
                        <div className="mt-auto pt-8 text-[10px] text-gray-400 text-center">
                            Authorized for internal use. Generated by ImportCosts.co.za limit-liability engine.
                            <br />
                            Tariff Version: {result.tariffVersionLabel}
                        </div>
                    </div>
                </ScrollArea>
            </DialogContent>
        </Dialog>
    );
}
