/**
 * Tariff Service
 * CRUD operations for tariff versions and rates
 */

import prisma from "../prisma";
import type { TariffVersion, TariffRate, DutyType, Prisma } from "@prisma/client";


export type CreateTariffVersionInput = {
    label: string;
    effectiveFrom: Date;
    publishedAt?: Date;
    isActive?: boolean;
    notes?: string;
};

export async function createTariffVersion(
    data: CreateTariffVersionInput
): Promise<TariffVersion> {
    return prisma.tariffVersion.create({ data });
}

export async function getActiveTariffVersion(): Promise<TariffVersion | null> {
    return prisma.tariffVersion.findFirst({
        where: { isActive: true },
        orderBy: { effectiveFrom: "desc" },
    });
}

export async function getTariffVersionById(id: string): Promise<TariffVersion | null> {
    return prisma.tariffVersion.findUnique({ where: { id } });
}

export async function getTariffVersionByLabel(label: string): Promise<TariffVersion | null> {
    return prisma.tariffVersion.findUnique({ where: { label } });
}

export async function setActiveTariffVersion(id: string): Promise<TariffVersion> {
    // Deactivate all other versions
    await prisma.tariffVersion.updateMany({
        where: { isActive: true },
        data: { isActive: false },
    });

    // Activate the specified version
    return prisma.tariffVersion.update({
        where: { id },
        data: { isActive: true },
    });
}

export async function getAllTariffVersions(): Promise<TariffVersion[]> {
    return prisma.tariffVersion.findMany({
        orderBy: { effectiveFrom: "desc" },
    });
}

export type CreateTariffRateInput = {
    tariffVersionId: string;
    hsCodeId: string;
    dutyType: DutyType;
    adValoremPct?: Prisma.Decimal | number;
    specificRule?: Prisma.InputJsonValue;
    compoundRule?: Prisma.InputJsonValue;
    hasVatSpecialHandling?: boolean;
    notes?: string;
};

export async function addTariffRate(data: CreateTariffRateInput): Promise<TariffRate> {
    return prisma.tariffRate.create({ data });
}

export async function getTariffRateForHs(
    tariffVersionId: string,
    hsCodeId: string
): Promise<TariffRate | null> {
    return prisma.tariffRate.findFirst({
        where: { tariffVersionId, hsCodeId },
    });
}

export async function getTariffRateByHs6(
    tariffVersionId: string,
    hs6: string
): Promise<TariffRate | null> {
    const hsCode = await prisma.hsCode.findUnique({ where: { hs6 } });
    if (!hsCode) return null;

    return prisma.tariffRate.findFirst({
        where: { tariffVersionId, hsCodeId: hsCode.id },
        include: { hsCode: true, tariffVersion: true },
    });
}

export async function getRatesForVersion(tariffVersionId: string): Promise<TariffRate[]> {
    return prisma.tariffRate.findMany({
        where: { tariffVersionId },
        include: { hsCode: true },
        orderBy: { hsCode: { hs6: "asc" } },
    });
}
