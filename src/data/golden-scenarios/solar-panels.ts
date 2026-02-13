import { CalculationInputs, DocChecklistGroup, RiskFlag } from "@/types/pseo";

export interface GoldenScenario {
    id: string;
    label: string;
    description: string;
    inputs: Partial<CalculationInputs>;
    highlightedRisks: string[];
}

// HS 8541.43: Photovoltaic cells assembled in modules or made up into panels
// Duty: Generally 0% (Free) for PV modules. 
// VAT: 15% 
// AD Warning: There are active investigations/duties on solar glass, but panels themselves are often 0%. 
// However, we will flag the "Module vs Cell" classification risk.

export const SOLAR_PANEL_GOLDEN_DATA = {
    hsCode: "8541.43",
    title: "Solar Panels (PV Modules)",
    dutyRate: 0.0, // General rate
    adDutyWarning: "Review specific Anti-Dumping duties for manufacturers not on the exempted list.",

    risks: [
        {
            key: "ad_duty_risk",
            severity: "high",
            title: "Anti-Dumping Duty Risk",
            summary: "Certain solar glass and components from China face Anti-Dumping duties. Ensure your supplier defines the product strictly as 'PV Modules' (8541.43) and not component parts to avoid 10-20% surcharges.",
            recommended_action: "Request a binding tariff ruling or confirmation of manufacturer exemption from ITAC."
        },
        {
            key: "breakage_risk",
            severity: "medium",
            title: "Breakage & Crating",
            summary: "Solar panels are fragile. LCL (Shared Container) shipments have a 15% higher breakage rate than FCL.",
            recommended_action: "Ensure 'Export Crating' is specified in your FOB contract. For LCL, verify pallet stacking limits."
        },
        {
            key: "nrcs_compliance",
            severity: "medium",
            title: "NRCS LOA Requirements",
            summary: "Electrical goods often require an NRCS Letter of Authority (LOA). While panels themselves may be exempt, inverters/batteries in the same shipment are NOT.",
            recommended_action: "Check if your shipment includes regulated accessories (cables, connectors)."
        }
    ] as RiskFlag[],

    checklist: {
        always: [
            { title: "Commercial Invoice", why: "Must state 'Photovoltaic Modules' and HS 8541.43 explicitly." },
            { title: "Packing List", why: "Required for customs clearance." },
            { title: "Bill of Lading", why: "Proof of ownership and shipping terms." }
        ],
        common: [
            { title: "Certificate of Origin", why: "To prove Chinese origin (though no preference applies, it validates the source)." },
            { title: "Flash Test Report", why: "Quality control document showing power output per panel (critical for resale value)." }
        ],
        conditional: [
            { title: "NRCS LOA", why: "If shipment includes inverters or specialized connectors.", trigger: "Includes Accessories" }
        ]
    } as DocChecklistGroup,

    scenarios: [
        {
            id: "air-sample",
            label: "Air Freight (Sample)",
            description: "Fastest way to validate a supplier. High cost/unit, negative margin likely.",
            inputs: {
                quantity: 10,
                invoiceValue: 15000, // ~R1500/panel
                currency: "ZAR", // Simplified for initial view, or use USD
                exchangeRate: 18.50,
                freightCost: 8000, // Expensive air freight
                incoterm: "CIP",
                insuranceCost: 500,
                otherCharges: 0,
                importerType: "VAT_REGISTERED",
                targetSellingPrice: 2500 // R2500 retail
            },
            highlightedRisks: ["Freight cost eats 40% of margin"]
        },
        {
            id: "sea-lcl",
            label: "Sea Freight (LCL - 2 Pallets)",
            description: "Standard market entry order (100 panels). Good balance of risk vs margin.",
            inputs: {
                quantity: 100,
                invoiceValue: 120000, // ~R1200/panel (volume discount)
                currency: "ZAR",
                exchangeRate: 18.50,
                freightCost: 15000, // LCL is cheaper
                incoterm: "FOB",
                insuranceCost: 1200,
                otherCharges: 2500, // Port fees
                importerType: "VAT_REGISTERED",
                targetSellingPrice: 2200
            },
            highlightedRisks: ["Port delays (Durban)", "LCL Breakage Risk"]
        },
        {
            id: "sea-fcl",
            label: "Sea Freight (FCL - 20ft)",
            description: "High volume (800 panels). Maximum margin, lowest landed cost.",
            inputs: {
                quantity: 800,
                invoiceValue: 880000, // ~R1100/panel (bulk price)
                currency: "ZAR",
                exchangeRate: 18.50,
                freightCost: 45000, // 20ft container
                incoterm: "FOB",
                insuranceCost: 4000,
                otherCharges: 15000, // Port & Haulage
                importerType: "VAT_REGISTERED",
                targetSellingPrice: 1950 // Competitive pricing
            },
            highlightedRisks: ["Cashflow lockup (30-40 days)", "Demurrage risk"]
        }
    ] as GoldenScenario[]
};
