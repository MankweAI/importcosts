import prisma from "@/lib/db/prisma";
import { PlanTier } from "@prisma/client";

export async function createOrg(userId: string, name: string) {
    // Transaction: Create Org, Create Membership (Owner), Create Default Subscription (Free)
    return prisma.$transaction(async (tx) => {
        const org = await tx.org.create({
            data: {
                name,
                memberships: {
                    create: {
                        userId,
                        role: "owner",
                    },
                },
                subscriptions: {
                    create: {
                        tier: PlanTier.FREE,
                        status: "active",
                    },
                },
            },
        });
        return org;
    });
}

export async function getUserOrgs(userId: string) {
    return prisma.org.findMany({
        where: {
            memberships: {
                some: {
                    userId,
                },
            },
        },
        include: {
            memberships: true,
            subscriptions: true,
        },
    });
}

export async function getOrgDetails(orgId: string) {
    return prisma.org.findUnique({
        where: { id: orgId },
        include: {
            memberships: {
                include: {
                    user: true,
                },
            },
            subscriptions: true,
        },
    });
}
