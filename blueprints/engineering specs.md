Awesome — here’s a **concrete build backlog** you can hand to engineering (or use yourself). It includes:

* **Epics → stories → acceptance criteria**
* A **database / rules schema outline**
* **Publishing rules** (what qualifies to index vs noindex)
* A **first 200 “money pages” list** (20 product clusters × 10 origins)

---

## 0) Backlog structure and “Definition of Done”

### MVP “Definition of Done” (SA wedge)

You can credibly ship when you have:

1. Landed cost calculator that produces **auditable breakdowns** (duty + VAT + levies) for a scoped HS set
2. A **tariff/rules versioning** system (so updates don’t silently change results)
3. pSEO template that generates **index-worthy** pages (not thin)
4. Basic auth + save/export paywall
5. Indexation controls (canonical/noindex/sitemaps) + analytics

---

## 1) Epics + user stories backlog (prioritized)

### EPIC A — Foundations (repo, observability, analytics, SEO safety)

**Goal:** You can ship fast without burning SEO trust or breaking calculations.

**A1. Instrumentation + events**

* **Story:** Track `page_view`, `calc_started`, `calc_completed`, `hs_suggested`, `paywall_viewed`, `checkout_clicked`, `subscription_started`.
* **Acceptance:** Events fire with stable IDs; dashboards show funnel rates by page template + origin + product cluster.

**A2. Feature flags**

* **Story:** Gate new tariff versions, new HS mappings, new page types.
* **Acceptance:** Can roll back tariff/rules without redeploy.

**A3. SEO safety rails**

* **Story:** Per-page `index/noindex`, canonical tags, robots, sitemap partitioning.
* **Acceptance:** Any page lacking “unique value bundle” is automatically `noindex`.

---

### EPIC B — Tariff Brain v0 (data model + ingestion + versioning)

**Goal:** A deterministic, auditable rules core.

**B1. Data schema + migrations**

* **Acceptance:** Schema supports: HS code, rate components, effective dates, origin preference rates, doc requirements, risk flags, and versioning.

**B2. Tariff ingestion pipeline (manual + structured)**

* **Story:** Admin can import/update HS rates in structured form (CSV first; automation later).
* **Acceptance:** Ingestion creates a new version; diffs are visible (what changed, when, why).

**B3. Rule versioning**

* **Story:** Every calculation stores the exact tariff version + VAT rule version.
* **Acceptance:** Re-running old calc reproduces identical results unless user chooses “latest rules”.

**B4. Data quality checks**

* **Acceptance:** Block publishing if required fields missing (rate base, effective date, origin handling, VAT logic flags).

---

### EPIC C — Calculation Engine (duty/VAT/landed cost) v0

**Goal:** <30 seconds to a trustworthy number.

**C1. Calculation API**

* Inputs: product (or HS), origin, customs value, freight, insurance, incoterm, quantity, importer type, currency.
* Outputs: line-by-line breakdown + totals + per-unit landed cost + rule references.
* **Acceptance:** Returns deterministic JSON + human-readable breakdown text.

**C2. VAT logic module (SA)**

* **Acceptance:** VAT computation is consistent, tested, and versioned.

**C3. Levies / special duties flags**

* **Acceptance:** Engine can represent “extra components” even if not implemented for all HS at first (so the model scales).

**C4. Audit trace**

* **Acceptance:** Each output includes: inputs, assumptions used, tariff version, and “confidence label”.

---

### EPIC D — Web app: Calculator-first UX (activation engine)

**Goal:** Users calculate immediately on any page.

**D1. Calculator UI component**

* **Acceptance:** Works on every page type; loads pre-filled defaults; produces result in <2s once inputs valid (excluding network).

**D2. “Scenario presets”**

* Presets: R10k / R50k / R250k value, common incoterms, common shipping allocations.
* **Acceptance:** One click applies preset; results update.

**D3. Result UX**

* **Acceptance:** Breakdown is skimmable; export/save CTAs appear only after successful calculation.

---

### EPIC E — HS Mapping v0 (product → HS candidates)

**Goal:** You can start from “normal words” (critical for SEO conversion).

**E1. Product cluster → HS candidate map**

* **Acceptance:** For each product cluster, you store 3–10 candidate HS codes with confidence + notes.

**E2. Guided HS helper (lightweight)**

* **Story:** Ask 3–5 disambiguation questions only when needed.
* **Acceptance:** Produces a ranked HS set; user can override.

