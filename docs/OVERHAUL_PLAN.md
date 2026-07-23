# BudgetBrain overhaul plan

**Status:** Recommendations accepted for planning  
**Date:** 2026-07-23  
**Goal:** Multi-account finance overview (Buddy replacement) — dogfood on owner’s banks now, architecture ready for SaaS bank-link later.

Supporting research & ADRs:

- [Research: Crew, Buddy, Wealthfront](./research/crew-buddy-wealthfront.md)
- [ADR 0001: Product direction](./adr/0001-personal-finance-overview-product.md)
- [ADR 0002: Ingestion](./adr/0002-data-ingestion-strategy.md)
- [ADR 0003: Domain model](./adr/0003-domain-model-accounts-cashflow.md)

---

## 1. Product north star

### Two horizons

| Now (dogfood) | Later (SaaS) |
|---------------|--------------|
| Replace Buddy for the owner | Anyone links their preferred banks |
| First institutions: Crew + Wealthfront | Same ledger + Plaid-class Link for any supported bank |
| No paywall | Reintroduce Stripe (or similar) when packaging |

**Crew / Wealthfront describe how the owner allocates money today** — they are not the product. UI and schema speak in generic terms: accounts, purposes (fixed / discretionary / emergency / investment), categories, transfers.

### Reference money model (owner)

| Where | Job |
|-------|-----|
| **Wealthfront** | Wealth home: checking, emergency, investments. Pays subscriptions & real bills (**fixed**). |
| **Crew** | **Discretionary / variable** — gas, groceries, non-fixed. |
| Funding Crew from Wealthfront | **Transfer**, not spend |

Other SaaS users may put bills on Chase and discretionary on a credit card — same `purpose` tags, different institutions.

### Questions the product answers (every period)

1. **Am I net positive?** — Inflows − lifestyle outflows (exclude transfers + wealth moves).
2. **Where does money go?** — % allocation by category (lifestyle spend).
3. **Fixed vs discretionary?** — by account purpose / category group (not branded “Crew vs Wealthfront”).
4. **Account picture** — balances for linked accounts.

---

## 2. Recommendations (decided)

| Topic | Suggestion | Why |
|-------|------------|-----|
| **Architecture** | Generic accounts + ingest from day one | Avoid rewrite when opening to other banks |
| **v1 scope** | Cash flow + allocation + account balances strip | Core Buddy-replacement job; net-worth deep dive can wait |
| **Net worth** | **Defer** full net-worth UI; still store balances | Investments matter later for SaaS; don’t block overview |
| **First ingest** | **CSV/QFX import first**, Plaid Link next | Get real data in fast; Plaid is the SaaS bank-connect path |
| **Institutions in dogfood** | Owner’s Wealthfront + Crew only | Enough to prove transfers + fixed/variable split |
| **Hardcoding** | No Crew-/WF-only code paths | Optional seed accounts/rules for the owner OK |
| **`/plan`** | Keep as **generic envelope module** | Useful for discretionary targets; SaaS feature later |
| **Stripe** | **Remove now**, re-add for SaaS launch | Dead weight while dogfooding |
| **Auth / household** | Keep | Already the right SaaS tenancy root |
| **Hosting** | **Vercel** — `main` deploys live | Existing app: `https://budget-brain-kappa.vercel.app` |

---

## 3. What we keep vs change vs remove

| Area | Action |
|------|--------|
| Supabase auth (email OTP) | **Keep** |
| Household tenancy | **Keep** (invites/billing later) |
| Overview dashboard (`/`) | **Rebuild** around cash flow + allocation |
| Plan (`/plan`) | **Keep** as secondary generic envelope tool |
| Stripe / pricing / checkout | **Remove now** (return for SaaS) |
| Marketing App Store welcome | Simplify later; not blocking |
| Manual add expense | **Keep** as fallback |

---

## 4. Target information architecture

```
/                Overview — net cash flow, fixed vs discretionary, allocation %, account strip
/accounts        Linked accounts, balances, connect bank / import
/transactions    Unified ledger (filter account, category, purpose)
/plan            Optional envelope planner (discretionary targets)
/settings        Profile, theme — no subscription (for now)
```

### Overview widgets (v1)

