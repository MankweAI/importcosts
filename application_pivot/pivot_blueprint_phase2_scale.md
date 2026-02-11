# Pivot Blueprint - Phase 2: Retention & Scale
# Importer Business Decision Tool
**"From Decision Engine to Operating System"**

## 1. Executive Summary & Goal
Phase 2 focuses on **retention and monetization**. Once the "Viability Assessment" value is proven (Phase 1), we introduce "Stateful" features that require user accounts (Watchlists, Alerts, Saved History). This shifts the user relationship from "transactional" (one-off check) to "relational" (ongoing monitoring). We also scale the content engine from 20 to 500+ pages using the established Risk Rules Engine.

## 2. Core Feature Set (Scale)

### A. User Accounts & "My Workspace"
*   **Concept:** A personalized dashboard for the importer.
*   **Features:**
    *   **Saved Deals:** "My Solar Import (Feb 2026)" - Re-run viability checks with updated FX/Tariffs.
    *   **Import History:** Track past calculations.
    *   **Profile Settings:** Default preferences (e.g., "Always use Air Freight", "VAT Registered: Yes").

### B. The "Watchlist" & Alert System (Retention Hook)
*   **Concept:** Proactive notifications on business-critical changes.
*   **Triggers:**
    *   **FX Alert:** "USD/ZAR moved >5% - Your margin dropped to 12%."
    *   **Tariff Change:** "New Trade Defense investigation opened for [Product]."
    *   **Logistics:** "Port Strike in Durban - Expect +7 days delay."
*   **Delivery:** Email digest (Weekly) or Instant Alert (Critical).

### C. Market Intelligence Layer
*   **Concept:** Contextual data to improve decision reliance.
*   **Features:**
    *   **Market Price Trends:** "Retail price for [Product] in SA is trending [Down/Up]."
    *   **Competitor Volume:** "Imports of [Product] increased 20% last month (satuation warning)."
    *   *(Note: This requires external data partnerships or scraping - High Value/High Effort)*.

### D. Advanced "What-If" Simulator
*   **Concept:** Complex structuring for pro users.
*   **Scenarios:**
    *   "Compare Air vs. Sea Freight (Cash Flow impact)."
    *   "Compare Supplier A (USD) vs. Supplier B (CNY)."
    *   "Compare HS Code options (Classification risk vs. Duty saving)."

## 3. Automated Content Scale (pSEO 2.0)
*   **Strategy:** Programmatic scale using "Smart Templates".
*   **Mechanism:**
    *   Expand `RiskRules` database to cover 90% of HS Chapters.
    *   Generate thousands of "Long-tail" pages (e.g., "Import [Specific Component] from China").
    *   Inject dynamic "Market Intelligence" snippets into these pages to maintain "Freshness" SEO signals.

## 4. Monetization Strategy (SaaS Layer)
*   **Freemium Model:**
    *   **Free:** Unlimited "Viability Checks", PDF Export (Watermarked), 1 Active Watchlist.
    *   **Pro (R299/mo):** Unlimited Watchlists, Real-time Alerts, Unbranded PDF, "Market Intelligence" data.
    *   **Enterprise:** API Access (for ERP integration).

## 5. Success Metrics (KPIs)
*   **Conversion:** % of stateless users who create an account.
*   **Retention:** % of users active after 30 days (checking alerts/running new deals).
*   **LTV:** Lifetime Value of Pro subscribers (vs. Ad revenue/Lead gen).
*   **Churn:** % of users unsubscribing from alerts.

## 6. Implementation Roadmap
1.  **Month 3:** User Authentication (Clerk/NextAuth) & DB Schema Update (Users, SavedDeals).
2.  **Month 4:** "Watchlist" Engine & Email Notification Service (SendGrid/Postmark).
3.  **Month 5:** Advanced "What-If" Simulator & Market Intelligence Pilots.
4.  **Month 6:** Pro Subscription Integration (Stripe/PayStack) & Full Marketing Launch.
