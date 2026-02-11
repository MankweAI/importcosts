
spec_version: "1.0.0"
doc_type: "machine_readable_implementation_blueprint"
product_name: "LandedCost OS"
module: "Importer Decision Tool (China -> South Africa)"
scope_constraint:
  origin_country_iso2: "CN"
  destination_country_iso2: "ZA"
  allowed_integrations:
    - "Free / zero-cost APIs only"
    - "No paid APIs, no paid data feeds, no paid SaaS dependencies for core functionality"
  positioning:
    - "NOT a calculator"
    - "Business decision tool for importers"
    - "Each pSEO page is a complete standalone product page (a decision report + interactive widgets)"
  source_of_truth_policy:
    - "SARS tariff / customs documents are primary source of truth"
    - "SARS guidance pages for VAT formula are authoritative"
    - "ITAC public notices for anti-dumping are supplemental (manual/cron ingestion)"
    - "NRCS/SABS regs are supplemental (manual curation + updates)"

repository_context:
  repo_name: "importcosts"
  audited_routes_root: "src/app/import-duty-vat-landed-cost/**"
  current_templates_found:
    - template_id: "CLUSTER_ORIGIN_DEST"
      route_pattern: "/import-duty-vat-landed-cost/[clusterSlug]/from/[originIso]/to/south-africa"
      key_behavior:
        - "Server-side default calculation using calculateLandedCost() on defaultInputs"
        - "R10,000 default scenario values + minimal copy"
      current_output:
        - "H1 + intro paragraph (templated)"
        - "ResultsPanel (duty/vat breakdown)"
        - "Related links + FAQs"
      key_problem:
        - "Calculator-like; no decision verdict, no scenario compare, no risk narrative, no readiness guidance"
    - template_id: "HS6_ORIGIN_DEST"
      route_pattern: "/import-duty-vat-landed-cost/hs/[hs6]/from/[originIso]/to/south-africa"
      key_behavior:
        - "SSR calculation + similar layout to product page"
      current_output:
        - "H1 + intro paragraph (templated)"
        - "ResultsPanel + Related links + FAQs"
        - "doc_checklist exists but focuses on preference proof checklist; omits general docs list depth"
      key_problem:
        - "No business insights; compliance and risk not expressed in human actionable form"

executive_summary_conclusion:
  pivot_success_status: "NOT_SUCCESSFUL_YET"
  reason:
    - "Current app provides cost breakdown only"
    - "Missing decision support primitives: profitability verdicts, scenario comparisons, risk summaries, compliance checklists, cash/timeline planning, alerts, export"
  priority_upgrades:
    - "Rewrite each pSEO page into standalone decision report (rich content + widgets)"
    - "Scenario comparison + deal saving"
    - "Watchlist/alerts"
    - "Data freshness / versioning / disclaimers"

goals:
  north_star_outcome:
    - "Importer can answer: 'Can I make money on this shipment?'"
    - "Importer can answer: 'What can go wrong and what do I do next?'"
  JTBD_map:
    - id: "J1"
      name: "Deal Viability"
      definition: "Profitability verdict with margin, break-even, sensitivity"
    - id: "J2"
      name: "Order Structuring"
      definition: "Compare incoterms, quantities, freight modes; choose best structure"
    - id: "J3"
      name: "Risk Radar"
      definition: "FX, classification risk, anti-dumping exposure, hidden fees, delays"
    - id: "J4"
      name: "Import Readiness"
      definition: "Docs, steps, permits, compliance requirements; reduce mistakes"
    - id: "J5"
      name: "Cash & Timeline Planning"
      definition: "When money leaves, when goods land, cash tied up"
    - id: "J6"
      name: "Watchlist & Alerts"
      definition: "Notify when tariffs/FX/compliance changes affect a saved deal"
  core_product_primitives_to_build:
    - "Decision Verdict Engine (Go / Caution / No-Go)"
    - "Scenario Builder + Comparison Table"
    - "Margin Killers Radar"
    - "Import Readiness Checklist (general + conditional)"
    - "Cash & Timeline Planner"
    - "Save Deal + Export (PDF/Share link) + Watchlist"
    - "Alerts (FX move threshold, tariff version change, ITAC notice update)"

