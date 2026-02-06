Below is a **practical seed plan** to ship the **first 200 “money pages”** for **importcosts** ([www.importcosts.co.za](http://www.importcosts.co.za)) without accidentally indexing thin/spam pages.

Key idea: **seed pages only where you have (a) HS mapping coverage, (b) tariff rates loaded, (c) doc/risk blocks populated enough to pass your indexation gate.** Everything else stays **NOINDEX** until it’s ready.

---

## 1) What the “first 200 money pages” are (and how you seed them)

### Fixed list (200 pages)

* **Dest**: ZA (South Africa)
* **Origins (10)**: CN, US, DE, AE, IN, GB, JP, IT, TR, VN
* **Product clusters (20)**:
  `solar-panels, inverters, lithium-batteries, smartphones, laptops, tvs, routers, security-cameras, printers, power-tools, tyres, car-parts, engine-oil, medical-gloves, vitamins-supplements, cosmetics, clothing, sneakers, furniture, kitchenware`

### Canonical slug format (simple + consistent)

```
/import-duty-vat-landed-cost/{clusterSlug}/from/{originIso2}/to/ZA
```

### What gets seeded into DB

You seed:

1. **Countries** (the 10 origins + ZA)
2. **Product clusters** (20)
3. **Cluster → HS candidate map** (min 3 HS6 candidates per cluster)
4. **TariffVersion** (active)
5. **Tariff rates for each HS6** in that version
6. **Docs + risk flags** (initial baseline per cluster and per HS6 where known)
7. **SeoPage rows** for 200 pages, initially `NOINDEX` until readiness is computed

---

## 2) Seed data files (drop-in structure)

Create these under:

```
prisma/seed/
```

### A) `origins_seed.json`

```json
[
  { "iso2": "ZA", "name": "South Africa" },
  { "iso2": "CN", "name": "China" },
  { "iso2": "US", "name": "United States" },
  { "iso2": "DE", "name": "Germany" },
  { "iso2": "AE", "name": "United Arab Emirates" },
  { "iso2": "IN", "name": "India" },
  { "iso2": "GB", "name": "United Kingdom" },
  { "iso2": "JP", "name": "Japan" },
  { "iso2": "IT", "name": "Italy" },
  { "iso2": "TR", "name": "Turkey" },
  { "iso2": "VN", "name": "Vietnam" }
]
```

### B) `product_clusters_seed.json`

```json
[
  { "slug": "solar-panels", "name": "Solar panels", "description": "Photovoltaic modules and panels" },
  { "slug": "inverters", "name": "Power inverters", "description": "DC/AC inverters incl. solar inverters" },
  { "slug": "lithium-batteries", "name": "Lithium batteries", "description": "Lithium-ion batteries and packs" },
  { "slug": "smartphones", "name": "Smartphones", "description": "Mobile phones incl. smartphones" },
  { "slug": "laptops", "name": "Laptops", "description": "Portable computers" },
  { "slug": "tvs", "name": "Televisions", "description": "TV sets, monitors (consumer)" },
  { "slug": "routers", "name": "Routers", "description": "Network routers and Wi-Fi equipment" },
  { "slug": "security-cameras", "name": "Security cameras", "description": "CCTV/IP cameras and surveillance gear" },
  { "slug": "printers", "name": "Printers", "description": "Office printers and MFPs" },
  { "slug": "power-tools", "name": "Power tools", "description": "Drills, grinders, saws etc." },
  { "slug": "tyres", "name": "Tyres", "description": "Vehicle tyres" },
  { "slug": "car-parts", "name": "Car parts", "description": "Automotive spare parts" },
  { "slug": "engine-oil", "name": "Engine oil", "description": "Lubricants and oils" },
  { "slug": "medical-gloves", "name": "Medical gloves", "description": "Disposable exam gloves" },
  { "slug": "vitamins-supplements", "name": "Vitamins & supplements", "description": "Dietary supplements" },
  { "slug": "cosmetics", "name": "Cosmetics", "description": "Beauty and personal care products" },
  { "slug": "clothing", "name": "Clothing", "description": "Apparel and garments" },
  { "slug": "sneakers", "name": "Sneakers", "description": "Sports and casual footwear" },
  { "slug": "furniture", "name": "Furniture", "description": "Home/office furniture" },
  { "slug": "kitchenware", "name": "Kitchenware", "description": "Cookware and kitchen items" }
]
```

### C) `cluster_hs_map_seed.json` (IMPORTANT)

This is the **only part I can’t truthfully fill with guaranteed-correct HS codes without your tariff dataset / classification policy** (HS selection can vary with material/spec/usage). So this seed file should contain **candidate HS6 codes as “suggested sets”**, marked with confidence and notes.

Format:

```json
[
  {
    "clusterSlug": "solar-panels",
    "candidates": [
      { "hs6": "854140", "confidence": 85, "notes": "Photovoltaic cells/modules are commonly classified here; confirm by exact product spec." },
      { "hs6": "850720", "confidence": 20, "notes": "Not panels; example of wrong class to avoid. Keep as negative test if you want." }
    ]
  }
]
```

**Recommended seeding rule:** for each cluster, seed **3–6 candidate HS6 codes** with:

* `confidence` (0–100)
* `disambiguation_questions` (optional field, if you add it)

If you want me to produce the **full 20 clusters × candidate HS sets** file, I can do it as **a structured “candidate map”** (not guaranteed correct classification; clearly labeled) — but I won’t pretend they’re definitive without your HS policy.

### D) `pages_seed.json` (generated, don’t hand-write)

You should generate the 200 pages programmatically from:

* 20 clusters
* 10 origins
* dest = ZA

Example generated row:

```json
{
  "pageType": "CLUSTER_ORIGIN_DEST",
  "clusterSlug": "solar-panels",
  "originIso2": "CN",
  "destIso2": "ZA",
  "slug": "/import-duty-vat-landed-cost/solar-panels/from/CN/to/ZA"
}
```

---

## 3) Readiness & indexation plan for the first 200 pages

### Default stance: everything starts **NOINDEX**

For each of the 200 pages:

* `indexStatus = NOINDEX`
* `readinessScore = 0`

Then you run a build step that computes readiness based on whether the page has:

**Readiness score components (example, 100 total):**

* +30 if **HS candidates exist** for cluster
* +25 if at least **one HS candidate has tariff rate** in active TariffVersion
* +15 if **VAT rule module** can compute output (always true if module exists)
* +10 if **docs checklist** non-empty (cluster-level baseline allowed)
* +10 if **risk flags** non-empty OR “none known” explicitly shown
* +10 if **internal links count ≥ 6**

**Index threshold:** `readinessScore >= 70` AND `hasComputedExampleOutputs = true`

### “Computed example outputs” (non-negotiable)

Each page must have at least **3 preset scenarios** computed server-side:

* Scenario A: customs value R10k (or $500), freight=auto estimate
* Scenario B: customs value R50k
* Scenario C: customs value R250k
  If you can’t compute (missing tariff), keep NOINDEX.

---

## 4) Seeding workflow (step-by-step)

### Step 1 — Seed Countries + Clusters

* Run `seed.ts` to insert:

  * Countries (ZA + 10 origins)
  * Product clusters (20)

### Step 2 — Seed HS codes table (only those you can support now)

You have two strategies:

**Strategy A (recommended): “Top coverage first”**

* Only create HSCode records for the HS6 candidates you intend to support in MVP
* This keeps your tariff workload tight

**Strategy B: “HS library first”**

* Load many HS codes but keep most pages NOINDEX
* More overhead, slower to validate

### Step 3 — Load TariffVersion + TariffRate

* Insert `TariffVersion(label="MVP-2026-02", isActive=true)`
* Insert tariff rates for HS6 candidates
* Anything missing blocks indexation automatically

### Step 4 — Seed baseline Docs + Risks (cluster-level first)

Even basic doc blocks massively improve page uniqueness:

* Invoice, packing list, bill of lading/airway bill, proof of payment, importer registration, etc.
  Add cluster-specific docs where you know they differ.

### Step 5 — Generate 200 SeoPage rows

* Create 200 pages with:

  * clusterSlug
  * originIso2
  * destIso2=ZA
  * slug
  * indexStatus=NOINDEX

### Step 6 — Run “Page Build” job

For each page:

* Resolve HS candidates
* Check tariff availability for candidates
* Compute 3 scenario outputs using the best candidate (highest confidence with rates)
* Generate internal links
* Compute readiness
* Set:

  * `indexStatus=INDEX` if ready
  * else `NOINDEX` + reason

---

## 5) Practical “seed.ts” outline (what it should do)

You can implement this in `prisma/seed/seed.ts`:

1. Upsert Countries
2. Upsert ProductClusters
3. Upsert HsCodes from candidate map
4. Create Cluster→HS maps
5. Upsert TariffVersion + TariffRates
6. Upsert Docs/Risks
7. Generate 200 SeoPages
8. Run build pass to set readiness/indexStatus

---

## 6) Rollout strategy for the first 200 pages (to avoid SEO faceplant)

### Week 1: Publish only 20–40 pages

Pick 2–4 clusters where you’re confident you can cover HS + rates + docs cleanly (e.g., solar hardware, common electronics).

* Let Google crawl, measure:

  * calc activation
  * calc completion
  * time on page
  * bounce
* Fix UX + HS helper

### Week 2: Expand to 100 pages

Only index pages that pass the readiness gate.

### Week 3: All 200 pages

Once the pipeline is stable.

---

## 7) Deliverable checklist for “first 200 seed complete”

You’re done when:

* 200 SeoPage rows exist
* At least 50+ are **INDEX** (readiness≥70) and have scenario outputs
* All others are NOINDEX with explicit blockers recorded
* Sitemaps include only INDEX pages
* Each indexed page renders:

  * calculator prefilled
  * 3 scenarios
  * docs block
  * internal links

---

If you want, I can generate **the actual `pages_seed.json` (all 200 rows)** and a **seed.ts script skeleton** tailored to your Prisma models — but I’ll need to know your exact slug preference (uppercase ISO vs lowercase, and whether you want “ZA” or “south-africa” in URL).
