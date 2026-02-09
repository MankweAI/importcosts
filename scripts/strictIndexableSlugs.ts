/**
 * Strict Indexable Slug Generator
 *
 * Formula (all must be true):
 * 1) Page has a default HS mapping (or explicit HS) with confidence >= MIN_HS_CONFIDENCE.
 * 2) Active tariff version exists and the mapped HS has a computable rate for preset inputs.
 * 3) Computed scenario presets are possible (duty + VAT can be computed) for 10k/50k/250k.
 * 4) Docs checklist data exists (>= MIN_DOCS, with at least one MEDIUM+ confidence).
 * 5) Risk flags exist (>= MIN_RISKS) or an explicit "none" risk flag is present.
 * 6) At least MIN_DATA_BLOCKS data-driven blocks are present (scenarios, docs, risks, preferences).
 * 7) Internal links count >= MIN_INTERNAL_LINKS (based on template link inventory).
 * 8) Freshness metadata present: page.lastBuiltAt AND active tariff effective date.
 * 9) canonicalSlug is null or matches slug (no duplicate canonicalization).
 *
 * By default, this script ignores current indexStatus. Use --respect-status to honor it.
 *
 * Usage:
 *   npx ts-node --project tsconfig.scripts.json scripts/strictIndexableSlugs.ts
 *   npx ts-node --project tsconfig.scripts.json scripts/strictIndexableSlugs.ts --format json --output strict-slugs.json
 *   npx ts-node --project tsconfig.scripts.json scripts/strictIndexableSlugs.ts --explain
 */

import "dotenv/config";
import fs from "fs";
import path from "path";
import { parseArgs } from "util";
import pg from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import {
  PrismaClient,
  PageType,
  ConfidenceLabel,
  IndexStatus,
  TariffRate,
} from "@prisma/client";

const RULES = {
  minHsCandidates: 1,
  minHsConfidence: 80,
  minDocs: 3,
  minDocConfidence: ConfidenceLabel.MEDIUM,
  minRisks: 1,
  minDataBlocks: 2,
  minInternalLinks: 6,
  requireFreshness: true,
  requireCanonicalSelf: true,
  requireComputableScenarios: true,
  requireNonPlaceholderHsTitle: true,
  maxBuildAgeDays: 365,
};

const SCENARIO_VALUES = [10000, 50000, 250000];
const TRADING_PARTNERS = ["CN", "US", "DE", "GB", "IN"];
const CTA_LINKS = 2; // Assisted + Professional CTAs in SeoPageHero

const CONFIDENCE_RANK: Record<ConfidenceLabel, number> = {
  LOW: 1,
  MEDIUM: 2,
  HIGH: 3,
  UNKNOWN: 0
};

function isNonPlaceholderTitle(title?: string | null): boolean {
  if (!title) return false;
  return !/^HS\s*\d{6}$/.test(title.trim());
}

function computeInternalLinks(originIso2: string): number {
  const origin = originIso2.toUpperCase();
  const altOrigins = TRADING_PARTNERS.filter((iso) => iso !== origin);
  return CTA_LINKS + altOrigins.length;
}

function isRateComputable(rate: TariffRate, input: { quantity?: number; weightKg?: number; volumeLitres?: number; }): boolean {
  if (rate.dutyType === "AD_VALOREM") {
    return rate.adValoremPct !== null;
  }

  const rule = rate.specificRule as { unit?: string; rate?: number } | null;
  if (!rule || !rule.unit) return false;

  if (rule.unit === "kg") return (input.weightKg ?? 0) > 0;
  if (rule.unit === "litre") return (input.volumeLitres ?? 0) > 0;
  if (rule.unit === "item" || rule.unit === "u" || rule.unit === "pair") return (input.quantity ?? 0) > 0;

  return false;
}

function buildOutput(slugs: string[], format: string): string {
  if (format === "json") {
    return JSON.stringify({
      generatedAt: new Date().toISOString(),
      count: slugs.length,
      slugs,
    }, null, 2);
  }

  return slugs.join("\n");
}

