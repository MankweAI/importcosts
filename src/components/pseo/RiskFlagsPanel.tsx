"use client";

import { usePSEOCalculatorStore } from "@/store/usePSEOCalculatorStore";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    ShieldAlert,
    AlertTriangle,
    CheckCircle2,
    ChevronDown,
    ChevronUp,
    ExternalLink,
    Info,
    Bell,
    FileText,
    History
} from "lucide-react";
import { useState } from "react";
import { RiskAssessment, RiskFinding, UnknownCoverage } from "@/types/pseo";

export function RiskFlagsPanel() {
    const { result, status } = usePSEOCalculatorStore();

    // Guard: Only show if calculation is successful
    if (status !== 'success' || !result) return null;

    // Use compliance_risks if available, otherwise fallback to legacy risk_flags for backward compatibility
    const riskAssessment = result.compliance_risks;

    // If neither exists, hide panel
    if (!riskAssessment && (!result.risk_flags || result.risk_flags.length === 0)) return null;

    return (
        <div className="space-y-6 mb-8">
            {riskAssessment ? (
                // Phase 3: New Compliance Architecture
                <>
                    <RiskRadarSummary assessment={riskAssessment} />
                    <AuthorityChecklist assessment={riskAssessment} />
                    {/* Placeholder for RecentChangesCard - data not yet available in engine */}
                    <RecentChangesCard />
                    {riskAssessment.unknowns.length > 0 && <UnknownCoverageCard unknowns={riskAssessment.unknowns} />}
                    <WatchAlertsCTA />
                </>
            ) : (
                // Legacy Fallback (Keep existing logic until full migration)
                <LegacyRiskPanel riskFlags={result.risk_flags} />
            )}
        </div>
    );
}

// --- Sub-Components ---

