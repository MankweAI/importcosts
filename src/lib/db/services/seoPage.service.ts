/**
 * SEO Page Service
 * CRUD operations for SEO money pages
 */

import prisma from "../prisma";
import type { SeoPage, PageType, IndexStatus } from "@prisma/client";

export type CreatePageInput = {
    slug: string;
    pageType: PageType;
    indexStatus?: IndexStatus;
    canonicalSlug?: string;
    productClusterId?: string;
    hsCodeId?: string;
    originIso2: string;
    destIso2: string;
    readinessScore?: number;
};

export async function createPage(data: CreatePageInput): Promise<SeoPage> {
    return prisma.seoPage.create({
        data: {
            slug: data.slug,
            pageType: data.pageType,
            indexStatus: data.indexStatus ?? "BLOCKED_MISSING_DATA",
            canonicalSlug: data.canonicalSlug,
            productClusterId: data.productClusterId,
            hsCodeId: data.hsCodeId,
            originIso2: data.originIso2,
            destIso2: data.destIso2,
            readinessScore: data.readinessScore ?? 0,
        },
    });
}

export async function upsertPage(data: CreatePageInput): Promise<SeoPage> {
    return prisma.seoPage.upsert({
        where: { slug: data.slug },
        update: {
            pageType: data.pageType,
            indexStatus: data.indexStatus,
            canonicalSlug: data.canonicalSlug,
            productClusterId: data.productClusterId,
            hsCodeId: data.hsCodeId,
            originIso2: data.originIso2,
            destIso2: data.destIso2,
            readinessScore: data.readinessScore,
        },
        create: {
            slug: data.slug,
            pageType: data.pageType,
            indexStatus: data.indexStatus ?? "BLOCKED_MISSING_DATA",
            canonicalSlug: data.canonicalSlug,
            productClusterId: data.productClusterId,
            hsCodeId: data.hsCodeId,
            originIso2: data.originIso2,
            destIso2: data.destIso2,
            readinessScore: data.readinessScore ?? 0,
        },
    });
}

export async function getPageBySlug(slug: string) {
    const page = await prisma.seoPage.findUnique({
        where: { slug },
        include: {
            productCluster: true,
            hsCode: true,
            origin: true,
            dest: true,
        },
    });

    if (page) return page;

    // Fallback: Try lowercase slug (e.g. if URL has /CN/ but DB has /cn/)
    const lowerSlug = slug.toLowerCase();
    if (lowerSlug !== slug) {
        return prisma.seoPage.findUnique({
            where: { slug: lowerSlug },
            include: {
                productCluster: true,
                hsCode: true,
                origin: true,
                dest: true,
            },
        });
    }

    return null;
}

export async function getPageById(id: string): Promise<SeoPage | null> {
    return prisma.seoPage.findUnique({ where: { id } });
}

export async function getIndexablePages(): Promise<SeoPage[]> {
    return prisma.seoPage.findMany({
        where: { indexStatus: "INDEX" },
        orderBy: { slug: "asc" },
    });
}

export async function getPagesByStatus(status: IndexStatus): Promise<SeoPage[]> {
    return prisma.seoPage.findMany({
        where: { indexStatus: status },
        orderBy: { slug: "asc" },
    });
}

export async function updateReadinessScore(
    pageId: string,
    score: number
): Promise<SeoPage> {
    return prisma.seoPage.update({
        where: { id: pageId },
        data: { readinessScore: score },
    });
}

export async function setIndexStatus(
    pageId: string,
    status: IndexStatus
): Promise<SeoPage> {
    return prisma.seoPage.update({
        where: { id: pageId },
        data: { indexStatus: status },
    });
}

export async function markPageBuilt(pageId: string): Promise<SeoPage> {
    return prisma.seoPage.update({
        where: { id: pageId },
        data: { lastBuiltAt: new Date() },
    });
}

export async function getPagesByCluster(clusterId: string): Promise<SeoPage[]> {
    return prisma.seoPage.findMany({
        where: { productClusterId: clusterId },
        orderBy: { slug: "asc" },
    });
}

export async function getPagesByOrigin(originIso2: string): Promise<SeoPage[]> {
    return prisma.seoPage.findMany({
        where: { originIso2 },
        orderBy: { slug: "asc" },
    });
}

export async function countPagesByStatus(): Promise<Record<string, number>> {
    const counts = await prisma.seoPage.groupBy({
        by: ["indexStatus"],
        _count: { id: true },
    });
    return counts.reduce((acc, curr) => {
        acc[curr.indexStatus] = curr._count.id;
        return acc;
    }, {} as Record<string, number>);
}

export async function getPageByClusterAndRoute(
    clusterSlug: string,
    originIso: string,
    destIso: string
) {
    // 1. Find Cluster ID
    const cluster = await prisma.productCluster.findUnique({
        where: { slug: clusterSlug },
        select: { id: true }
    });

    if (!cluster) return null;

    // 2. Find Page by logical keys
    return prisma.seoPage.findFirst({
        where: {
            productClusterId: cluster.id,
            originIso2: originIso.toUpperCase(),
            destIso2: destIso.toUpperCase(),
            pageType: "CLUSTER_ORIGIN_DEST"
        },
        include: {
            productCluster: true,
            hsCode: true,
            origin: true,
            dest: true,
        },
    });
}