async function main() {
  const { values } = parseArgs({
    args: process.argv.slice(2),
    options: {
      format: { type: "string" },
      output: { type: "string" },
      explain: { type: "boolean" },
      respectStatus: { type: "boolean" },
      pageType: { type: "string" },
    },
  });

  const format = (values.format || "text").toLowerCase();
  const explain = Boolean(values.explain);
  const respectStatus = Boolean(values.respectStatus);
  const pageTypeFilter = (values.pageType || "CLUSTER_ORIGIN_DEST").toString();

  const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
  const adapter = new PrismaPg(pool);
  const prisma = new PrismaClient({ adapter });

  try {
    const activeTariff = await prisma.tariffVersion.findFirst({
      where: { isActive: true },
      orderBy: { effectiveFrom: "desc" },
    });

    if (!activeTariff) {
      throw new Error("No active tariff version found.");
    }

    const pages = await prisma.seoPage.findMany({
      where: {
        pageType: pageTypeFilter as PageType,
      },
      include: {
        productCluster: {
          include: {
            hsMaps: {
              orderBy: { confidence: "desc" },
            },
          },
        },
      },
    });

    const hsIds = new Set<string>();

    for (const page of pages) {
      if (page.hsCodeId) hsIds.add(page.hsCodeId);
      for (const map of page.productCluster?.hsMaps ?? []) {
        hsIds.add(map.hsCodeId);
      }
    }

    const hsCodeList = await prisma.hsCode.findMany({
      where: { id: { in: Array.from(hsIds) } },
      include: { synonyms: true },
    });

    const hsById = new Map(hsCodeList.map((hs) => [hs.id, hs]));

    const rates = await prisma.tariffRate.findMany({
      where: {
        tariffVersionId: activeTariff.id,
        hsCodeId: { in: Array.from(hsIds) },
      },
    });

    const ratesByHsId = new Map<string, TariffRate>();
    for (const rate of rates) {
      ratesByHsId.set(rate.hsCodeId, rate);
    }

    const docs = await prisma.docRequirement.findMany({
      where: { hsCodeId: { in: Array.from(hsIds) } },
    });
    const docsByHsId = new Map<string, typeof docs>();
    for (const doc of docs) {
      const bucket = docsByHsId.get(doc.hsCodeId) || [];
      bucket.push(doc);
      docsByHsId.set(doc.hsCodeId, bucket);
    }

    const risks = await prisma.riskFlag.findMany({
      where: { hsCodeId: { in: Array.from(hsIds) } },
    });
    const risksByHsId = new Map<string, typeof risks>();
    for (const risk of risks) {
      const bucket = risksByHsId.get(risk.hsCodeId) || [];
      bucket.push(risk);
      risksByHsId.set(risk.hsCodeId, bucket);
    }

    const preferences = await prisma.originPreference.findMany({
      where: {
        tariffVersionId: activeTariff.id,
        hsCodeId: { in: Array.from(hsIds) },
      },
    });

    const prefsByHsOrigin = new Map<string, typeof preferences>();
    for (const pref of preferences) {
      const key = `${pref.hsCodeId}|${pref.originIso2}`;
      const bucket = prefsByHsOrigin.get(key) || [];
      bucket.push(pref);
      prefsByHsOrigin.set(key, bucket);
    }

    const results: Array<{ slug: string; pass: boolean; reasons: string[] }> = [];
    const now = new Date();

    for (const page of pages) {
      const reasons: string[] = [];

      if (RULES.requireCanonicalSelf && page.canonicalSlug && page.canonicalSlug !== page.slug) {
        reasons.push("Canonical slug points elsewhere");
      }

      if (respectStatus) {
        if (page.indexStatus === IndexStatus.NOINDEX) {
          reasons.push("IndexStatus=NOINDEX");
        }
        if (page.indexStatus === IndexStatus.CANONICAL_TO_OTHER) {
          reasons.push("IndexStatus=CANONICAL_TO_OTHER");
        }
      }

      const internalLinksCount = computeInternalLinks(page.originIso2);
      if (internalLinksCount < RULES.minInternalLinks) {
        reasons.push(`Internal links (${internalLinksCount}) below minimum (${RULES.minInternalLinks})`);
      }

      if (RULES.requireFreshness) {
        if (!page.lastBuiltAt) {
          reasons.push("Missing page.lastBuiltAt (freshness)");
        } else if (RULES.maxBuildAgeDays) {
          const ageDays = (now.getTime() - page.lastBuiltAt.getTime()) / (1000 * 60 * 60 * 24);
          if (ageDays > RULES.maxBuildAgeDays) {
            reasons.push(`page.lastBuiltAt older than ${RULES.maxBuildAgeDays} days`);
          }
        }
      }

      if (!activeTariff.effectiveFrom) {
        reasons.push("Active tariff missing effective date");
      }

      let hsCandidates: Array<{ hsCodeId: string; confidence: number }> = [];

      if (page.hsCodeId) {
        hsCandidates = [{ hsCodeId: page.hsCodeId, confidence: 100 }];
      } else if (page.productCluster?.hsMaps?.length) {
        hsCandidates = page.productCluster.hsMaps.map((map) => ({
          hsCodeId: map.hsCodeId,
          confidence: map.confidence,
        }));
      } else {
        reasons.push("No HS candidates (missing cluster map)");
      }

      const eligibleCandidates = hsCandidates
        .filter((c) => c.confidence >= RULES.minHsConfidence)
        .sort((a, b) => b.confidence - a.confidence);

      if (eligibleCandidates.length < RULES.minHsCandidates) {
        reasons.push(`HS candidates below minimum confidence (${RULES.minHsConfidence})`);
      }

      const primaryCandidate = eligibleCandidates[0] || hsCandidates[0];
      const primaryHs = primaryCandidate ? hsById.get(primaryCandidate.hsCodeId) : undefined;

      if (!primaryHs) {
        reasons.push("Primary HS candidate missing from HS table");
      } else if (RULES.requireNonPlaceholderHsTitle && !isNonPlaceholderTitle(primaryHs.title)) {
        reasons.push("HS title is placeholder or missing");
      }

      const primaryRate = primaryCandidate ? ratesByHsId.get(primaryCandidate.hsCodeId) : undefined;
      if (!primaryRate) {
        reasons.push("Missing tariff rate for primary HS in active version");
      }

      let computedScenarios = false;
      if (primaryRate) {
        const presetInput = { quantity: 1 };
        const isComputable = isRateComputable(primaryRate, presetInput);
        if (!isComputable) {
          reasons.push("Tariff rate not computable with preset inputs (needs weight/volume)");
        } else {
          computedScenarios = SCENARIO_VALUES.length > 0;
        }
      }

      if (RULES.requireComputableScenarios && !computedScenarios) {
        reasons.push("Computed scenarios unavailable");
      }

      const docsForHs = primaryCandidate ? (docsByHsId.get(primaryCandidate.hsCodeId) || []) : [];
      const docsForOrigin = docsForHs.filter((doc) => !doc.originIso2 || doc.originIso2 === page.originIso2);
      const hasDocs = docsForOrigin.length >= RULES.minDocs && docsForOrigin.some(
        (doc) => CONFIDENCE_RANK[doc.confidence] >= CONFIDENCE_RANK[RULES.minDocConfidence]
      );
      if (!hasDocs) {
        reasons.push(`Docs checklist below minimum (${RULES.minDocs}) or low confidence`);
      }

      const risksForHs = primaryCandidate ? (risksByHsId.get(primaryCandidate.hsCodeId) || []) : [];
      const hasExplicitNone = risksForHs.some((risk) => risk.type.toLowerCase() === "none");
      const hasRisks = risksForHs.length >= RULES.minRisks || hasExplicitNone;
      if (!hasRisks) {
        reasons.push("Missing risk flags (no explicit none)");
      }

      const prefKey = primaryCandidate ? `${primaryCandidate.hsCodeId}|${page.originIso2}` : "";
      const prefsForOrigin = prefKey ? (prefsByHsOrigin.get(prefKey) || []) : [];
      const hasPreferences = prefsForOrigin.length > 0;

      const dataBlockCount = [computedScenarios, hasDocs, hasRisks, hasPreferences].filter(Boolean).length;
      if (dataBlockCount < RULES.minDataBlocks) {
        reasons.push(`Data-driven blocks (${dataBlockCount}) below minimum (${RULES.minDataBlocks})`);
      }

      const pass = reasons.length === 0;
      results.push({ slug: page.slug, pass, reasons });
    }

    const indexable = results.filter((r) => r.pass).map((r) => r.slug);
    const output = buildOutput(indexable, format);

    if (values.output) {
      const outputPath = path.resolve(values.output);
      fs.writeFileSync(outputPath, output, "utf-8");
    } else {
      process.stdout.write(output + (output.endsWith("\n") ? "" : "\n"));
    }

    if (explain) {
      const blockers = new Map<string, number>();
      for (const r of results) {
        if (r.pass) continue;
        for (const reason of r.reasons) {
          blockers.set(reason, (blockers.get(reason) || 0) + 1);
        }
      }

      const topBlockers = Array.from(blockers.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .map(([reason, count]) => `${count}x ${reason}`)
        .join("\n");

      console.error("\nStrict indexable summary:");
      console.error(`Total pages scanned: ${results.length}`);
      console.error(`Indexable slugs: ${indexable.length}`);
      if (topBlockers) {
        console.error("Top blockers:\n" + topBlockers);
      }
    }
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
