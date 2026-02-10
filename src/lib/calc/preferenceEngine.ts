import { PreferenceDecision, AgreementOption, SourceRef } from '@/types/pseo';
import { AGREEMENTS, TradeAgreement } from '@/data/preferences/agreements';
import { PREFERENCE_RATES } from '@/data/preferences/rates';
import { findRuleOfOrigin } from '@/data/preferences/rules';

/**
 * Finds all trade agreements that cover the given origin country.
 */
export function findApplicableAgreements(originIso: string): TradeAgreement[] {
    return AGREEMENTS.filter(agreement =>
        agreement.status === "active" && agreement.covered_origins.includes(originIso)
    );
}

/**
 * Resolves the best available preference rate for a given HS code and origin.
 */
export function resolvePreference(
    hsCode: string,
    originIso: string,
    mfnRateValue: number = 0.25 // Default MFN if not provided (customizable)
): PreferenceDecision {
    const applicableAgreements = findApplicableAgreements(originIso);

    // If no agreements found
    if (applicableAgreements.length === 0) {
        return {
            mfn_rate: {
                rate_type: "ad_valorem_pct",
                rate_value: mfnRateValue,
                source_ref: {
                    source_type: "wto_schedule",
                    url: "#",
                    document_title: "WTO MFN",
                    published_date: null
                }
            },
            applicable_agreements: [],
            best_option: null,
            status: "not_eligible",
            unknown_or_block_reason: `No active trade agreement found between ${originIso} and South Africa.`,
            required_actions: [],
            proof_checklist: [],
            rate_confidence: "high",
            tariff_version_id: "v2024.01.file"
        };
    }

    const options: AgreementOption[] = [];

    for (const agreement of applicableAgreements) {
        // 1. Look up rate (try 6-digit, then 4-digit)
        const rateDef = PREFERENCE_RATES[agreement.id]?.[hsCode.substring(0, 6)]
            || PREFERENCE_RATES[agreement.id]?.[hsCode.substring(0, 4)];

        // 2. Look up rule using the helper function
        const ruleDef = findRuleOfOrigin(hsCode, agreement.id);

        if (rateDef) {
            const savings = Math.max(0, mfnRateValue - (rateDef.value || 0));

            options.push({
                agreement_id: agreement.id,
                agreement_name: agreement.shortName,
                coverage_status: "covered",
                agreement_type: agreement.type,
                preferential_rate: {
                    rate_type: "ad_valorem_pct",
                    rate_value: rateDef.value,
                    effective_from: "2024-01-01",
                    effective_to: null
                },
                savings_vs_mfn: {
                    savings_amount: 0, // Calculated later
                    savings_pct: savings,
                    notes: null
                },
                rule_of_origin: {
                    summary: ruleDef?.ruleText || "Standard rules apply.",
                    origin_criteria_code: "P"
                },
                documentation: {
                    proof_type: "Certificate of Origin (Form EUR.1 or EUR-MED COO)",
                    retention_period: "5 years"
                },
                eligibility_signal: {
                    status: "eligible",
                    reason: null
                },
                proof_required: ["Certificate of Origin", "Supplier's Declaration"],
                source_refs: [{
                    source_type: "agreement_text",
                    url: ruleDef?.sourceRef || "#",
                    document_title: agreement.shortName,
                    published_date: "2024-01-01"
                }]
            });
        }
    }

    // Determine best option
    const bestOption = options.sort((a, b) =>
        (a.preferential_rate.rate_value || 0) - (b.preferential_rate.rate_value || 0)
    )[0] || null;

    const isEligible = bestOption !== null;

    return {
        mfn_rate: {
            rate_type: "ad_valorem_pct",
            rate_value: mfnRateValue,
            source_ref: {
                source_type: "tariff_book",
                url: "#",
                document_title: "SARS Tariff Book",
                published_date: "2024-01-01"
            }
        },
        applicable_agreements: options,
        best_option: bestOption,
        status: isEligible ? "eligible" : "not_eligible",
        unknown_or_block_reason: isEligible ? null : `No preferential rates found for this commodity code despite agreement.`,
        required_actions: isEligible ? ["Verify origin criteria", "Obtain proof of origin"] : [],
        proof_checklist: (isEligible && bestOption?.documentation) ? [bestOption.documentation.proof_type, "Commercial Invoice"] : [],
        rate_confidence: "high",
        tariff_version_id: "v2024.01.file"
    };
}