non_goals:
  - "Freight booking or paid carrier integrations"
  - "Guaranteeing legal compliance outcomes (provide guidance + disclaimers)"
  - "Multi-country coverage (post-validation only)"
  - "Paid data sources (strictly excluded)"

decision_tool_requirements:
  decision_outputs_must_include:
    - "Landed cost per unit + total"
    - "Estimated gross margin % and R (requires user selling price input)"
    - "Break-even selling price"
    - "Sensitivity: FX move impact, duty rate change impact"
    - "Risk flags (classification, AD duty, docs missing, congestion/demurrage exposure)"
    - "Next best action checklist"
    - "Exportable decision brief"

page_types_required: # 5 templates promised in prior conversation
  - page_type: "PRODUCT_DECISION_PAGE"
    purpose: "Importer evaluates importing a product category (cluster) from China to SA"
    route:
      canonical: "/import-duty-vat-landed-cost/{clusterSlug}/from/china/to/south-africa"
      aliases: []
    required_widgets:
      - "DealSummaryCard"
      - "MiniCalculatorInputs"
      - "ProfitabilityInputs (selling price, target margin, overhead per unit optional)"
      - "ScenarioComparisonTable (3 default scenarios minimum)"
      - "RiskRadarPanel"
      - "ImportChecklistPanel"
      - "SaveDealButton"
      - "ExportPDFButton"
      - "DisclaimerBanner"
      - "DataFreshnessStamp"
    required_content_sections:
      - h1: "Import {ProductName} from China: Landed Cost, Profitability & Risks"
      - h2: "Deal Summary"
      - h2: "Scenario Analysis"
      - h2: "Top Risks"
      - h2: "Import Checklist"
      - h2: "FAQs"
    minimum_content_depth_targets:
      - ">= 1000 words per page (mix of dynamic + curated text blocks)"
      - "At least 3 worked examples (numbers shown) per page"
    default_scenarios:
      - scenario_id: "A"
        label: "Baseline (Sea, FOB, 100 units)"
        assumptions:
          quantity: 100
          incoterm: "FOB"
          mode: "SEA"
      - scenario_id: "B"
        label: "Bulk (Sea, FOB, 500 units)"
        assumptions:
          quantity: 500
          incoterm: "FOB"
          mode: "SEA"
      - scenario_id: "C"
        label: "Fast (Air, CIF, 100 units)"
        assumptions:
          quantity: 100
          incoterm: "CIF"
          mode: "AIR"
    example_scenarios_with_numbers:
      - example_id: "EX-PROD-1"
        narrative: "Importer tests laptops shipment profitability under FX volatility."
        inputs:
          invoice_value_zar: 100000
          freight_zar: 18000
          insurance_zar: 1000
          exchange_rate_usd_zar: 18.5
          selling_price_per_unit_zar: 6500
          units: 100
          hs6: "TBD (resolved from cluster bestHs6)"
        outputs_required:
          - "landed_cost_total_zar"
          - "landed_cost_per_unit_zar"
          - "gross_margin_percent"
          - "break_even_price_per_unit_zar"
          - "fx_sensitivity_10pct_move_zar"
        verdict_rules_example:
          go_if:
            - "gross_margin_percent >= 20"
            - "risk_score <= 30"
          caution_if:
            - "gross_margin_percent between 10 and 20"
          no_go_if:
            - "gross_margin_percent < 10"
      - example_id: "EX-PROD-2"
        narrative: "Importer compares 100 vs 500 units to see freight-per-unit effects."
        compare:
          - units: 100
            freight_zar: 18000
          - units: 500
            freight_zar: 45000
        outputs_required:
          - "delta_landed_cost_per_unit_zar"
          - "delta_margin_percent"
      - example_id: "EX-PROD-3"
        narrative: "Importer compares FOB vs CIF to expose hidden cost risk."
        compare:
          - incoterm: "FOB"
            freight_zar: 18000
          - incoterm: "CIF"
            freight_zar: 0
            note: "Seller includes freight in invoice; require separate transparency section"
        outputs_required:
          - "effective_cost_difference_zar"
          - "risk_flag_if_cif_markup_suspected"

  - page_type: "HS_CODE_DECISION_PAGE"
    purpose: "Importer evaluates duty/VAT + compliance checklist for a specific HS6"
    route:
      canonical: "/import-duty-vat-landed-cost/hs/{hs6}/from/china/to/south-africa"
    required_widgets:
      - "HSContextHeader (description, common goods)"
      - "DutyVatBreakdownPanel"
      - "WorkedExampleBlock (show formula with numbers)"
      - "ClassificationRiskPanel (neighboring HS codes)"
      - "RegulatoryRequirementsPanel (NRCS/SABS/permits if mapped)"
      - "ActionChecklistPanel"
      - "SaveHSWatchButton"
      - "AlertSetupWidget (tariff/ITAC changes)"
      - "DisclaimerBanner"
      - "DataFreshnessStamp"
    required_content_sections:
      - h1: "HS {hs6}: Duty, VAT & Import Checklist (China → South Africa)"
      - h2: "Duty & VAT Calculation"
      - h2: "Common Classification Risks"
      - h2: "Regulatory Requirements"
      - h2: "Action Checklist"
    example_scenarios_with_numbers:
      - example_id: "EX-HS-1"
        narrative: "R10,000 invoice for HS {hs6}: show duty + VAT."
        inputs:
          invoice_value_zar: 10000
          customs_value_zar: 10000
          non_rebated_duties_zar: "computed"
        formula_requirements:
          - "VAT uses SARS ATV concept: [(Customs Value + 10%) + non-rebated duties] * VAT_RATE"
          - "Show each intermediate line item"
        outputs_required:
          - "duty_zar"
          - "vat_zar"
          - "total_payable_zar"
      - example_id: "EX-HS-2"
        narrative: "Misclassification compare: HS {hs6} vs adjacent HS {alt_hs6}"
        compare_required:
          - "duty_rate_difference"
          - "total_cost_difference"
          - "risk_warning_text"
      - example_id: "EX-HS-3"
        narrative: "Quantity scaling: 1 vs 5 units; show linearity and any fixed costs placeholder."
        outputs_required:
          - "total_cost_unit1"
          - "total_cost_unit5"
          - "notes_on_fixed_fees_placeholder"

  - page_type: "PORT_ROUTE_PAGE"
    purpose: "Importer compares shipping routes/ports impact on cost and timeline"
    route:
      canonical: "/china-to-south-africa-shipping-ports"
      optional_alt_routes:
        - "/import-duty-vat-landed-cost/shipping-china"
    required_widgets:
      - "RouteCompareWidget (Durban vs Cape Town vs Air baseline)"
      - "TransitTimePanel"
      - "HiddenFeesChecklist (demurrage, storage, local trucking)"
      - "RouteImpactOnDealCalculator (plug into a saved deal)"
      - "SaveRoutePreferenceButton"
      - "DisclaimerBanner"
    content_sections_required:
      - h1: "Shipping Ports: China → South Africa — Cost & Transit Comparison"
      - h2: "Route Scenarios"
      - h2: "Cost Breakdown"
      - h2: "Delays & Fees"
      - h2: "Checklist"
    example_scenarios:
      - example_id: "EX-ROUTE-1"
        narrative: "Shanghai → Durban vs Shanghai → Cape Town, 1x40' container"
        assumptions:
          durban:
            transit_days: 30
            freight_usd: 3000
            port_fees_zar: 5000
          capetown:
            transit_days: 25
            freight_usd: 3500
            port_fees_zar: 7000
        outputs_required:
          - "cost_difference_zar"
          - "time_difference_days"
          - "decision_guidance_text"
      - example_id: "EX-ROUTE-2"
        narrative: "Air option vs Sea for urgent restock"
        assumptions:
          air_days: 10
          air_rate_usd_per_kg: 7
        outputs_required:
          - "cost_premium_zar"
          - "time_saved_days"
          - "when_air_makes_sense_rules"

  - page_type: "SCENARIO_COMPARISON_PAGE"
    purpose: "Generic importer education + interactive compare; supports negotiations"
    route:
      canonical: "/compare-import-scenarios"
    required_widgets:
      - "ScenarioBuilder (A/B/C)"
      - "ScenarioCompareTable"
      - "InsightsPanel (auto-generated narrative)"
      - "SaveComparisonButton"
      - "ExportComparisonPDF"
    required_content_sections:
      - h1: "Compare Import Scenarios: FOB vs CIF, Quantity & Freight Effects"
      - h2: "Scenario A vs B vs C"
      - h2: "Key Insights"
      - h2: "Checklist"
    default_scenarios_same_as_product_page: true
    example_scenarios:
      - example_id: "EX-SCEN-1"
        narrative: "100 pcs FOB Sea vs 500 pcs FOB Sea vs 100 pcs CIF Sea"
        required_outputs:
          - "per_unit_cost_each"
          - "total_cash_outlay_each"
          - "recommended_option_rule_based"

  - page_type: "COMPLIANCE_ALERT_PAGE"
    purpose: "Change log + impact analysis for compliance / duties affecting China→SA imports"
    route:
      canonical: "/news/import-alerts/{topicSlug}"
    required_widgets:
      - "AlertHeader (effective date, impacted HS codes)"
      - "CostImpactCalculator (before vs after)"
      - "AffectedTariffLinesTable"
      - "ImporterNextStepsChecklist"
      - "WatchAlertButton (notify on updates)"
      - "DisclaimerBanner"
    required_content_sections:
      - h1: "Alert: {IssueTitle}"
      - h2: "What Changed?"
      - h2: "Affected Tariff Lines"
      - h2: "Cost Impact Example"
      - h2: "What To Do Next"
    example_scenarios:
      - example_id: "EX-ALERT-1"
        narrative: "Anti-dumping duty added to a Chinese-origin product line"
        required_comparisons:
          - "pre_change_total_cost"
          - "post_change_total_cost"
          - "difference"
          - "risk_of_non_declaration_warning_text"
      - example_id: "EX-ALERT-2"
        narrative: "Alternative sourcing (non-China) shows avoided AD duty (future expansion note)"
        note: "For now, include as educational without implementing multi-origin calculator"
        required_output: "educational_comparison_text"