**E3. HS synonyms library**

* **Acceptance:** Search and mapping recognizes common synonyms (e.g., “inverter” vs “power inverter”).

---

### EPIC F — Trade preferences / agreements v0

**Goal:** Origin affects rates and docs.

**F1. Origin preference table**

* **Acceptance:** Given HS + origin, engine returns preference eligibility + doc requirements (even if many are “unknown” initially, the structure exists).

**F2. “Docs required” checklist per page**

* **Acceptance:** Page renders checklist; any unknowns are explicitly labeled.

---

### EPIC G — pSEO page system (page factory)

**Goal:** Generate thousands of genuinely useful pages safely.

**G1. Page types**

1. Product+Origin → SA calculator page (the “money page”)
2. HS+Origin → SA calculator page (more precise)
3. HS hub page (explain HS, common uses, related origins)

* **Acceptance:** Each page type has a strict “unique value bundle” (see publishing rules).

**G2. Internal linking graph**

* **Acceptance:** Every page links to:

  * same product other origins
  * same origin other products
  * HS hub (if mapped)
  * “How to classify” / “Docs checklist” utility pages

**G3. Programmatic content blocks**

* **Acceptance:** Content blocks are computed from data (rates, docs, risks) — not generic copy.

**G4. Sitemap partitioning**

* **Acceptance:** Separate sitemaps per page type and per 10k URLs; only indexable pages included.

---

### EPIC H — Monetization (save/export/paywall)

**Goal:** Convert activated users without outbound.

**H1. Accounts + workspace**

* **Acceptance:** Users can save calculations and scenarios.

**H2. Export (PDF/CSV)**

* **Acceptance:** Export is paywalled; free users see preview only.

**H3. Subscriptions**

* Tiers: Free / SME / Pro / Enterprise.
* **Acceptance:** Stripe (or equivalent) integrated; entitlements enforced server-side.

**H4. Usage limits**

* **Acceptance:** Soft limits for Free; transparent upgrade prompts.

---

### EPIC I — Alerts & retention loop (user-initiated only)

**Goal:** Repeat use without marketing.

**I1. Watchlist**

* Watch: HS code, product cluster, origin pair.
* **Acceptance:** Users can add to watchlist from results.

**I2. Change detection**

* **Acceptance:** When tariff version updates, affected watchlist items are flagged in-app (and optionally emailed only if user opts in).

---

### EPIC J — Admin console (ops = shipping velocity)

**Goal:** You can expand coverage daily.

**J1. HS editor**

* **Acceptance:** Add/edit HS, rates, docs, risk notes, origin preference.

**J2. Page publishing dashboard**

* **Acceptance:** Shows indexable vs noindex counts, missing data blockers, top performing pages.

**J3. Regression suite runner**

* **Acceptance:** Admin can run test pack before promoting new tariff version.

---

### EPIC K — Regression tests (the “don’t embarrass us” suite)

**Goal:** Accuracy is the moat.

**K1. Golden scenarios**

* **Acceptance:** 100 hand-verified scenarios produce stable outputs across releases.

**K2. Fuzz tests**

* **Acceptance:** Engine handles invalid inputs safely; never outputs nonsense silently.

---

### EPIC L — API + widgets (Pro growth)

**Goal:** Self-serve “embed the calculator” for teams/3PLs.

**L1. API keys + rate limits**

* **Acceptance:** Keys per org; logging; revoke/rotate.

**L2. Widget embed**

* **Acceptance:** Lightweight JS embed with org branding + usage tracking.

---

## 2) Database / rules schema outline (practical)

### Core reference tables

* `hs_code` (hs6, hs8/10 optional, title, description, tags)
* `hs_synonym` (term, hs_code_id, weight)
* `product_cluster` (slug, name, description)
* `product_cluster_hs_map` (cluster_id, hs_code_id, confidence, notes)

### Tariff/rules versioning

* `tariff_version` (id, effective_from, published_at, notes)
* `tariff_rate` (tariff_version_id, hs_code_id, duty_type, ad_valorem_pct, specific_rule_json, min/max, notes)
* `tariff_extra_component` (e.g., levies/excise/anti-dumping flags) linked to HS + version

### Trade preferences

* `trade_agreement` (name, code)
* `origin_country` (iso, name)
* `preference_rate` (tariff_version_id, hs_code_id, origin_country_id, agreement_id, duty_override_json, eligibility_notes)

