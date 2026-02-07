"use server";

import { auth } from "@clerk/nextjs/server";
import { createOrg } from "@/lib/db/services/org.service";
import { revalidatePath } from "next/cache";
import { checkGate } from "@/lib/auth/permissions";

export async function createOrganizationAction(formData: FormData) {
    const { userId } = await auth();
    if (!userId) return { success: false, error: "Unauthorized" };

    const name = formData.get("name") as string;
    if (!name || name.length < 3) {
        return { success: false, error: "Name must be at least 3 characters" };
    }

    // Gating check: Can this user create an org?
    // Note: Free users might be blocked, but for this first org we might allow it 
    // or strictly enforce the PRO rule defined in permissions.ts
    const permission = await checkGate(userId, "create_org");
    if (!permission.allowed) {
        return { success: false, error: permission.reason };
    }

    try {
        await createOrg(userId, name);
        revalidatePath("/workspace/settings/organization");
        return { success: true };
    } catch (error) {
        console.error("Failed to create org:", error);
        return { success: false, error: "Failed to create organization" };
    }
}