shared_widgets_and_components:
  - id: "DealSummaryCard"
    function: "Top-of-page verdict + key numbers"
    fields_required:
      - "landed_cost_total_zar"
      - "landed_cost_per_unit_zar"
      - "estimated_gross_margin_percent"
      - "break_even_price_per_unit_zar"
      - "verdict_label (GO/CAUTION/NO-GO)"
      - "risk_score_0_100"
  - id: "MiniCalculatorInputs"
    function: "Core inputs with defaults; supports SSR initial render + CSR updates"
    required_inputs:
      - "hs_code (hs6 or resolved from cluster)"
      - "invoice_value"
      - "currency (ZAR default, allow USD/CNY)"
      - "exchange_rate"
      - "freight"
      - "insurance"
      - "incoterm (FOB/CIF/EXW etc - initially FOB/CIF)"
      - "units"
      - "importer_type (VAT registered vs not)"
  - id: "ScenarioComparisonTable"
    function: "Compare scenarios side-by-side"
    required_columns:
      - "scenario_label"
      - "units"
      - "incoterm"
      - "mode"
      - "landed_cost_total"
      - "landed_cost_per_unit"
      - "duty"
      - "vat"
      - "estimated_margin"
      - "notes"
  - id: "RiskRadarPanel"
    function: "Narrative + flags"
    risk_flags_required:
      - "fx_volatility"
      - "classification_ambiguity"
      - "anti_dumping_possible"
      - "port_congestion"
      - "documentation_gaps"
      - "regulatory_permit_needed"
    output:
      - "risk_score"
      - "top_3_risks"
      - "mitigations_list"
  - id: "ImportChecklistPanel"
    function: "Step-by-step checklist; general + conditional"
    base_checklist_required:
      - "Commercial Invoice"
      - "Packing List"
      - "Bill of Lading / Airway Bill"
      - "SAD500"
      - "Importer registration / customs code (if applicable)"
    conditional_checklist_sources:
      - "Preference proof checklist (if preference claimed)"
      - "HS-mapped permit requirements (NRCS/SABS/etc) when known"
  - id: "SaveDealButton"
    function: "Persist scenario(s) and enable watchlist"
    minimum_storage:
      - "local_storage_guest_mode"
      - "account_mode_optional (later)"
  - id: "ExportPDFButton"
    function: "Generate decision brief PDF from page state"
    allowed_approach:
      - "Server-side PDF generation with open-source libs OR client-side print-to-pdf"
      - "No paid PDF APIs"
  - id: "AlertSetupWidget"
    function: "Define thresholds and subscribe"
    alert_types:
      - "FX threshold (e.g., USD/ZAR +/- 5%)"
      - "Tariff version update"
      - "New compliance alert affecting saved HS6/cluster"
    delivery_modes:
      - "Email (requires SMTP or free-tier provider)"
      - "In-app notifications (MVP)"
    note:
      - "If email provider cannot be free reliably, ship in-app only initially"

