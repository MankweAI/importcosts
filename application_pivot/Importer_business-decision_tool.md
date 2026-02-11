Product Requirements Document
LandedCost OS — Importer Business Decision Tool (China → SA)
1) Product summary

LandedCost OS helps a South African importer decide whether an import deal from China is profitable, survivable, and executable—before they commit cash. It outputs a decision verdict (Go / Caution / No-Go), highlights margin killers, provides what-if structuring, and delivers a clear action plan to avoid customs/regulatory delays.

Positioning (non-negotiable):

Not “a duty calculator.”

A business decision system that happens to compute duties/taxes as one component.

Primary promise:

“Before you wire money, know your landed cost, margin, and risk—then get a step-by-step plan to clear.”

2) Target users & personas
Persona A — “Hands-on SME importer”

Imports 1–10 shipments/month.

Sells on WhatsApp, retail, or B2B supply.

Biggest fear: margin surprise + cargo delay.

Persona B — “Scaling importer / distributor”

Imports containers regularly.

Cares about scenario planning, working capital, and repeatable SOPs.

Persona C — “First-time importer”

Doesn’t know HS codes, Incoterms, or document requirements.

Needs confidence and a clear checklist.

3) Core user jobs-to-be-done (JTBD)

In the importer’s head, the job sequence is:

Feasibility: “Is this deal profitable in ZAR after everything?”

Sensitivity: “What change (FX, freight, tariff, HS code) can break it?”

Structure: “How do I structure this order to protect margin?”

Readiness: “What do I need so I don’t get blocked/delayed?”

Protection: “If anything changes, will I find out early enough?”

4) The “mental tools” importers expect (your product stack)

These are the tools they are mentally looking for:

Deal Viability Scanner (Verdict + margin clarity)

What-If Simulator (Scenario planning / structuring)

Margin Killers Radar (Risk intelligence in business language)

Import Readiness Score + Checklist (Execution plan)

Deal Watchlist & Alerts (Ongoing protection)

Decision Brief Export (A shareable one-pager for partners/teams/banks)

Strengthening note: The missing piece in most “calculator” products is working capital + timing. Importers don’t just care about total cost; they care about when cash leaves, when duties are paid, and how delays bleed profit. So this PRD includes a built-in Cash & Timeline Planner as part of decision-making.

5) User journey (end-to-end)
Step 1 — Landing (from pSEO page)

User arrives on a page like:

“Is it profitable to import LED floodlights from China to SA?”

“Importing Android car radios: cost + risks + compliance”

They see:

A 1-minute Deal Viability Scanner (not a big form).

An example scenario + assumptions.

A “Save this deal” CTA.

Step 2 — Deal Viability (2–3 minutes)

User inputs minimal decision inputs:

Product name (plain English)

Supplier price (currency + unit price)

Quantity

Shipping mode (Air/Sea)

Estimated freight (optional; we suggest benchmark ranges)

Target selling price (ZAR) OR target margin %

Output:

Verdict: Go / Caution / No-Go

Estimated landed cost per unit + total

Gross margin & break-even selling price

Top 3 margin killers (ranked)

Step 3 — Structuring (5–10 minutes)

User explores scenarios:

Quantity changes

Shipping mode changes

FX range

Freight ranges

HS code ambiguity options (“Code A/B/C”)

Output:

Side-by-side scenario comparison

“Best structuring recommendation” (rules-based, not AI vibes)

Step 4 — Readiness plan (3–5 minutes)

User gets:

Import Readiness Score

Checklist (docs + compliance)

Timeline milestones

“Next actions” list (printable)

Step 5 — Save + monitor (retention)

User saves the deal; sets alerts:

FX threshold

Tariff change for HS code

Trade remedy/anti-dumping triggers

“Cost now exceeds my limit” notifications

6) Functional requirements by module
Module A — Deal Viability Scanner (MVP)

Goal: Produce a decision verdict with transparent assumptions.

Inputs (MVP):

Product description

Unit price & currency

Quantity

Freight mode (air/sea)

Freight estimate: user-entered OR choose “low/typical/high”

Insurance (optional)

Target selling price OR target margin

Outputs:

Landed cost per unit & total

Gross margin % and margin in ZAR

Break-even selling price

A confidence score (based on data completeness + HS certainty)

Verdict: Go / Caution / No-Go with reasons

Rules for verdict (example):

Go: margin ≥ 25% and low/moderate risk

Caution: margin 12–24% OR risk high

No-Go: margin < 12% OR fails compliance hard-stop risk

Key requirement: Every output must show “Assumptions used” (FX rate used, freight assumption band, VAT rate config, etc.). The importer must trust it.

Module B — What-If Simulator (MVP+)

Goal: Help importers structure an order to protect margin.

Features:

Create multiple scenarios under one “Deal”

Scenario knobs:

Quantity

Supplier price

Freight mode + cost

FX (current + custom)

HS code option A/B/C (if ambiguous)

Comparison view:

Landed cost / unit

Total cash required

Margin

Break-even selling price

Risk score

Importer POV outputs:

“If FX worsens by 8%, your margin drops to X.”

“Switching to sea freight improves margin by Y but adds Z days.”

Module C — Margin Killers Radar (MVP)

Goal: Convert technical risk into business risk.

Risk types:

Classification risk (HS ambiguity, multiple plausible codes)

Trade remedies risk (anti-dumping/safeguard exposure)

Regulatory risk (possible LOA/standards requirements)

Freight volatility risk

Delay risk (demurrage/storage probability + cost range)

Cashflow risk (timing mismatch, working capital strain)

Output format:

