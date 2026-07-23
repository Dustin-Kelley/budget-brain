# ADR 0001: Personal finance overview product

## Status

Accepted — 2026-07-23

## Context

BudgetBrain began as a household envelope budgeter (planned income → categories → line items → expenses) with Stripe scaffolding aimed at a consumer SaaS / App Store product. The owner’s real workflow is:

- **Crew** for discretionary pocket spending
- **Wealthfront** as the primary account
- **Buddy** as the cross-account overview (allocation %, income vs spend, multi-account picture)

The goal is to use BudgetBrain as a **personal** Buddy replacement — not to ship a paid multi-tenant product right now.

## Decision

1. **Reposition** BudgetBrain as a personal high-level finance overview and cash-flow tracker spanning linked accounts.
2. **Primary UX questions** the app must answer every period:
   - Cash flow: inflows − lifestyle outflows; am I net positive?
   - Fixed vs discretionary: Wealthfront bills/subs vs Crew variable spend
   - Allocation: what % of lifestyle spending goes to each category?
3. **Remove Stripe / paywall surface area** (API routes, settings card, deps, env, docs). Keep auth for private access only.
4. **Deprioritize** App Store / marketing-first framing for this phase; the authenticated overview is the product.
5. **Optionally retain** the existing Plan/envelope UI as a secondary tool for discretionary budgeting, not as the main dashboard.

## Consequences

### Positive

- Clear product north star aligned with actual usage.
- Less code and fewer secrets (no Stripe).
- Schema and UI can evolve around accounts + cash flow instead of planned envelopes alone.

### Negative / trade-offs

- Not building a general-audience SaaS; some existing marketing/pricing routes become dead weight until cleaned up.
- Household multi-user features stay lower priority unless needed later.

## Alternatives considered

- **Keep envelope-first, manually mirror Crew/Buddy** — fails the “replace Buddy” job; duplicate data entry.
- **Keep Stripe “just in case”** — unnecessary complexity for a personal tool; already not gating features.
