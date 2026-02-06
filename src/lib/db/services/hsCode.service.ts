/**
 * HS Code Service
 * CRUD operations for HS codes and synonyms
 */

import prisma from "../prisma";
import type { HsCode, HsSynonym } from "@prisma/client";

export type CreateHsCodeInput = {
    hs6: string;
    title: string;
    description?: string;
    tags?: string[];
};

export async function createHsCode(data: CreateHsCodeInput): Promise<HsCode> {
    return prisma.hsCode.create({
        data: {
            hs6: data.hs6,
            title: data.title,
            description: data.description,
            tags: data.tags ?? [],
        },
    });
}

export async function upsertHsCode(data: CreateHsCodeInput): Promise<HsCode> {
    return prisma.hsCode.upsert({
        where: { hs6: data.hs6 },
        update: {
            title: data.title,
            description: data.description,
            tags: data.tags ?? [],
        },
        create: {
            hs6: data.hs6,
            title: data.title,
            description: data.description,
            tags: data.tags ?? [],
        },
    });
}

export async function getHsCodeByHs6(hs6: string): Promise<HsCode | null> {
    return prisma.hsCode.findUnique({ where: { hs6 } });
}

export async function getHsCodeById(id: string): Promise<HsCode | null> {
    return prisma.hsCode.findUnique({ where: { id } });
}

export async function searchHsCodes(query: string, limit = 10) {
    return prisma.hsCode.findMany({
        where: {
            OR: [
                { hs6: { startsWith: query } },
                { title: { contains: query, mode: "insensitive" } },
                { description: { contains: query, mode: "insensitive" } },
                { synonyms: { some: { term: { contains: query, mode: "insensitive" } } } },
            ],
        },
        include: { synonyms: true },
        take: limit,
    });
}

export async function addSynonym(
    hsCodeId: string,
    term: string,
    weight = 1
): Promise<HsSynonym> {
    return prisma.hsSynonym.create({
        data: { hsCodeId, term, weight },
    });
}

export async function getSynonymsForHsCode(hsCodeId: string): Promise<HsSynonym[]> {
    return prisma.hsSynonym.findMany({
        where: { hsCodeId },
        orderBy: { weight: "desc" },
    });
}

export async function getHsCodeWithRelations(hs6: string) {
    return prisma.hsCode.findUnique({
        where: { hs6 },
        include: {
            synonyms: true,
            rates: { include: { tariffVersion: true } },
            docs: true,
            risks: true,
            clusterMaps: { include: { productCluster: true } },
        },
    });
}
