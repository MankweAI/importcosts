import { RiskRule } from '@/types/pseo';
import { SOURCES } from './sources';

export const COMPLIANCE_RULES: RiskRule[] = [
    // 1. Used Goods (ITAC) - Global Rule
    {
        rule_id: "ITAC_USED_GOODS_PERMIT",
        authority_id: "ITAC",
        rule_type: "permit_required",
        title: "Import Permit Required for Used Goods",
        summary: "All used or second-hand goods require an import permit from ITAC before shipment.",
        severity: "high",
        match: {
            hs_match: ["*"], // Applies to all HS codes
            condition_match: {
                used_goods: true
            }
        },
        required_action: {
            steps: [
                "Apply for an Import Permit from ITAC.",
                "Ensure permit is issued BEFORE goods are shipped from origin."
            ],
            required_documents: ["ITAC Import Permit", "Commercial Invoice", "Equipment Description"]
        },
        official_refs: [{
            source_type: SOURCES.ITAC_IMPORT_CONTROL.type,
            url: SOURCES.ITAC_IMPORT_CONTROL.url,
            document_title: SOURCES.ITAC_IMPORT_CONTROL.name,
            published_date: null
        }]
    },
    // 2. Electronics (NRCS LOA) - HS Chapter 85
    {
        rule_id: "NRCS_LOA_ELECTRONICS",
        authority_id: "NRCS",
        rule_type: "loa_required",
        title: "Letter of Authority (LOA) Likely Required",
        summary: "Electronic and electrical equipment often requires an LOA from the NRCS to ensure safety standards.",
        severity: "medium", // Medium because not ALL 85 is controlled, but high probability
        match: {
            hs_match: ["85"], // Matches prefix 85
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
            source_type: SOURCES.NRCS_LOA_PROCEDURE.type,
            url: SOURCES.NRCS_LOA_PROCEDURE.url,
            document_title: SOURCES.NRCS_LOA_PROCEDURE.name,
            published_date: "2019-05-06"
        }]
    },
    // 3. Medicaments (SAHPRA) - HS 30
    {
        rule_id: "SAHPRA_MEDICAMENTS",
        authority_id: "SAHPRA",
        rule_type: "permit_required",
        title: "SAHPRA License/Registration Required",
        summary: "Medical products must be registered with the South African Health Products Regulatory Authority (SAHPRA).",
        severity: "high",
        match: {
            hs_match: ["30"],
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
    // 4. Textiles (Clothing) - Composition Labeling
    {
        rule_id: "TEXTILE_LABELING",
        authority_id: "SARS",
        rule_type: "inspection_risk",
        title: "Strict Labeling & Composition Requirements",
        summary: "Textiles are high-risk for customs stops. Labels must explicitly state composition and country of origin.",
        severity: "medium",
        match: {
            hs_match: ["61", "62", "63"],
        },
        required_action: {
            steps: [
                "Ensure strictly accurate composition labels (e.g. '100% Cotton').",
                "Permanently affixed labels required."
            ],
            required_documents: ["Packing List (detailed)", "Commercial Invoice"]
        },
        official_refs: [{
            source_type: SOURCES.SARS_PROHIBITED_RESTRICTED_MAIN.type,
            url: SOURCES.SARS_PROHIBITED_RESTRICTED_MAIN.url,
            document_title: SOURCES.SARS_PROHIBITED_RESTRICTED_MAIN.name,
            published_date: null
        }]
    }
];
