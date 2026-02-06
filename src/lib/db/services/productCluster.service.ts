/**
 * Product Cluster Service
 * CRUD operations for product clusters and HS code mappings
 */

import prisma from "../prisma";
import type { ProductCluster, ProductClusterHsMap } from "@prisma/client";

export type CreateClusterInput = {
    slug: string;
    name: string;
    description?: string;
};

export async function createCluster(data: CreateClusterInput): Promise<ProductCluster> {
    return prisma.productCluster.create({ data });
}

export async function upsertCluster(data: CreateClusterInput): Promise<ProductCluster> {
    return prisma.productCluster.upsert({
        where: { slug: data.slug },
        update: { name: data.name, description: data.description },
        create: data,
    });
}

export async function getClusterBySlug(slug: string): Promise<ProductCluster | null> {
    return prisma.productCluster.findUnique({ where: { slug } });
}

export async function getClusterById(id: string): Promise<ProductCluster | null> {
    return prisma.productCluster.findUnique({ where: { id } });
}

export async function getAllClusters(): Promise<ProductCluster[]> {
    return prisma.productCluster.findMany({ orderBy: { name: "asc" } });
}

export async function getClusterWithHsCodes(slug: string) {
    return prisma.productCluster.findUnique({
        where: { slug },
        include: {
            hsMaps: {
                include: { hsCode: true },
                orderBy: { confidence: "desc" },
            },
        },
    });
}

export type MapHsInput = {
    productClusterId: string;
    hsCodeId: string;
    confidence?: number;
    notes?: string;
};

export async function mapHsToCluster(data: MapHsInput): Promise<ProductClusterHsMap> {
    return prisma.productClusterHsMap.upsert({
        where: {
            productClusterId_hsCodeId: {
                productClusterId: data.productClusterId,
                hsCodeId: data.hsCodeId,
            },
        },
        update: { confidence: data.confidence ?? 50, notes: data.notes },
        create: {
            productClusterId: data.productClusterId,
            hsCodeId: data.hsCodeId,
            confidence: data.confidence ?? 50,
            notes: data.notes,
        },
    });
}

export async function getHsCodesForCluster(clusterId: string) {
    return prisma.productClusterHsMap.findMany({
        where: { productClusterId: clusterId },
        include: { hsCode: true },
        orderBy: { confidence: "desc" },
    });
}