data_and_calculation_requirements:
  VAT:
    vat_rate: 0.15
    SARS_ATV_formula:
      description: "ATV = (Customs Value + 10% of Customs Value) + non-rebated duties; VAT = ATV * VAT_RATE"
      must_show_in_UI: true
  Duty:
    required_fields:
      - "duty_rate"
      - "duty_amount"
      - "duty_basis (customs value, CIF, etc as applicable)"
  Tariff_versioning:
    must_display:
      - "tariff_version_label"
      - "effective_date"
      - "last_updated_timestamp"
  Currency:
    required_pairs:
      - "USD/ZAR"
      - "CNY/ZAR"
    policy:
      - "If live FX unavailable, show last cached rate + timestamp and allow manual override"
  Compliance_risks_data_model:
    fields:
      - "risk_id"
      - "risk_type"
      - "severity"
      - "human_summary"
      - "mitigation_steps"
      - "source_ref"
  Document_checklist_data_model:
    fields:
      - "doc_title"
      - "why_needed"
      - "trigger_condition (optional)"
      - "source_ref (optional)"

free_data_sources_and_ingestion_strategy:
  primary_sources:
    - name: "SARS Customs Tariff (Schedule 1 etc)"
      ingestion:
        method: "PDF/HTML download + parse"
        cadence: "manual check weekly; cron parse monthly; emergency update on changes"
        storage:
          - "versioned snapshots"
          - "diff detection"
    - name: "SARS Duties and Taxes guidance (VAT formula page)"
      ingestion:
        method: "manual confirm + store formula text + link"
        cadence: "quarterly check"
  supplemental_sources:
    - name: "ITAC public notices (anti-dumping / trade remedies)"
      ingestion:
        method: "monitor site/RSS if available; otherwise manual capture + content entry"
        cadence: "weekly check"
    - name: "NRCS / SABS regulations"
      ingestion:
        method: "curated mapping (HS->requirement) stored in repo"
        cadence: "monthly review"
  free_fx_api_option:
    - name: "exchangerate.host"
      usage_policy:
        - "cache results daily"
        - "fallback to manual input"
        - "store timestamp + provider response"
      note:
        - "If reliability concerns occur, ship without live FX and keep manual override as default"

