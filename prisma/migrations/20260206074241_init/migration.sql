-- CreateEnum
CREATE TYPE "PageType" AS ENUM ('CLUSTER_ORIGIN_DEST', 'HS_ORIGIN_DEST', 'HS_HUB', 'DIRECTORY');

-- CreateEnum
CREATE TYPE "IndexStatus" AS ENUM ('INDEX', 'NOINDEX', 'CANONICAL_TO_OTHER', 'BLOCKED_MISSING_DATA');

-- CreateEnum
CREATE TYPE "DutyType" AS ENUM ('AD_VALOREM', 'SPECIFIC', 'COMPOUND', 'EXCISE', 'LEVY', 'ANTI_DUMPING', 'SAFEGUARD', 'OTHER');

-- CreateEnum
CREATE TYPE "ConfidenceLabel" AS ENUM ('HIGH', 'MEDIUM', 'LOW', 'UNKNOWN');

-- CreateEnum
CREATE TYPE "WatchType" AS ENUM ('HS_CODE', 'CLUSTER', 'ROUTE');

-- CreateEnum
CREATE TYPE "PlanTier" AS ENUM ('FREE', 'SME', 'PRO', 'ENTERPRISE');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "image" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Org" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Org_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Membership" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "orgId" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Membership_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Country" (
    "iso2" TEXT NOT NULL,
    "iso3" TEXT,
    "name" TEXT NOT NULL,
    "region" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Country_pkey" PRIMARY KEY ("iso2")
);

