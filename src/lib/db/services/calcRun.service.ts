/**
 * CalcRun Service
 * CRUD operations for calculation runs
 */

import prisma from "../prisma";
import type { CalcRun, ConfidenceLabel, Prisma } from "@prisma/client";

export type CreateCalcRunInput = {
    userId?: string;
    orgId?: string;
    tariffVersionId: string;
    inputs: Prisma.InputJsonValue;
    outputs: Prisma.InputJsonValue;
    confidence?: ConfidenceLabel;
    explain?: Prisma.InputJsonValue;
};

export async function createCalcRun(data: CreateCalcRunInput): Promise<CalcRun> {
    return prisma.calcRun.create({
        data: {
            userId: data.userId,
            orgId: data.orgId,
            tariffVersionId: data.tariffVersionId,
            inputs: data.inputs,
            outputs: data.outputs,
            confidence: data.confidence ?? "MEDIUM",
            explain: data.explain,
        },
    });
}

export async function getCalcRunById(id: string): Promise<CalcRun | null> {
    return prisma.calcRun.findUnique({
        where: { id },
        include: { tariffVersion: true },
    });
}

export async function getCalcRunsForUser(
    userId: string,
    limit = 50
): Promise<CalcRun[]> {
    return prisma.calcRun.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        take: limit,
        include: { tariffVersion: true },
    });
}

export async function getCalcRunsForOrg(
    orgId: string,
    limit = 100
): Promise<CalcRun[]> {
    return prisma.calcRun.findMany({
        where: { orgId },
        orderBy: { createdAt: "desc" },
        take: limit,
        include: { tariffVersion: true, user: true },
    });
}

export async function getRecentCalcRuns(limit = 100): Promise<CalcRun[]> {
    return prisma.calcRun.findMany({
        orderBy: { createdAt: "desc" },
        take: limit,
        include: { tariffVersion: true },
    });
}

export async function countCalcRunsByVersion(
    tariffVersionId: string
): Promise<number> {
    return prisma.calcRun.count({
        where: { tariffVersionId },
    });
}
