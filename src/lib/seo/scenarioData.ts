/**
 * scenarioData.ts
 *
 * Generates pre-computed example scenarios for pSEO pages.
 * Each scenario shows a different volume / incoterm / freight mode
 * combination with pre-calculated landed cost and margin.
 */

export interface ExampleScenario {
    label: string;
    quantity: number;
    unitPrice: number;          // ZAR
    freightPerUnit: number;     // ZAR
    freightMode: "Sea" | "Air";
    incoterm: "FOB" | "CIF" | "EXW";
    dutyPct: number;
    landedCostPerUnit: number;  // ZAR
    sellingPrice: number;       // ZAR
    marginPct: number;
    verdict: "GO" | "CAUTION" | "NOGO";
}

/**
 * Generate 3 product-level scenarios for a cluster page.
 * Uses the duty rate from the HS lookup and applies realistic
 * freight estimates.
 */
export function generateProductScenarios(
    productName: string,
    dutyPct: number = 20,
    baseUnitPriceZar: number = 10000,
): ExampleScenario[] {
    const vatPct = 15;
    const sellingMarkup = 1.45; // 45% markup target

    // Scenario A: Small qty via Sea
    const qtyA = 100;
    const freightA = 250; // per unit, sea
    const cifA = baseUnitPriceZar + freightA;
    const dutyA = cifA * (dutyPct / 100);
    const vatA = (cifA + dutyA) * (vatPct / 100);
    const landedA = cifA + dutyA + vatA;
    const sellA = Math.round(baseUnitPriceZar * sellingMarkup);
    const marginA = ((sellA - landedA) / sellA) * 100;

    // Scenario B: Bulk via Sea (lower freight per unit)
    const qtyB = 1000;
    const freightB = 80; // economies of scale
    const cifB = baseUnitPriceZar + freightB;
    const dutyB = cifB * (dutyPct / 100);
    const vatB = (cifB + dutyB) * (vatPct / 100);
    const landedB = cifB + dutyB + vatB;
    const sellB = sellA; // same selling price
    const marginB = ((sellB - landedB) / sellB) * 100;

    // Scenario C: Bulk via Air (higher freight)
    const qtyC = 1000;
    const freightC = 600; // air premium
    const cifC = baseUnitPriceZar + freightC;
    const dutyC = cifC * (dutyPct / 100);
    const vatC = (cifC + dutyC) * (vatPct / 100);
    const landedC = cifC + dutyC + vatC;
    const sellC = sellA;
    const marginC = ((sellC - landedC) / sellC) * 100;

    const toVerdict = (m: number): "GO" | "CAUTION" | "NOGO" =>
        m >= 25 ? "GO" : m >= 12 ? "CAUTION" : "NOGO";

    return [
        {
            label: `${qtyA} units via Sea (FOB)`,
            quantity: qtyA, unitPrice: baseUnitPriceZar, freightPerUnit: freightA,
            freightMode: "Sea", incoterm: "FOB", dutyPct,
            landedCostPerUnit: Math.round(landedA),
            sellingPrice: sellA, marginPct: Math.round(marginA * 10) / 10,
            verdict: toVerdict(marginA),
        },
        {
            label: `${qtyB.toLocaleString()} units via Sea (FOB)`,
            quantity: qtyB, unitPrice: baseUnitPriceZar, freightPerUnit: freightB,
            freightMode: "Sea", incoterm: "FOB", dutyPct,
            landedCostPerUnit: Math.round(landedB),
            sellingPrice: sellB, marginPct: Math.round(marginB * 10) / 10,
            verdict: toVerdict(marginB),
        },
        {
            label: `${qtyC.toLocaleString()} units via Air (FOB)`,
            quantity: qtyC, unitPrice: baseUnitPriceZar, freightPerUnit: freightC,
            freightMode: "Air", incoterm: "FOB", dutyPct,
            landedCostPerUnit: Math.round(landedC),
            sellingPrice: sellC, marginPct: Math.round(marginC * 10) / 10,
            verdict: toVerdict(marginC),
        },
    ];
}

/**
 * Generate 3 HS-code-level scenarios for an HS page.
 * Varies invoice value and shows impact of similar HS codes.
 */
export function generateHsScenarios(
    hs6: string,
    dutyPct: number = 20,
    baseValueZar: number = 5000,
): ExampleScenario[] {
    const vatPct = 15;
    const freight = 150; // flat per-unit estimate
    const sell = Math.round(baseValueZar * 1.5);

    const compute = (val: number, duty: number) => {
        const cif = val + freight;
        const dutyAmt = cif * (duty / 100);
        const vat = (cif + dutyAmt) * (vatPct / 100);
        const landed = cif + dutyAmt + vat;
        const margin = ((sell - landed) / sell) * 100;
        return { landed: Math.round(landed), margin: Math.round(margin * 10) / 10 };
    };

    const a = compute(baseValueZar, dutyPct);
    const b = compute(baseValueZar * 1.5, dutyPct);
    const c = compute(baseValueZar, Math.max(0, dutyPct - 10)); // lower duty alt

    const toVerdict = (m: number): "GO" | "CAUTION" | "NOGO" =>
        m >= 25 ? "GO" : m >= 12 ? "CAUTION" : "NOGO";

    return [
        {
            label: `HS ${hs6} @ R${baseValueZar.toLocaleString()}`,
            quantity: 1, unitPrice: baseValueZar, freightPerUnit: freight,
            freightMode: "Sea", incoterm: "FOB", dutyPct,
            landedCostPerUnit: a.landed, sellingPrice: sell,
            marginPct: a.margin, verdict: toVerdict(a.margin),
        },
        {
            label: `HS ${hs6} @ R${(baseValueZar * 1.5).toLocaleString()} (+50%)`,
            quantity: 1, unitPrice: baseValueZar * 1.5, freightPerUnit: freight,
            freightMode: "Sea", incoterm: "FOB", dutyPct,
            landedCostPerUnit: b.landed, sellingPrice: sell,
            marginPct: b.margin, verdict: toVerdict(b.margin),
        },
        {
            label: `Alt. code @ ${Math.max(0, dutyPct - 10)}% duty`,
            quantity: 1, unitPrice: baseValueZar, freightPerUnit: freight,
            freightMode: "Sea", incoterm: "FOB", dutyPct: Math.max(0, dutyPct - 10),
            landedCostPerUnit: c.landed, sellingPrice: sell,
            marginPct: c.margin, verdict: toVerdict(c.margin),
        },
    ];
}
