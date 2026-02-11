/**
 * timelineData.ts
 *
 * Provides timeline stages and cashflow events for import shipments.
 * Toggles between Air and Sea freight modes.
 */

export type FreightMode = "Sea" | "Air";

export interface TimelineStage {
    label: string;
    description: string;
    daysOffsetStart: number;
    daysOffsetEnd: number;
    cashflowEvent?: {
        label: string;
        amountLabel: string; // e.g. "30% Deposit"
        isPainPoint: boolean;
    };
}

export interface ImportTimeline {
    totalDays: number;
    stages: TimelineStage[];
}

export function getImportTimeline(mode: FreightMode): ImportTimeline {
    if (mode === "Air") {
        return {
            totalDays: 45, // approx total cycle including production
            stages: [
                {
                    label: "Order & Deposit",
                    description: "Supplier starts production upon receipt of deposit.",
                    daysOffsetStart: 0, daysOffsetEnd: 0,
                    cashflowEvent: { label: "Pay Deposit", amountLabel: "30% of Invoice", isPainPoint: true },
                },
                {
                    label: "Production",
                    description: "Manufacturing lead time (variable).",
                    daysOffsetStart: 1, daysOffsetEnd: 20,
                },
                {
                    label: "Balance Payment",
                    description: "Goods ready. Pay balance to release shipment.",
                    daysOffsetStart: 20, daysOffsetEnd: 20,
                    cashflowEvent: { label: "Pay Balance", amountLabel: "70% of Invoice", isPainPoint: true },
                },
                {
                    label: "Air Freight",
                    description: "Transit from China to OR Tambo / Cape Town.",
                    daysOffsetStart: 21, daysOffsetEnd: 25,
                },
                {
                    label: "Customs Clearance",
                    description: "Goods arrive. Duty & VAT must be paid to release.",
                    daysOffsetStart: 25, daysOffsetEnd: 27,
                    cashflowEvent: { label: "Pay SARS", amountLabel: "Duty + VAT", isPainPoint: true },
                },
                {
                    label: "Local Delivery",
                    description: "Courier to your door.",
                    daysOffsetStart: 28, daysOffsetEnd: 30,
                },
            ],
        };
    } else {
        // Sea Freight
        return {
            totalDays: 90,
            stages: [
                {
                    label: "Order & Deposit",
                    description: "Supplier starts production.",
                    daysOffsetStart: 0, daysOffsetEnd: 0,
                    cashflowEvent: { label: "Pay Deposit", amountLabel: "30% of Invoice", isPainPoint: true },
                },
                {
                    label: "Production",
                    description: "Manufacturing lead time.",
                    daysOffsetStart: 1, daysOffsetEnd: 30,
                },
                {
                    label: "Balance Payment",
                    description: "Goods ready. Pay balance to release Bill of Lading.",
                    daysOffsetStart: 30, daysOffsetEnd: 30,
                    cashflowEvent: { label: "Pay Balance", amountLabel: "70% of Invoice", isPainPoint: true },
                },
                {
                    label: "Sea Freight",
                    description: "Sailing from Shekou/Shanghai to Durban.",
                    daysOffsetStart: 31, daysOffsetEnd: 65,
                },
                {
                    label: "Customs Clearance",
                    description: "Vessel arrival & container discharge. Duty & VAT due.",
                    daysOffsetStart: 66, daysOffsetEnd: 72,
                    cashflowEvent: { label: "Pay SARS", amountLabel: "Duty + VAT", isPainPoint: true },
                },
                {
                    label: "Local Delivery",
                    description: "Road freight from port to warehouse.",
                    daysOffsetStart: 73, daysOffsetEnd: 78,
                },
            ],
        };
    }
}