function RiskRadarSummary({ assessment }: { assessment: RiskAssessment }) {
    const scoreColor =
        assessment.overall_risk_score >= 7 ? "text-red-600 dark:text-red-400" :
            assessment.overall_risk_score >= 4 ? "text-amber-600 dark:text-amber-400" :
                "text-green-600 dark:text-green-400";

    const borderColor =
        assessment.overall_risk_score >= 7 ? "border-l-red-500" :
            assessment.overall_risk_score >= 4 ? "border-l-amber-500" :
                "border-l-green-500";

    return (
        <Card className={`border-l-4 ${borderColor}`}>
            <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                    <div>
                        <CardTitle className="text-lg font-bold flex items-center gap-2">
                            <ShieldAlert className={`h-5 w-5 ${scoreColor}`} />
                            Compliance Risk Assessment
                        </CardTitle>
                        <CardDescription>
                            Automated analysis based on HS Code and Origin.
                        </CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <div className="flex flex-col md:flex-row gap-6 mt-2">
                    {/* Score Gauge */}
                    <div className="flex-shrink-0 flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900 rounded-lg p-4 w-full md:w-32">
                        <span className={`text-3xl font-bold ${scoreColor}`}>
                            {assessment.overall_risk_score}/10
                        </span>
                        <span className="text-xs text-muted-foreground font-medium uppercase mt-1">
                            Risk Score
                        </span>
                    </div>

                    {/* Top Risks */}
                    <div className="flex-1 space-y-3">
                        {assessment.top_risks.length > 0 ? assessment.top_risks.map(risk => (
                            <div key={risk.rule_id} className="flex items-start gap-3 p-2 rounded hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors">
                                <Badge variant={risk.severity === 'high' ? 'destructive' : risk.severity === 'medium' ? 'default' : 'secondary'} className="mt-0.5 uppercase text-[10px]">
                                    {risk.severity}
                                </Badge>
                                <div>
                                    <p className="text-sm font-semibold leading-none mb-1">{risk.title}</p>
                                    <p className="text-xs text-muted-foreground">{risk.summary}</p>
                                </div>
                            </div>
                        )) : (
                            <div className="flex items-center gap-2 text-green-600">
                                <CheckCircle2 className="h-5 w-5" />
                                <span className="text-sm font-medium">No high-priority risks detected.</span>
                            </div>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

function AuthorityChecklist({ assessment }: { assessment: RiskAssessment }) {
    // Group finding by Authority
    const groups: Record<string, RiskFinding[]> = {};
    assessment.all_risks.forEach(r => {
        if (!groups[r.authority_id]) groups[r.authority_id] = [];
        groups[r.authority_id].push(r);
    });

    const authorities = Object.keys(groups);

    if (authorities.length === 0) return null;

    return (
        <div className="space-y-4">
            <h3 className="text-md font-semibold text-gray-900 dark:text-gray-100 px-1">Compliance Requirements by Authority</h3>
            {authorities.map(authId => (
                <AuthorityCard key={authId} authorityId={authId} findings={groups[authId]} />
            ))}
        </div>
    );
}

function AuthorityCard({ authorityId, findings }: { authorityId: string, findings: RiskFinding[] }) {
    const [isOpen, setIsOpen] = useState(true);

    return (
        <Card>
            <div
                className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-900/30 transition-colors"
                onClick={() => setIsOpen(!isOpen)}
            >
                <div className="flex items-center gap-3">
                    <div className="bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 font-bold px-2 py-1 rounded text-xs w-16 text-center">
                        {authorityId}
                    </div>
                    <div>
                        <span className="font-semibold text-sm">{findings.length} Requirement{findings.length !== 1 ? 's' : ''}</span>
                    </div>
                </div>
                {isOpen ? <ChevronUp className="h-4 w-4 text-gray-400" /> : <ChevronDown className="h-4 w-4 text-gray-400" />}
            </div>

            {isOpen && (
                <CardContent className="border-t pt-4 px-4 pb-4 space-y-6">
                    {findings.map(finding => (
                        <div key={finding.rule_id} className="relative pl-4 border-l-2 border-gray-200 dark:border-gray-700">
                            <div className="mb-2">
                                <h4 className="text-sm font-bold flex items-center gap-2">
                                    {finding.title}
                                    {finding.severity === 'high' && <Badge variant="destructive" className="text-[10px] h-4">High Impact</Badge>}
                                </h4>
                                <p className="text-xs text-muted-foreground mt-0.5">{finding.summary}</p>
                            </div>

                            <div className="space-y-2">
                                {finding.required_action_steps.length > 0 && (
                                    <div className="bg-amber-50 dark:bg-amber-900/10 p-2 rounded text-xs">
                                        <span className="font-semibold text-amber-800 dark:text-amber-500 block mb-1">Required Actions:</span>
                                        <ul className="list-disc pl-4 space-y-0.5 text-amber-900 dark:text-amber-200">
                                            {finding.required_action_steps.map((step, i) => <li key={i}>{step}</li>)}
                                        </ul>
                                    </div>
                                )}

                                {finding.required_documents.length > 0 && (
                                    <div className="flex items-start gap-2 text-xs text-gray-600 dark:text-gray-400">
                                        <FileText className="h-3.5 w-3.5 mt-0.5" />
                                        <span className="font-medium">Valid Docs:</span>
                                        <span>{finding.required_documents.join(", ")}</span>
                                    </div>
                                )}

                                {finding.official_refs.length > 0 && (
                                    <div className="mt-2">
                                        {finding.official_refs.map((ref, i) => (
                                            <a
                                                key={i}
                                                href={ref.url}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="inline-flex items-center gap-1 text-[10px] text-blue-600 hover:underline bg-blue-50 dark:bg-blue-900/20 px-2 py-1 rounded"
                                            >
                                                <ExternalLink className="h-3 w-3" />
                                                {ref.document_title || "Official Source"}
                                            </a>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </CardContent>
            )}
        </Card>
    );
}

function RecentChangesCard() {
    // Mocked for now - pending Phase 3 data scraping
    return (
        <Card className="bg-gray-50/50 dark:bg-gray-900/20 border-dashed">
            <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold flex items-center gap-2 text-gray-500">
                    <History className="h-4 w-4" />
                    Recent Regulatory Changes
                </CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-xs text-muted-foreground italic">
                    No recent regulatory changes detected for this HS Chapter in the last 90 days.
                </p>
                {/* Future implementation will list changes here */}
            </CardContent>
        </Card>
    );
}

function UnknownCoverageCard({ unknowns }: { unknowns: UnknownCoverage[] }) {
    if (!unknowns || unknowns.length === 0) return null;

    return (
        <Card className="bg-neutral-50 dark:bg-neutral-900 border-l-4 border-l-gray-400">
            <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                    <Info className="h-4 w-4" />
                    Coverage Limitations
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-2">
                    {unknowns.map((u, i) => (
                        <div key={i} className="text-xs">
                            <span className="font-bold">{u.area}:</span> {u.reason}
                            {u.suggested_next_step && <div className="mt-1 text-muted-foreground">Tip: {u.suggested_next_step}</div>}
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}

function WatchAlertsCTA() {
    return (
        <div className="flex flex-col sm:flex-row gap-3 items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg border border-blue-100 dark:border-blue-800">
            <div className="flex items-center gap-3">
                <div className="bg-white dark:bg-black/40 p-2 rounded-full shadow-sm">
                    <Bell className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                    <h4 className="text-sm font-bold text-blue-900 dark:text-blue-100">Never miss a compliance update</h4>
                    <p className="text-xs text-blue-700 dark:text-blue-300">Get notified when SARS or ITAC rules change for this product.</p>
                </div>
            </div>
            <Button size="sm" className="whitespace-nowrap bg-blue-600 hover:bg-blue-700 text-white">
                Get Alerts
            </Button>
        </div>
    );
}

function LegacyRiskPanel({ riskFlags }: { riskFlags: any[] }) {
    const [expanded, setExpanded] = useState(false);

    // Sort by severity (high -> medium -> low)
    const sortedFlags = [...riskFlags].sort((a, b) => {
        const severityMap: any = { high: 3, medium: 2, low: 1 };
        return severityMap[b.severity] - severityMap[a.severity];
    });

    const topFlags = expanded ? sortedFlags : sortedFlags.slice(0, 3);
    const hasMore = sortedFlags.length > 3;

    return (
        <Card className="mb-6 border-l-4 border-l-amber-500 dark:border-l-amber-700">
            <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold flex items-center gap-2 text-amber-900 dark:text-amber-100">
                    <ShieldAlert className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                    Compliance Risks & Alerts
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-3">
                    {topFlags.map((flag) => (
                        <div key={flag.key} className={`p-3 rounded-lg border ${flag.severity === 'high' ? 'bg-red-50 border-red-100 dark:bg-red-900/20 dark:border-red-800' :
                            flag.severity === 'medium' ? 'bg-amber-50 border-amber-100 dark:bg-amber-900/20 dark:border-amber-800' :
                                'bg-blue-50 border-blue-100 dark:bg-blue-900/20 dark:border-blue-800'
                            }`}>
                            <div className="flex justify-between items-start mb-1">
                                <h4 className="font-semibold text-sm">{flag.title}</h4>
                                <span className={`text-[10px] uppercase font-bold px-1.5 py-0.5 rounded ${flag.severity === 'high' ? 'bg-red-200 text-red-800' :
                                    flag.severity === 'medium' ? 'bg-amber-200 text-amber-800' :
                                        'bg-blue-200 text-blue-800'
                                    }`}>{flag.severity}</span>
                            </div>
                            <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-2">{flag.summary}</p>
                            <div className="text-xs font-medium flex items-center gap-1.5 text-neutral-500 dark:text-neutral-500 bg-white dark:bg-black/20 p-2 rounded">
                                <AlertTriangle className="h-3 w-3" />
                                <span>Action: {flag.recommended_action}</span>
                            </div>
                        </div>
                    ))}

                    {hasMore && (
                        <Button
                            variant="ghost"
                            size="sm"
                            className="w-full text-xs text-neutral-500 h-8"
                            onClick={() => setExpanded(!expanded)}
                        >
                            {expanded ? <><ChevronUp className="h-3 w-3 mr-1" /> Show Less</> : <><ChevronDown className="h-3 w-3 mr-1" /> Show {sortedFlags.length - 3} More Risks</>}
                        </Button>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
