// prisma/schema.prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

enum PageType {
  CLUSTER_ORIGIN_DEST
  HS_ORIGIN_DEST
  HS_HUB
  DIRECTORY
}

enum IndexStatus {
  INDEX
  NOINDEX
  CANONICAL_TO_OTHER
  BLOCKED_MISSING_DATA
}

enum DutyType {
  AD_VALOREM
  SPECIFIC
  COMPOUND
  EXCISE
  LEVY
  ANTI_DUMPING
  SAFEGUARD
  OTHER
}

enum ConfidenceLabel {
  HIGH
  MEDIUM
  LOW
  UNKNOWN
}

enum WatchType {
  HS_CODE
  CLUSTER
  ROUTE
}

enum PlanTier {
  FREE
  SME
  PRO
  ENTERPRISE
}

model User {
  id            String   @id @default(cuid())
  email         String   @unique
  name          String?
  image         String?
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  memberships   Membership[]
  calcRuns      CalcRun[]
  scenarios     SavedScenario[]
  watchItems    WatchItem[]
  subscriptions Subscription[]
  apiKeys       ApiKey[]
}

model Org {
  id        String   @id @default(cuid())
  name      String
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  memberships Membership[]
  apiKeys     ApiKey[]
}

model Membership {
  id        String   @id @default(cuid())
  userId    String
  orgId     String
  role      String   // "owner" | "admin" | "member"
  createdAt DateTime @default(now())

  user User @relation(fields: [userId], references: [id])
  org  Org  @relation(fields: [orgId], references: [id])

  @@unique([userId, orgId])
}

model Country {
  iso2      String   @id
  iso3      String?  @unique
  name      String
  region    String?
  createdAt DateTime @default(now())

  origins   OriginPreference[]
  pagesAsOrigin SeoPage[] @relation("originCountry")
  pagesAsDest   SeoPage[] @relation("destCountry")
}

model TradeAgreement {
  id          String   @id @default(cuid())
  code        String   @unique  // e.g. "MFN", "SADC", "EU-EPA"
  name        String
  description String?
  createdAt   DateTime @default(now())

  originPreferences OriginPreference[]
}

model HsCode {
  id          String   @id @default(cuid())
  hs6         String   @unique
  title       String
  description String?
  tags        String[] @default([])
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  synonyms    HsSynonym[]
  rates       TariffRate[]
  docs        DocRequirement[]
  risks       RiskFlag[]
  clusterMaps ProductClusterHsMap[]
}

model HsSynonym {
  id       String @id @default(cuid())
  hsCodeId String
  term     String
  weight   Int    @default(1)

  hsCode HsCode @relation(fields: [hsCodeId], references: [id])

  @@index([term])
}

model ProductCluster {
  id          String   @id @default(cuid())
  slug        String   @unique
  name        String
  description String?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  hsMaps      ProductClusterHsMap[]
  pages       SeoPage[]
}

model ProductClusterHsMap {
  id            String   @id @default(cuid())
  productClusterId String
  hsCodeId      String
  confidence    Int      @default(50) // 0-100
  notes         String?
  createdAt     DateTime @default(now())

  productCluster ProductCluster @relation(fields: [productClusterId], references: [id])
  hsCode         HsCode         @relation(fields: [hsCodeId], references: [id])

  @@unique([productClusterId, hsCodeId])
}

model TariffVersion {
  id           String   @id @default(cuid())
  label        String   @unique        // e.g. "2026-02-01"
  effectiveFrom DateTime
  publishedAt  DateTime?
  isActive     Boolean  @default(false)
  notes        String?
  createdAt    DateTime @default(now())

  rates        TariffRate[]
  preferences  OriginPreference[]
}

model TariffRate {
  id             String   @id @default(cuid())
  tariffVersionId String
  hsCodeId       String

  dutyType       DutyType
  adValoremPct   Decimal? @db.Decimal(10,4)
  specificRule   Json?    // e.g. {"unit":"kg","rate":12.5}
  compoundRule   Json?    // e.g. {"adValoremPct":10,"specific":{"unit":"kg","rate":2}}

  // Optional flags & notes
  hasVatSpecialHandling Boolean @default(false)
  notes          String?
  createdAt      DateTime @default(now())

  tariffVersion TariffVersion @relation(fields: [tariffVersionId], references: [id])
  hsCode        HsCode        @relation(fields: [hsCodeId], references: [id])

  @@index([tariffVersionId, hsCodeId])
}

