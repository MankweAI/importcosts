/**
 * Preferential Tariff Rates
 * Auto-generated from SARS Tariff Book Schedule 1
 * Last updated: 2026-02-09
 * 
 * Coverage: 28 HS codes
 * Agreements: SADC_EU_EPA, SACUM_UK_EPA, SADC_PROTOCOL, EFTA, MERCOSUR
 */

export interface PreferenceRateDef {
    type: "ad_valorem" | "specific" | "free";
    value: number | null; // e.g. 0.18 for 18%
    unit?: string;
}

// Map: AgreementID -> HS Code Prefix (6 or 4 or 2) -> Rate
export const PREFERENCE_RATES: Record<string, Record<string, PreferenceRateDef>> = {
    "MFN": {
        "852842": {
            "type": "free",
            "value": 0
        },
        "84713010": {
            "type": "free",
            "value": 0
        },
        "84713090": {
            "type": "free",
            "value": 0
        },
        "85171310": {
            "type": "free",
            "value": 0
        },
        "85171390": {
            "type": "free",
            "value": 0
        },
        "85171410": {
            "type": "free",
            "value": 0
        },
        "85284910": {
            "type": "ad_valorem",
            "value": 0.25
        },
        "85284990": {
            "type": "free",
            "value": 0
        },
        "85285210": {
            "type": "free",
            "value": 0
        },
        "85285290": {
            "type": "ad_valorem",
            "value": 0.25
        },
        "85285990": {
            "type": "ad_valorem",
            "value": 0.25
        },
        "85287110": {
            "type": "ad_valorem",
            "value": 0.15
        },
        "85287220": {
            "type": "ad_valorem",
            "value": 0.25
        },
        "85287290": {
            "type": "ad_valorem",
            "value": 0.25
        },
        "85287320": {
            "type": "ad_valorem",
            "value": 0.25
        },
        "87032190": {
            "type": "ad_valorem",
            "value": 0.25
        },
        "87032290": {
            "type": "ad_valorem",
            "value": 0.25
        },
        "87032390": {
            "type": "ad_valorem",
            "value": 0.25
        },
        "87032490": {
            "type": "ad_valorem",
            "value": 0.25
        },
        "87033190": {
            "type": "ad_valorem",
            "value": 0.25
        },
        "87033290": {
            "type": "ad_valorem",
            "value": 0.25
        },
        "87033390": {
            "type": "ad_valorem",
            "value": 0.25
        },
        "87034090": {
            "type": "ad_valorem",
            "value": 0.25
        },
        "87035090": {
            "type": "ad_valorem",
            "value": 0.25
        },
        "87036090": {
            "type": "ad_valorem",
            "value": 0.25
        },
        "87037090": {
            "type": "ad_valorem",
            "value": 0.25
        },
        "87038090": {
            "type": "ad_valorem",
            "value": 0.25
        },
        "87039090": {
            "type": "ad_valorem",
            "value": 0.25
        }
    },
    "SADC_EU_EPA": {
        "852842": {
            "type": "free",
            "value": 0
        },
        "84713010": {
            "type": "free",
            "value": 0
        },
        "84713090": {
            "type": "free",
            "value": 0
        },
        "85171310": {
            "type": "free",
            "value": 0
        },
        "85171390": {
            "type": "free",
            "value": 0
        },
        "85171410": {
            "type": "free",
            "value": 0
        },
        "85284910": {
            "type": "free",
            "value": 0
        },
        "85284990": {
            "type": "free",
            "value": 0
        },
        "85285210": {
            "type": "free",
            "value": 0
        },
        "85285290": {
            "type": "free",
            "value": 0
        },
        "85285990": {
            "type": "free",
            "value": 0
        },
        "85287110": {
            "type": "free",
            "value": 0
        },
        "85287220": {
            "type": "free",
            "value": 0
        },
        "85287290": {
            "type": "free",
            "value": 0
        },
        "85287320": {
            "type": "free",
            "value": 0
        },
        "87032190": {
            "type": "free",
            "value": 0
        },
        "87032290": {
            "type": "ad_valorem",
            "value": 0.18
        },
        "87032390": {
            "type": "ad_valorem",
            "value": 0.18
        },
        "87032490": {
            "type": "ad_valorem",
            "value": 0.18
        },
        "87033190": {
            "type": "ad_valorem",
            "value": 0.18
        },
        "87033290": {
            "type": "ad_valorem",
            "value": 0.18
        },
        "87033390": {
            "type": "ad_valorem",
            "value": 0.18
        },
        "87034090": {
            "type": "ad_valorem",
            "value": 0.18
        },
        "87035090": {
            "type": "ad_valorem",
            "value": 0.18
        },
        "87036090": {
            "type": "ad_valorem",
            "value": 0.18
        },
        "87037090": {
            "type": "ad_valorem",
            "value": 0.18
        },
        "87038090": {
            "type": "ad_valorem",
            "value": 0.25
        },
        "87039090": {
            "type": "ad_valorem",
            "value": 0.25
        }
    },
    "SACUM_UK_EPA": {
        "852842": {
            "type": "free",
            "value": 0
        },
        "84713010": {
            "type": "free",
            "value": 0
        },
        "84713090": {
            "type": "free",
            "value": 0
        },
        "85171310": {
            "type": "free",
            "value": 0
        },
        "85171390": {
            "type": "free",
            "value": 0
        },
        "85171410": {
            "type": "free",
            "value": 0
        },
        "85284910": {
            "type": "free",
            "value": 0
        },
        "85284990": {
            "type": "free",
            "value": 0
        },
        "85285210": {
            "type": "free",
            "value": 0
        },
        "85285290": {
            "type": "free",
            "value": 0
        },
        "85285990": {
            "type": "free",
            "value": 0
        },
        "85287110": {
            "type": "free",
            "value": 0
        },
        "85287220": {
            "type": "free",
            "value": 0
        },
        "85287290": {
            "type": "free",
            "value": 0
        },
        "85287320": {
            "type": "free",
            "value": 0
        },
        "87032190": {
            "type": "free",
            "value": 0
        },
        "87032290": {
            "type": "ad_valorem",
            "value": 0.25
        },
        "87032390": {
            "type": "ad_valorem",
            "value": 0.25
        },
        "87032490": {
            "type": "ad_valorem",
            "value": 0.25
        },
        "87033190": {
            "type": "ad_valorem",
            "value": 0.25
        },
        "87033290": {
            "type": "ad_valorem",
            "value": 0.25
        },
        "87033390": {
            "type": "ad_valorem",
            "value": 0.25
        },
        "87034090": {
            "type": "ad_valorem",
            "value": 0.25
        },
        "87035090": {
            "type": "ad_valorem",
            "value": 0.25
        },
        "87036090": {
            "type": "ad_valorem",
            "value": 0.25
        },
        "87037090": {
            "type": "ad_valorem",
            "value": 0.25
        },
        "87038090": {
            "type": "ad_valorem",
            "value": 0.25
        },
        "87039090": {
            "type": "ad_valorem",
            "value": 0.25
        }
    },
    "SADC_PROTOCOL": {
        "852842": {
            "type": "free",
            "value": 0
        },
        "84713010": {
            "type": "free",
            "value": 0
        },
        "84713090": {
            "type": "free",
            "value": 0
        },
        "85171310": {
            "type": "free",
            "value": 0
        },
        "85171390": {
            "type": "free",
            "value": 0
        },
        "85171410": {
            "type": "free",
            "value": 0
        },
        "85284910": {
            "type": "ad_valorem",
            "value": 0.25
        },
        "85284990": {
            "type": "free",
            "value": 0
        },
        "85285210": {
            "type": "free",
            "value": 0
        },
        "85285290": {
            "type": "ad_valorem",
            "value": 0.25
        },
        "85285990": {
            "type": "ad_valorem",
            "value": 0.25
        },
        "85287110": {
            "type": "free",
            "value": 0
        },
        "85287220": {
            "type": "ad_valorem",
            "value": 0.25
        },
        "85287290": {
            "type": "free",
            "value": 0
        },
        "85287320": {
            "type": "ad_valorem",
            "value": 0.25
        },
        "87032190": {
            "type": "ad_valorem",
            "value": 0.25
        },
        "87032290": {
            "type": "ad_valorem",
            "value": 0.25
        },
        "87032390": {
            "type": "ad_valorem",
            "value": 0.25
        },
        "87032490": {
            "type": "ad_valorem",
            "value": 0.25
        },
        "87033190": {
            "type": "ad_valorem",
            "value": 0.25
        },
        "87033290": {
            "type": "ad_valorem",
            "value": 0.25
        },
        "87033390": {
            "type": "ad_valorem",
            "value": 0.25
        },
        "87034090": {
            "type": "ad_valorem",
            "value": 0.25
        },
        "87035090": {
            "type": "ad_valorem",
            "value": 0.25
        },
        "87036090": {
            "type": "ad_valorem",
            "value": 0.25
        },
        "87037090": {
            "type": "ad_valorem",
            "value": 0.25
        },
        "87038090": {
            "type": "ad_valorem",
            "value": 0.25
        },
        "87039090": {
            "type": "ad_valorem",
            "value": 0.25
        }
    },
    "EFTA": {
        "852842": {
            "type": "free",
            "value": 0
        },
        "84713010": {
            "type": "free",
            "value": 0
        },
        "84713090": {
            "type": "free",
            "value": 0
        },
        "85171310": {
            "type": "free",
            "value": 0
        },
        "85171390": {
            "type": "free",
            "value": 0
        },
        "85171410": {
            "type": "free",
            "value": 0
        },
        "85284910": {
            "type": "free",
            "value": 0
        },
        "85284990": {
            "type": "free",
            "value": 0
        },
        "85285210": {
            "type": "free",
            "value": 0
        },
        "85285290": {
            "type": "free",
            "value": 0
        },
        "85285990": {
            "type": "free",
            "value": 0
        },
        "85287110": {
            "type": "free",
            "value": 0
        },
        "85287220": {
            "type": "free",
            "value": 0
        },
        "85287290": {
            "type": "free",
            "value": 0
        },
        "85287320": {
            "type": "free",
            "value": 0
        },
        "87032190": {
            "type": "free",
            "value": 0
        },
        "87032290": {
            "type": "free",
            "value": 0
        },
        "87032390": {
            "type": "free",
            "value": 0
        },
        "87032490": {
            "type": "free",
            "value": 0
        },
        "87033190": {
            "type": "free",
            "value": 0
        },
        "87033290": {
            "type": "free",
            "value": 0
        },
        "87033390": {
            "type": "free",
            "value": 0
        },
        "87034090": {
            "type": "free",
            "value": 0
        },
        "87035090": {
            "type": "free",
            "value": 0
        },
        "87036090": {
            "type": "free",
            "value": 0
        },
        "87037090": {
            "type": "free",
            "value": 0
        },
        "87038090": {
            "type": "free",
            "value": 0
        },
        "87039090": {
            "type": "free",
            "value": 0
        }
    },
    "MERCOSUR": {
        "852842": {
            "type": "free",
            "value": 0
        },
        "84713010": {
            "type": "free",
            "value": 0
        },
        "84713090": {
            "type": "free",
            "value": 0
        },
        "85171310": {
            "type": "free",
            "value": 0
        },
        "85171390": {
            "type": "free",
            "value": 0
        },
        "85171410": {
            "type": "free",
            "value": 0
        },
        "85284910": {
            "type": "ad_valorem",
            "value": 0.1
        },
        "85284990": {
            "type": "free",
            "value": 0
        },
        "85285210": {
            "type": "free",
            "value": 0
        },
        "85285290": {
            "type": "ad_valorem",
            "value": 0.1
        },
        "85285990": {
            "type": "ad_valorem",
            "value": 0.1
        },
        "85287110": {
            "type": "ad_valorem",
            "value": 0.06
        },
        "85287220": {
            "type": "ad_valorem",
            "value": 0.1
        },
        "85287290": {
            "type": "ad_valorem",
            "value": 0.1
        },
        "85287320": {
            "type": "ad_valorem",
            "value": 0.1
        },
        "87032190": {
            "type": "ad_valorem",
            "value": 0.25
        },
        "87032290": {
            "type": "ad_valorem",
            "value": 0.25
        },
        "87032390": {
            "type": "ad_valorem",
            "value": 0.25
        },
        "87032490": {
            "type": "ad_valorem",
            "value": 0.25
        },
        "87033190": {
            "type": "ad_valorem",
            "value": 0.25
        },
        "87033290": {
            "type": "ad_valorem",
            "value": 0.25
        },
        "87033390": {
            "type": "ad_valorem",
            "value": 0.25
        },
        "87034090": {
            "type": "ad_valorem",
            "value": 0.1
        },
        "87035090": {
            "type": "ad_valorem",
            "value": 0.1
        },
        "87036090": {
            "type": "ad_valorem",
            "value": 0.1
        },
        "87037090": {
            "type": "ad_valorem",
            "value": 0.1
        },
        "87038090": {
            "type": "ad_valorem",
            "value": 0.1
        },
        "87039090": {
            "type": "ad_valorem",
            "value": 0.25
        }
    }
};

