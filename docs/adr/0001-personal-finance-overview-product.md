# ADR 0001: Product direction — dogfood now, SaaS-ready architecture

## Status

Accepted — 2026-07-23 (revised)

## Context

BudgetBrain began as a household envelope budgeter with Stripe scaffolding aimed at a consumer SaaS / App Store product.

The owner’s **current** workflow (reference setup, not product identity):

- **Crew** — discretionary / variable spend
- **Wealthfront** — wealth home (checking, emergency, investments) + fixed bills/subscriptions
- **Buddy** — cross-account overview to replace

**Horizon:**

| Phase | Audience | Goal |
|-------|----------|------|
| **Now** | Owner (dogfood) | Replace Buddy; real cash flow + allocation from real accounts |
| **Later** | SaaS anyone | Users link *their* banks; same overview jobs |

Crew and Wealthfront are the first two institutions we integrate against — not hardcoded product concepts.

## Decision

1. **Build generic multi-account finance overview** (cash flow, allocation %, accounts). Institution-agnostic domain from day one.
2. **Dogfood on the owner’s setup** to prove the product before commercializing.
3. **Primary UX questions** every period:
   - Cash flow: inflows − lifestyle outflows; am I net positive?
   - Spend shape: fixed vs discretionary (via account `purpose` / categories — not “Crew vs Wealthfront” labels in the UI)
   - Allocation: % of lifestyle spend by category
4. **Bank connect is a pluggable ingest layer** (import + Plaid-class aggregator). No Crew-/Wealthfront-specific business logic beyond optional seed presets/rules for the owner.
5. **Remove Stripe for now** to reduce drag while dogfooding. Reintroduce billing when packaging SaaS — do not keep half-wired paywall code.
6. **Keep household tenancy** — already the right multi-user SaaS root; don’t invest in invites/billing until later.
7. **Retain Plan/envelope UI** as an optional budgeting module (generic), useful for discretionary targets; Overview is the primary surface.

## Consequences

### Positive

- Architecture matches the eventual SaaS (“hook up preferred banks”) without rewriting the ledger later.
- Dogfooding forces real transfer/categorization edge cases early.
- No Stripe tax while proving value.

### Negative / trade-offs

- Slightly more abstraction than a one-off Crew+Wealthfront script.
- SaaS concerns (RLS hardening, Plaid production approval, pricing) deferred — must not be forgotten before public launch.

## Alternatives considered

- **Hardcode Crew + Wealthfront only** — faster short term; blocks SaaS path and pollutes UI copy.
- **Keep Stripe scaffolding** — unused complexity; re-add when monetizing.
- **Build full SaaS (billing, onboarding, multi-tenant polish) before dogfood** — slow; no proof the overview job is right.
