
import { RiskAssessment, RiskFinding, RiskRule, UnknownCoverage, SourceRef } from "@/types/pseo";
import { COMPLIANCE_RULES } from "@/data/compliance/rules";

interface ComplianceInput {
    hsCode: string;
    originIso: string;
    usedGoods?: boolean;
    importerType?: string;
}

export function assessRisks(input: ComplianceInput): RiskAssessment {
    const findings: RiskFinding[] = [];

    // 1. Evaluate Rules
    for (const rule of COMPLIANCE_RULES) {
        if (isMatch(rule, input)) {
            findings.push(mapRuleToFinding(rule));
        }
    }

    // 2. Sort by Severity
    const severityWeight = { high: 3, medium: 2, low: 1 };
    findings.sort((a, b) => severityWeight[b.severity] - severityWeight[a.severity]);

    // 3. Compute Score (Simple weighted sum capped at 10 for now)
    let score = findings.reduce((acc, f) => acc + severityWeight[f.severity], 0);
    score = Math.min(10, score);

    // Adjust score: if any high severity, min score is 7
    if (findings.some(f => f.severity === 'high')) {
        score = Math.max(7, score);
    }

    // 4. Identify Unknowns (Heuristics)
    const unknowns: UnknownCoverage[] = [];
    // Example: If no NRCS rule triggered for HS 85, adding a hint? 
    // For MVP, we stick to explicit rules. But we can add a generic unknown if coverage is low.

    return {
        overall_risk_score: score,
        top_risks: findings.slice(0, 3),
        all_risks: findings,
        unknowns: unknowns,
        risk_version_id: "v2024.02.file",
        generated_at: new Date().toISOString()
    };
}

function isMatch(rule: RiskRule, input: ComplianceInput): boolean {
    // 1. HS Match
    const hsMatch = rule.match.hs_match.some(pattern => {
        if (pattern === "*") return true;
        return input.hsCode.startsWith(pattern);
    });
    if (!hsMatch) return false;

    // 2. Condition Match
    if (rule.match.condition_match) {
        if (rule.match.condition_match.used_goods !== undefined) {
            // If rule requires used_goods=true, and input is false/undefined -> no match
            if (rule.match.condition_match.used_goods === true && !input.usedGoods) return false;
            // If rule requires used_goods=false, and input is true -> no match
            if (rule.match.condition_match.used_goods === false && input.usedGoods) return false;
        }
        // Add importer_type match if needed
    }

    return true;
}

function mapRuleToFinding(rule: RiskRule): RiskFinding {
    return {
        rule_id: rule.rule_id,
        authority_id: rule.authority_id,
        severity: rule.severity,
        title: rule.title,
        summary: rule.summary,
        why_triggered: `Matches HS ${rule.match.hs_match.join(", ")}` + (rule.match.condition_match?.used_goods ? " and Used Goods condition" : ""),
        required_action_steps: rule.required_action.steps,
        required_documents: rule.required_action.required_documents,
        official_refs: rule.official_refs
    };
}