Risk score + top 3 risks

Plain language explanation + mitigation steps

Module D — Import Readiness Score + Checklist (MVP)

Goal: Replace “confusing compliance” with a step-by-step plan.

Checklist categories:

Supplier docs (invoice fields, packing list alignment)

Shipping docs (B/L, insurance)

Customs docs (bill of entry data requirements)

Special requirements (where applicable)

“Common rejection mistakes” list

Outputs:

Readiness score

“What’s missing” list

Timeline milestones:

Before shipment

At shipment

Before clearance

At clearance

Module E — Cash & Timeline Planner (Strengthening addition)

Goal: Make it a business decision tool, not just “cost”.

Importer inputs:

Deposit % (e.g., 30/70 terms)

Payment timing (today / in 7 days)

Expected transit time band

Clearance time band

Outputs:

Cash-out timeline

“Total cash required before goods land”

“Worst-case delay cost estimate” (banded)

“You can survive X days delay before margin turns negative”

This is a huge differentiator because it helps them answer:

“Can I fund this safely?”

Module F — Deal Watchlist & Alerts (Post-MVP, but critical for retention)

Alert triggers:

FX moves beyond threshold

Duty/VAT config changes

Trade remedy notices for watched categories

“Deal margin falls below X%”

“Total cash required exceeds budget Y”

Outputs:

Notification with impact on deal (not generic news)

Module G — Decision Brief Export (MVP+)

Goal: One-click “shareable truth”.

Exports:

One-page decision brief PDF:

Deal inputs

Verdict

Scenarios compared

Key risks

Readiness checklist

Assumptions + date stamp

This is what importers forward to partners, finance people, or brokers.

7) pSEO pages must be “products”

Each indexed page must function as a complete decision pack.

Requirements for every pSEO page

Must include:

Mini Deal Viability Scanner pre-configured to that topic

Example scenario (realistic assumptions)

Risk Radar specific to the category

Readiness checklist (category-tailored)

Common pitfalls section (unique to the page)

“Save this deal” CTA (account creation)

Page template types (China → SA only)

Template 1 — Product Decision Page

/import-from-china/{product-slug}

Example: “Import wireless earbuds from China to SA: profitability + risks”

Template 2 — HS Code Decision Page

/hs/{hs-code}/import-from-china

HS code explained + cost drivers + risk exposures

Template 3 — Category Playbook Page

/import-from-china/category/{category}

“Electronics imports from China: margin patterns + pitfalls”

Template 4 — Port/Route Practical Page

/china-to-sa-shipping/{port-or-route}

Benchmarks + timeline + cashflow effects + decision guidance

Every template must generate unique value (category-specific risks, pitfalls, example scenarios) so pages aren’t thin or interchangeable.

8) Data requirements & constraints (free-only)

Hard constraint: no paid APIs, no paid data subscriptions.

Required datasets (stored locally, versioned)

Tariff schedule data (structured from official source documents)

VAT configuration (rate is a setting, date-effective)

HS code taxonomy + descriptions

Risk mapping tables:

HS → “watch flags” (e.g., trade remedy exposure categories)

Product category → compliance flags

FX rates:

Use at least 2 independent free sources and cache daily (for resilience)

Data freshness requirements

Tariff updates: weekly check + “change log” visible in UI

FX: daily refresh + manual override

Transparency requirements

Every output should show:

Tariff version date

FX rate used + timestamp

Freight assumption band used (low/typical/high)

Whether the deal is “high confidence” or “estimate”

9) UX requirements (importer-first)

Principles:

“Verdict first, details second.”

Show ranges when inputs are uncertain.

No customs jargon on the first screen.

Every number must answer “so what?”

Key screens (MVP):

pSEO page with embedded mini scanner

Deal page (verdict + breakdown + risks)

Scenario comparison

Readiness checklist + timeline

Save/export decision brief

10) Metrics & success criteria
Acquisition (pSEO)

Indexed pages count

Impressions and clicks

% pages ranking top 10 for long-tail

Activation

% of visitors who complete viability scan

% who run ≥2 scenarios

% who save a deal

Monetization (later)

Conversion to paid: scenario limits, alerts, exports, team features

Retention

Returning users/week

Alerts enabled rate

“Saved deals edited” frequency

11) Monetization model (decision-tool aligned)

Monetize the decision workflow, not the basic math.

Free:

Viability scan + 1 scenario

Basic risks + basic checklist

No exports, no alerts, limited saves

Paid tiers (examples):

Unlimited scenarios & saves

Alerts & watchlists

Decision brief export

Team access

Bulk upload (CSV deals)

(Payments can be handled via manual invoicing/EFT initially to avoid “paid tech dependencies.”)

12) MVP scope (first 90 days)
MVP must ship with:

Deal Viability Scanner

Scenario comparison (at least 3 scenarios)

Risk Radar v1 (rules-based)

Readiness checklist v1

Export Decision Brief (PDF)

30–50 pSEO product decision pages (high intent)

MVP must NOT include:

Deep AI HS classification claims

Full compliance automation

Freight live quotes

Multi-origin / multi-country

13) Key risks & mitigations

Wrong HS code → wrong verdict
Mitigation: show HS ambiguity + multiple options; show confidence score; encourage broker confirmation.

Tariff updates break accuracy
Mitigation: versioning + change logs + visible “last updated” and alert if stale.

Users treat output as official advice (medium YMYL)
Mitigation: clear disclaimers, “estimate” wording, encourage broker validation.

SEO thin-content risk
Mitigation: enforce page requirements (unique scenarios, category pitfalls, risk flags, checklists).