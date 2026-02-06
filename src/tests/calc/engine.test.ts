import "dotenv/config"; // Ensure env vars are loaded
import { calculateLandedCost } from "../../lib/calc/landedCost";
import { prisma } from "../../lib/db/prisma";
import { getActiveTariffVersion } from "../../lib/db/services/tariff.service";

// Ensure we close DB connection after tests
afterAll(async () => {
    await prisma.$disconnect();
});

describe("Calculation Engine Integration", () => {

    // Debug step to verify environment
    test("Environment Verification", async () => {
        const active = await getActiveTariffVersion();
        console.log("Active Tariff Version in Test:", active?.label || "NONE");
        console.log("DB URL (masked):", process.env.DATABASE_URL ? "DEFINED" : "UNDEFINED");

        // If NONE, we might need to set one active manually for the test if the DB was reset (unlikely but possible)
        // Or if the test DB is distinct from dev DB.
        expect(active).not.toBeNull();
    });

    // Scenario 1: Solar Panels (Ad Valorem 10% in V1)
    // HS: 854143
    // Value: R10,000
    test("Calculates correct duties for Solar Panels (Ad Valorem)", async () => {
        const input = {
            hsCode: "854143",
            customsValue: 10000,
            quantity: 1,
            incoterm: "CIF" as const
        };

        const result = await calculateLandedCost(input);

        expect(result.tariffVersionLabel).toContain("MVP-2026-02");
        expect(result.landedCostTotal).toBeCloseTo(12800, 2);

        const duty = result.breakdown.find(i => i.id === "duty");
        expect(duty).toBeDefined();
        expect(duty?.amount).toBeCloseTo(1000, 2);
        expect(duty?.rateApplied).toBe("10%");

        const vat = result.breakdown.find(i => i.id === "vat");
        expect(vat).toBeDefined();
        expect(vat?.amount).toBeCloseTo(1800, 2);
    });

    // Scenario 2: Beer (Specific Rate R0.50 / litre in V1)
    // HS: 220300
    // Value: R1000
    // Volume: 1000 litres
    test("Calculates correct duties for Beer (Specific Rate)", async () => {
        const input = {
            hsCode: "220300",
            customsValue: 1000,
            volumeLitres: 1000,
            quantity: 100,
            incoterm: "CIF" as const
        };

        const result = await calculateLandedCost(input);

        expect(result.tariffVersionLabel).toContain("MVP-2026-02");
        expect(result.landedCostTotal).toBeCloseTo(1740, 2);

        const duty = result.breakdown.find(i => i.id === "duty");
        expect(duty).toBeDefined();
        expect(duty?.amount).toBeCloseTo(500, 2);

        const vat = result.breakdown.find(i => i.id === "vat");
        expect(vat).toBeDefined();
        expect(vat?.amount).toBeCloseTo(240, 2);
    });
});
