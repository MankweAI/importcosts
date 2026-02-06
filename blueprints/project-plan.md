# importcosts Engineering Project Plan (Phased, testable units)

Domain: **[www.importcosts.co.za](http://www.importcosts.co.za)**
Product: a calculator-first import duty / VAT / landed-cost engine for South Africa, distributed **only** via programmatic SEO money pages + a self-serve SaaS app.

---

## 1) Product intent + non-negotiables

### Core user job (the wedge)

“Given product/HS (or description), origin, value, shipping, incoterm, importer type — tell me duties + VAT + landed cost + docs + risks **right now**.” 

### MVP “Definition of Done” (ship criteria)

You can credibly ship once you have: auditable landed-cost calculator, tariff/rules versioning, index-worthy pSEO template, basic auth + save/export paywall, and indexation controls (canonical/noindex/sitemaps) + analytics. 

### UI/UX is a weapon (not decoration)

Design must be **fast, calm, ridiculously clear, audit-friendly**; tool above the fold; every number explainable (“Why?” drawer), confidence + what could change; “zero-PDF mindset” (checklists + structured blocks instead). 

---

## 2) System architecture (high level)

### App surfaces (3 “zones”)

1. **Public / SEO money pages** (pSEO factory) → calculator-first templates. 
2. **Tools** (generic calculator, HS classifier, compare) → conversion + retention loops. 
3. **Logged-in app** (dashboard, saved calcs/scenarios, watchlist, billing) → retention without outreach. 

### Repo / file structure (authoritative)

Use the proposed Next.js App Router layout + route groups: marketing, seo, tools, app. 
Key SEO money page route pattern:
`/import-duty-vat-landed-cost/[clusterSlug]/from/[originIso]/to/[destIso]` 

---

## 3) Data model (Prisma tables you must support)

Implement (at minimum) the “rules + calc + SEO” primitives:

### Reference + mapping

* `hs_code`, `hs_synonym`
* `product_cluster`, `product_cluster_hs_map` (confidence + notes) 

### Versioned tariffs / rules

* `tariff_version`, `tariff_rate`, `tariff_extra_component` (levies/excise/anti-dumping flags) 
* Optional but planned: trade preferences (`trade_agreement`, `preference_rate`, origins) 

### Compliance / docs / risk

* `doc_requirement`, `risk_flag` 

### Calculations + SaaS objects

* `calc_run` (stores inputs_json, outputs_json, tariff_version_id, confidence_label)
* `saved_scenario`, `watch_item`, `subscription` 

### SEO publishing control + metrics

* `page` (slug, type, origin/dest, index_status, canonical_slug, last_built_at)
* `page_metric_daily` (impressions, clicks, ctr, avg_position, calc_completions) 

---

## 4) SEO money pages: indexation rules (hard gates)

### Indexable only if ALL true

A page is INDEXABLE only if it has:

1. pre-filled calculator with valid HS mapping (or explicit HS),
2. non-empty breakdown (duty + VAT minimum),
3. ≥2 unique data-driven blocks (docs / preference / risk / computed scenarios),
4. ≥6 internal links,
5. freshness metadata (tariff version + last updated). 

### Auto-NOINDEX if ANY true

No HS candidates; missing rate; would output “contact a broker” without numbers; duplicates another page (canonicalize). 

### Canonicalization

Synonyms → one canonical; if product+origin resolves to a single HS confidently, canonical may point to HS+origin page. 

---

## 5) Seeding + “build pass” pipeline (first 200 pages)

### pages_seed.json conventions (SEO-friendly)

Your seed file already uses lowercase slugs like:
`/import-duty-vat-landed-cost/lithium-batteries/from/india/to/south-africa` 
So: **use “south-africa”** (not “ZA”) in URLs and keep everything lowercase for consistency.

### Default stance: everything starts NOINDEX

Seed 200 pages with `indexStatus = NOINDEX`, `readinessScore = 0`. 

### Readiness scoring + index threshold

Compute readiness from: HS candidates exist, tariff rates exist for at least one candidate, VAT module works, docs exist, risks exist (or explicitly “none known”), internal links ≥6. 
**Index only if** `readinessScore >= 70` AND `hasComputedExampleOutputs = true`. 

### “Computed example outputs” are non-negotiable

Each money page must render **3 server-computed scenario presets** (e.g., R10k / R50k / R250k). If you can’t compute (missing tariff), keep NOINDEX. 

### Seed workflow (what seed.ts must do)

Upsert countries + clusters → HS codes + cluster maps → tariff version + rates → docs/risks → generate 200 pages → run build pass to set readiness/indexStatus. 

### Rollout strategy (avoid SEO faceplant)

Week 1 index only 20–40 pages; Week 2 expand to 100; Week 3 all 200 — but **only** pages passing readiness gate. 

---

## 6) UI/UX spec (what engineering must implement)

### Standardized components (build early, reuse everywhere)

CalcCard, BreakdownTable, ConfidenceBadge, DocChecklist, PreferencePill, RiskBanner, ScenarioTabs, StickyActionBar, InternalLinkGrid. 

### Money page template (the “win screen”)

Above-the-fold must include: breadcrumbs, H1 “Import duty & landed cost for X from Y → South Africa”, subtitle, calculator card (minimal inputs + HS helper inline), and a result preview with confidence. 
Below-the-fold must be structured blocks: breakdown with “Why” drawer (formula + values + tariff version), scenario presets, docs checklist, preference eligibility (traffic-light), risk callouts, related internal links, next best actions.  

### HS helper UX (remove “HS code” friction)

Inline drawer flow: user types description → show 3–5 candidate HS with confidence and warnings → ask 1–3 clarifying questions only when needed → user selects → calculator reruns. 

### Compare tool UX (conversion engine)

Side-by-side table across origins/incoterms/freight modes; rows include duty, VAT, total taxes, landed cost, docs delta, risk delta; CTA save/export (Pro). 

---

## 7) Observability + growth instrumentation (SEO-only reality)

Track funnel events (minimum): `page_view`, `calc_started`, `calc_completed`, `hs_suggested`, `paywall_viewed`, `checkout_clicked`, `subscription_started`. 
You must be able to segment funnel by **page template + origin + product cluster** to know which money pages actually monetize. 

---

# 8) Phased execution plan (each phase is shippable + tested)

Below is the engineer-facing backlog organized into **phases**, where each phase ends with concrete tests + acceptance.

---

## Phase 0 — Foundations + SEO safety rails

**Goal:** ship fast without breaking SEO trust or calculation determinism.

**Deliverables**

* Repo baseline + env template
* Event instrumentation + dashboards
* Feature flags for tariff versions/page types
* SEO safety rails: per-page index/noindex, canonical tags, robots, sitemap partitioning 

**Tests (must pass)**

* Unit: “SEO meta builder” returns correct robots/canonical for each page state.
* E2E: a NOINDEX page never appears in sitemap; an INDEX page does.
* Analytics smoke test: all listed events fire with stable IDs. 

**Exit criteria**

* You can safely deploy “empty” money pages without accidental indexing.

---

## Phase 1 — Database schema + migrations (rules primitives)

**Goal:** the database can represent tariffs, mappings, docs, risk, pages, and calc runs.

**Deliverables**

* Prisma schema + migrations implementing the table set in §3. 
* Basic CRUD service layer (no UI yet)

**Tests**

* Migration test in CI (fresh DB → migrate → seed minimal fixtures).
* Referential integrity tests (cluster↔hs map, tariff version↔rates).

**Exit criteria**

* Can create: cluster → HS candidates → tariff version → rates → a page record → a calc_run.

---

## Phase 2 — Tariff Brain v0 (ingestion + versioning)

**Goal:** deterministic, auditable tariff versions.

**Deliverables**

* Tariff ingestion (CSV first) creates a *new* version; diffs visible. 
* Rule versioning: each calculation stores exact tariff + VAT rule version. 
* Data quality checks block publishing when required fields missing. 

**Tests**

* Golden tests: same inputs + same tariff_version_id → identical outputs.
* Regression: publishing blocked when “required rate fields” missing.

**Exit criteria**

* “Re-run old calculation” reproduces identical results.

---

## Phase 3 — Calculation Engine v0 (API + audit trace)

**Goal:** <30 seconds to trustworthy numbers, returned as auditable JSON.

**Deliverables**

* Calculation API: inputs (HS or product), origin, customs value, freight/insurance, incoterm, qty, importer type, currency; outputs line-by-line breakdown + totals + per-unit + rule references. 
* VAT logic module (versioned + tested). 
* “Extra components” representation (levies/excise flags) even if partial coverage. 
* Audit trace included in every result: inputs, assumptions, tariff version, confidence label. 

**Tests**

* Unit: duty calculation for ad valorem + VAT basis calculation.
* Contract: API schema validation (Zod) for request/response.
* Performance: typical calc executes under a strict latency budget.

**Exit criteria**

* Engine returns deterministic, auditable breakdown for a small HS fixture set.

---

## Phase 4 — Calculator-first UI shell (shared component system)

**Goal:** every entry point is a calculator page.

**Deliverables**

* CalcCard component that works on every page type; prefilled defaults; renders results fast. 
* Scenario presets (R10k/R50k/R250k) one-click apply. 
* Result UX: skimmable breakdown; CTAs appear only after successful calc. 
* “Why drawer” on each number (formula + values + tariff version). 

**Tests**

* Component tests (React Testing Library): CalcCard renders, validates, submits, displays breakdown.
* Accessibility checks (keyboard navigation, focus traps for drawers).

**Exit criteria**

* A user can land on a generic calculator page and compute successfully.

---

## Phase 5 — Money pages (pSEO template + index gate)

**Goal:** ship 10k+ pages later, but start with 200 “money pages” correctly.

**Deliverables**

* Implement the SEO routes exactly as structure.md describes. 
* Money page template blocks + internal linking grid.  
* Publishing rules enforced (INDEX only if criteria met). 

**Tests**

* SEO snapshot tests: title/meta/structured blocks present; canonical/noindex correct.
* Build-pass tests: pages without rates remain NOINDEX with explicit blocker reason.

**Exit criteria**

* You can safely deploy 200 seeded pages with zero thin-content indexing risk.

---

## Phase 6 — HS Mapping v0 (product → HS candidates + helper)

**Goal:** user can start from normal words (critical for SEO conversion).

**Deliverables**

* Store 3–10 candidate HS codes per cluster with confidence + notes. 
* Guided HS helper: ask disambiguation only when needed; ranked HS set; user override. 
* Synonyms library for common terms. 

**Tests**

* Unit: candidate ranking logic returns stable ordering.
* UX: selecting HS candidate re-runs calc and updates breakdown.

**Exit criteria**

* Money pages can compute using cluster→HS mapping for at least a few clusters end-to-end.

---

## Phase 7 — Seeding + Build Pass + Controlled rollout

**Goal:** generate + evaluate the first 200 pages; index only the ready ones.

**Deliverables**

* Seed pipeline as per seed-plan (countries/clusters/HS/rates/docs/pages/build pass). 
* Readiness scoring and “computed example outputs” enforced. 
* Sitemaps include only INDEX pages. 
* Rollout in waves (20–40 → 100 → 200). 

**Tests**

* Integration: seed → build pass → confirm some pages INDEX, others NOINDEX w/ reasons.
* Sitemap correctness: matches DB `index_status=INDEX`.

**Exit criteria**

* “First 200 seed complete” checklist passes (200 rows exist; ≥50 INDEX with scenarios; NOINDEX pages have blockers). 

---

## Phase 8 — SaaS layer (auth, save/export paywall, retention UI)

**Goal:** monetize without outbound: users save, export, compare, watch.

**Deliverables**

* Auth + user model; calc history; saved scenarios; watchlist. 
* Paywall UX: gate export/save beyond free threshold; conversions via sticky action bar. 
* Billing implementation (recommend Stripe for subscriptions).

**Tests**

* E2E: anonymous user runs calc → hits paywall on export → subscribes → export succeeds.
* Data integrity: calc_run saved with tariff_version_id and reproducible output.

**Exit criteria**

* End-to-end revenue loop exists from SEO page → calc → paywall → subscription → export.

---

## Phase 9 — Admin ops (tariffs, mapping, readiness, regression)

**Goal:** you can operate this like a real rules product (without fear).

**Deliverables**

* Admin: tariff versions (draft → publish), HS codes, cluster mapping, docs/risk, page readiness/index controls, regression tests. 
* Regression harness: store “golden” calc cases; run on new tariff publish; block publish if deltas unexpected.

**Tests**

* Admin permissions tests.
* Publish gate tests (cannot publish broken versions).

**Exit criteria**

* You can update tariffs without silently breaking SEO pages or user trust.

---

# 9) Appendix: the first 200 money pages (scope anchor)

You’re building **20 product clusters × 10 origins → ZA** (200 pages). 
Format (engineering spec): `/import-duty-vat-landed-cost/<product>-from-<origin>-to-south-africa` 
Your actual seed uses the *route-group style* format: `/import-duty-vat-landed-cost/<cluster>/from/<origin>/to/south-africa` (keep it; it’s consistent + scalable). 

---

## 10) The “don’t ship unless…” checklist (final gate)

Before public indexing, confirm:

* Pages missing tariffs/HS remain NOINDEX automatically. 
* Every INDEX page has 3 computed scenario outputs. 
* Every number has traceability (tariff version + “why” explanation). 
* Analytics can attribute conversions by cluster+origin. 

---
