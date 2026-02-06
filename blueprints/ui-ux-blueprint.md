The core vibe: **fast, calm, ridiculously clear, audit-friendly** — like a fintech terminal, but friendly enough for an SME importer.

---

## 1) Design principles that “dethrone incumbents”

### Answer-first (0→result in one screen)

* Every entrypoint (SEO page, tool page, dashboard) is a **calculator page**.
* No “read this guide” before you can compute.

### Trust is a UI feature

* Every number has a **“Why?” drawer** (formula + inputs + rule version).
* Show **confidence level** and **what could change** (HS uncertainty, missing docs, preference eligibility).

### Zero-PDF mindset

* Replace PDFs with:

  * checklists
  * structured requirements
  * exportable summaries (PDF/CSV) generated from your outputs

### SEO-native layout

* Every pSEO page:

  * loads fast
  * shows the tool above the fold
  * has structured, unique blocks
  * has internal links that feel like a journey, not a footer dump

---

## 2) Information architecture (what exists, and why)

### Public / SEO

* Home
* Pricing
* Tools directory
* HS code directory (find/lookup)
* **pSEO pages (money pages)**

  * Product × Origin → ZA
  * HS × Origin → ZA
  * HS hub pages

### App (logged-in)

* Dashboard (overview)
* Calculations (history)
* Scenarios (saved)
* Watchlist (HS / product / route)
* Billing
* API keys (Pro)
* Team (Pro)

### Admin (internal ops)

* Tariff versions (draft → publish)
* HS codes
* Product cluster → HS mapping
* Docs & risk flags
* Page readiness + indexation controls
* Regression tests

---

## 3) Brand + UI system (your “weapon skin”)

### Look & feel

* **Neutral, high-contrast, enterprise-clean** (think “Stripe docs meets Bloomberg-lite”)
* White/near-white base with subtle gray surfaces
* One strong accent color for primary action (Calculate, Save, Export)

### Typography

* Headings: strong, compact (Inter / Geist / similar)
* Numbers: tabular figures for alignment (crucial in breakdown tables)

### Components to standardize early

* **CalcCard** (the calculator container used everywhere)
* **BreakdownTable** (duty/VAT/fees with expandable details)
* **ConfidenceBadge** (HIGH/MED/LOW + tooltip “why”)
* **DocChecklist** (with “required/conditional” tags)
* **PreferencePill** (e.g., “Possible preference: needs COO”)
* **RiskBanner** (anti-dumping / restricted / inspection risk)
* **ScenarioTabs** (R10k / R50k / R250k + custom)
* **StickyActionBar** (Save / Export / Compare / Add to Watchlist)
* **InternalLinkGrid** (related routes that feel helpful)

---

## 4) The most important screen: SEO money page UI

This is where you win.

### Page template: “Import Duty, VAT & Landed Cost: X from Y → South Africa”

**Above the fold (must fit on laptop without scrolling):**

**Header row**

* Breadcrumbs: Tools → Import Calculator → Solar Panels
* Page title (H1): *Import duty & landed cost for Solar Panels from China to South Africa*
* Subtitle: “Estimate duties, VAT, landed cost per unit, docs checklist—under 30 seconds.”

**Calculator Card (left / main)**

* Inputs (minimal first, advanced tucked away):

  1. Product: prefilled (“Solar panels”) + edit
  2. Origin: prefilled (China)
  3. Destination: South Africa (locked on SA pages)
  4. Customs value (required)
  5. Shipping (optional quick default toggle)
  6. Incoterm (FOB default) + “help” tooltip
  7. Quantity (optional for per-unit)
* Primary button: **Calculate**
* Secondary: “Not sure HS code?” → opens HS helper drawer inline

**Result Preview (right side on desktop)**

* Big numbers:

  * Total taxes
  * Estimated VAT
  * Estimated duty
  * Landed cost (total + per unit if qty)
* Confidence badge + “What affects this?”

**Below the fold (structured blocks, no fluff):**

1. **Breakdown (table)**

   * Duty line items (expandable)
   * VAT basis (expandable)
   * Any levies flags (even if $0)
   * Each row has “Why?” that opens a side drawer with:

     * formula
     * values used
     * tariff version used

2. **Scenario presets**

   * 3 tabs: R10k / R50k / R250k
   * Toggle: “Include shipping estimate”
   * Users love this because it’s instant validation

3. **Docs checklist**

   * Always visible and scannable
   * Grouped:

     * Always required
     * Commonly required (depends)
     * If claiming preference
   * Each item has a short “why it matters”

