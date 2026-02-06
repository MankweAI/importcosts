Below is a **single execution spec** for **LandedCost OS** (import duty + VAT + landed cost + compliance engine), designed to win **SA-first via pSEO only**, then expand globally.

---

## LandedCost OS Execution Spec

### 1) Product thesis

Build the **default “answer-first” destination** for:
**“How much will it cost to import X from Y into South Africa (and what do I need to do)?”**
The product must collapse SARS/tariff complexity into a **<30-second** outcome: duty/VAT/levies + landed cost per unit + trade preference + required documents. 

---

### 2) ICP and economic buyer

**Primary users (SA wedge):**

* Importing SMEs / mid-market retailers, distributors, manufacturers
* 3PLs, freight forwarders, customs brokers needing customer-facing calculators/widgets
* Cross-border ecom merchants shipping into SA 

**Economic buyer:** Ops/logistics manager, CFO, founder who owns import P&L and compliance risk. 

**Why they pay:** misclassification, delays, penalties, and “surprise landed cost” are expensive; incumbents already monetize via calculators → consulting/software/broker services.  

---

### 3) The wedge: free tool that solves the search *immediately*

**Core tools (must ship in this order):**

1. **Universal Landed Cost Calculator**
   Inputs: HS code (or description), origin, destination, customs value, freight/insurance, incoterm, importer type.
   Outputs: duty/VAT/levies breakdown + landed cost per unit + references. 

2. **HS Classification Helper (guided)**
   Takes a lay description → suggests HS candidates → asks 3–5 clarifying questions → shows confidence + “get a ruling” warnings. 

3. **Trade Agreement / Rebate Engine**
   Given origin + HS: show preference eligibility + documentary trail (certificates of origin, etc.). 

4. **Scenario Comparator**
   Air vs sea, FOB vs CIF vs DDP, China vs Vietnam, etc. 

**Non-negotiable:** each tool must give a decision-quality answer in one shot (no PDF scavenger hunt). 

---

### 4) pSEO factory design (the growth engine)

You are not building “an import duty calculator page.” You are building an indexable **entity library**.

**Core entities & parameters (SA wedge first):**

* HS code (6–10 digit) + plain-language product category
* Origin country
* Destination country (SA first)
* Trade agreement (MFN, SADC, EU, etc.)
* Shipment type (B2B vs B2C; gift vs sale)
* Transport mode (air/sea/road; courier vs freight)
* Value bands (R10k / R50k / R250k typical)
* Incoterms (FOB, CIF, DAP, DDP)
* Importer profile (VAT vendor vs individual) 

**Scale model (SA-first):**

* ~3,000 inbound-relevant HS6 codes
* × ~40 main origin partners → ~120k HS6-origin combinations
* Don’t publish all: **target top ~20k product–origin pairs covering the bulk of trade**, then expand. 

**Canonical page type**
`/import/hs-[code]-[product]-from-[origin]-to-south-africa-duty-vat-calculator`

Use the report’s proven examples as your initial blueprint. 

**Why these pages aren’t spam**
Each page embeds:

* pre-configured duty + VAT examples (value band presets)
* compliance/document checklist for that HS/product
* risk callouts (anti-dumping, common misclassification traps)
* the calculator pre-loaded with that HS/product + origin 

---

### 5) Data + calculation engine spec (the “trust core”)

You need an internal “Tariff Brain” that produces deterministic outputs and is fully auditable.

**Data objects (minimum):**

* `hs_code` (6–10), description, synonyms
* `rate_components`: ad valorem %, specific duty rules, excise/levies flags, anti-dumping flags
* `vat_logic`: ATV / uplift / rules required to compute VAT in SA context (store formulas as versioned rules) 
* `trade_preferences`: origin→agreement eligibility + required docs 
* `doc_requirements`: docs/licences/permits per HS/product category (as a checklist)
* `effective_dates`: start/end + “last updated”

**Pipeline**

* Ingest official tariff/rate sources (even if PDF-first), normalize into structured tables.
* Version every change (tariff updates must be diffable).
* Every computed output must expose:

  * inputs
  * rule versions used
  * a human-readable breakdown
  * citations/references (source list)

**Accuracy strategy**

* Start with a narrow slice (top 50–100 HS codes by demand) and be perfect there.
* Expand only when you can pass regression tests (see “Killer tests”).

---

### 6) Page template spec (what every pSEO page must contain)

To win SEO + conversions, every page is a **tool page**, not an article.

**Above the fold**

* Title: “Import Duty, VAT & Landed Cost Calculator: [Product/HS] from [Origin] → South Africa”
* Input widget: value, shipping, incoterm, quantity, importer type
* One-click “Calculate” (pre-filled HS/origin)

**Immediate outputs**

* duty breakdown
* VAT estimate
* total taxes
* landed cost per unit
* confidence / warning labels (e.g., “HS uncertain—answer is a range”)

**Below**

