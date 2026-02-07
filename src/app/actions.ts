"use server";

import { auth, currentUser } from "@clerk/nextjs/server";
import { createCalcRun } from "@/lib/db/services/calcRun.service";
import { CalcInput, CalcOutput } from "@/lib/calc/types";
import { revalidatePath } from "next/cache";
import prisma from "@/lib/db/prisma";
import { checkGate } from "@/lib/auth/permissions";

export async function saveCalculation(input: CalcInput, result: CalcOutput) {
    const { userId } = await auth();

    if (!userId) {
        return { success: false, error: "Authentication required" };
    }

    // Check Limits
    const permission = await checkGate(userId, "create_calc_run");
    if (!permission.allowed) {
        return { success: false, error: permission.reason || "Limit reached" };
    }

    try {
        // Sync Clerk user to DB (upsert)
        const clerkUser = await currentUser();
        if (clerkUser) {
            await prisma.user.upsert({
                where: { id: userId },
                update: {
                    email: clerkUser.emailAddresses[0]?.emailAddress || "",
                    name: clerkUser.firstName || clerkUser.username || null,
                    image: clerkUser.imageUrl || null,
                },
                create: {
                    id: userId,
                    email: clerkUser.emailAddresses[0]?.emailAddress || "",
                    name: clerkUser.firstName || clerkUser.username || null,
                    image: clerkUser.imageUrl || null,
                },
            });
        }

        await createCalcRun({
            userId,
            tariffVersionId: result.tariffVersionId,
            inputs: input as any,
            outputs: result as any,
            confidence: result.confidence,
            explain: { auditTrace: result.auditTrace } as any,
        });

        revalidatePath("/");
        return { success: true };
    } catch (error) {
        console.error("Failed to save calculation:", error);
        return { success: false, error: "Failed to save to workspace" };
    }
}

