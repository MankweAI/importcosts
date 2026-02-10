export type PSEO_Mode = 'professional' | 'assisted';
export type CalcStatus = 'idle' | 'editing' | 'calculating' | 'success' | 'error';
export type HSConfidence = 'high' | 'medium' | 'low' | 'unknown';

export interface RouteContext {
    clusterSlug: string | null;
    hs6: string | null;
    originIso: string; // e.g. "US", "CN"
    destinationIso: string; // always "ZA"
    pageType: 'product_origin_money_page' | 'hs_origin_money_page';
}

export interface CalculationInputs {
    invoiceValue: number;
    currency: string;
    exchangeRate: number;
    freightCost: number;
    insuranceCost: number;
    otherCharges: number;
    quantity: number;
    incoterm: string; // "FOB", "CIF", etc.
    importerType: 'VAT_REGISTERED' | 'PRIVATE';
    originCountry: string;
    hsCode: string;
}

export interface LineItem {
    key: string;
    label: string;
    amount_zar: number;
    audit?: {
        formula: string;
        inputs_used: Record<string, any>;
        rates: any;
        ref_pointer?: string;
        tariff_version?: string;
        effective_date?: string;
    };
}

export interface CalculationResult {
    summary: {
        total_taxes_zar: number;
        total_landed_cost_zar: number;
        landed_cost_per_unit_zar: number;
        origin_country?: string;
    };
    hs: {
        confidence_score: number;
        confidence_bucket: HSConfidence;
        alternatives: Array<{
            hs6: string;
            label: string;
            confidence_score: number;
        }>;
    };
    tariff: {
        version: string;
        effective_date: string;
        last_updated: string;
    };
    line_items: LineItem[];
    doc_checklist: DocChecklistGroup;
    risk_flags: RiskFlag[];
    preference_decision?: PreferenceDecision | null;
    compliance_risks?: RiskAssessment | null;
}

export interface PreferenceDecision {
    mfn_rate: {
        rate_type: "ad_valorem_pct" | "specific" | "mixed";
        rate_value: number | null;
        source_ref: SourceRef | null;
    };
    applicable_agreements: AgreementOption[];
    best_option: AgreementOption | null;
    status: "eligible" | "maybe" | "not_eligible" | "unknown";
    unknown_or_block_reason: string | null;
    required_actions: string[];
    proof_checklist: string[];
    rate_confidence: "high" | "medium" | "low";
    tariff_version_id: string;
}

export interface AgreementOption {
    agreement_id: string;
    agreement_name: string;
    coverage_status: "covered" | "partial" | "unknown" | "not_covered";
    preferential_rate: {
        rate_type: string;
        rate_value: number | null;
        effective_from: string | null;
        effective_to: string | null;
    };
    savings_vs_mfn: {
        savings_pct: number | null;
        savings_amount?: number | null;
        notes: string | null;
    };
    rule_of_origin?: { // Made optional to avoid breaking existing code immediately, but engine will populate it
        summary: string;
        origin_criteria_code?: string;
    };
    documentation?: {
        proof_type: string;
        retention_period?: string;
    };
    eligibility_signal: {
        status: "eligible" | "maybe" | "not_eligible" | "unknown";
        reason: string | null;
    };
    proof_required: string[];
    source_refs: SourceRef[];
    agreement_type?: string; // e.g. EPA, FTA
}

export interface SourceRef {
    source_type: string;
    url: string;
    document_title: string | null;
    published_date: string | null;
}

export interface RiskFlag {
    key: string;
    severity: 'low' | 'medium' | 'high';
    title: string;
    summary: string;
    recommended_action: string;
}

export interface DocChecklistItem {
    title: string;
    why: string;
    notes?: string;
    trigger?: string; // for conditional items
}

export interface DocChecklistGroup {
    always: DocChecklistItem[];
    common: DocChecklistItem[];
    conditional: DocChecklistItem[];
}

// Update CalculationResult to use new DocChecklistGroup
// We need to redefine CalculationResult or extend it. 
// For simplicity in this replace block, I'm just appending types. 
// Note: The previous CalculationResult had doc_checklist as:
// doc_checklist: { always: string[]; ... } which is incompatible.
// I will need to update CalculationResult in a separate edit or broader replace.

export interface CompareRequest {
    baseInputs: CalculationInputs;
    compareOrigins: string[]; // ISO codes
    scenarioPresetValue?: number;
}

export interface CompareResult {
    perOriginResults: {
        originIso: string;
        summary: CalculationResult['summary'];
        risk_flags_top: RiskFlag[];
        preference_decision: CalculationResult['preference_decision'];
    }[];
    deltas: Record<string, any>; // simplified for now
}

export interface HSImpactRequest {
    baseInputs: CalculationInputs;
    hsCandidates: string[];
}

export interface HSImpactResponse {
    impactPreview: {
        mode: 'delta' | 'range';
        deltas: {
            hs6: string;
            dutyDeltaZar: number;
            taxesDeltaZar: number;
            landedDeltaZar: number;
        }[];
    };
}

// Phase 3: Compliance Risk Types

export interface RiskAssessment {
    overall_risk_score: number; // 0-10
    top_risks: RiskFinding[];
    all_risks: RiskFinding[];
    unknowns: UnknownCoverage[];
    risk_version_id: string;
    generated_at: string;
}

export interface RiskFinding {
    rule_id: string;
    authority_id: string;
    severity: "low" | "medium" | "high";
    title: string;
    summary: string;
    why_triggered: string;
    required_action_steps: string[];
    required_documents: string[];
    official_refs: SourceRef[];
}

export interface UnknownCoverage {
    area: string;
    reason: string;
    suggested_next_step: string;
    official_ref: SourceRef | null;
}

export interface RiskRule {
    rule_id: string;
    authority_id: string;
    rule_type: string;
    title: string;
    summary: string;
    severity: "low" | "medium" | "high";
    match: {
        hs_match: string[];
        // condition match for rule applicability
        condition_match?: {
            used_goods?: boolean;
            importer_type?: string;
            detained_for_NRCS?: boolean;
            excluded_schedule_4_headings?: string[];
            [key: string]: unknown; // Allow additional conditions
        };
    };
    required_action: {
        steps: string[];
        required_documents: string[];
    };
    official_refs: SourceRef[];
    source_ref?: string; // Original source reference from extraction
}