SEO_and_page_quality_requirements:
  canonical_rules:
    - "Each page has self-canonical matching its slug"
    - "Noindex until content depth + decision widgets meet readiness threshold"
  page_uniqueness_rules:
    - "Dynamic H1/intro alone is insufficient"
    - "Must include structured sections, worked examples, and at least one unique table"
  schema_requirements:
    - "JSON-LD: Product/FAQ/HowTo-like where applicable (no deceptive markup)"
  internal_linking:
    - "Product page -> related HS pages + route page + scenario compare page"
    - "HS page -> related product pages + adjacent HS codes"
    - "Compliance alert pages -> impacted HS and product pages"
  minimum_page_components:
    - "H1 + intro"
    - "Decision widgets"
    - "Worked examples"
    - "Risks + checklist"
    - "Save/export CTA"

feature_gaps_to_close (from audit):
  - id: "GAP-01"
    name: "No Deal Verdict / Score"
    fix: "Implement Decision Verdict Engine + DealSummaryCard"
  - id: "GAP-02"
    name: "No Multi-Scenario Comparison"
    fix: "Scenario Builder + Comparison Table + default 3 scenarios"
  - id: "GAP-03"
    name: "No Save / Export"
    fix: "SaveDeal + ExportPDF"
  - id: "GAP-04"
    name: "No Alerts / Watchlist"
    fix: "Watchlist + alert thresholds (FX + tariff version + compliance alerts)"
  - id: "GAP-05"
    name: "Incomplete Compliance Guidance"
    fix: "General docs checklist + conditional checklist expansion + plain language"
  - id: "GAP-06"
    name: "No VAT uplift explanation"
    fix: "UI shows VAT formula and why 10% uplift is included"
  - id: "GAP-07"
    name: "Thin content / doorway risk"
    fix: "Page templates require depth, examples, H2 sections, unique tables"
  - id: "GAP-08"
    name: "Data freshness transparency"
    fix: "DataFreshnessStamp + tariff version labels + timestamps"
  - id: "GAP-09"
    name: "Risk outputs exist but not displayed"
    fix: "Render compliance_risks + preference_decision in human terms"

