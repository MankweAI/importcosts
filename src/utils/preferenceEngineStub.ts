import { PreferenceDecision, AgreementOption, SourceRef } from "@/types/pseo";

/**
 * Stub function to mimic the Preference Engine for Phase 1 (UI/UX Transformation).
 * Returns hardcoded data for specific routes to validate the "Rate Card" design.
 */
export function getHardcodedPreference(
    hsCode: string,
    originIso: string
): PreferenceDecision | null {
    const normalizedOrigin = originIso.toUpperCase();
    const normalizedHs = hsCode.replace(/\./g, "").substring(0, 6);

    // Scenario 1: Germany (DE) -> ZA (EUR.1 Eligible)
    // Target HS: Vehicles (8703) or Machinery
    if (normalizedOrigin === "DE") {
        return {
            mfn_rate: {
                rate_type: "ad_valorem_pct",
                rate_value: 0.25, // 25% MFN
                source_ref: {
                    source_type: "sars_html",
                    url: "https://www.sars.gov.za/legal-counsel/primary-legislation/schedule-1-ordinary-customs-duty/",
                    document_title: "Schedule 1 Part 1",
                    published_date: "2024-01-01"
                }
            },
            applicable_agreements: [
                {
                    agreement_id: "SADC_EU_EPA",
                    agreement_name: "SADC-EU EPA",
                    coverage_status: "covered",
                    preferential_rate: {
                        rate_type: "ad_valorem_pct",
                        rate_value: 0.18, // 18% Pref Rate (Staged)
                        effective_from: "2024-01-01",
                        effective_to: null,
                    },
                    savings_vs_mfn: {
                        savings_pct: 0.07, // 7% savings
                        notes: "Reduced duty under EPA staging.",
                    },
                    eligibility_signal: {
                        status: "eligible",
                        reason: "Originates in EU, direct transport assumed.",
                    },
                    proof_required: ["EUR.1 Movement Certificate", "Invoice Declaration"],
                    source_refs: [
                        {
                            source_type: "agreement_pdf",
                            url: "https://www.sars.gov.za/legal-counsel/international-treaties-agreements/trade-agreements/sadc-eu-epa/",
                            document_title: "SADC-EU EPA Protocol 1",
                            published_date: "2016-10-01",
                        },
                    ],
                },
            ],
            best_option: {
                agreement_id: "SADC_EU_EPA",
                agreement_name: "SADC-EU EPA",
                coverage_status: "covered",
                preferential_rate: {
                    rate_type: "ad_valorem_pct",
                    rate_value: 0.18,
                    effective_from: "2024-01-01",
                    effective_to: null,
                },
                savings_vs_mfn: {
                    savings_pct: 0.07,
                    notes: "Reduced duty under EPA staging.",
                },
                eligibility_signal: {
                    status: "eligible",
                    reason: "Originates in EU, direct transport assumed.",
                },
                proof_required: ["EUR.1 Movement Certificate", "Invoice Declaration"],
                source_refs: [
                    {
                        source_type: "agreement_pdf",
                        url: "https://www.sars.gov.za/legal-counsel/international-treaties-agreements/trade-agreements/sadc-eu-epa/",
                        document_title: "SADC-EU EPA Protocol 1",
                        published_date: "2016-10-01",
                    },
                ],
            },
            status: "eligible",
            unknown_or_block_reason: null,
            required_actions: [
                "Ensure supplier provides EUR.1 Certificate.",
                "Verify direct shipment from EU port.",
            ],
            proof_checklist: ["EUR.1 Certificate (Original)", "Commercial Invoice with Origin Statement"],
            rate_confidence: "high",
            tariff_version_id: "v2024.01.stubs",
        };
    }

    // Scenario 2: China (CN) -> ZA (No Preference)
    if (normalizedOrigin === "CN") {
        return {
            mfn_rate: {
                rate_type: "ad_valorem_pct",
                rate_value: 0.20,
                source_ref: null,
            },
            applicable_agreements: [],
            best_option: null,
            status: "not_eligible",
            unknown_or_block_reason: "No active trade agreement between China and SACU.",
            required_actions: [],
            proof_checklist: [],
            rate_confidence: "high",
            tariff_version_id: "v2024.01.stubs",
        };
    }

    // Scenario 3: UK (GB) -> ZA (SACUM-UK EPA)
    if (normalizedOrigin === "GB") {
        return {
            mfn_rate: {
                rate_type: "ad_valorem_pct",
                rate_value: 0.15,
                source_ref: null,
            },
            applicable_agreements: [
                {
                    agreement_id: "SACUM_UK_EPA",
                    agreement_name: "SACUM-UK EPA",
                    coverage_status: "covered",
                    preferential_rate: {
                        rate_type: "duty_free",
                        rate_value: 0.0,
                        effective_from: "2021-01-01",
                        effective_to: null,
                    },
                    savings_vs_mfn: {
                        savings_pct: 0.15,
                        notes: "Full duty waiver.",
                    },
                    eligibility_signal: {
                        status: "eligible",
                        reason: null,
                    },
                    proof_required: ["Origin Declaration (UK)"],
                    source_refs: [],
                },
            ],
            best_option: {
                agreement_id: "SACUM_UK_EPA",
                agreement_name: "SACUM-UK EPA",
                coverage_status: "covered",
                preferential_rate: {
                    rate_type: "duty_free",
                    rate_value: 0.0,
                    effective_from: "2021-01-01",
                    effective_to: null,
                },
                savings_vs_mfn: {
                    savings_pct: 0.15,
                    notes: "Full duty waiver.",
                },
                eligibility_signal: {
                    status: "eligible",
                    reason: null,
                },
                proof_required: ["Origin Declaration (UK)"],
                source_refs: [],
            },
            status: "eligible",
            unknown_or_block_reason: null,
            required_actions: ["Obtain Origin Declaration from UK Exporter"],
            proof_checklist: ["Origin Declaration on Invoice"],
            rate_confidence: "high",
            tariff_version_id: "v2024.01.stubs",
        };
    }

    // Default: Unknown / Maybe
    return {
        mfn_rate: {
            rate_type: "ad_valorem_pct",
            rate_value: 0.20,
            source_ref: null
        },
        applicable_agreements: [],
        best_option: null,
        status: "unknown",
        unknown_or_block_reason: "We do not have specific data for this route yet.",
        required_actions: [],
        proof_checklist: [],
        rate_confidence: "low",
        tariff_version_id: "v2024.01.stubs"
    };
}