* Document checklist
* Trade preference eligibility
* 3 scenario presets (R10k/R50k/R250k)
* Related internal links: same HS other origins, same origin other HS, “how to classify HS”, “anti-dumping checker”, etc.

**Indexation guardrails**

* Do **not** index “thin” pages (no data/no calculator preset).
* Canonicalize duplicates (synonym products).
* Only publish combinations that have a meaningful rate/doc delta.

---

### 7) Conversion funnel (SEO-only, no outbound)

**Traffic → activation → paid**

1. User lands on a specific HS/product/origin page (high-intent)
2. They run a calculation (activation event)
3. They hit a paywall only when value is proven:

   * export to PDF/CSV
   * save scenarios
   * alerts/watchlists (tariff change, watched HS codes)
   * multi-country calculations
   * API access / embed widgets for 3PLs 

**Retention (no outbound required)**

* “Saved Imports” workspace (repeat imports are the norm)
* “Watched HS codes” dashboard + user-initiated alerts
* Audit trail of calculations (especially for teams)

---

### 8) Pricing & packaging (as per the proven model)

Use the report’s tiering because it matches buyer segments and supports expansion:

* **Freemium:** X free calcs/month, limited detail 
* **SME:** **$49–$99/mo** unlimited SA calculations + save/export + basic alerts 
* **Pro/3PL:** **$199–$399/mo** multi-country + API + white-label widgets + multi-user 
* **Enterprise:** negotiated (brokers, large forwarders) 

Also keep an SA-local price ladder in mind (the exec summary’s R1,000/mo ARPA framing is coherent for SA SMEs). 

---

### 9) Moat plan (compounding advantages)

You’re building compounding assets—not “content.”

**Moats that compound naturally from usage:**

* HS synonym graph (how people describe products) → improves HS helper
* Query-to-HS mapping improvements → higher calc success rate
* Coverage density (HS×origin) → internal link flywheel 
* Scenario library (common imports) → faster answers + better conversion

---

### 10) Build plan (phased deliverables)

This is how you ship without boiling the ocean:

**Phase A — “Narrow but perfect”**

* Build tariff brain for **top 50–100 HS codes** + top 10 origins
* Ship:

  * calculator
  * 1 page template
  * 500–1,000 pages (only where you have full data + doc checklist)
* Instrumentation: activation, calc completion rate, paid clicks

**Phase B — “pSEO ramp”**

* Expand to **top ~20k product–origin pairs** (publish only validated combos) 
* Add:

  * HS helper (guided)
  * scenario compare
  * save/export + paywall

**Phase C — “B2B embed / Pro expansion”**

* API + widget embed for 3PLs/brokers (self-serve docs + keys)
* Multi-user workspaces

**Phase D — “Internationalization”**

* Add more destination countries (the report’s ARR model assumes this ramp). 

---

### 11) Week-1 killer tests (falsifiable, fast, brutal)

These are the “prove or kill” checks before you scale page volume.

1. **Accuracy parity test (deal-breaker):**
   Pick 20 real-world import scenarios (mix of HS types, origins, incoterms). Your outputs must match expert/broker-calculated totals within an acceptable tolerance (define it upfront). If you can’t do this, the whole wedge collapses.

2. **HS ambiguity test (tool viability):**
   Take 30 lay descriptions (e.g., “solar panels”, “toys”, “cookware”). The HS helper must return a correct HS candidate set often enough to let users proceed without rage-quitting. (You’re explicitly betting on “description → HS candidates” being workable). 

3. **Page uniqueness test (SEO survivability):**
   Generate 200 pages and manually review 30 at random. Each must have: a preloaded calculation, a unique duty/VAT logic or doc/risk delta, and meaningful internal links. If pages feel “templated,” Google will treat you like spam.

4. **Activation test (product-market signal):**
   From organic traffic (even tiny early impressions), track: landing → calculation started → calculation completed. If completion is low, your UX or inputs are too demanding (common incumbent weakness is “you need HS upfront”—you must beat that). 

5. **Willingness-to-pay test (without outbound):**
   Gate **export/save** behind pricing and measure click-through to checkout from activated users. If activated users won’t even *attempt* to pay, your value is not strong enough or your pricing ladder is wrong. (This doesn’t require you to email/call anyone.)

---

### 12) The operating metric targets that matter

If these aren’t trending right, you’re not on the $50M+ path:

* **Calc activation rate** (landings → calc started)
* **Calc completion rate** (started → completed)
* **Paid intent rate** (completed → paywall feature click)
* **Net paid conversion** (sessions → paid)
  The report’s scale model assumes meaningful paid conversion at scale. 

---

If you want, I’ll turn this spec into **a concrete “build backlog”** (MVP epics → stories), including:

* exact database schema outline
* the first 20k-page publishing rule (what qualifies / what gets noindexed)
* the first 200 “money keywords” page list derived from your HS/origin strategy