1. **Cash flow** — In | Lifestyle out | Net  
2. **Fixed vs discretionary** — by purpose (amounts + %)  
3. **Allocation** — category % of lifestyle spend  
4. **Accounts** — linked balances  
5. **Recent activity** — filterable ledger slice  

---

## 5. Data architecture (target)

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

Institution-agnostic. Owner dogfoods with two Links/imports; SaaS users add N institutions the same way.

Migration approach:

1. Add new tables alongside existing ones.
2. Backfill historical manual expenses → ledger with account `Manual`.
3. Point Overview at ledger; leave Plan on old tables until consolidation.

---

## 6. Ingestion roadmap

| Phase | Deliverable | Unlocks |
|-------|-------------|---------|
| **A** | CSV + QFX import → any account | Dogfood with Wealthfront QFX + Crew CSV/export immediately |
| **B** | Plaid Link + sync + webhooks | Hands-off updates; **future SaaS “connect your bank”** |
| **C** | Generic HMAC webhook ingest | Optional third-party sync tools |

Validate Plaid Transactions coverage for the owner’s institutions before relying on Phase B alone.

---

## 7. Workstreams (implementation slices)

### WS0 — Personal-tool cleanup

- Remove Stripe surface area; update runbooks.
- Optional drop of Stripe columns on `household`.

### WS1 — Ledger foundation (SaaS-shaped)

- `accounts` with `purpose` (`fixed_spend` \| `discretionary_spend` \| `emergency` \| `investment` \| `other`)
- Stable categories, rules, signed transactions, transfer pairs
- Seed **owner presets** (Wealthfront ×3 + Crew) as data, not code branches
- Queries: lifestyle cash flow, fixed vs discretionary, allocation %

### WS2 — Overview UI rebuild

- In/Out/Net + fixed/discretionary + allocation
- Generic copy (no “Crew” / “Wealthfront” required in chrome)

### WS3 — Import path (Phase A)

- Upload → parse → map to account → categorize → commit
- Transfer detection heuristics

### WS4 — Bank Link (Phase B) — SaaS precursor

- Plaid Link on `/accounts`
- Sync + webhooks
- Same normalizer as import

### WS5 — Categorization quality

- Account-aware rules; uncategorized review queue

### WS6 — Docs / coexistence

- Nav: Overview vs Plan
- Document dogfood vs future SaaS in README/WARP/AGENTS

### Later (post-dogfood SaaS track — not v1)

- Harden RLS for true multi-tenant
- Onboarding (“connect your banks”)
- Reintroduce Stripe / plans
- Net-worth dashboard
- Household invites

---

## 8. Success criteria (dogfood)

| Metric | Done when |
|--------|-----------|
| Replace Buddy | Owner runs month overview without Buddy |
| Allocation | Category % of lifestyle spend, editable |
| Cash flow | In / out / net; transfers & wealth moves don’t distort |
| Generic core | Second hypothetical bank could plug in without schema change |
| No paywall | Stripe removed; auth-only access |
| Trust | Idempotent import/sync |

---

## 9. Risks

| Risk | Mitigation |
|------|------------|
| Accidental Crew/WF hardcoding | Code review against ADR 0001; presets as seed data |
| Transfer mis-count | Explicit transfer pairing + purpose tags |
| Plaid delay | Phase A import ships first |
| SaaS security debt | Checklist before public launch (RLS, token encryption, rate limits) |
| Live Vercel dogfood | Auth-gated routes; production Supabase env on Vercel; don’t ship half-broken Stripe removal (build must not require live Stripe keys) |
| Production auth URLs | Supabase `site_url` / redirect allowlist must include `https://budget-brain-kappa.vercel.app` (and preview URLs if used) |

---

## 10. Hosting

- **Production:** Vercel auto-deploys from `main`.
- **URL:** https://budget-brain-kappa.vercel.app
- **Dogfood path:** merge feature work → `main` → live. Preview deploys on PRs are fine for UI checks; real bank data stays on production Supabase.
- **Env on Vercel:** Supabase URL/keys, `NEXT_PUBLIC_APP_URL`; Stripe vars removable after WS0 (use placeholders only if something still imports Stripe during transition).

---

## 11. Next step

Turn WS0–WS3 into a concrete implementation plan (schema DDL, ticket list, UI notes) and start building. Plaid (WS4) follows once import-fed Overview is trusted with real months of data.
