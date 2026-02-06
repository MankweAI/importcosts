importcosts/
├─ README.md
├─ package.json
├─ next.config.js
├─ tsconfig.json
├─ middleware.ts
├─ .env.example
├─ .eslintrc.json
├─ prisma/
│  ├─ schema.prisma
│  ├─ migrations/
│  └─ seed/
│     ├─ seed.ts
│     ├─ hs_seed.csv
│     ├─ product_clusters_seed.json
│     └─ origins_seed.json
├─ public/
│  ├─ favicon.ico
│  ├─ og/
│  │  ├─ default.png
│  │  └─ templates/
│  └─ assets/
├─ src/
│  ├─ app/
│  │  ├─ layout.tsx
│  │  ├─ globals.css
│  │  ├─ not-found.tsx
│  │  ├─ error.tsx
│  │  ├─ loading.tsx
│  │  ├─ robots.ts
│  │  ├─ sitemap.ts
│  │  ├─ (marketing)/
│  │  │  ├─ page.tsx                      # Home
│  │  │  ├─ pricing/page.tsx
│  │  │  ├─ how-it-works/page.tsx
│  │  │  ├─ hs-codes/page.tsx
│  │  │  ├─ import-guides/page.tsx         # minimal, tool-led only
│  │  │  └─ contact/page.tsx
│  │  ├─ (seo)/
│  │  │  ├─ import-duty-vat-landed-cost/
│  │  │  │  ├─ [clusterSlug]/
│  │  │  │  │  ├─ from/[originIso]/to/[destIso]/page.tsx
│  │  │  │  │  ├─ from/[originIso]/to/[destIso]/loading.tsx
│  │  │  │  │  └─ from/[originIso]/to/[destIso]/opengraph-image.tsx
│  │  │  │  ├─ hs/[hs6]/
│  │  │  │  │  ├─ from/[originIso]/to/[destIso]/page.tsx
│  │  │  │  │  └─ page.tsx                # HS hub page
│  │  │  │  └─ page.tsx                    # directory / finder
│  │  │  └─ _components/
│  │  │     ├─ SeoPageShell.tsx
│  │  │     ├─ SeoFaqBlock.tsx
│  │  │     └─ SeoInternalLinks.tsx
│  │  ├─ (tools)/
│  │  │  ├─ calculator/page.tsx            # generic calc page
│  │  │  ├─ hs-classifier/page.tsx
│  │  │  ├─ trade-preferences/page.tsx
│  │  │  └─ compare/page.tsx
│  │  ├─ (app)/
│  │  │  ├─ dashboard/page.tsx
│  │  │  ├─ dashboard/calculations/page.tsx
│  │  │  ├─ dashboard/scenarios/page.tsx
│  │  │  ├─ dashboard/watchlist/page.tsx
│  │  │  ├─ dashboard/billing/page.tsx
│  │  │  └─ dashboard/settings/page.tsx
│  │  ├─ (auth)/
│  │  │  ├─ sign-in/page.tsx
│  │  │  ├─ sign-up/page.tsx
│  │  │  └─ verify/page.tsx
│  │  ├─ (admin)/
│  │  │  ├─ admin/page.tsx
│  │  │  ├─ admin/tariffs/page.tsx
│  │  │  ├─ admin/tariffs/[versionId]/page.tsx
│  │  │  ├─ admin/hs-codes/page.tsx
│  │  │  ├─ admin/product-clusters/page.tsx
│  │  │  ├─ admin/origins/page.tsx
│  │  │  ├─ admin/pages/page.tsx
│  │  │  ├─ admin/regression-tests/page.tsx
│  │  │  └─ admin/audit/page.tsx
│  │  ├─ api/
│  │  │  ├─ auth/[...nextauth]/route.ts
│  │  │  ├─ calc/route.ts                  # compute landed cost
│  │  │  ├─ hs/suggest/route.ts            # HS classifier suggestions
│  │  │  ├─ pages/revalidate/route.ts      # ISR/manual
│  │  │  ├─ billing/
│  │  │  │  ├─ checkout/route.ts
│  │  │  │  ├─ portal/route.ts
│  │  │  │  └─ webhook/route.ts
│  │  │  ├─ admin/
│  │  │  │  ├─ tariffs/import/route.ts
│  │  │  │  ├─ tariffs/publish/route.ts
│  │  │  │  ├─ regression/run/route.ts
│  │  │  │  └─ pages/build/route.ts
│  │  │  └─ v1/
│  │  │     ├─ calc/route.ts               # API customers (API key auth)
│  │  │     ├─ hs/lookup/route.ts
│  │  │     └─ meta/health/route.ts
│  │  └─ legal/
│  │     ├─ privacy/page.tsx
│  │     ├─ terms/page.tsx
│  │     └─ disclaimer/page.tsx
│  ├─ components/
│  │  ├─ calculator/
│  │  │  ├─ Calculator.tsx
│  │  │  ├─ CalculatorForm.tsx
│  │  │  ├─ ResultBreakdown.tsx
│  │  │  ├─ ScenarioPresets.tsx
│  │  │  └─ ConfidenceBadges.tsx
│  │  ├─ hs/
│  │  │  ├─ HsClassifier.tsx
│  │  │  ├─ HsQuestionFlow.tsx
│  │  │  └─ HsCandidateList.tsx
│  │  ├─ billing/
│  │  │  ├─ PaywallGate.tsx
│  │  │  └─ PricingTable.tsx
│  │  ├─ ui/                               # shadcn/ui components
│  │  └─ shared/
│  │     ├─ Header.tsx
│  │     ├─ Footer.tsx
│  │     └─ Toasts.tsx
│  ├─ lib/
│  │  ├─ db/
│  │  │  ├─ prisma.ts
│  │  │  └─ queries/
│  │  │     ├─ seoPages.ts
│  │  │     ├─ tariffs.ts
│  │  │     ├─ hs.ts
│  │  │     ├─ calcRuns.ts
│  │  │     └─ users.ts
│  │  ├─ calc/
│  │  │  ├─ engine.ts                      # orchestrates calc
│  │  │  ├─ duty.ts                        # duty components
│  │  │  ├─ vat.ts                         # VAT rules
│  │  │  ├─ landedCost.ts                  # totals & per-unit
│  │  │  ├─ preferences.ts                 # trade agreements
│  │  │  ├─ validation.ts
│  │  │  ├─ types.ts
│  │  │  └─ audit.ts                       # traces + explainability
│  │  ├─ seo/
│  │  │  ├─ slug.ts
│  │  │  ├─ canonical.ts
│  │  │  ├─ indexPolicy.ts                 # index/noindex rules
│  │  │  ├─ internalLinks.ts               # link graph generator
│  │  │  ├─ sitemapWriter.ts               # multi-sitemap generator
│  │  │  └─ og.ts                          # OG image helpers
│  │  ├─ auth/
│  │  │  ├─ options.ts
│  │  │  ├─ requireUser.ts
│  │  │  └─ requireAdmin.ts
│  │  ├─ billing/
│  │  │  ├─ stripe.ts
│  │  │  ├─ entitlements.ts
│  │  │  └─ plans.ts
│  │  ├─ api/
│  │  │  ├─ apiKeyAuth.ts
│  │  │  ├─ rateLimit.ts
│  │  │  └─ errors.ts
│  │  ├─ jobs/
│  │  │  ├─ tariffImport.ts
│  │  │  ├─ pageBuild.ts
│  │  │  ├─ regression.ts
│  │  │  └─ changeDetection.ts
│  │  └─ utils/
│  │     ├─ money.ts
│  │     ├─ dates.ts
│  │     ├─ country.ts
│  │     └─ logger.ts
│  ├─ server/
│  │  ├─ services/
│  │  │  ├─ SeoPageService.ts
│  │  │  ├─ TariffService.ts
│  │  │  ├─ CalcService.ts
│  │  │  ├─ HsService.ts
│  │  │  └─ BillingService.ts
│  │  └─ policies/
│  │     ├─ IndexationPolicy.ts
│  │     └─ EntitlementPolicy.ts
│  └─ tests/
│     ├─ regression/
│     │  ├─ goldenScenarios.json
│     │  └─ regression.test.ts
│     ├─ calc/
│     └─ seo/
└─ scripts/
   ├─ build-sitemaps.ts
   ├─ publish-tariff-version.ts
   ├─ seed-pages.ts
   └─ backfill-calc-runs.ts