### Compliance/docs/risk

* `doc_requirement` (hs_code_id, origin_country_id nullable, requirement_type, description, links/refs, confidence)
* `risk_flag` (hs_code_id, type, severity, explanation)

### Calculation & user data

* `calc_run` (id, user_id nullable, created_at, tariff_version_id, inputs_json, outputs_json, confidence_label)
* `saved_scenario` (user_id, name, calc_run_id, tags)
* `watch_item` (user_id, type, reference_id)
* `subscription` (user_id/org_id, tier, status, started_at)

### SEO publishing

* `page` (slug, page_type, product_cluster_id nullable, hs_code_id nullable, origin_country_id, destination_country_id, index_status, canonical_slug, last_built_at)
* `page_metric_daily` (slug, impressions, clicks, ctr, avg_position, calc_completions)

---

## 3) Publishing rules (what gets indexed vs noindex)

### A page is **INDEXABLE** only if it satisfies all:

1. Has a **pre-filled calculator** with a valid default HS mapping OR explicit HS
2. Can output a **non-empty breakdown** (duty + VAT minimum)
3. Includes at least **2 unique, data-driven blocks** beyond the calculator, such as:

   * doc checklist (not empty)
   * preference eligibility summary
   * risk flags
   * scenario presets with computed outputs
4. Has at least **6 internal links** (related origins/products/HS hub)
5. Has **freshness metadata** (tariff version + last updated date)

### Auto-**NOINDEX** if any:

* No HS candidates available
* Rate missing / unknown for mapped HS
* Output would be “contact a broker” without numbers
* Duplicates another page (same effective rates/docs) → canonicalize instead

### Canonicalization rules

* If multiple product synonyms map to same cluster → one canonical slug
* If product+origin page resolves to a single HS with high confidence → canonical can point to HS+origin page

---

## 4) The first 200 “money pages” (SA wedge)

Format:
`/import-duty-vat-landed-cost/<product>-from-<origin>-to-south-africa`

**Origins (10):** china, usa, germany, uae, india, uk, japan, italy, turkey, vietnam

**Product clusters (20):** solar-panels, inverters, lithium-batteries, smartphones, laptops, tvs, routers, security-cameras, printers, power-tools, tyres, car-parts, engine-oil, medical-gloves, vitamins-supplements, cosmetics, clothing, sneakers, furniture, kitchenware

That’s 20 × 10 = **200 pages**, listed below.

#### 1) solar-panels

1. solar-panels-from-china-to-south-africa
2. solar-panels-from-usa-to-south-africa
3. solar-panels-from-germany-to-south-africa
4. solar-panels-from-uae-to-south-africa
5. solar-panels-from-india-to-south-africa
6. solar-panels-from-uk-to-south-africa
7. solar-panels-from-japan-to-south-africa
8. solar-panels-from-italy-to-south-africa
9. solar-panels-from-turkey-to-south-africa
10. solar-panels-from-vietnam-to-south-africa

#### 2) inverters

11. inverters-from-china-to-south-africa
12. inverters-from-usa-to-south-africa
13. inverters-from-germany-to-south-africa
14. inverters-from-uae-to-south-africa
15. inverters-from-india-to-south-africa
16. inverters-from-uk-to-south-africa
17. inverters-from-japan-to-south-africa
18. inverters-from-italy-to-south-africa
19. inverters-from-turkey-to-south-africa
20. inverters-from-vietnam-to-south-africa

#### 3) lithium-batteries

21. lithium-batteries-from-china-to-south-africa
22. lithium-batteries-from-usa-to-south-africa
23. lithium-batteries-from-germany-to-south-africa
24. lithium-batteries-from-uae-to-south-africa
25. lithium-batteries-from-india-to-south-africa
26. lithium-batteries-from-uk-to-south-africa
27. lithium-batteries-from-japan-to-south-africa
28. lithium-batteries-from-italy-to-south-africa
29. lithium-batteries-from-turkey-to-south-africa
30. lithium-batteries-from-vietnam-to-south-africa

#### 4) smartphones

31. smartphones-from-china-to-south-africa
32. smartphones-from-usa-to-south-africa
33. smartphones-from-germany-to-south-africa
34. smartphones-from-uae-to-south-africa
35. smartphones-from-india-to-south-africa
36. smartphones-from-uk-to-south-africa
37. smartphones-from-japan-to-south-africa
38. smartphones-from-italy-to-south-africa
39. smartphones-from-turkey-to-south-africa
40. smartphones-from-vietnam-to-south-africa