-- CreateTable
CREATE TABLE "TradeAgreement" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TradeAgreement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HsCode" (
    "id" TEXT NOT NULL,
    "hs6" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "HsCode_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HsSynonym" (
    "id" TEXT NOT NULL,
    "hsCodeId" TEXT NOT NULL,
    "term" TEXT NOT NULL,
    "weight" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "HsSynonym_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProductCluster" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProductCluster_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProductClusterHsMap" (
    "id" TEXT NOT NULL,
    "productClusterId" TEXT NOT NULL,
    "hsCodeId" TEXT NOT NULL,
    "confidence" INTEGER NOT NULL DEFAULT 50,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProductClusterHsMap_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TariffVersion" (
    "id" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "effectiveFrom" TIMESTAMP(3) NOT NULL,
    "publishedAt" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT false,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TariffVersion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TariffRate" (
    "id" TEXT NOT NULL,
    "tariffVersionId" TEXT NOT NULL,
    "hsCodeId" TEXT NOT NULL,
    "dutyType" "DutyType" NOT NULL,
    "adValoremPct" DECIMAL(10,4),
    "specificRule" JSONB,
    "compoundRule" JSONB,
    "hasVatSpecialHandling" BOOLEAN NOT NULL DEFAULT false,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TariffRate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OriginPreference" (
    "id" TEXT NOT NULL,
    "tariffVersionId" TEXT NOT NULL,
    "hsCodeId" TEXT NOT NULL,
    "originIso2" TEXT NOT NULL,
    "agreementId" TEXT NOT NULL,
    "dutyOverride" JSONB NOT NULL,
    "eligibilityNotes" TEXT,
    "requiredDocs" TEXT[] DEFAULT ARRAY[]::TEXT[],

    CONSTRAINT "OriginPreference_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DocRequirement" (
    "id" TEXT NOT NULL,
    "hsCodeId" TEXT NOT NULL,
    "originIso2" TEXT,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "details" TEXT,
    "references" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "confidence" "ConfidenceLabel" NOT NULL DEFAULT 'MEDIUM',

    CONSTRAINT "DocRequirement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RiskFlag" (
    "id" TEXT NOT NULL,
    "hsCodeId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "severity" INTEGER NOT NULL DEFAULT 3,
    "message" TEXT NOT NULL,
    "details" TEXT,

    CONSTRAINT "RiskFlag_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SeoPage" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "pageType" "PageType" NOT NULL,
    "indexStatus" "IndexStatus" NOT NULL DEFAULT 'BLOCKED_MISSING_DATA',
    "canonicalSlug" TEXT,
    "lastBuiltAt" TIMESTAMP(3),
    "lastIndexedAt" TIMESTAMP(3),
    "productClusterId" TEXT,
    "hsCodeId" TEXT,
    "originIso2" TEXT NOT NULL,
    "destIso2" TEXT NOT NULL,
    "readinessScore" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "SeoPage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SeoPageMetricDaily" (
    "id" TEXT NOT NULL,
    "pageId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "impressions" INTEGER NOT NULL DEFAULT 0,
    "clicks" INTEGER NOT NULL DEFAULT 0,
    "ctr" DECIMAL(10,4),
    "avgPosition" DECIMAL(10,4),
    "calcCompletions" INTEGER NOT NULL DEFAULT 0,
    "paywallViews" INTEGER NOT NULL DEFAULT 0,
    "checkoutClicks" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "SeoPageMetricDaily_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CalcRun" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT,
    "orgId" TEXT,
    "tariffVersionId" TEXT NOT NULL,
    "inputs" JSONB NOT NULL,
    "outputs" JSONB NOT NULL,
    "confidence" "ConfidenceLabel" NOT NULL DEFAULT 'MEDIUM',
    "explain" JSONB,

    CONSTRAINT "CalcRun_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SavedScenario" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "calcRunId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SavedScenario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WatchItem" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" "WatchType" NOT NULL,
    "ref" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WatchItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Subscription" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "orgId" TEXT,
    "tier" "PlanTier" NOT NULL DEFAULT 'FREE',
    "status" TEXT NOT NULL,
    "stripeCustomerId" TEXT,
    "stripeSubId" TEXT,
    "currentPeriodEnd" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Subscription_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ApiKey" (
    "id" TEXT NOT NULL,
    "orgId" TEXT,
    "userId" TEXT,
    "name" TEXT NOT NULL,
    "keyHash" TEXT NOT NULL,
    "lastUsedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "revokedAt" TIMESTAMP(3),

    CONSTRAINT "ApiKey_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Membership_userId_orgId_key" ON "Membership"("userId", "orgId");

-- CreateIndex
CREATE UNIQUE INDEX "Country_iso3_key" ON "Country"("iso3");

-- CreateIndex
CREATE UNIQUE INDEX "TradeAgreement_code_key" ON "TradeAgreement"("code");

-- CreateIndex
CREATE UNIQUE INDEX "HsCode_hs6_key" ON "HsCode"("hs6");

-- CreateIndex
CREATE INDEX "HsSynonym_term_idx" ON "HsSynonym"("term");

-- CreateIndex
CREATE UNIQUE INDEX "ProductCluster_slug_key" ON "ProductCluster"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "ProductClusterHsMap_productClusterId_hsCodeId_key" ON "ProductClusterHsMap"("productClusterId", "hsCodeId");

-- CreateIndex
CREATE UNIQUE INDEX "TariffVersion_label_key" ON "TariffVersion"("label");

-- CreateIndex
CREATE INDEX "TariffRate_tariffVersionId_hsCodeId_idx" ON "TariffRate"("tariffVersionId", "hsCodeId");

-- CreateIndex
CREATE INDEX "OriginPreference_tariffVersionId_hsCodeId_originIso2_idx" ON "OriginPreference"("tariffVersionId", "hsCodeId", "originIso2");

-- CreateIndex
CREATE INDEX "DocRequirement_hsCodeId_originIso2_idx" ON "DocRequirement"("hsCodeId", "originIso2");

-- CreateIndex
CREATE INDEX "RiskFlag_hsCodeId_idx" ON "RiskFlag"("hsCodeId");

-- CreateIndex
CREATE UNIQUE INDEX "SeoPage_slug_key" ON "SeoPage"("slug");

-- CreateIndex
CREATE INDEX "SeoPage_pageType_originIso2_destIso2_idx" ON "SeoPage"("pageType", "originIso2", "destIso2");

-- CreateIndex
CREATE UNIQUE INDEX "SeoPageMetricDaily_pageId_date_key" ON "SeoPageMetricDaily"("pageId", "date");

-- CreateIndex
CREATE INDEX "CalcRun_createdAt_idx" ON "CalcRun"("createdAt");

-- CreateIndex
CREATE INDEX "CalcRun_tariffVersionId_idx" ON "CalcRun"("tariffVersionId");

-- CreateIndex
CREATE UNIQUE INDEX "WatchItem_userId_type_ref_key" ON "WatchItem"("userId", "type", "ref");

-- CreateIndex
CREATE INDEX "Subscription_stripeCustomerId_idx" ON "Subscription"("stripeCustomerId");

-- CreateIndex
CREATE INDEX "Subscription_stripeSubId_idx" ON "Subscription"("stripeSubId");

-- CreateIndex
CREATE UNIQUE INDEX "ApiKey_keyHash_key" ON "ApiKey"("keyHash");

-- AddForeignKey
ALTER TABLE "Membership" ADD CONSTRAINT "Membership_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Membership" ADD CONSTRAINT "Membership_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "Org"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HsSynonym" ADD CONSTRAINT "HsSynonym_hsCodeId_fkey" FOREIGN KEY ("hsCodeId") REFERENCES "HsCode"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductClusterHsMap" ADD CONSTRAINT "ProductClusterHsMap_productClusterId_fkey" FOREIGN KEY ("productClusterId") REFERENCES "ProductCluster"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductClusterHsMap" ADD CONSTRAINT "ProductClusterHsMap_hsCodeId_fkey" FOREIGN KEY ("hsCodeId") REFERENCES "HsCode"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TariffRate" ADD CONSTRAINT "TariffRate_tariffVersionId_fkey" FOREIGN KEY ("tariffVersionId") REFERENCES "TariffVersion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TariffRate" ADD CONSTRAINT "TariffRate_hsCodeId_fkey" FOREIGN KEY ("hsCodeId") REFERENCES "HsCode"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OriginPreference" ADD CONSTRAINT "OriginPreference_tariffVersionId_fkey" FOREIGN KEY ("tariffVersionId") REFERENCES "TariffVersion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OriginPreference" ADD CONSTRAINT "OriginPreference_hsCodeId_fkey" FOREIGN KEY ("hsCodeId") REFERENCES "HsCode"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OriginPreference" ADD CONSTRAINT "OriginPreference_originIso2_fkey" FOREIGN KEY ("originIso2") REFERENCES "Country"("iso2") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OriginPreference" ADD CONSTRAINT "OriginPreference_agreementId_fkey" FOREIGN KEY ("agreementId") REFERENCES "TradeAgreement"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DocRequirement" ADD CONSTRAINT "DocRequirement_hsCodeId_fkey" FOREIGN KEY ("hsCodeId") REFERENCES "HsCode"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DocRequirement" ADD CONSTRAINT "DocRequirement_originIso2_fkey" FOREIGN KEY ("originIso2") REFERENCES "Country"("iso2") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RiskFlag" ADD CONSTRAINT "RiskFlag_hsCodeId_fkey" FOREIGN KEY ("hsCodeId") REFERENCES "HsCode"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SeoPage" ADD CONSTRAINT "SeoPage_productClusterId_fkey" FOREIGN KEY ("productClusterId") REFERENCES "ProductCluster"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SeoPage" ADD CONSTRAINT "SeoPage_hsCodeId_fkey" FOREIGN KEY ("hsCodeId") REFERENCES "HsCode"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SeoPage" ADD CONSTRAINT "SeoPage_originIso2_fkey" FOREIGN KEY ("originIso2") REFERENCES "Country"("iso2") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SeoPage" ADD CONSTRAINT "SeoPage_destIso2_fkey" FOREIGN KEY ("destIso2") REFERENCES "Country"("iso2") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SeoPageMetricDaily" ADD CONSTRAINT "SeoPageMetricDaily_pageId_fkey" FOREIGN KEY ("pageId") REFERENCES "SeoPage"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CalcRun" ADD CONSTRAINT "CalcRun_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CalcRun" ADD CONSTRAINT "CalcRun_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "Org"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CalcRun" ADD CONSTRAINT "CalcRun_tariffVersionId_fkey" FOREIGN KEY ("tariffVersionId") REFERENCES "TariffVersion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SavedScenario" ADD CONSTRAINT "SavedScenario_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SavedScenario" ADD CONSTRAINT "SavedScenario_calcRunId_fkey" FOREIGN KEY ("calcRunId") REFERENCES "CalcRun"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WatchItem" ADD CONSTRAINT "WatchItem_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Subscription" ADD CONSTRAINT "Subscription_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Subscription" ADD CONSTRAINT "Subscription_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "Org"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ApiKey" ADD CONSTRAINT "ApiKey_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "Org"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ApiKey" ADD CONSTRAINT "ApiKey_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
