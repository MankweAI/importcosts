
export interface TradeAgreement {
    id: string;
    name: string;
    shortName: string;
    type: "EPA" | "FTA" | "CUSTOMS_UNION" | "PTA";
    status: "active" | "inactive" | "provisional";
    covered_origins: string[]; // ISO2 codes
}

export const AGREEMENTS: TradeAgreement[] = [
    {
        id: "SADC_EU_EPA",
        name: "SADC-EU Economic Partnership Agreement",
        shortName: "SADC-EU EPA",
        type: "EPA",
        status: "active",
        covered_origins: [
            "AT", "BE", "BG", "HR", "CY", "CZ", "DK", "EE", "FI", "FR", "DE", "GR",
            "HU", "IE", "IT", "LV", "LT", "LU", "MT", "NL", "PL", "PT", "RO", "SK",
            "SI", "ES", "SE"
        ]
    },
    {
        id: "SACUM_UK_EPA",
        name: "SACUM-UK Economic Partnership Agreement",
        shortName: "SACUM-UK EPA",
        type: "EPA",
        status: "active",
        covered_origins: ["GB"]
    },
    {
        id: "SADC_PROTOCOL",
        name: "SADC Protocol on Trade",
        shortName: "SADC Protocol",
        type: "FTA",
        status: "active",
        covered_origins: [
            "AO", "BW", "KM", "CD", "SZ", "LS", "MG", "MW", "MU", "MZ", "NA", "SC", "TZ", "ZM", "ZW"
        ]
    },
    {
        id: "AFCFTA",
        name: "African Continental Free Trade Area",
        shortName: "AfCFTA",
        type: "FTA",
        status: "provisional",
        covered_origins: [
            "GH", "KE", "RW", "CM", "EG", "MU", "TZ", "TN" // Pilot countries for now
        ]
    }
];
