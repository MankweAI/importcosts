const fs = require('fs');
const path = require('path');

// Read tariff rates JSON (note: file is named compliance_extraction.json but contains tariff data)
const rawDataPath = path.join(__dirname, '..', 'extracted_data', 'compliance_extraction.json');
const rawData = JSON.parse(fs.readFileSync(rawDataPath, 'utf-8'));

console.log(`Loaded ${rawData.length} tariff rate entries`);

// Build the rates structure: AgreementID -> HS Code -> Rate
const ratesByAgreement = {};

rawData.forEach(item => {
    const hsCode = item.hs_code;
    const mfnRate = item.mfn_rate;
    const rateType = item.rate_type === 'free' ? 'free' : 'ad_valorem';

    // Add MFN rate (General/MFN)
    if (!ratesByAgreement['MFN']) {
        ratesByAgreement['MFN'] = {};
    }
    ratesByAgreement['MFN'][hsCode] = {
        type: rateType,
        value: mfnRate
    };

    // Add preferential rates for each agreement
    if (item.rates) {
        Object.entries(item.rates).forEach(([agreementId, rate]) => {
            if (!ratesByAgreement[agreementId]) {
                ratesByAgreement[agreementId] = {};
            }
            ratesByAgreement[agreementId][hsCode] = {
                type: rate === 0 ? 'free' : 'ad_valorem',
                value: rate
            };
        });
    }
});

// Generate TypeScript file
const tsContent = `/**
 * Preferential Tariff Rates
 * Auto-generated from SARS Tariff Book Schedule 1
 * Last updated: ${new Date().toISOString().split('T')[0]}
 * 
 * Coverage: ${rawData.length} HS codes
 * Agreements: ${Object.keys(ratesByAgreement).filter(k => k !== 'MFN').join(', ')}
 */

export interface PreferenceRateDef {
    type: "ad_valorem" | "specific" | "free";
    value: number | null; // e.g. 0.18 for 18%
    unit?: string;
}

// Map: AgreementID -> HS Code Prefix (6 or 4 or 2) -> Rate
export const PREFERENCE_RATES: Record<string, Record<string, PreferenceRateDef>> = ${JSON.stringify(ratesByAgreement, null, 4)};

// MFN rates for fallback
export const MFN_RATES: Record<string, PreferenceRateDef> = ${JSON.stringify(ratesByAgreement['MFN'] || {}, null, 4)};

/**
 * Get MFN rate for a given HS code
 * Falls back to 0 if not found
 */
export function getMFNRate(hsCode: string): number {
    // Try exact match first
    if (MFN_RATES[hsCode]) {
        return MFN_RATES[hsCode].value || 0;
    }
    
    // Try 6-digit
    const hs6 = hsCode.substring(0, 6);
    if (MFN_RATES[hs6]) {
        return MFN_RATES[hs6].value || 0;
    }
    
    // Try 4-digit
    const hs4 = hsCode.substring(0, 4);
    if (MFN_RATES[hs4]) {
        return MFN_RATES[hs4].value || 0;
    }
    
    return 0; // Default to 0 (no duty)
}
`;

// Write to output
const outputPath = path.join(__dirname, '..', 'src', 'data', 'preferences', 'rates.ts');
fs.writeFileSync(outputPath, tsContent, 'utf-8');

console.log(`✅ Successfully wrote ${rawData.length} tariff rates to ${outputPath}`);
console.log(`📊 Agreements: ${Object.keys(ratesByAgreement).join(', ')}`);
Object.entries(ratesByAgreement).forEach(([agreement, rates]) => {
    console.log(`   - ${agreement}: ${Object.keys(rates).length} codes`);
});