#### 5) laptops

41. laptops-from-china-to-south-africa
42. laptops-from-usa-to-south-africa
43. laptops-from-germany-to-south-africa
44. laptops-from-uae-to-south-africa
45. laptops-from-india-to-south-africa
46. laptops-from-uk-to-south-africa
47. laptops-from-japan-to-south-africa
48. laptops-from-italy-to-south-africa
49. laptops-from-turkey-to-south-africa
50. laptops-from-vietnam-to-south-africa

#### 6) tvs

51. tvs-from-china-to-south-africa
52. tvs-from-usa-to-south-africa
53. tvs-from-germany-to-south-africa
54. tvs-from-uae-to-south-africa
55. tvs-from-india-to-south-africa
56. tvs-from-uk-to-south-africa
57. tvs-from-japan-to-south-africa
58. tvs-from-italy-to-south-africa
59. tvs-from-turkey-to-south-africa
60. tvs-from-vietnam-to-south-africa

#### 7) routers

61. routers-from-china-to-south-africa
62. routers-from-usa-to-south-africa
63. routers-from-germany-to-south-africa
64. routers-from-uae-to-south-africa
65. routers-from-india-to-south-africa
66. routers-from-uk-to-south-africa
67. routers-from-japan-to-south-africa
68. routers-from-italy-to-south-africa
69. routers-from-turkey-to-south-africa
70. routers-from-vietnam-to-south-africa

#### 8) security-cameras

71. security-cameras-from-china-to-south-africa
72. security-cameras-from-usa-to-south-africa
73. security-cameras-from-germany-to-south-africa
74. security-cameras-from-uae-to-south-africa
75. security-cameras-from-india-to-south-africa
76. security-cameras-from-uk-to-south-africa
77. security-cameras-from-japan-to-south-africa
78. security-cameras-from-italy-to-south-africa
79. security-cameras-from-turkey-to-south-africa
80. security-cameras-from-vietnam-to-south-africa

#### 9) printers

81. printers-from-china-to-south-africa
82. printers-from-usa-to-south-africa
83. printers-from-germany-to-south-africa
84. printers-from-uae-to-south-africa
85. printers-from-india-to-south-africa
86. printers-from-uk-to-south-africa
87. printers-from-japan-to-south-africa
88. printers-from-italy-to-south-africa
89. printers-from-turkey-to-south-africa
90. printers-from-vietnam-to-south-africa

#### 10) power-tools

91. power-tools-from-china-to-south-africa
92. power-tools-from-usa-to-south-africa
93. power-tools-from-germany-to-south-africa
94. power-tools-from-uae-to-south-africa
95. power-tools-from-india-to-south-africa
96. power-tools-from-uk-to-south-africa
97. power-tools-from-japan-to-south-africa
98. power-tools-from-italy-to-south-africa
99. power-tools-from-turkey-to-south-africa
100. power-tools-from-vietnam-to-south-africa

#### 11) tyres

101. tyres-from-china-to-south-africa
102. tyres-from-usa-to-south-africa
103. tyres-from-germany-to-south-africa
104. tyres-from-uae-to-south-africa
105. tyres-from-india-to-south-africa
106. tyres-from-uk-to-south-africa
107. tyres-from-japan-to-south-africa
108. tyres-from-italy-to-south-africa
109. tyres-from-turkey-to-south-africa
110. tyres-from-vietnam-to-south-africa

#### 12) car-parts

111. car-parts-from-china-to-south-africa
112. car-parts-from-usa-to-south-africa
113. car-parts-from-germany-to-south-africa
114. car-parts-from-uae-to-south-africa
115. car-parts-from-india-to-south-africa
116. car-parts-from-uk-to-south-africa
117. car-parts-from-japan-to-south-africa
118. car-parts-from-italy-to-south-africa
119. car-parts-from-turkey-to-south-africa
120. car-parts-from-vietnam-to-south-africa

#### 13) engine-oil

