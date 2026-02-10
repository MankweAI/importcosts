/**
 * Data Ingestion Script for Rules of Origin
 * Processes researcher JSON output and populates src/data/preferences/rules.ts
 */

import * as fs from 'fs';
import * as path from 'path';

interface RawRule {
    hs_code: string;
    description: string;
    agreement_id: string;
    rule_text: string;
    has_alternative_rule: boolean;
    alternative_rule_text: string;
    is_chapter_rule: boolean;
    source_ref: string;
}

interface PreferenceRule {
    hsCode: string;
    agreementId: string;
    ruleText: string;
    alternativeRuleText?: string;
    isChapterRule: boolean;
    sourceRef: string;
}

// Clean source references by removing AI citation artifacts
function cleanSourceRef(ref: string): string {
    return ref.replace(/:contentReference\[oaicite:\d+\]\{index=\d+\}/g, '').trim();
}

// Normalize HS Code (remove dots, ensure consistent format)
function normalizeHSCode(code: string): string {
    // Remove "ex" prefix if present
    const cleaned = code.replace(/^ex/i, '').replace(/\./g, '').trim();
    return cleaned;
}

// Convert raw JSON rule to TypeScript interface
function transformRule(raw: RawRule): PreferenceRule {
    const rule: PreferenceRule = {
        hsCode: normalizeHSCode(raw.hs_code),
        agreementId: raw.agreement_id,
        ruleText: raw.rule_text,
        isChapterRule: raw.is_chapter_rule,
        sourceRef: cleanSourceRef(raw.source_ref)
    };

    if (raw.has_alternative_rule && raw.alternative_rule_text) {
        rule.alternativeRuleText = raw.alternative_rule_text;
    }

    return rule;
}

// Main ingestion function
async function ingestRulesOfOrigin() {
    console.log('Starting Rules of Origin ingestion...');

    // Read raw JSON data
    const rawDataPath = path.join(process.cwd(), 'data', 'compliance_rules.yaml');
    const rawData: RawRule[] = JSON.parse(fs.readFileSync(rawDataPath, 'utf-8'));

    console.log(`Loaded ${rawData.length} raw rules`);

    // Transform data
    const transformedRules = rawData.map(transformRule);

    // Group by Agreement ID
    const rulesByAgreement: Record<string, PreferenceRule[]> = {};
    transformedRules.forEach(rule => {
        if (!rulesByAgreement[rule.agreementId]) {
            rulesByAgreement[rule.agreementId] = [];
        }
        rulesByAgreement[rule.agreementId].push(rule);
    });

    // Generate TypeScript file content
    const tsContent = `/**
 * Rules of Origin - Product Specific Rules (PSR)
 * Auto-generated from official trade agreement documents
 * Last updated: ${new Date().toISOString().split('T')[0]}
 */

export interface PreferenceRule {
  hsCode: string;
  agreementId: string;
  ruleText: string;
  alternativeRuleText?: string;
  isChapterRule: boolean;
  sourceRef: string;
}

export const RULES_OF_ORIGIN: Record<string, Record<string, PreferenceRule>> = ${JSON.stringify(rulesByAgreement, null, 2)};

/**
 * Lookup function to find applicable rule for given HS Code and Agreement
 */
export function findRule(hsCode: string, agreementId: string): PreferenceRule | null {
  const agreementRules = RULES_OF_ORIGIN[agreementId];
  if (!agreementRules) return null;

  // Try exact match first
  if (agreementRules[hsCode]) {
    return agreementRules[hsCode];
  }

  // Try chapter-level rule (first 2 digits)
  const chapterCode = hsCode.substring(0, 2);
  if (agreementRules[chapterCode]?.isChapterRule) {
    return agreementRules[chapterCode];
  }

  return null;
}
`;

    // Write to destination
    const outputPath = path.join(process.cwd(), 'src', 'data', 'preferences', 'rules.ts');
    fs.writeFileSync(outputPath, tsContent, 'utf-8');

    console.log(`✅ Successfully wrote ${transformedRules.length} rules to ${outputPath}`);
    console.log(`📊 Coverage: ${Object.keys(rulesByAgreement).length} agreement(s)`);

    Object.entries(rulesByAgreement).forEach(([agreementId, rules]) => {
        console.log(`   - ${agreementId}: ${rules.length} rules`);
    });
}

// Run ingestion
ingestRulesOfOrigin().catch(console.error);
