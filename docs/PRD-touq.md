# Product Requirements Document — توق (Touq)

**B2B Wholesale Marketplace for Abayas in Saudi Arabia**

| | |
|---|---|
| Version | 1.0 (Draft) |
| Date | 2026-08-08 |
| Owner | Product |
| Status | For review |

---

## 1. Product Vision

### 1.1 Vision Statement

توق (*Touq* — "longing/yearning") becomes the trusted starting point of the Saudi abaya supply chain: the place where any online merchant, from a 19-year-old Snapchat reseller to a multi-store Salla brand, finds verified abaya suppliers and sources inventory in minutes instead of weeks.

### 1.2 Mission

Replace the fragmented, trust-poor, WhatsApp-and-word-of-mouth way that abaya wholesale currently happens in Saudi Arabia with a structured, searchable, verifiable digital marketplace — starting with a single, deeply-owned category (Abayas) rather than a shallow multi-category catalog.

### 1.3 Why This, Why Now

- **The abaya is not a commodity category in KSA — it's the largest women's fashion category by spend**, worn daily by the vast majority of Saudi women, with strong seasonal demand spikes (Ramadan, Eid, back-to-school, wedding season).
- **Supply is highly fragmented and informal**: thousands of small workshops and mid-size garment factories in Riyadh, Jeddah, Mecca, and Al-Ahsa sell almost entirely through WhatsApp broadcast lists, Instagram DMs, and personal relationships. There is no searchable, comparable catalog of suppliers.
- **Demand-side e-commerce enablement has outpaced supply-side sourcing tools.** Platforms like Salla and Zid have made it trivially easy for anyone to open an online store, but they solve *selling*, not *sourcing*. Thousands of new abaya resellers open stores every month and still source inventory the same way they did ten years ago.
- **Saudi Vision 2030 and the broader e-commerce/SME push** (Monsha'at, Maroof business verification, PDPL, growing digital payments) create the regulatory and infrastructural conditions for a formal, verifiable B2B marketplace to succeed where it couldn't have five years ago.
- **A single-category focus is a deliberate wedge.** Abayas have unique attributes (fabric type, cut, closure, embroidery, modesty compliance) that a horizontal B2B marketplace (Alibaba, TradeKey) cannot model well, and the category is large enough on its own to build a real business before expanding.

### 1.4 Long-Term Ambition

Become the largest and most trusted wholesale abaya platform in Saudi Arabia within 24 months, then expand into adjacent modest-fashion categories (hijabs, thobes, kids' abayas, accessories) and into the GCC, becoming the default B2B sourcing layer for modest fashion e-commerce in the region — the "Faire" or "Alibaba" of modest fashion.

---

## 2. Business Model

### 2.1 Core Principle: Two-Sided Marketplace, Asymmetric Monetization

Suppliers are the harder side to acquire (fragmented, low digital literacy, currently transact for free over WhatsApp) and the side that creates the catalog value merchants come for. **Suppliers register and list products for free** to remove all friction to building supply-side density. Monetization is concentrated on the merchant side and on optional supplier upsells, not on the core act of listing.

### 2.2 Revenue Streams

| Stream | Side | Description | Phase |
|---|---|---|---|
| Merchant subscription tiers | Merchant | Free tier (limited purchase requests/month), Pro tier (unlimited RFQs, priority supplier responses, saved suppliers, analytics), Enterprise tier (multi-user accounts, dedicated account manager) | MVP → V1.1 |
| Featured/sponsored supplier placement | Supplier | Free listing stays free; suppliers pay to appear in top search results, homepage, or category spotlights | MVP → V1.1 |
| Verified/Pro Supplier badge | Supplier | Paid tier for enhanced verification, response-time guarantees, and a trust badge that increases merchant conversion | V1.1 |
| Transaction facilitation fee | Both | Small % fee once in-platform payments/escrow are live, charged on completed orders | Post-MVP |
| Logistics markup/facilitation | Merchant | Fee for arranging or brokering bulk shipping through integrated carriers | Post-MVP |
| Trade financing origination fee | Merchant | Revenue share with financing partners offering BNPL/inventory financing to merchants | Post-MVP |
| Data & insights subscription | Supplier | Demand trends, pricing benchmarks, best-selling styles/fabrics by region | Post-MVP |
| Advertising (banner/sponsored search) | Supplier | Self-serve ad placements for suppliers wanting more visibility | V1.1 |

### 2.3 Why Not Charge Suppliers to List

Charging suppliers upfront would kill the exact catalog density needed to make the platform useful to merchants on day one — this is the classic cold-start failure mode of B2B marketplaces. Free supplier onboarding is a customer-acquisition cost, not a permanent subsidy: once density exists, suppliers pay for *visibility and tools*, not for *access*.

### 2.4 Sequencing of Monetization

1. **MVP**: no monetization, or lightweight merchant subscription only — the priority is proving the RFQ → order loop works and suppliers/merchants stay on-platform.
2. **Post-MVP**: featured placement + Pro supplier badges + merchant subscription tiers become the primary revenue.
3. **Scale phase**: transaction fees become viable only once payments, escrow, and logistics are integrated enough that on-platform transacting is clearly more valuable than moving to WhatsApp — charging a transaction fee before that point accelerates disintermediation (see Risks §8).

---

## 3. User Personas

### 3.1 Supplier Personas

**"Umm Faisal" — Small Family Workshop Owner**
- Location: Al-Baha / Mecca region small workshop, 3-8 seamstresses
- Currently sells via: WhatsApp broadcast lists, word of mouth, occasionally Instagram
- Goals: Get discovered by more merchants without spending on marketing; reduce time spent answering repetitive WhatsApp price questions
- Pain points: No catalog — sends photos one by one; can't prove legitimacy to new buyers; loses track of who ordered what; low trust in unknown online buyers paying on time
- Tech comfort: Low-to-medium; smartphone-only; Arabic-only interface required

**"Abu Turki" — Mid-Size Garment Factory Owner**
- Location: Riyadh Second Industrial City
- Currently sells via: Sales agents, trade shows, long-standing merchant relationships, some Instagram
- Goals: Fill excess production capacity, reach merchants outside his existing network, professionalize the sales pipeline
- Pain points: Sales team spends hours qualifying leads manually; no visibility into demand trends; competitors undercut on unlisted, unverifiable pricing

**"Reem" — Fabric & Textile Trader turned Abaya Producer**
- Location: Jeddah
- Goals: Test new designs with real merchant demand before committing to large production runs
- Pain points: No cheap way to gauge market interest before manufacturing; MOQ negotiations happen ad hoc and inconsistently

### 3.2 Merchant Personas

**"Sara" — Instagram/Snapchat Boutique Owner**
- Runs a one-woman online abaya business, 5-15K followers, orders in small batches (10-30 units)
- Goals: Find affordable, on-trend suppliers with low MOQs and fast turnaround before Ramadan/Eid
- Pain points: Doesn't know which suppliers are legitimate; screenshots prices from Instagram wholesale accounts with no way to compare; gets ghosted by suppliers after sending a deposit

**"Nour" — Salla/Zid Store Owner**
- Runs a registered online store with growing order volume, 50-200 units/month
- Goals: Diversify supplier base, negotiate better wholesale pricing at volume, avoid stockouts during peak season
- Pain points: Sourcing is entirely manual and relationship-based; no way to compare multiple suppliers' pricing/MOQ side-by-side; reordering the same product from the same supplier is repetitive and undocumented

**"Khalid" — Multi-Brand E-Tailer / Growing Retailer**
- Operates several storefronts or a larger multi-brand site, orders in bulk (500+ units), may have a small buying team
- Goals: Reliable, scalable supplier relationships; visibility into supplier capacity and lead times; eventually trade financing
- Pain points: Needs suppliers who can guarantee production capacity and consistent quality at scale; wants an audit trail for procurement

---

## 4. User Journeys

### 4.1 Supplier Onboarding & Listing Journey

1. Discovers توق via referral, social media, or field/BD outreach (early on, likely concierge-onboarded)
2. Registers free account — business name, CR (Commercial Registration) or Maroof ID, contact info, region
3. Platform verifies business legitimacy (manual review in MVP, automated CR/Maroof lookup later)
4. Uploads product catalog: photos, fabric type, colors, sizes, cuts/styles, MOQ, wholesale price tiers, lead time
5. Storefront goes live and becomes searchable
6. Receives purchase requests (RFQs) via in-app notification + SMS/WhatsApp alert
7. Responds with quote/confirmation or counter-offer via in-app messaging
8. Manages orders, updates production/availability status
9. Builds reputation via completed orders and merchant ratings

### 4.2 Merchant Discovery & Purchase Request Journey

1. Registers free account, verifies as a merchant (store link, CR optional at MVP, social profile acceptable)
2. Browses/searches catalog — filters by fabric, color, style (classic/open/kimono/butterfly), price range, MOQ, region, lead time
3. Compares multiple suppliers side-by-side (price, MOQ, ratings, response time)
4. Sends a wholesale purchase request (RFQ): desired quantity, variants, customization notes, target price
5. Receives supplier responses/quotes, negotiates via in-app chat
6. Confirms order terms with a chosen supplier
7. Coordinates payment and fulfillment (offline/manual in MVP; in-platform in later phases)
8. Tracks order status, receives shipment
9. Rates the supplier and saves them as a favorite for reorders

### 4.3 End-to-End Order Journey (Combined View)

```
Supplier lists product → Merchant discovers via search/filter → Merchant sends RFQ
   → Supplier quotes/negotiates → Terms agreed → Order confirmed
   → Payment handled (offline MVP → escrow later) → Production/fulfillment
   → Shipping (merchant-arranged MVP → platform-integrated later)
   → Delivery confirmed → Rating & review → Reorder / long-term relationship
```

---

## 5. Core Features (V1 — Abaya Category Only)

### 5.1 Supplier-Side Features
- Free registration with business verification (CR/Maroof lookup or manual document upload)
- Product catalog management: multi-photo listings with variants (fabric, color, size, cut/style, closure type, embroidery/detailing, MOQ, tiered wholesale pricing, lead time)
- Supplier storefront/profile page (business info, location, years active, ratings, response time)
- RFQ inbox: receive, respond to, and track purchase requests
- In-app messaging with merchants
- Basic order/quote management (accept, counter, decline, mark fulfilled)
- Basic analytics dashboard (views, RFQs received, conversion)

### 5.2 Merchant-Side Features
- Free registration with light verification (store link/social profile; CR optional)
- Browse and search catalog with abaya-specific filters: fabric, color, cut/style, price range, MOQ, region, availability/lead time
- Product detail pages with full variant and pricing-tier information
- Purchase Request (RFQ) builder: quantity, variant selection, customization notes, target price/timeline
- In-app messaging/negotiation with suppliers
- Saved suppliers/favorites list
- Order and RFQ history/tracking
- Supplier ratings and reviews

### 5.3 Platform / Trust & Safety Features
- Admin moderation console (approve suppliers, moderate listings, handle disputes/reports)
- Business verification pipeline (CR/Maroof integration where feasible, manual fallback)
- Abaya-specific taxonomy and structured attributes (not a generic apparel taxonomy)
- Notifications via SMS/WhatsApp Business API and email (critical given target users live in WhatsApp)
- Bilingual UI (Arabic-first, English secondary)
- Mobile-first responsive web (PWA-capable); native app deferred post-MVP

---

## 6. Future Features (Beyond V1)

- Category expansion: hijabs/scarves, thobes, kids' abayas, modest-fashion accessories
- In-platform payments and escrow
- Integrated logistics (SMSA, Aramex, or aggregator APIs) for bulk shipping
- Trade financing / BNPL for merchant purchases
- Sample-ordering workflow (small paid samples before committing to bulk MOQ)
- Bulk RFQ broadcast: one request sent to multiple matching suppliers at once
- Supplier production capacity calendar / real-time availability
- AI-assisted demand forecasting and trend insights (best-selling fabrics, cuts, colors by season/region)
- Supplier analytics suite: pricing benchmarks vs. category, competitor visibility
- White-label storefront tools for merchants who want to embed توق sourcing into their own site
- Native mobile apps (iOS/Android)
- GCC market expansion (UAE, Kuwait, Qatar, Bahrain)

---

## 7. Marketplace Flow

**Step-by-step platform-mediated flow:**

1. **Supplier onboarding**: Free registration → business verification → catalog upload → listing goes live
2. **Merchant onboarding**: Free registration → light verification → access to browse/search
3. **Discovery**: Merchant searches/filters catalog by abaya-specific attributes
4. **Request**: Merchant sends a structured purchase request (RFQ) to one or more suppliers
5. **Response**: Supplier receives instant notification (in-app + SMS/WhatsApp), responds with quote or counter-offer
6. **Negotiation**: Both parties negotiate price/quantity/timeline via in-app messaging (kept on-platform to preserve trust signals and data)
7. **Agreement**: Order terms are confirmed and logged on-platform (creates a structured record — a first for this market)
8. **Fulfillment**: Payment and shipping arranged (manually/offline in MVP, increasingly platform-integrated over time)
9. **Delivery & confirmation**: Merchant confirms receipt
10. **Trust loop**: Merchant rates supplier; rating and order history feed back into supplier's public reputation and search ranking, and into the merchant's own repeat-order convenience (reorder from history, saved suppliers)

**Platform's role at each step** is to reduce the trust and search cost that currently makes this entire flow happen inefficiently over WhatsApp — the platform's defensibility comes from owning the structured data (verified suppliers, comparable pricing, order history, ratings) that WhatsApp fundamentally cannot provide.

---

## 8. Risks

| Risk | Description | Mitigation Direction |
|---|---|---|
| **Cold start / chicken-and-egg** | Merchants won't come without supplier density; suppliers won't invest time without merchant demand | Free, high-touch supplier onboarding; concierge-curate the first 50-100 suppliers; launch geographically focused (e.g., Riyadh first) |
| **Disintermediation / leakage** | Suppliers and merchants meet on-platform, then move the actual transaction to WhatsApp to avoid fees — a well-known failure mode for B2B marketplaces in relationship-driven cultures | Delay transaction fees until platform delivers real added value (payments, escrow, logistics, financing) that WhatsApp can't replicate; monetize visibility/subscriptions first, not the transaction itself |
| **Trust & fraud** | Fake suppliers, non-delivery, quality mismatch, counterfeit/copied designer abaya cuts | Mandatory business verification (CR/Maroof), rating system, dispute resolution process, IP-reporting mechanism |
| **Regulatory** | E-commerce law compliance (Ministry of Commerce), payments regulation (SAMA) once escrow/payments launch, Personal Data Protection Law (PDPL) compliance | Legal review before launching payments; PDPL-compliant data handling from day one |
| **Category concentration** | 100% dependency on a single, seasonal category (Ramadan/Eid spikes, off-season lulls) | Deliberate early strategy, but plan category expansion roadmap post-MVP; build working-capital/cash-flow features to smooth seasonality later |
| **Low digital literacy among small suppliers** | Target supplier segment (small workshops) may resist a new tool, prefer WhatsApp | Arabic-only UX, WhatsApp-integrated notifications, human onboarding support/field agents |
| **Competitive response** | Horizontal players (Alibaba, TradeKey) or a fast-follower local vertical entrant | Move fast on category depth (abaya-specific taxonomy, trust features) that horizontal platforms can't easily replicate |
| **Logistics complexity** | Bulk shipping, customization lead times, no standardized sizing across suppliers | Start with merchant-arranged logistics in MVP; integrate carrier APIs only once volume justifies it |
| **Payment trust** | No escrow at MVP means real counterparty risk between merchant and supplier | Be transparent about MVP limitations; prioritize escrow as an early post-MVP milestone once trust data (ratings, order history) exists to underwrite it |

---

## 9. Competitor Analysis

| Competitor Type | Examples | Strengths | Weaknesses vs. توق |
|---|---|---|---|
| **Informal channels (primary incumbent)** | WhatsApp broadcast groups, Instagram/Snapchat wholesale accounts, physical wholesale markets (e.g., Al-Batha, Riyadh) | Deep existing trust relationships, zero platform friction, already how the entire market operates | No search/comparison, no verification, no structured pricing, no order history, doesn't scale past a supplier's personal network |
| **Horizontal global B2B marketplaces** | Alibaba, TradeKey | Massive supplier base, mature payment/logistics infra | Poor fit for Saudi-specific abaya attributes (fabric/cut/modesty norms), language and cultural friction, low trust for local SME buyers, long cross-border lead times, no local verification |
| **Regional D2C enablement platforms** | Salla, Zid | Own the merchant relationship for storefront/checkout, strong brand trust with Saudi merchants | Solve *selling*, not *sourcing* — a clear partnership opportunity (touq as the sourcing layer feeding into Salla/Zid stores) rather than a head-on competitor |
| **Global vertical wholesale marketplaces (model inspiration, not direct competitors)** | Faire (curated B2B wholesale for boutiques, US market) | Proven model of curated, trust-first vertical B2B marketplace with strong retention | Not localized to Saudi/GCC, no modest-fashion/abaya focus |

**Key takeaway:** there is no direct, abaya-specific, trust-verified B2B marketplace operating in Saudi Arabia today. The core competition is the *status quo* (WhatsApp/Instagram informal sourcing), not a funded competitor — the opportunity is to formalize an existing, massive, currently-invisible market rather than to steal share from an incumbent platform.

---

## 10. MVP Scope

### 10.1 In Scope
- Free supplier registration + basic business verification (manual review acceptable at launch)
- Abaya-only catalog with structured attributes (fabric, color, cut/style, size, MOQ, tiered pricing, lead time)
- Merchant registration + light verification
- Search and filtering by abaya-specific attributes
- Purchase Request (RFQ) flow with in-app messaging/negotiation
- Basic order/quote status tracking (requested → quoted → confirmed → fulfilled)
- SMS/WhatsApp + email notifications for RFQs and messages
- Supplier ratings/reviews after order completion
- Arabic-first, bilingual (AR/EN) responsive web app (mobile-first)
- Admin console for supplier approval and basic dispute handling
- Geographic focus: launch concentrated in one or two major cities (e.g., Riyadh, then Jeddah) with concierge-curated initial supplier base, even if merchant access is national

### 10.2 Explicitly Out of Scope for V1
- In-platform payments / escrow (payment and delivery remain coordinated off-platform, e.g. bank transfer/COD arranged between the two parties)
- Logistics/shipping integration
- Trade financing/BNPL
- Multi-category expansion beyond abayas
- Native mobile apps
- AI-driven recommendations/forecasting
- Sample-ordering workflow
- Automated CR/Maroof API verification (manual review acceptable initially)

### 10.3 MVP Success Metrics
- Number of verified suppliers onboarded and with live listings
- Number of active product listings
- Number of purchase requests (RFQs) sent per week
- RFQ → confirmed-order conversion rate
- Average supplier response time to RFQs
- Merchant repeat-usage rate (return within 30/60 days)
- % of RFQs that result in an in-app-tracked completed order (proxy for on-platform trust vs. leakage to WhatsApp)

---

## 11. Post-MVP Roadmap

**Phase 1 — MVP Launch (Months 0-3)**
Concierge-onboard first supplier cohort in Riyadh; launch merchant access nationally; validate RFQ → order loop; instrument leakage/disintermediation metrics.

**Phase 2 — Trust & Monetization Foundations (Months 3-6)**
Introduce merchant subscription tiers and featured/sponsored supplier placement; pilot lightweight in-platform payment/escrow with a subset of trusted suppliers; expand supplier base to Jeddah, Mecca, Al-Ahsa.

**Phase 3 — Fulfillment Infrastructure (Months 6-12)**
Integrate logistics/carrier APIs for bulk shipping; roll out Verified/Pro supplier badges; launch supplier analytics dashboard (demand trends, pricing benchmarks); build dispute-resolution tooling matured from Phase 1-2 learnings.

**Phase 4 — Category & Product Expansion (Months 12-18)**
Expand into adjacent categories (hijabs, thobes, kids' abayas, accessories); launch native mobile apps; introduce trade financing/BNPL partnerships for merchants; roll out bulk RFQ broadcast and sample-ordering.

**Phase 5 — Regional Expansion (Months 18-24)**
Expand into GCC markets (UAE, Kuwait, Qatar, Bahrain) leveraging the proven Saudi playbook; deepen AI-driven demand forecasting and cross-border logistics support.

---

## 12. Recommendations

1. **Launch narrow and dense, not broad and thin.** Concierge-onboard a curated set of ~50-100 real, verified suppliers in one city before opening broadly — a merchant's first search experience must return real, credible results or trust is lost permanently.
2. **Resist charging transaction fees early.** The single biggest existential risk is disintermediation to WhatsApp. Monetize visibility (subscriptions, featured placement) before monetizing the transaction itself, and only introduce transaction fees once payments/escrow/logistics make staying on-platform clearly more valuable than leaving it.
3. **Design for WhatsApp-native users, not against them.** The target supplier and much of the merchant base already live in WhatsApp. Use WhatsApp Business API for notifications and consider WhatsApp as a companion channel rather than trying to force 100% in-app behavior from day one — meet the "leakage" risk with product design, not policy alone.
4. **Make business verification a visible trust signal, not just a gate.** Loudly surface CR/Maroof-verified badges to merchants; this directly answers the #1 fear (fraud/non-delivery) that keeps this market informal today.
5. **Time launch around the Ramadan/Eid demand cycle.** Abaya wholesale demand is sharply seasonal; a launch timed 2-3 months ahead of Ramadan maximizes the chance of an urgent, real merchant need pulling suppliers onto the platform.
6. **Treat Salla and Zid as distribution partners, not threats.** Explore integrations (e.g., "source this product on توق" from within a Salla/Zid merchant dashboard) to tap their large, already-verified merchant base rather than competing for merchant acquisition from zero.
7. **Invest in a high-touch supplier success function early.** Given low digital literacy among small workshop suppliers, human onboarding support (field agents, phone/WhatsApp-based catalog upload assistance) will matter more than self-serve UX polish in the first two phases.
8. **Keep V1 ruthlessly single-category.** Abaya-specific taxonomy and trust features are the actual moat against horizontal competitors (Alibaba/TradeKey); diluting into multi-category too early forfeits that differentiation before it's defensible.
