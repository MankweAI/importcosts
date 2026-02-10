const fs = require('fs');
const path = require('path');

// Read compliance rules JSON (note: file is named tariff_extraction.json but contains compliance data)
const rawDataPath = path.join(__dirname, '..', 'extracted_data', 'tariff_extraction.json');
const rawData = JSON.parse(fs.readFileSync(rawDataPath, 'utf-8'));

console.log(`Loaded ${rawData.length} compliance rules`);

// Sources reference (imported in the generated file)
const SOURCE_MAPPINGS = {
    'ITAC': {
        type: 'gazette',
        name: 'ITAC Import Control Regulations (R.91)',
        url: 'http://www.itac.org.za/'
    },
    'SARS': {
        type: 'customs_list',
        name: 'SARS Prohibited and Restricted List',
        url: 'https://www.sars.gov.za/customs-and-excise/travellers/prohibited-and-restricted-goods/'
    },
    'NRCS': {
        type: 'regulatory',
        name: 'NRCS Letter of Authority Requirements',
        url: 'https://www.nrcs.org.za/'
    },
    'SAHPRA': {
        type: 'regulatory',
        name: 'SAHPRA',
        url: 'https://www.sahpra.org.za/'
    }
};

// Transform rules to match the RiskRule interface
const transformedRules = rawData.map(rule => {
    const authoritySource = SOURCE_MAPPINGS[rule.authority] || { type: 'other_official', name: rule.authority, url: '#' };

    // Normalize HS codes (remove dots)
    const normalizedHsCodes = rule.hs_codes.map(code => code.replace(/\./g, ''));

    return {
        rule_id: rule.rule_id,
        authority_id: rule.authority,
        rule_type: rule.rule_type,
        title: rule.title,
        summary: rule.summary,
        severity: rule.severity,
        match: {
            hs_match: normalizedHsCodes,
            condition_match: rule.conditions || undefined
        },
        required_action: {
            steps: [rule.summary], // Default step from summary
            required_documents: rule.required_documents
        },
        official_refs: [{
            source_type: authoritySource.type,
            url: authoritySource.url,
            document_title: authoritySource.name,
            published_date: null
        }],
        // Preserve source reference from extraction
        source_ref: rule.source_ref
    };
});

// Merge with existing hardcoded rules (NRCS LOA for electronics, SAHPRA for medicaments, Textile labeling)
const existingRules = [
    {
        rule_id: "NRCS_LOA_ELECTRONICS",
        authority_id: "NRCS",
        rule_type: "loa_required",
        title: "Letter of Authority (LOA) Likely Required",
        summary: "Electronic and electrical equipment often requires an LOA from the NRCS to ensure safety standards.",
        severity: "medium",
        match: {
            hs_match: ["85"]
        },
        required_action: {
            steps: [
                "Check if product falls under Compulsory Specifications (VCs).",
                "Apply for LOA from NRCS if applicable.",
                "Pay non-refundable levy to NRCS."
            ],
            required_documents: ["Test Reports (IEC standards)", "LOA Application Form", "Proof of Payment"]
        },
        official_refs: [{
            source_type: "regulatory",
            url: "https://www.nrcs.org.za/",
            document_title: "NRCS LOA Procedure",
            published_date: "2019-05-06"
        }]
    },
    {
        rule_id: "SAHPRA_MEDICAMENTS",
        authority_id: "SAHPRA",
        rule_type: "permit_required",
        title: "SAHPRA License/Registration Required",
        summary: "Medical products must be registered with the South African Health Products Regulatory Authority (SAHPRA).",
        severity: "high",
        match: {
            hs_match: ["30"]
        },
        required_action: {
            steps: [
                "Ensure product is registered with SAHPRA.",
                "Importer must hold a valid Section 22C license."
            ],
            required_documents: ["SAHPRA License", "Registration Certificate"]
        },
        official_refs: [{
            source_type: "other_official",
            url: "https://www.sahpra.org.za/",
            document_title: "SAHPRA Regulatory Requirements",
            published_date: null
        }]
    },
    {
        rule_id: "TEXTILE_LABELING",
        authority_id: "SARS",
        rule_type: "inspection_risk",
        title: "Strict Labeling & Composition Requirements",
        summary: "Textiles are high-risk for customs stops. Labels must explicitly state composition and country of origin.",
        severity: "medium",
        match: {
            hs_match: ["61", "62", "63"]
        },
        required_action: {
            steps: [
                "Ensure strictly accurate composition labels (e.g. '100% Cotton').",
                "Permanently affixed labels required."
            ],
            required_documents: ["Packing List (detailed)", "Commercial Invoice"]
        },
        official_refs: [{
            source_type: "customs_list",
            url: "https://www.sars.gov.za/customs-and-excise/travellers/prohibited-and-restricted-goods/",
            document_title: "SARS Prohibited and Restricted Goods",
            published_date: null
        }]
    }
];

// Combine: extracted rules first, then existing rules (deduped)
const extractedIds = new Set(transformedRules.map(r => r.rule_id));
const finalRules = [
    ...transformedRules,
    ...existingRules.filter(r => !extractedIds.has(r.rule_id))
];

// Generate TypeScript file
const tsContent = `/**
 * Compliance Rules Registry
 * Auto-generated from ITAC R.91 and SARS Prohibited List
 * Last updated: ${new Date().toISOString().split('T')[0]}
 * 
 * Extracted rules: ${transformedRules.length}
 * Preserved hardcoded rules: ${existingRules.filter(r => !extractedIds.has(r.rule_id)).length}
 * Total: ${finalRules.length}
 */

import { RiskRule } from '@/types/pseo';

export const COMPLIANCE_RULES: RiskRule[] = ${JSON.stringify(finalRules, null, 2)};
`;

// Write to output
const outputPath = path.join(__dirname, '..', 'src', 'data', 'compliance', 'rules.ts');
fs.writeFileSync(outputPath, tsContent, 'utf-8');

console.log(`✅ Successfully wrote ${finalRules.length} compliance rules to ${outputPath}`);
console.log(`📊 Breakdown:`);
console.log(`   - Extracted: ${transformedRules.length} rules`);
console.log(`   - Preserved: ${existingRules.filter(r => !extractedIds.has(r.rule_id)).length} rules`);
