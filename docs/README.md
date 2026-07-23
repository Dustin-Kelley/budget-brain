# Docs

## Overhaul (personal finance overview)

- [Overhaul plan](./OVERHAUL_PLAN.md) — product north star, workstreams, success criteria
- [Research: Crew, Buddy, Wealthfront](./research/crew-buddy-wealthfront.md)
- [Production ledger migration](./PRODUCTION_LEDGER_MIGRATION.md) — run on hosted Supabase before/at merge to `main`

### Architecture Decision Records

| ADR | Title |
|-----|-------|
| [0001](./adr/0001-personal-finance-overview-product.md) | Personal finance overview product (replace Buddy; remove Stripe) |
| [0002](./adr/0002-data-ingestion-strategy.md) | Data ingestion (import → Plaid → webhook) |
| [0003](./adr/0003-domain-model-accounts-cashflow.md) | Accounts, ledger, cash flow & allocation |

## Legacy

- Stripe was removed in the finance-overview overhaul (see ADR 0001). Reintroduce when packaging SaaS.