prioritized_pages_to_build (initial set):
  rationale: "Focus on categories that drive China→SA import interest and search intent; expand to 50 pages."
  examples:
    - slug: "/import-duty-vat-landed-cost/smartphones/from/china/to/south-africa"
      type: "PRODUCT_DECISION_PAGE"
      reason: "High-volume consumer goods"
    - slug: "/import-duty-vat-landed-cost/laptops/from/china/to/south-africa"
      type: "PRODUCT_DECISION_PAGE"
      reason: "High demand + margin sensitivity"
    - slug: "/import-duty-vat-landed-cost/solar-panels/from/china/to/south-africa"
      type: "PRODUCT_DECISION_PAGE"
      reason: "High value; policy-sensitive"
    - slug: "/import-duty-vat-landed-cost/inverters/from/china/to/south-africa"
      type: "PRODUCT_DECISION_PAGE"
      reason: "Pairs with solar; frequent imports"
    - slug: "/import-duty-vat-landed-cost/televisions/from/china/to/south-africa"
      type: "PRODUCT_DECISION_PAGE"
      reason: "Duty-heavy; needs scenario compare"
    - slug: "/import-duty-vat-landed-cost/shoes/from/china/to/south-africa"
      type: "PRODUCT_DECISION_PAGE"
      reason: "Apparel importers; compliance + duties relevant"
    - slug: "/import-duty-vat-landed-cost/furniture/from/china/to/south-africa"
      type: "PRODUCT_DECISION_PAGE"
      reason: "Bulky freight; route impacts big"
    - slug: "/import-duty-vat-landed-cost/led-lighting/from/china/to/south-africa"
      type: "PRODUCT_DECISION_PAGE"
      reason: "Regulatory + classification risk"
    - slug: "/china-to-south-africa-shipping-ports"
      type: "PORT_ROUTE_PAGE"
      reason: "Cross-cutting decision lever"
    - slug: "/compare-import-scenarios"
      type: "SCENARIO_COMPARISON_PAGE"
      reason: "Core education and tool anchor"

roadmap:
  total_duration_months: 6
  phases:
    - phase: "Phase 1 (Months 1-2)"
      deliverables:
        - "Redesign page templates to Decision Tool structure"
        - "Implement core widgets (DealSummary, Scenario compare, Risk radar, Checklist)"
        - "Tariff/FX ingestion baseline + timestamps"
        - "Publish 10 high-priority pages with full content modules"
    - phase: "Phase 2 (Months 3-4)"
      deliverables:
        - "Publish 20 more pages"
        - "Save Deal + basic watchlist"
        - "Scenario comparison improvements"
        - "QA: SEO + content uniqueness"
    - phase: "Phase 3 (Months 5-6)"
      deliverables:
        - "Alerts subsystem (FX/tariff/compliance) at least in-app"
        - "Monitoring scripts for data freshness"
        - "Launch readiness review + disclaimers everywhere"

