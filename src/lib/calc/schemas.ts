import { z } from "zod";

export const CalcInputSchema = z.object({
    hsCode: z.string().regex(/^\d{6}$/, "HS Code must be 6 digits"),
    customsValue: z.number().positive("Customs value must be positive"),
    quantity: z.number().int().positive().optional(),
    volumeLitres: z.number().positive().optional(),
    weightKg: z.number().positive().optional(),
    incoterm: z.enum(["FOB", "CIF", "EXW"]).default("CIF"),
    freightInsuranceCost: z.number().min(0).optional(),
});
