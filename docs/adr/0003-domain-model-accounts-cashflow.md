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

### Confirmed account roles

| Account | Institution | Role | Default spend treatment |
|---------|-------------|------|-------------------------|
| Wealthfront Checking | Wealthfront | Bills + subscriptions (fixed) | Lifestyle **outflow** when categorized as bill/sub |
| Wealthfront Emergency Fund | Wealthfront | Reserves | **Transfer / savings** — not lifestyle spend |
| Wealthfront Investments | Wealthfront | Long-term wealth | **Wealth move** — not lifestyle spend |
| Crew | Crew | Discretionary / variable (gas, groceries, non-fixed) | Lifestyle **outflow** |

Seed these four accounts (or however Wealthfront splits them in Plaid/QFX) on first setup. Tag accounts with `purpose`: `fixed_spend` | `discretionary_spend` | `emergency` | `investment`.

### Core entities (new / evolved)

| Entity | Responsibility |
|--------|----------------|
| `accounts` | Named money pots above. `institution`, `type`, `purpose`, `currency`, `current_balance`, `external_ids`. |
| `category_taxonomy` (stable, not month-scoped) | Fixed: Housing, Utilities, Insurance, Subscriptions, … · Variable: Groceries, Gas/Transport, Dining, Entertainment, … · System: Income, Transfer, Savings, Investment. |
| `transactions` (evolved) | Canonical ledger rows: `account_id`, `amount` (signed: +in / −out), `posted_at`, `description`, `merchant`, `category_id`, `transfer_pair_id?`, `source` (`manual` \| `plaid` \| `import` \| `webhook`), `external_id`. |
| `category_rules` | Prefer account-aware rules: Wealthfront merchants → fixed categories; Crew merchants → variable categories. |
| `period_snapshots` (optional) | Cached monthly rollups: income, fixed out, discretionary out, net, allocation JSON. |

### Cash-flow semantics

- **Inflow:** paycheck, interest, refunds (usually lands in Wealthfront).
- **Lifestyle outflow:** Crew spend + Wealthfront bill/subscription payments.
- **Transfer:** Wealthfront → Crew funding; checking ↔ emergency; etc. Excluded from lifestyle spend and from net “am I positive?” unless we show a separate savings rate.
- **Wealth move:** buys/sells inside investments; contributions to emergency/investment from checking. Excluded from lifestyle allocation; may appear in a future net-worth view.

**Net positive check (period) — lifestyle cash flow:**

```
net = sum(inflows) − sum(|lifestyle outflows|)
     excluding transfers and wealth moves
```

**Allocation % (period) — of lifestyle spend:**

```
allocation[category] = sum(|outflows in category|) / sum(|all lifestyle outflows|)
```

**Fixed vs discretionary split (first-class Overview metric):**

```
fixed %         = Wealthfront lifestyle outflows / total lifestyle outflows
discretionary % = Crew lifestyle outflows       / total lifestyle outflows
```

(Refine later if some Wealthfront txns are discretionary or some Crew txns are fixed.)

Optionally also show `% of income` for planning comparison (Buddy-like).

### Relationship to existing Plan UI

- Keep `categories` / `line_items` / planned `income` as **budget plan** artifacts — strongest fit for **Crew discretionary** envelopes.
- New overview reads from the **ledger**, not from planned amounts.
- Optional bridge: map Crew pocket spend onto plan line items; Wealthfront fixed bills can stay ledger-only or get simple recurring rules.

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
