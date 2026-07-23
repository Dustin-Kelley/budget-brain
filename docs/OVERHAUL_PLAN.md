# BudgetBrain overhaul plan

**Status:** Draft for review  
**Date:** 2026-07-23  
**Goal:** Replace Buddy as the personal all-accounts finance overview, fed by Crew + Wealthfront.

Supporting research & ADRs:

- [Research: Crew, Buddy, Wealthfront](./research/crew-buddy-wealthfront.md)
- [ADR 0001: Product direction](./adr/0001-personal-finance-overview-product.md)
- [ADR 0002: Ingestion](./adr/0002-data-ingestion-strategy.md)
- [ADR 0003: Domain model](./adr/0003-domain-model-accounts-cashflow.md)

---

## 1. Product north star

BudgetBrain should answer, for any selected period (default: current month):

1. **Am I net positive?** — Total in, total out, net (excluding internal transfers).
2. **Where does money go?** — % allocation by category (housing, groceries, …).
3. **What’s the picture across accounts?** — Crew + Wealthfront (and later others) in one ledger.

Crew remains the day-to-day discretionary controller; BudgetBrain does not need to recreate pockets/Autopilot. Wealthfront remains the primary bank/brokerage; BudgetBrain does not need to recreate investing UI.

---

## 2. What we keep vs change vs remove

| Area | Action |
|------|--------|
| Supabase auth (email OTP) | **Keep** — private personal access |
| Household tenancy | **Keep** (single-user is fine) |
| Overview dashboard (`/`) | **Rebuild** around cash flow + allocation |
| Plan (`/plan`) | **Keep as secondary** envelope tool, or park behind a “Budget plan” nav item |
| Stripe / pricing / checkout | **Remove** |
| Marketing App Store welcome | **Simplify** later; not blocking |
| Manual add expense | **Keep** as fallback + adjustments |

---

## 3. Target information architecture

```
/                Overview — net cash flow, allocation pie/%, account strip
/accounts        Linked accounts, balances, last sync / import
/transactions    Unified searchable ledger (filter by account, category, source)
/plan            (optional) Existing envelope planner for discretionary targets
/settings        Profile, theme, reset, link/import credentials — no subscription
```

### Overview widgets (v1)

1. **Cash flow card** — In | Out | Net + sparkline or simple month comparison  
2. **Allocation** — pie or stacked bar: category % of spend  
3. **Accounts** — Crew, Wealthfront balances (when available)  
4. **Recent activity** — last N transactions across accounts  

---

## 4. Data architecture (target)

```
                    ┌─────────────┐
  Plaid / files /   │  Ingest     │
  webhook ─────────►│  normalizer │──► accounts + transactions + rules
                    └─────────────┘
                              │
                              ▼
                    ┌─────────────────────┐
                    │  Period analytics   │──► Overview UI
                    │  (cash flow, %)     │
                    └─────────────────────┘
```

See ADR 0003 for tables. Migration approach:

1. Add new tables alongside existing ones.
2. Backfill historical manual expenses → ledger with account `Manual`.
3. Point Overview at ledger; leave Plan on old tables until a later consolidation.

---

## 5. Ingestion roadmap

| Phase | Deliverable | Unlocks |
|-------|-------------|---------|
| **A** | CSV + QFX import UI; category mapping on import | Wealthfront via QFX; any Crew CSV/export; Overview with real data |
| **B** | Plaid Link for Crew + Wealthfront; sync job + webhooks | Hands-off updates |
| **C** | Generic HMAC webhook ingest | Finicom/Buddy-like “push” workflow if preferred over Plaid |

**Open validation before Phase B:** Confirm in a Plaid developer account that **Transactions** product works for both institutions under this app’s keys.

---

## 6. Workstreams (implementation slices)

Ordered so each slice leaves the app usable.

### WS0 — Personal-tool cleanup

- Remove Stripe package usage, `/api/stripe/*`, checkout success, subscription settings card, `docs/STRIPE_SETUP.md`.
- Drop Stripe env requirements from runbooks (`AGENTS.md`, `WARP.md`).
- Optional DB migration to drop unused Stripe columns on `household`.

### WS1 — Ledger foundation

- Migrations: `accounts`, evolved `transactions`, stable categories, `category_rules`.
- Seed default category taxonomy (Housing, Groceries, Dining, Transport, Utilities, Health, Entertainment, Shopping, Subscriptions, Income, Transfer, Other).
- Server queries: period cash flow, allocation %, transaction list by account.

### WS2 — Overview UI rebuild

- Replace Planned/Spent/Remaining-as-primary with In/Out/Net + allocation.
- Month selector stays.
- Account filter chips.

### WS3 — Import path (Phase A ingest)

- Upload QFX/CSV → parse → preview → confirm categories → commit.
- Deduping and “Transfers” detection heuristics (same amount, close dates, two accounts).

### WS4 — Automation (Phase B/C)

- Plaid Link button on `/accounts`.
- Sync + webhook handlers.
- Optional generic ingest webhook.

### WS5 — Categorization quality

- Rules engine (contains merchant X → Groceries).
- Review queue for uncategorized txns (biggest lever for accurate %).
- Optional: map Crew pocket names when present in memo/metadata.

### WS6 — Plan coexistence / docs

- Clarify nav labels: Overview vs Budget plan.
- Update README / WARP / AGENTS for new mental model.
- Retire or freeze dead stubs (pricing, password reset, invite).

---

## 7. Success criteria

| Metric | Definition of done |
|--------|--------------------|
| Replace Buddy for overview | User can see Crew + Wealthfront activity in one place without opening Buddy |
| Allocation | Category % of spend for the selected month, editable via recategorize |
| Cash flow | Clear In / Out / Net; transfers don’t distort the story |
| Personal tool | No Stripe; app runs with Supabase auth only |
| Trust | Imports are idempotent; sync doesn’t duplicate transactions |

---

## 8. Risks and open questions

| Risk / question | Notes |
|-----------------|-------|
| Does Crew expose pocket names via Plaid? | May only get merchant/amount; rules/manual map needed |
| Wealthfront cash vs investment accounts | May need multiple `accounts` rows; investment buys ≠ lifestyle spend |
| Transfer detection | Critical so Crew funding from Wealthfront isn’t double-counted |
| Plaid personal-use cost / ToS | Confirm Development tier limits; Production approval if hosting publicly |
| Keep Plan UI? | Recommend yes initially; revisit after Overview is trusted |
| Single-user vs household | Build ledger per household; don’t invest in invites yet |

**Questions for the next planning pass (with you):**

1. Is Wealthfront **Cash** the primary spending account, or mostly bills/transfers while Crew is the spend card?
2. Do you care about **net worth / investment balances**, or only cash-flow + allocation for now?
3. Preferred first ingest: **manual QFX/CSV** this week, or go straight to **Plaid**?
4. Should internal transfers to investment goals count as “out” or be excluded like transfers?
5. Any other accounts (credit cards, 401k) in scope for v1?

---

## 9. Suggested next step

After you review this pack, we turn §6 into a concrete implementation plan (ticket-sized tasks, schema DDL sketch, and UI wireframe notes) and start with **WS0 + WS1** unless you prefer ingest-first with a thinner schema.

No application code has been changed in this documentation pass — research and decisions only.
