# Research: Crew, Buddy, and Wealthfront

**Date:** 2026-07-23  
**Purpose:** Ground the BudgetBrain overhaul in how the user actually manages money today, and what data-access paths exist.

---

## Current user workflow

| Tool | Role today | What BudgetBrain should absorb |
|------|------------|--------------------------------|
| **Crew** ([trycrew.com](https://www.trycrew.com/)) | Discretionary spending / envelope-style “pockets” (groceries, gas, fun money). High-yield checking with real authorization controls. | Category-level discretionary spend; pocket → category mapping; transactions from Crew debit activity. |
| **Wealthfront** | Primary account (cash + investments). Broader money movement. | Core inflows/outflows, transfers, bills paid from primary account, investment/cash activity where useful for cash-flow. |
| **Buddy** ([buddy.download](https://buddy.download/)) | High-level overview across accounts (Crew + Wealthfront + others): budgets, category %, income vs spend, multi-account / net-worth style view. | **Replace entirely** as the all-accounts tracker and allocation dashboard. |

**Target product job:** BudgetBrain becomes the Buddy replacement — a personal, high-level finance overview that answers:

1. **Allocation** — What % of my money goes to housing, groceries, etc.?
2. **Cash flow** — Am I net positive this period (in − out)?
3. **Source truth** — Pull real activity from Crew + Wealthfront instead of (or in addition to) manual envelope entry.

---

## Crew (trycrew.com)

### What it is

- Fintech checking/account manager (banking via Bangor Savings Bank, FDIC), not a pure budgeting SaaS.
- **Pockets** for goals/expenses; Autopilot; bill reserves; household members; debit cards that can decline overspend.
- No subscription; monetized via deposits + interchange.
- Strong fit for *discretionary control* — the user already uses it that way.

### Official API / webhooks

- **No public developer API or webhook product** from Crew itself (confirmed via Crew site + Open Banking Tracker: no developer portal, no listed API products).
- User recollection of “a webhook” most likely refers to **third-party sync products**, not a first-party Crew webhook.

### Practical data-access options

| Option | Pros | Cons | Fit |
|--------|------|------|-----|
| **Plaid (or similar aggregator)** | Balances + transactions; same path as Wealthfront; industry standard | Plaid fees (even for personal use); institution coverage can flake; pocket metadata may not map 1:1 | **Best long-term automation** |
| **Finicom / BankSync-style sync → webhook into BudgetBrain** | Near-real-time webhooks into our endpoint; low code | Extra SaaS; trust/privacy; still aggregator under the hood | Good if user already uses one |
| **Manual CSV / statement import** | Zero vendor lock; works immediately | Manual; may lose pocket labels | Good MVP fallback |
| **Scrape / unofficial API** | — | Fragile, ToS risk | **Do not** |

**Implication:** Treat “Crew webhook” as *our* ingest webhook that receives normalized transactions from an aggregator (Plaid Link + Plaid webhooks, or Finicom → `POST /api/ingest/webhook`), not as a Crew-native feature.

---

## Wealthfront

### What it is

- Primary brokerage/cash account for the user.
- Activity includes transfers, dividends, fees, cash movements, etc.

### Official export

- **Quicken QFX** export via Dashboard → Documents → “Export to Quicken®” (date range + account). Not available for 529s.
- **No first-party CSV** of full activity; community workarounds scrape the activity UI (fragile).

### Practical data-access options

| Option | Pros | Cons | Fit |
|--------|------|------|-----|
| **Plaid Transactions** | Automated sync; Wealthfront is listed as Plaid-supported (`ins_115617` in aggregator directories) | Coverage/product availability must be verified in Plaid Dashboard for this app | **Preferred for automation** |
| **QFX / OFX import** | Official Wealthfront export path | Manual; need OFX/QFX parser | Strong MVP / backup |
| **CSV from console scrapers** | Quick personal hack | Breaks often; not shippable | Dev only |

---

## Buddy (buddy.download)

### What it is (the UX we are replacing)

Buddy Budgeting AB (Stockholm) — “joyful” multi-account budget overview:

- Create budgets by category (housing, food, etc.) with amounts and **percentage-style breakdowns**
- Track expenses (manual + bank connect)
- Multiple accounts → spending/savings/debt → **net worth**
- Shared budgets / split with partners
- Overview of spending, income, savings

### What we need from Buddy’s job (not a clone)

Minimum viable “replace Buddy” surface for this personal overhaul:

1. **Unified transaction ledger** across Crew + Wealthfront (+ future accounts)
2. **Category allocation view** — % of total spend (and optionally % of income) by category
3. **Period cash flow** — total in, total out, net (positive/negative)
4. **Account list** — balances and which source each txn came from
5. Optional later: net worth, shared household, bank Link UX polish

We do **not** need Buddy’s social split, App Store marketing, or subscription paywall.

---

## BudgetBrain today (gap analysis)

| Capability | Today | Needed |
|------------|-------|--------|
| Multi-account ledger | No `accounts` table; transactions hang off budget line items only | First-class accounts + source institution |
| Bank sync | None (no Plaid) | Ingest from Crew + Wealthfront |
| Allocation % | Planned category ÷ income (envelope planning) | **Actual** spend ÷ total spend (and/or income) |
| Cash flow in/out | Expenses only; income is separate planned sources | Signed money movement: inflow, outflow, transfers |
| Stripe / paywall | Scaffolded, not gating features | Remove — personal tool |
| Envelope `/plan` UI | Strong for zero-based planning | Keep optionally for discretionary planning; overview becomes primary |

---

## Recommended direction (summary)

1. **Product:** Personal all-accounts overview (Buddy replacement), not a SaaS paywall product.
2. **Ingest:** Prefer **Plaid** for both Crew and Wealthfront; support **file import (QFX/CSV)** as day-one fallback; expose a **generic ingest webhook** if using Finicom-style tools.
3. **Domain:** Introduce accounts, canonical categories, signed transactions, and period rollups for allocation + cash flow.
4. **Preserve:** Auth, household tenancy, month navigation patterns, and optionally the existing Plan UI for envelope budgeting of discretionary spend.

See also:

- [ADR 0001 — Personal finance overview product](../adr/0001-personal-finance-overview-product.md)
- [ADR 0002 — Data ingestion strategy](../adr/0002-data-ingestion-strategy.md)
- [ADR 0003 — Domain model for accounts & cash flow](../adr/0003-domain-model-accounts-cashflow.md)
- [Overhaul plan](../OVERHAUL_PLAN.md)

## Sources

- [Crew](https://www.trycrew.com/)
- [Buddy](https://buddy.download/)
- [Wealthfront Quicken export](https://support.wealthfront.com/hc/en-us/articles/209353346-Can-I-export-my-Wealthfront-account-data-to-another-personal-finance-tool-like-Quicken)
- [Wealthfront Plaid coverage (aggregator directory)](https://fintable.io/coverage/banks/United%20States/22850_wealthfront)
- [Crew Plaid / API notes](https://www.openbankingtracker.com/provider/crew-finance)
- [Finicom Crew webhooks](https://finicom.com/bank-coverage/crew-ins_136335)
