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
    preference_summary?: {
        eligible: boolean;
        agreement_name?: string;
        savings_estimate?: number;
    };
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
        preference_summary: CalculationResult['preference_summary'];
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
