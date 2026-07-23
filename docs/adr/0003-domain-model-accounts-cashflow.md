# ADR 0003: Domain model for accounts and cash flow

## Status

Proposed — 2026-07-23

## Context

Today’s schema is envelope-centric and month-scoped:

```
household → users
household → categories(month/year) → line_items → transactions
household → income(month/year)
```

There is no notion of **bank accounts**, **transfers**, or **signed cash flow**. Transactions are expenses tied to planned line items. That model fits discretionary planning; it does not fit Buddy-style multi-account overview.

## Decision

Evolve toward a **ledger-first** model, while allowing the existing plan tables to remain for optional envelope budgeting.

### Core entities (new / evolved)

| Entity | Responsibility |
|--------|----------------|
| `accounts` | Named money pots: Crew checking, Wealthfront Cash, Wealthfront Investment, cash, etc. `institution`, `type`, `currency`, `current_balance`, `external_ids`. |
| `category_taxonomy` (or global `categories` not month-scoped) | Stable labels: Housing, Groceries, Transport, Income, Transfer, … used for allocation %. |
| `transactions` (evolved) | Canonical ledger rows: `account_id`, `amount` (signed: +in / −out), `posted_at`, `description`, `merchant`, `category_id`, `transfer_pair_id?`, `source` (`manual` \| `plaid` \| `import` \| `webhook`), `external_id`. |
| `category_rules` | Map merchant/description/account → category (auto-categorize imports). |
| `period_snapshots` (optional) | Cached monthly rollups for fast dashboard (income, expense, net, allocation JSON). |

### Cash-flow semantics

- **Inflow:** amount > 0 (paychecks, interest, refunds) — or explicit `type = inflow`
- **Outflow:** amount < 0 (spend, bills)
- **Transfer:** movement between own accounts; excluded from spend allocation and from “net lifestyle cash flow” (or counted separately) so Crew ↔ Wealthfront transfers do not inflate income/spend.

**Net positive check (period):**

```
net = sum(inflows) − sum(|outflows|)
     excluding transfers (and optionally excluding investment buys that are asset swaps)
```

**Allocation % (period):**

```
allocation[category] = sum(|outflows in category|) / sum(|all categorized outflows|)
```

Optionally also show `% of income` for planning comparison (Buddy-like).

### Relationship to existing Plan UI

- Keep `categories` / `line_items` / planned `income` as **budget plan** artifacts, renamed conceptually to “Plan” not “Overview.”
- New overview reads from the **ledger**, not from planned amounts.
- Optional bridge: map discretionary Crew spend categories onto plan line items later.

### Stripe columns on `household`

Remove or stop writing `stripe_*` / `subscription_*` fields as part of Stripe teardown (migration can drop columns when convenient).

## Consequences

### Positive

- Matches Buddy’s mental model: accounts + categories + period overview.
- Supports multi-source ingest without forcing every txn onto a planned envelope.
- Transfer handling prevents false “I’m losing money” signals when moving between Crew and Wealthfront.

### Negative / trade-offs

- Schema migration is non-trivial; existing expense rows need a backfill path (synthetic account “Manual”, categories from line items).
- Two parallel concepts (Plan vs Ledger) until Plan is retired or tightly linked — must be clear in UI copy.

## Alternatives considered

- **Only extend current transactions + line items** — cannot represent Wealthfront activity that is not “budgeted,” or account balances.
- **Full double-entry accounting** — correct but heavy for a personal overview; signed single-entry + transfer pairs is enough.
