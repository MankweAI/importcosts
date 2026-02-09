
export interface RuleOfOriginDef {
    summary: string;
    proofs: string[];
}

// Map: AgreementID -> HS Code (Prefix/Chapter) -> Rule
export const RULES_OF_ORIGIN: Record<string, Record<string, RuleOfOriginDef>> = {
    "SADC_EU_EPA": {
        "87": {
            summary: "Manufacture in which the value of all the non-originating materials used does not exceed 40% of the ex-works price of the product.",
            proofs: ["EUR.1 Movement Certificate", "Invoice Declaration (for shipments < €6000 or by Approved Exporters)"]
        },
        "61": {
            summary: "Manufacture from yarn (Double Transformation Rule).",
            proofs: ["EUR.1 Movement Certificate"]
        }
    },
    "SACUM_UK_EPA": {
        "87": {
            summary: "Manufacture in which the value of all the non-originating materials used does not exceed 40% of the ex-works price of the product.",
            proofs: ["Origin Declaration on Invoice (UK Exporters)"]
        }
    },
    "SADC_PROTOCOL": {
        "87": {
            summary: "Change in Tariff Heading (CTH) or Value Added > 35%.",
            proofs: ["SADC Certificate of Origin"]
        }
    },
    "AFCFTA": {
        "87": {
            summary: "Non-originating materials max 60% of ex-works price.",
            proofs: ["AfCFTA Certificate of Origin"]
        }
    }
};