QA_monitoring_and_guardrails:
  data_freshness_checks:
    - "Show last tariff update date on every page"
    - "Automated diff check between stored tariff and latest SARS document snapshot"
  reliability_fallbacks:
    - "If FX API down: show last cached + allow manual input"
    - "If tariff missing for HS: show clear missing-data state, not guesses"
  legal_disclaimer_requirements:
    - "Every page states: estimates only; confirm with SARS / clearing agent"
    - "No promises of compliance; provide guidance"
  content_quality_checks:
    - "Uniqueness: each page must have at least 3 unique examples and unique risk/checklist sections"
    - "Minimum word count targets"
  unit_tests:
    - "VAT formula computation including +10% uplift"
    - "Duty calculation correctness"
    - "Scenario comparison correctness"
    - "Risk scoring stability"

implementation_notes_for_SWE_LLM:
  must_keep:
    - "Existing canonical URL builder patterns"
    - "SSR default calculation for fast first paint"
  must_change:
    - "Move from 'ResultsPanel-only page' to 'Decision Report page' (widgets + content modules)"
    - "Render risk/checklist outputs, not just compute them"
  recommended_storage_strategy:
    - "MVP: localStorage for saved deals + shareable URL encoding for scenario"
    - "Later: account-based persistence once validated (not required for MVP)"
  export_strategy:
    - "MVP: print stylesheet + client 'Export to PDF' via browser"
    - "Later: server PDF generator using open-source libs"

acceptance_criteria:
  per_page:
    - "User can see: landed cost + margin + verdict + risks + checklist without leaving page"
    - "User can compare at least 3 scenarios in one view"
    - "User can save deal and export a brief"
    - "Page includes data freshness stamp + disclaimers"
  system:
    - "Tariff versioning visible and updateable"
    - "FX fetch is optional with manual override"
    - "No paid APIs used"
    - "No content guessing when data absent"

appendix_example_decision_brief_output (export_payload_shape):
  decision_brief_json:
    deal_id: "uuid-or-slug-hash"
    created_at: "ISO8601"
    route:
      page_type: "PRODUCT_DECISION_PAGE"
      slug: "/import-duty-vat-landed-cost/laptops/from/china/to/south-africa"
      origin: "CN"
      dest: "ZA"
    inputs:
      hs6: "resolved"
      incoterm: "FOB"
      mode: "SEA"
      invoice_value_zar: 100000
      freight_zar: 18000
      insurance_zar: 1000
      exchange_rate_usd_zar: 18.5
      units: 100
      selling_price_per_unit_zar: 6500
    outputs:
      tariff_version_label: "string"
      landed_cost_total_zar: 0
      landed_cost_per_unit_zar: 0
      duty_zar: 0
      vat_zar: 0
      gross_margin_percent: 0
      break_even_price_per_unit_zar: 0
      sensitivity:
        fx_move_10pct_cost_delta_zar: 0
        duty_rate_plus_5pct_cost_delta_zar: 0
    verdict:
      label: "GO|CAUTION|NO-GO"
      rationale:
        - "string"
    risks:
      risk_score_0_100: 0
      top_risks:
        - "string"
      mitigations:
        - "string"
    checklist:
      base:
        - doc: "Commercial Invoice"
          why: "Proof of value for customs"
        - doc: "Packing List"
          why: "Matches invoice and shipment contents"
        - doc: "Bill of Lading / Airway Bill"
          why: "Proof of shipment contract"
        - doc: "SAD500"
          why: "Customs declaration form"
      conditional: []
    disclaimers:
      - "Estimates only; confirm with SARS and your clearing agent."
      - "FX rates may differ at time of clearance."
