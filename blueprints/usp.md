# importcosts USP Document

App: **importcosts** ([www.importcosts.co.za](http://www.importcosts.co.za)) — enterprise-grade import cost + compliance decisioning, distributed via **pSEO only**

---

## 1) The USP in one sentence

**importcosts turns “I want to import X from Y” into a decision-grade landed-cost + compliance outcome in under 30 seconds, with an auditable trace (rules/version/citations), directly on the SEO page that matches the exact route and product.**

If you only ship “duty %”, you’re a commodity. The USP is **outcome + trust + speed + route-specific usability**.

---

## 2) The “why users pay” reality

Users don’t pay for a number. They pay to:

* **avoid expensive surprises** (margin blown by VAT/levies/freight basis)
* **reduce risk** (misclassification, wrong preference claims, missing docs, delays)
* **create an internal artifact** (a PDF/CSV or saved scenario an ops team can rely on)
* **repeat the workflow** (they import the same things repeatedly)

So the USP must produce: **decision + evidence + reusability**.

---

## 3) USP Pillars (what makes you beat incumbents)

### Pillar A — “Landed cost, not duty”

Incumbent tools often stop at duty. You must answer the real question:

* total taxes (duty + VAT + levies where applicable)
* landed cost total + landed cost per unit
* scenario presets (“R10k / R50k / R250k” or business-relevant bands)
* clear assumptions (incoterm, freight allocation, importer type)

**Implementation**

* Calculation engine returns **full breakdown** (not just one line item)
* Page template renders a **Result Preview** (big numbers) + **Breakdown Table** (line items)

**Retention/Monetization hook**

* Export/save is valuable only once the output is “complete enough to decide”.

---

### Pillar B — Trust is the product: audit trail by default

This is the enterprise wedge. Every output must be explainable, versioned, and reproducible:

* “Tariff Version used”
* “VAT basis used”
* “Which rules fired”
* citations/refs to official sources (e.g., SARS material) without making the user hunt PDFs

**Implementation**

* Every calc run stores:

  * inputs JSON (immutable)
  * outputs JSON (immutable)
  * tariff_version_id
  * a step-by-step `explain` trace
* UI has a **“Why?” drawer** per number:

  * formula
  * values substituted
  * rule version
  * linkable references

**Retention/Monetization hook**

* Teams will pay for **auditability**, exports, and workspace history.

---

### Pillar C — Handle HS uncertainty honestly (and still be useful)

The #1 practical killer is HS ambiguity. Your differentiator is NOT “we magically classify everything”, it’s:

* **HS shortlist + confidence**
* 2–3 disambiguation questions when confidence is low
* show **range impact** (“If HS A vs HS B, your landed cost changes by X”)
* never pretend certainty

**Implementation**

* Product cluster → HS candidates mapping with confidence + notes
* HS helper drawer:

  * accepts plain-English product description
  * suggests 3–5 candidates
  * asks minimal clarifying questions only when needed
* Engine supports “range mode” (compute multiple HS candidates and show spread)

**Retention/Monetization hook**

* Pro feature: “Save HS decision notes” + “share with team” (reduces repeat friction).

---

### Pillar D — Route-specific, pre-filled “money pages” (SEO pages that behave like tools)

Your distribution is pSEO-only; the page must do the work instantly:

* “Solar panels from China → South Africa” loads **pre-filled**
* shows **3 computed scenarios**
* shows docs checklist + risk flags
* links to compare origins, related HS hubs, adjacent routes

**Implementation**

* PageBuild job computes:

  * readiness score
  * scenario outputs
  * internal link graph
* Indexation gate:

  * only INDEX pages that have real computed output + non-empty structured blocks

**Retention/Monetization hook**

* Users will return to *the same* route pages (repeat imports). “Saved route” becomes natural.

---

### Pillar E — Compliance outcome, not compliance content

Don’t write guides. Generate **actionable checklists**:

* docs required (always/conditional/preference)
* risk flags (controlled goods, trade remedies, inspections)
* “what would need to be true” to claim preference
  This is where incumbents are “PDF heavy” and slow.

**Implementation**

* `doc_requirement` + `risk_flag` tied to HS and optionally origin
* UI blocks: DocChecklist, RiskBanner, PreferencePill
* Explicit confidence labels: “confirmed” vs “commonly required” vs “unknown”

**Retention/Monetization hook**

* Paid: “Export compliance pack” (docs list + evidence checklist + timeline).

---

## 4) USP → Product surface design (what the user experiences)

### The 30-second flow (pSEO page or tool page)

1. Land on route page (pre-filled product + origin)
2. Enter customs value (+ optional freight/insurance/qty)
3. Click **Calculate**
4. See:

   * Big numbers (total taxes, landed cost, per unit)
   * Confidence badge
   * “Why?” drawer (audit)
   * Scenario presets
   * Docs checklist
   * Risks/preferences

**The UI/UX weapon:** every page is a mini “decision terminal” with calm clarity.

---

## 5) Retention loops (SEO-only, no outbound required)

### Loop 1 — Saved Imports Workspace

* Save calculation + assumptions + HS choice
* Re-run later using latest tariff version
* Compare “then vs now”

**Why it retains:** importing is repetitive; they need a memory system.

### Loop 2 — Watchlist (in-app change detection)

* Watch route (product+origin), HS code, or cluster
* When a tariff version updates, show:

  * “Your saved routes impacted: 3”
  * “Estimated delta: +R X”

Opt-in email is optional, but in-app alone can retain.

### Loop 3 — Scenario Comparison as a habit

* “China vs Vietnam”
* “FOB vs CIF”
* “Sea vs air”
  Store comparisons for procurement decisions.

### Loop 4 — Export artifacts

Exports create internal sharing: PDF/CSV gets forwarded, referenced, reused → your product becomes part of the workflow.

---

## 6) Monetization design (what to charge for and why)

### Free tier (prove value, avoid frustration)

* Unlimited page views
* Limited calculations/day
* Limited HS suggestions/day
* Result summary + basic breakdown
* 1–3 saved calcs

### SME tier (core paid tier)

* Unlimited calculations
* Save/export PDF & CSV
* Scenario comparison
* Watchlist (in-app)
* Calculation history + tags

### Pro / Team tier

* Multi-user workspace
* API keys (later)
* Advanced audit exports (“rules trace”)
* Higher limits + priority updates

**Payment rail:** Stripe is ideal for subscriptions, but any equivalent works.

---

## 7) Paywall mechanics that maximize conversion (without harming UX)

**Principle:** never paywall *before* the user sees value. Paywall *after* a successful calc.

### Best paywall triggers

* Export PDF / CSV
* Save scenario beyond free quota
* Compare >2 scenarios
* Watchlist changes (or more than 1 watched item)
* Team features (sharing, multi-user)

### Paywall UX

* “Unlock this output” (not “subscribe now”)
* Show exactly what they get for this task:

  * “Export this landed-cost summary”
  * “Save this import route and re-run later”
* Keep pricing visible and simple on the paywall modal.

---

## 8) Implementation blueprint (USP features in the right order)

### Phase 1 — Make “duty calculator” become “landed cost”

* VAT module + landed cost totals + per-unit
* Scenario presets
* Result Breakdown Table

**Test:** golden scenarios produce stable outputs; UI renders in <2s.

### Phase 2 — Trust layer (audit + versioning)

* tariff versioning + calc_run immutability
* “Why?” drawer (explain trace)
* references/citations surfaced

**Test:** re-running old calc reproduces identical output.

### Phase 3 — HS uncertainty management

* cluster → HS mapping table + confidence
* HS helper drawer + minimal questions
* range mode for low confidence

**Test:** user can complete a calc from plain-English description without rage-quitting.

### Phase 4 — pSEO money pages that are actually useful

* PageBuild computes scenario outputs + readiness
* noindex until page qualifies
* internal linking map

**Test:** sitemap contains only indexable pages; each indexed page has computed scenarios + docs/risk blocks.

### Phase 5 — Retention + monetization

* saved workspace + exports
* watchlist change detection
* compare tool

**Test:** anonymous → calc → paywall → subscribe → export works end-to-end.

### Phase 6 — Compliance expansions

* controlled goods/permit signals (where public data supports it)
* deeper doc checklists
* trade remedies awareness (anti-dumping/safeguards)

**Note:** tie any controls/licensing signals to official bodies (e.g., ITAC) and label confidence to avoid “guesswork”.

---

## 9) What “useful, not guesswork” means in practice

You must enforce these rules:

* If HS is uncertain → show **confidence + range**, not a single fake-precise number
* If a rate/levy is missing → page stays **NOINDEX** and calculator warns clearly
* Every calculation states assumptions and the tariff version
* If user input is the limitation (customs value/freight) → be explicit and give sensible defaults with toggleable assumptions

This is how you earn trust and payment.

---

## 10) Success metrics tied to the USP

Track by page (cluster+origin) and by cohort:

**Activation**

* calc_started / page_view
* calc_completed / calc_started

**Trust**

* “Why drawer” opens per completed calc
* HS helper completion rate

**Monetization**

* export_click / calc_completed
* subscribe / paywall_view
* ARPA, churn, retention (7/30/90 day)

**SEO health**

* % indexed pages that meet readiness criteria
* content quality signals (time on page after calc, return visits)

---

## Bottom line: the USP you’re building

You’re not building “an import duty calculator.”
You’re building the **enterprise-grade decision system** for **route-specific landed cost + compliance**, delivered **instantly** via SEO pages, with **auditability** and **repeatability**. That’s what retains, and that’s what converts.
