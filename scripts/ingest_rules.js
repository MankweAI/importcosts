const fs = require('fs');
const path = require('path');

// Read raw JSON
const rawDataPath = path.join(__dirname, '..', 'data', 'compliance_rules.yaml');
const rawData = JSON.parse(fs.readFileSync(rawDataPath, 'utf-8'));

console.log(`Loaded ${rawData.length} raw rules`);

// Transform and group by HS Code
const rulesByHSCode = {};

rawData.forEach(rule => {
    // Normalize HS code
    const hsCode = rule.hs_code.replace(/^ex/i, '').replace(/\./g, '').trim();

    // Clean source ref
    const sourceRef = rule.source_ref.replace(/:contentReference\[oaicite:\d+\]\{index=\d+\}/g, '').trim();

    const transformed = {
        hsCode,
        agreementId: rule.agreement_id,
        ruleText: rule.rule_text,
        isChapterRule: rule.is_chapter_rule,
        sourceRef
    };

    if (rule.has_alternative_rule && rule.alternative_rule_text) {
        transformed.alternativeRuleText = rule.alternative_rule_text;
    }

    // Key by HS Code for lookup
    rulesByHSCode[hsCode] = transformed;
});

// Generate TS content
const tsContent = `/**
 * Rules of Origin - Product Specific Rules (PSR)
 * Auto-generated from SADC-EU EPA Protocol 1, Annex II
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

export const RULES_OF_ORIGIN: Record<string, PreferenceRule> = ${JSON.stringify(rulesByHSCode, null, 2)};

/**
 * Lookup function to find applicable rule for given HS Code
 * Falls back to chapter-level rule if exact match not found
 */
export function findRuleOfOrigin(hsCode: string, agreementId: string = 'SADC_EU_EPA'): PreferenceRule | null {
  // Try exact match first
  if (RULES_OF_ORIGIN[hsCode] && RULES_OF_ORIGIN[hsCode].agreementId === agreementId) {
    return RULES_OF_ORIGIN[hsCode];
  }

  // Try chapter-level rule (first 2 digits)
  const chapterCode = hsCode.substring(0, 2);
  if (RULES_OF_ORIGIN[chapterCode]?.isChapterRule && RULES_OF_ORIGIN[chapterCode].agreementId === agreementId) {
    return RULES_OF_ORIGIN[chapterCode];
  }

  return null;
}
`;

// Write to output
const outputPath = path.join(__dirname, '..', 'src', 'data', 'preferences', 'rules.ts');
fs.writeFileSync(outputPath, tsContent, 'utf-8');

console.log(`✅ Successfully wrote ${Object.keys(rulesByHSCode).length} rules to ${outputPath}`);
