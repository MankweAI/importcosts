import { z } from "zod";

export const CalcInputSchema = z.object({
    hsCode: z.string().regex(/^\d{6}$/, "HS Code must be 6 digits"),
    customsValue: z.number().positive("Customs value must be positive"),
    originCountry: z.string().min(2).max(56).optional(),
    destinationCountry: z.string().min(2).max(56).optional(),
    importerType: z.enum(["VAT_REGISTERED", "NON_VENDOR"]).optional(),
    invoiceValue: z.number().positive().optional(),
    currency: z.string().min(3).max(10).optional(),
    exchangeRate: z.number().positive().optional(),
    freightCost: z.number().min(0).optional(),
    insuranceCost: z.number().min(0).optional(),
    otherCharges: z.number().min(0).optional(),
    quantity: z.number().int().positive().optional(),
    volumeLitres: z.number().positive().optional(),
    weightKg: z.number().positive().optional(),
    incoterm: z.enum(["FOB", "CIF", "EXW"]).default("CIF"),
    freightInsuranceCost: z.number().min(0).optional(),
});
