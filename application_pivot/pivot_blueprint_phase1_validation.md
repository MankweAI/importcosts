# Pivot Blueprint - Phase 1: Validation & Core Engine
# Importer Business Decision Tool
**"From Calculator to Decision Engine"**

## 1. Executive Summary & Goal
The goal of Phase 1 is to validate the pivot from a "cost calculator" to a "business decision tool" without incurring significant technical debt (e.g., user accounts, complex billing). We will focus on delivering immediate "Viability Assessments" and "Risk Intelligence" to the user in a stateless, shareable format. This phase prioritizes the core value proposition: answering "Should I do this deal?" over simply "What does it cost?".

## 2. Core Feature Set (MVP)

### A. The "Viability Assessment" Engine (Core Pivot)
*   **Concept:** Replace the "Total Cost" output with a "Deal Viability" dashboard.
*   **Key Metrics:**
    *   **Landed Cost per Unit:** R [Amount] (with confidence interval).
    *   **Gross Margin:** [Percentage]% based on user input or benchmark.
    *   **Break-Even Price:** R [Amount] to cover costs + 0% profit.
    *   **Verdict:** "Go", "Caution", "High Risk" (based on margin thresholds & risk flags).
    *   **Confidence Score:** "High/Medium/Low" based on data age (tariff/fx) and specificity (HS code).

### B. The "Risk Rules Engine" v1 (Automated Intelligence)
*   **Concept:** Programmatic risk flagging instead of manual content writing.
*   **Implementation:**
    *   Database table mapping `Product Cluster` or `HS Chapter` to `Risk Rules`.
    *   **Rule Types:**
        *   **Compliance:** "Requires NRCS LOA (Electrical)" -> [Flag: Red]
        *   **Trade Defense:** "Anti-Dumping Duty Active (Steel)" -> [Flag: Critical]
        *   **Logistics:** "Port Congestion (Durban)" -> [Flag: Warning]
    *   **Output:** "Top 3 Margin Killers" displayed prominently next to the verdict.

### C. Stateless "Share this Deal" (Virality)
*   **Concept:** Allow users to save/share scenarios without creating an account.
*   **Mechanism:**
    *   Generate a unique URL with encoded query parameters (e.g., `?p=solar-panels&val=50000&qty=100...`).
    *   "Share with Partner" button copies the link.
    *   "Download Deal Brief" (PDF) captures the state into a professional artifact.

### D. Lead Generation Integration ("Broker Handoff")
*   **Concept:** Monetize the high-risk/complex decisions.
*   **Trigger:**
    *   If Verdict = "Caution" or "High Risk" -> Prominent CTA: "Get a verified broker to structure this deal & reduce risk."
    *   Generic CTA on "Go" verdicts: "Ready to ship? Get a freight quote."

## 3. Content Strategy: The "Product" Pages
*   **Target:** 20 High-Priority Product Pages (e.g., Solar Panels, Inverters, Laptops).
*   **Structure:**
    *   **Header:** Dynamic "Import [Product] from [Origin]: Business Viability Guide".
    *   **Hero:** The "Viability Scanner" (Mini-App).
    *   **Body:**
        *   **"Profitability Analysis":** Dynamic text based on current FX/Tariff (e.g., "Margins are tight due to 15% tariff").
        *   **"Risk Radar":** Auto-generated list from the Risk Rules Engine.
        *   **"Compliance Checklist":** Auto-generated based on HS code properties.
    *   **Footer:** FAQ & Cross-links.

## 4. Technical Requirements (Changes)
*   **Frontend:**
    *   New `ViabilityDashboard` component (React).
    *   PDF Generation library (e.g., `react-pdf` or `jspdf`).
    *   URL state management hook for "Share" feature.
*   **Backend / DB:**
    *   New `RiskRules` table (one-to-many with Clusters/HS).
    *   `RiskFlags` seeded for key industries (Electronics, Textiles, Steel).
*   **Data Sources:**
    *   Hardcoded benchmarks for "Market Price" (Scraped/Estimated) to calculate potential margin if user doesn't input selling price.

## 5. Success Metrics (KPIs)
*   **Engagement:** % of visitors who interact with the "Viability Scanner".
*   **Virality:** % of users who click "Share" or "Download PDF".
*   **Lead Gen:** Click-through rate on "Broker Handoff" CTA.
*   **Retention:** Return visitors (cookie-based).

## 6. Implementation Roadmap
1.  **Week 1:** Design & Build `ViabilityDashboard` component & logic.
2.  **Week 2:** Build `RiskRules` engine & seed data for top 20 keywords.
3.  **Week 3:** Implement PDF generation & "Share" URL logic.
4.  **Week 4:** Update pSEO templates to "Product Page" layout & Launch.
