"use client";

import { usePSEOCalculatorStore } from "@/store/usePSEOCalculatorStore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { AlertTriangle, CheckCircle, HelpCircle, ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export function HSConfidencePanel() {
    const { result, status, inputs } = usePSEOCalculatorStore();

    if (status !== 'success' || !result) return null;

    const confidenceScore = (result.hs.confidence_score || 0) * 100;
    const isHigh = result.hs.confidence_bucket === 'high';
    const isLow = result.hs.confidence_bucket === 'low' || result.hs.confidence_bucket === 'unknown';

    return (
        <Card className={`mb-6 border-l-4 ${isHigh ? 'border-l-emerald-500' : isLow ? 'border-l-red-500' : 'border-l-amber-500'}`}>
            <CardHeader className="pb-2">
                <div className="flex justify-between items-center">
                    <CardTitle className="text-base font-semibold flex items-center gap-2">
                        {isHigh ? <CheckCircle className="h-5 w-5 text-emerald-500" /> : <AlertTriangle className="h-5 w-5 text-amber-500" />}
                        HS Classification Confidence
                    </CardTitle>
                    <Badge variant={isHigh ? "default" : "outline"} className={isHigh ? "bg-emerald-500" : ""}>
                        {confidenceScore.toFixed(0)}% Match
                    </Badge>
                </div>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    <div>
                        <div className="flex justify-between text-sm mb-1">
                            <span className="text-neutral-500">Selected Code: <span className="font-mono font-medium text-neutral-900 dark:text-neutral-100">{inputs.hsCode}</span></span>
                        </div>
                        <Progress value={confidenceScore} className={`h-2 ${isHigh ? "bg-emerald-100 dark:bg-emerald-900" : "bg-amber-100 dark:bg-amber-900"}`} />
                    </div>

                    {/* Alternatives if not high confidence */}
                    {!isHigh && result.hs.alternatives.length > 0 && (
                        <div className="bg-neutral-50 dark:bg-neutral-900 p-3 rounded-lg border border-neutral-100 dark:border-neutral-800">
                            <h4 className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-2">Alternative Interpretations</h4>
                            <ul className="space-y-2">
                                {result.hs.alternatives.map((alt) => (
                                    <li key={alt.hs6} className="flex justify-between items-center text-sm">
                                        <div className="flex items-center gap-2">
                                            <span className="font-mono text-xs bg-neutral-200 dark:bg-neutral-800 px-1 rounded">{alt.hs6}</span>
                                            <span className="truncate max-w-[200px]">{alt.label}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs text-neutral-400">{(alt.confidence_score * 100).toFixed(0)}% match</span>
                                            <Button variant="ghost" size="icon" className="h-6 w-6">
                                                <ChevronRight className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                            <div className="mt-3 pt-3 border-t border-neutral-200 dark:border-neutral-800">
                                <Button variant="outline" size="sm" className="w-full text-xs">
                                    Compare Cost Impact of Alternatives
                                </Button>
                            </div>
                        </div>
                    )}

                    {isLow && (
                        <div className="flex items-start gap-2 text-sm text-amber-700 bg-amber-50 p-3 rounded dark:bg-amber-900/20 dark:text-amber-300">
                            <HelpCircle className="h-5 w-5 shrink-0" />
                            <div className="space-y-2">
                                <p>We are not 100% sure about this classification. The duties could range significantly if custom reclassifies this goods.</p>
                                <Button size="sm" variant="secondary" className="w-full">Get Expert Classification</Button>
                            </div>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
