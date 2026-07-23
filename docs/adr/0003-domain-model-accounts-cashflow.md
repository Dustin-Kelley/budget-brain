# ADR 0003: Domain model for accounts and cash flow

## Status

Accepted — 2026-07-23 (updated with confirmed account roles)

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

### Confirmed account roles (owner reference setup)

These are **seed examples**, not hardcoded product types. SaaS users create whatever accounts their banks expose and assign `purpose` themselves (or via onboarding defaults).

| Account (example) | Institution | Role | Default `purpose` |
|-------------------|-------------|------|-------------------|
| Checking | Wealthfront | Bills + subscriptions (fixed) | `fixed_spend` |
| Emergency Fund | Wealthfront | Reserves | `emergency` |
| Investments | Wealthfront | Long-term wealth | `investment` |
| Spending | Crew | Discretionary / variable | `discretionary_spend` |

Tag accounts with `purpose`: `fixed_spend` | `discretionary_spend` | `emergency` | `investment` | `other`.

### Core entities (new / evolved)

| Entity | Responsibility |
|--------|----------------|
| `accounts` | Named money pots. `institution`, `type`, `purpose`, `currency`, `current_balance`, `external_ids`. |
| `category_taxonomy` (stable, not month-scoped) | Fixed-leaning: Housing, Utilities, Insurance, Subscriptions, … · Variable-leaning: Groceries, Gas/Transport, Dining, Entertainment, … · System: Income, Transfer, Savings, Investment. |
| `transactions` (evolved) | Canonical ledger rows: `account_id`, `amount` (signed: +in / −out), `posted_at`, `description`, `merchant`, `category_id`, `transfer_pair_id?`, `source` (`manual` \| `plaid` \| `import` \| `webhook`), `external_id`. |
| `category_rules` | Account-aware rules (purpose + merchant/description → category). |
| `period_snapshots` (optional) | Cached monthly rollups: income, fixed out, discretionary out, net, allocation JSON. |

### Cash-flow semantics

- **Inflow:** paycheck, interest, refunds.
- **Lifestyle outflow:** spend on `fixed_spend` / `discretionary_spend` accounts (or categories marked lifestyle).
- **Transfer:** movement between own accounts (e.g. funding discretionary from checking). Excluded from lifestyle spend.
- **Wealth move:** activity on `emergency` / `investment` purposes (contributions, buys/sells). Excluded from lifestyle allocation; reserved for future net-worth views.

**Net positive check (period) — lifestyle cash flow:**

```
net = sum(inflows) − sum(|lifestyle outflows|)
     excluding transfers and wealth moves
```

**Allocation % (period) — of lifestyle spend:**

```
allocation[category] = sum(|outflows in category|) / sum(|all lifestyle outflows|)
```

**Fixed vs discretionary split:**

```
fixed %         = outflows on fixed_spend purposes (or fixed categories) / total lifestyle outflows
discretionary % = outflows on discretionary_spend purposes / total lifestyle outflows
```

Optionally also show `% of income` for planning comparison.

### Relationship to existing Plan UI

- Keep plan tables as a **generic envelope module** (strong fit for discretionary targets).
- Overview reads from the **ledger**, not planned amounts.
- Optional later bridge: map discretionary account spend onto plan line items.

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