4. **Trade preference eligibility**

   * A simple “traffic light”:

     * ✅ likely eligible
     * ⚠️ possible, depends on proof
     * ❌ not applicable
   * “What you’d need” list

5. **Risk flags**

   * “Possible anti-dumping risk” / “May require permit” etc.
   * Don’t fear-monger; be specific and calm

6. **Next best actions**

   * “Compare origins for this product” (opens Compare tool with origin prefilled)
   * “View HS codes commonly used for Solar Panels”
   * “Import checklist for first-time importers” (tool page, not blog)

7. **Related pages (internal links that feel like a map)**

   * Same product, other origins
   * Same origin, other products
   * HS hub pages

### Sticky action bar (appears after a successful calc)

* **Save** (free: 1–3 saves)
* **Export PDF / CSV** (paywalled)
* **Compare scenarios**
* **Add to Watchlist**

This is where conversions happen without feeling spammy.

---

## 5) HS helper UX (make “HS code” friction disappear)

**Trigger:** “Not sure HS code?” (inline, no navigation)

### Flow (fast)

1. User types product description in normal English:

   * “solar panel 550w mono”
2. You return 3–5 candidate HS codes with:

   * confidence
   * short plain explanation
   * “common misclassification warning”
3. If confidence < threshold, ask 1–3 clarifying questions:

   * “Is it a complete module/panel or a component?”
   * “Is it assembled or parts?”
4. User selects one candidate → calculator pre-fills HS and reruns.

**UX trick:** always show “you can override” so users don’t feel trapped.

---

## 6) Compare tool UX (turns research intent into conversion)

**UI:** a comparison table with 2–4 columns:

* Scenario A (China, FOB, R50k)
* Scenario B (Vietnam, FOB, R50k)
* Scenario C (Air freight)
* Scenario D (Claim preference)

Rows:

* Duty
* VAT
* Total taxes
* Landed cost
* Docs delta
* Risk delta

**CTA:** “Save comparison” (Pro), “Export” (Pro)

---

## 7) Dashboard UX (retention without marketing)

### Dashboard home

* “Recent calculations” (cards)
* “Watchlist changes” (tariff version updates affecting your items)
* “Saved scenarios” (pin the top ones)
* “Quick calculate” (always available)

### Calculations list

* Searchable, filterable:

  * product
  * origin
  * HS code
  * date
* Each row:

  * key numbers
  * confidence badge
  * export/save icons

### Watchlist

* Items: HS code, product cluster, route (CN→ZA solar panels)
* Shows:

  * last tariff version used
  * any changes since saved

**Retention loop is UI-driven:** “Your saved imports still match latest rules?” (no email needed unless user opts in)

---

## 8) Pricing & paywall UX (feel fair, not annoying)

**Paywall philosophy:** only gate what users already value.

* Free:

  * calculations (limited)
  * view breakdown (basic)
  * HS suggestions (limited)
* Paid gates:

  * Export PDF/CSV
  * Save unlimited
  * Watchlist alerts
  * Multi-country
  * API keys

**Paywall UI**

* Use “Unlock this output” microcopy
* Show exactly what they get *for this task*:

  * “Export this landed-cost summary as PDF”
  * “Save this route to your workspace”

---

## 9) Admin UX (your ops speed = your moat)

### Tariff versions

* Draft version editor
* Diff view vs current (what changed)
* “Run regression suite” button
* Publish gate with checklist:

  * pass tests
  * page readiness impact summary

### Page readiness dashboard

* Table:

  * slug
  * readiness score
  * blockers (“missing tariff rate”, “missing docs”, “no HS candidates”)
* One click: “build page context” / “set to noindex”

This is how you scale safely to 20k+ pages without SEO disasters.

---

## 10) Microcopy style (small detail, huge trust)

Examples:

* “Estimate” instead of “Exact”
* “Confidence: Medium — HS code may vary by product spec”
* “This result uses Tariff Version: 2026-02 (view changes)”
* “If you’re claiming preference, you’ll need: Certificate of Origin”

Keep it calm, factual, and non-salesy.

---

## 11) Performance & SEO UX (non-negotiable)

* SSR for pSEO pages
* Skeleton loading for calculator results
* Minimal JS on initial load (calculator hydrates fast)
* Sticky action bar uses CSS, not heavy JS
* Every pSEO page has:

  * clean heading hierarchy
  * schema.org (FAQ/HowTo only when truly applicable)
  * canonical rules enforced by readiness/canonical policy

