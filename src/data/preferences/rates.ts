
export interface PreferenceRateDef {
    type: "ad_valorem" | "specific" | "free";
    value: number | null; // e.g. 0.18 for 18%
    unit?: string;
}

// Map: AgreementID -> HS Code Prefix (6 or 4 or 2) -> Rate
export const PREFERENCE_RATES: Record<string, Record<string, PreferenceRateDef>> = {
    "SADC_EU_EPA": {
        // Motor Cars
        "8703": { type: "ad_valorem", value: 0.18 }, // General 8703 catch-all (simplified)
        "870321": { type: "ad_valorem", value: 0.18 },
        "870322": { type: "ad_valorem", value: 0.18 },
        "870323": { type: "ad_valorem", value: 0.18 },
        "870324": { type: "ad_valorem", value: 0.18 },
        "870331": { type: "ad_valorem", value: 0.18 },
        "870332": { type: "ad_valorem", value: 0.18 },
        "870333": { type: "ad_valorem", value: 0.18 },

        // Parts & Accessories
        "8708": { type: "free", value: 0 },

        // Example: Textiles (often have specific rules but varying rates)
        "6109": { type: "free", value: 0 }, // T-shirts
    },
    "SACUM_UK_EPA": {
        // Mirrored from EU EPA mostly
        "8703": { type: "ad_valorem", value: 0.18 },
        "8708": { type: "free", value: 0 },
    },
    "SADC_PROTOCOL": {
        // SADC is generally duty free for originating goods
        "8703": { type: "free", value: 0 },
        "8708": { type: "free", value: 0 },
    },
    "AFCFTA": {
        // Phased reductions - simplified for now
        "8703": { type: "ad_valorem", value: 0.20 }, // Slightly better than MFN 25%
    }
};