// MFN rates for fallback
export const MFN_RATES: Record<string, PreferenceRateDef> = {
    "852842": {
        "type": "free",
        "value": 0
    },
    "84713010": {
        "type": "free",
        "value": 0
    },
    "84713090": {
        "type": "free",
        "value": 0
    },
    "85171310": {
        "type": "free",
        "value": 0
    },
    "85171390": {
        "type": "free",
        "value": 0
    },
    "85171410": {
        "type": "free",
        "value": 0
    },
    "85284910": {
        "type": "ad_valorem",
        "value": 0.25
    },
    "85284990": {
        "type": "free",
        "value": 0
    },
    "85285210": {
        "type": "free",
        "value": 0
    },
    "85285290": {
        "type": "ad_valorem",
        "value": 0.25
    },
    "85285990": {
        "type": "ad_valorem",
        "value": 0.25
    },
    "85287110": {
        "type": "ad_valorem",
        "value": 0.15
    },
    "85287220": {
        "type": "ad_valorem",
        "value": 0.25
    },
    "85287290": {
        "type": "ad_valorem",
        "value": 0.25
    },
    "85287320": {
        "type": "ad_valorem",
        "value": 0.25
    },
    "87032190": {
        "type": "ad_valorem",
        "value": 0.25
    },
    "87032290": {
        "type": "ad_valorem",
        "value": 0.25
    },
    "87032390": {
        "type": "ad_valorem",
        "value": 0.25
    },
    "87032490": {
        "type": "ad_valorem",
        "value": 0.25
    },
    "87033190": {
        "type": "ad_valorem",
        "value": 0.25
    },
    "87033290": {
        "type": "ad_valorem",
        "value": 0.25
    },
    "87033390": {
        "type": "ad_valorem",
        "value": 0.25
    },
    "87034090": {
        "type": "ad_valorem",
        "value": 0.25
    },
    "87035090": {
        "type": "ad_valorem",
        "value": 0.25
    },
    "87036090": {
        "type": "ad_valorem",
        "value": 0.25
    },
    "87037090": {
        "type": "ad_valorem",
        "value": 0.25
    },
    "87038090": {
        "type": "ad_valorem",
        "value": 0.25
    },
    "87039090": {
        "type": "ad_valorem",
        "value": 0.25
    }
};

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