model OriginPreference {
  id             String   @id @default(cuid())
  tariffVersionId String
  hsCodeId       String
  originIso2     String
  agreementId    String

  // Duty override / preference logic
  dutyOverride   Json     // e.g. {"type":"AD_VALOREM","pct":0,"conditions":"..."}
  eligibilityNotes String?
  requiredDocs   String[] @default([])

  tariffVersion TariffVersion @relation(fields: [tariffVersionId], references: [id])
  hsCode        HsCode        @relation(fields: [hsCodeId], references: [id])
  origin        Country       @relation(fields: [originIso2], references: [iso2])
  agreement     TradeAgreement @relation(fields: [agreementId], references: [id])

  @@index([tariffVersionId, hsCodeId, originIso2])
}

model DocRequirement {
  id        String   @id @default(cuid())
  hsCodeId  String
  originIso2 String?
  type      String   // "certificate_of_origin", "permit", "license", etc.
  title     String
  details   String?
  references String[] @default([])
  confidence ConfidenceLabel @default(MEDIUM)

  hsCode    HsCode @relation(fields: [hsCodeId], references: [id])
  origin    Country? @relation(fields: [originIso2], references: [iso2])

  @@index([hsCodeId, originIso2])
}

model RiskFlag {
  id        String   @id @default(cuid())
  hsCodeId  String
  type      String   // "anti_dumping", "restricted", "inspection", etc.
  severity  Int      @default(3) // 1-5
  message   String
  details   String?

  hsCode    HsCode @relation(fields: [hsCodeId], references: [id])

  @@index([hsCodeId])
}

model SeoPage {
  id            String     @id @default(cuid())
  slug          String     @unique
  pageType      PageType
  indexStatus   IndexStatus @default(BLOCKED_MISSING_DATA)
  canonicalSlug String?
  lastBuiltAt   DateTime?
  lastIndexedAt DateTime?

  productClusterId String?
  hsCodeId       String?
  originIso2     String
  destIso2       String

  // Data readiness score to protect SEO
  readinessScore Int        @default(0) // 0-100

  productCluster ProductCluster? @relation(fields: [productClusterId], references: [id])
  hsCode        HsCode?          @relation(fields: [hsCodeId], references: [id])
  origin        Country          @relation("originCountry", fields: [originIso2], references: [iso2])
  dest          Country          @relation("destCountry", fields: [destIso2], references: [iso2])

  metrics       SeoPageMetricDaily[]

  @@index([pageType, originIso2, destIso2])
}

model SeoPageMetricDaily {
  id        String   @id @default(cuid())
  pageId    String
  date      DateTime
  impressions Int @default(0)
  clicks    Int @default(0)
  ctr       Decimal? @db.Decimal(10,4)
  avgPosition Decimal? @db.Decimal(10,4)

  calcCompletions Int @default(0)
  paywallViews    Int @default(0)
  checkoutClicks  Int @default(0)

  page SeoPage @relation(fields: [pageId], references: [id])

  @@unique([pageId, date])
}

model CalcRun {
  id            String   @id @default(cuid())
  createdAt     DateTime @default(now())

  userId        String?
  orgId         String?
  tariffVersionId String

  // Input/Output are immutable for audit
  inputs        Json
  outputs       Json

  confidence    ConfidenceLabel @default(MEDIUM)
  explain       Json?          // step-by-step trace for UI

  user User? @relation(fields: [userId], references: [id])
  org  Org?  @relation(fields: [orgId], references: [id])
  tariffVersion TariffVersion @relation(fields: [tariffVersionId], references: [id])

  @@index([createdAt])
  @@index([tariffVersionId])
}

model SavedScenario {
  id        String   @id @default(cuid())
  userId    String
  name      String
  tags      String[] @default([])
  calcRunId String
  createdAt DateTime @default(now())

  user    User @relation(fields: [userId], references: [id])
  calcRun CalcRun @relation(fields: [calcRunId], references: [id])
}

model WatchItem {
  id        String   @id @default(cuid())
  userId    String
  type      WatchType
  ref       String   // hs6 OR cluster slug OR route signature
  createdAt DateTime @default(now())

  user User @relation(fields: [userId], references: [id])

  @@unique([userId, type, ref])
}

model Subscription {
  id             String   @id @default(cuid())
  userId         String?
  orgId          String?
  tier           PlanTier @default(FREE)
  status         String   // stripe status
  stripeCustomerId String?
  stripeSubId    String?
  currentPeriodEnd DateTime?
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt

  user User? @relation(fields: [userId], references: [id])
  org  Org?  @relation(fields: [orgId], references: [id])

  @@index([stripeCustomerId])
  @@index([stripeSubId])
}

model ApiKey {
  id        String   @id @default(cuid())
  orgId     String?
  userId    String?
  name      String
  keyHash   String   @unique
  lastUsedAt DateTime?
  createdAt DateTime @default(now())
  revokedAt DateTime?

  org  Org?  @relation(fields: [orgId], references: [id])
  user User? @relation(fields: [userId], references: [id])
}