121. engine-oil-from-china-to-south-africa
122. engine-oil-from-usa-to-south-africa
123. engine-oil-from-germany-to-south-africa
124. engine-oil-from-uae-to-south-africa
125. engine-oil-from-india-to-south-africa
126. engine-oil-from-uk-to-south-africa
127. engine-oil-from-japan-to-south-africa
128. engine-oil-from-italy-to-south-africa
129. engine-oil-from-turkey-to-south-africa
130. engine-oil-from-vietnam-to-south-africa

#### 14) medical-gloves

131. medical-gloves-from-china-to-south-africa
132. medical-gloves-from-usa-to-south-africa
133. medical-gloves-from-germany-to-south-africa
134. medical-gloves-from-uae-to-south-africa
135. medical-gloves-from-india-to-south-africa
136. medical-gloves-from-uk-to-south-africa
137. medical-gloves-from-japan-to-south-africa
138. medical-gloves-from-italy-to-south-africa
139. medical-gloves-from-turkey-to-south-africa
140. medical-gloves-from-vietnam-to-south-africa

#### 15) vitamins-supplements

141. vitamins-supplements-from-china-to-south-africa
142. vitamins-supplements-from-usa-to-south-africa
143. vitamins-supplements-from-germany-to-south-africa
144. vitamins-supplements-from-uae-to-south-africa
145. vitamins-supplements-from-india-to-south-africa
146. vitamins-supplements-from-uk-to-south-africa
147. vitamins-supplements-from-japan-to-south-africa
148. vitamins-supplements-from-italy-to-south-africa
149. vitamins-supplements-from-turkey-to-south-africa
150. vitamins-supplements-from-vietnam-to-south-africa

#### 16) cosmetics

151. cosmetics-from-china-to-south-africa
152. cosmetics-from-usa-to-south-africa
153. cosmetics-from-germany-to-south-africa
154. cosmetics-from-uae-to-south-africa
155. cosmetics-from-india-to-south-africa
156. cosmetics-from-uk-to-south-africa
157. cosmetics-from-japan-to-south-africa
158. cosmetics-from-italy-to-south-africa
159. cosmetics-from-turkey-to-south-africa
160. cosmetics-from-vietnam-to-south-africa

#### 17) clothing

161. clothing-from-china-to-south-africa
162. clothing-from-usa-to-south-africa
163. clothing-from-germany-to-south-africa
164. clothing-from-uae-to-south-africa
165. clothing-from-india-to-south-africa
166. clothing-from-uk-to-south-africa
167. clothing-from-japan-to-south-africa
168. clothing-from-italy-to-south-africa
169. clothing-from-turkey-to-south-africa
170. clothing-from-vietnam-to-south-africa

#### 18) sneakers

171. sneakers-from-china-to-south-africa
172. sneakers-from-usa-to-south-africa
173. sneakers-from-germany-to-south-africa
174. sneakers-from-uae-to-south-africa
175. sneakers-from-india-to-south-africa
176. sneakers-from-uk-to-south-africa
177. sneakers-from-japan-to-south-africa
178. sneakers-from-italy-to-south-africa
179. sneakers-from-turkey-to-south-africa
180. sneakers-from-vietnam-to-south-africa

#### 19) furniture

181. furniture-from-china-to-south-africa
182. furniture-from-usa-to-south-africa
183. furniture-from-germany-to-south-africa
184. furniture-from-uae-to-south-africa
185. furniture-from-india-to-south-africa
186. furniture-from-uk-to-south-africa
187. furniture-from-japan-to-south-africa
188. furniture-from-italy-to-south-africa
189. furniture-from-turkey-to-south-africa
190. furniture-from-vietnam-to-south-africa

#### 20) kitchenware

191. kitchenware-from-china-to-south-africa
192. kitchenware-from-usa-to-south-africa
193. kitchenware-from-germany-to-south-africa
194. kitchenware-from-uae-to-south-africa
195. kitchenware-from-india-to-south-africa
196. kitchenware-from-uk-to-south-africa
197. kitchenware-from-japan-to-south-africa
198. kitchenware-from-italy-to-south-africa
199. kitchenware-from-turkey-to-south-africa
200. kitchenware-from-vietnam-to-south-africa

---

## 5) What I’d do next (immediately useful)

If you say “go”, the next practical step is to convert this backlog into a **2-level Jira-style board**:

* **Now / Next / Later**
* With dependencies and a “ship gate” checklist (accuracy + indexation + conversion).

If you want that board layout, tell me what stack you’re using (Next.js? Supabase? etc.) and I’ll map stories to components/services with exact folder/module boundaries.
