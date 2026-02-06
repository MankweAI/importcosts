/**
 * importcosts (www.importcosts.co.za) - Prisma seed skeleton
 *
 * Usage examples:
 *   1) ts-node prisma/seed/seed.ts
 *   2) node --loader ts-node/esm prisma/seed/seed.ts
 *
 * Requirements:
 *   - prisma generate
 *   - DATABASE_URL set
 *
 * This script seeds:
 *   - Country (ZA + origin countries used in money pages)
 *   - ProductCluster (20 clusters)
 *   - SeoPage (first 200 money pages) set to NOINDEX by default
 *
 * NOTE:
 *   - TariffVersion, TariffRate, HS mappings, docs/risks should be seeded separately
 *     once you have your structured tariff dataset.
 */

import { PrismaClient, PageType, IndexStatus } from "@prisma/client";
import fs from "node:fs";
import path from "node:path";

type CountrySeed = {
  iso2: string;
  name: string;
  iso3?: string;
  region?: string;
};

type ClusterSeed = {
  slug: string;
  name: string;
  description?: string;
};

type PageSeed = {
  slug: string;
  pageType: "CLUSTER_ORIGIN_DEST" | "HS_ORIGIN_DEST" | "HS_HUB" | "DIRECTORY";
  indexStatus: "INDEX" | "NOINDEX" | "CANONICAL_TO_OTHER" | "BLOCKED_MISSING_DATA";
  canonicalSlug?: string | null;
  readinessScore?: number;
  clusterSlug: string;
  originIso2: string;
  destIso2: string;
};

const prisma = new PrismaClient();

function readJson<T>(relPath: string): T {
  const p = path.join(process.cwd(), relPath);
  const raw = fs.readFileSync(p, "utf-8");
  return JSON.parse(raw) as T;
}

async function upsertCountries(countries: CountrySeed[]) {
  for (const c of countries) {
    await prisma.country.upsert({
      where: { iso2: c.iso2 },
      create: {
        iso2: c.iso2,
        iso3: c.iso3 ?? undefined,
        name: c.name,
        region: c.region ?? undefined,
      },
      update: {
        iso3: c.iso3 ?? undefined,
        name: c.name,
        region: c.region ?? undefined,
      },
    });
  }
}

async function upsertClusters(clusters: ClusterSeed[]) {
  for (const cl of clusters) {
    await prisma.productCluster.upsert({
      where: { slug: cl.slug },
      create: {
        slug: cl.slug,
        name: cl.name,
        description: cl.description ?? undefined,
      },
      update: {
        name: cl.name,
        description: cl.description ?? undefined,
      },
    });
  }
}

async function upsertSeoPages(pages: PageSeed[]) {
  // Resolve dest exists
  // (We assume ZA exists; if not, upsertCountries should have created it.)
  for (const p of pages) {
    const cluster = await prisma.productCluster.findUnique({
      where: { slug: p.clusterSlug },
      select: { id: true },
    });
    if (!cluster) {
      throw new Error(`Missing ProductCluster for slug: ${p.clusterSlug}`);
    }

    // Guard: countries must exist (upsertCountries first)
    const origin = await prisma.country.findUnique({
      where: { iso2: p.originIso2 },
      select: { iso2: true },
    });
    if (!origin) {
      throw new Error(`Missing origin Country iso2: ${p.originIso2}`);
    }
    const dest = await prisma.country.findUnique({
      where: { iso2: p.destIso2 },
      select: { iso2: true },
    });
    if (!dest) {
      throw new Error(`Missing dest Country iso2: ${p.destIso2}`);
    }

    await prisma.seoPage.upsert({
      where: { slug: p.slug },
      create: {
        slug: p.slug,
        pageType: PageType.CLUSTER_ORIGIN_DEST,
        indexStatus: IndexStatus.NOINDEX,
        canonicalSlug: p.canonicalSlug ?? null,
        readinessScore: p.readinessScore ?? 0,
        productClusterId: cluster.id,
        originIso2: p.originIso2,
        destIso2: p.destIso2,
      },
      update: {
        // Keep SEO safe by default; your PageBuild job should promote to INDEX later.
        pageType: PageType.CLUSTER_ORIGIN_DEST,
        indexStatus: IndexStatus.NOINDEX,
        canonicalSlug: p.canonicalSlug ?? null,
        readinessScore: p.readinessScore ?? 0,
        productClusterId: cluster.id,
        originIso2: p.originIso2,
        destIso2: p.destIso2,
      },
    });
  }
}

async function main() {
  // Paths are relative to repo root
  const countries = readJson<CountrySeed[]>("prisma/seed/origins_seed.json");
  const clusters = readJson<ClusterSeed[]>("prisma/seed/product_clusters_seed.json");
  const pages = readJson<PageSeed[]>("pages_seed.json"); // generated seed file

  console.log(`Seeding countries: ${countries.length}`);
  await upsertCountries(countries);

  console.log(`Seeding clusters: ${clusters.length}`);
  await upsertClusters(clusters);

  console.log(`Seeding SEO pages: ${pages.length}`);
  await upsertSeoPages(pages);

  console.log("Done. NOTE: Pages are NOINDEX by default. Run your PageBuild job to compute readiness & promote to INDEX.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
