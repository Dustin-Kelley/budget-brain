# ADR 0002: Data ingestion strategy (Crew + Wealthfront)

## Status

Accepted — 2026-07-23 (implementation phased)

## Context

We need transactions (and ideally balances) from **Crew** and **Wealthfront**. Neither vendor offers a clean first-party developer API suited to this app:

- Crew: no public API/webhook portal; third parties (Plaid, Finicom, BankSync) advertise connectivity and webhooks.
- Wealthfront: official **QFX** export for Quicken; no CSV API; Plaid appears in aggregator coverage directories.

The user expected a Crew webhook; that is achievable as **our** ingest endpoint fed by an aggregator, not as a Crew-native feature.

## Decision

Adopt a **layered, institution-agnostic ingest** strategy. Crew and Wealthfront are the first connected institutions for dogfooding — not special-cased product modules.

### Phase A — Manual import (unblocks overview immediately)

- Accept **QFX/OFX** and **CSV**.
- User picks (or creates) the destination `account` on import.
- Normalize into a single internal transaction shape (see ADR 0003).
- Deduplicate on `(account_id, external_id)` or content hash when no external id.

### Phase B — Aggregator sync (preferred steady state + SaaS bank-link path)

- Integrate **Plaid Link + Transactions** (`/transactions/sync`) — or equivalent aggregator later.
- One Link flow works for any supported institution (owner’s Crew + Wealthfront first; SaaS users bring their own banks).
- Store `plaid_item_id` / `access_token` (encrypted at rest) per linked item.
- Handle aggregator webhooks (`SYNC_UPDATES_AVAILABLE`, etc.) to refresh.

### Phase C — Optional generic webhook

- Expose `POST /api/ingest/transactions` (HMAC-signed) so third-party sync tools can push activity.
- Same normalizer as file/Plaid paths.

### Non-goals (for ingest)

- Scraping bank UIs
- Moving money / payment initiation
- Hardcoding institution-specific parsers as the long-term path (presets/rules OK)

## Consequences

### Positive

- Day-one value without waiting on Plaid approval/coverage.
- Single normalizer keeps category mapping and cash-flow math consistent.
- Webhook path honors the user’s mental model (“Crew sends me data”).

### Negative / trade-offs

- Plaid has cost and compliance overhead even for personal use (use Development/Sandbox carefully; Production needs approval).
- Pocket-level Crew metadata may not survive aggregator normalization — category mapping rules become important.
- Manual import remains a maintenance path when Link breaks.

## Alternatives considered

- **Plaid-only from day one** — best automation, but blocks progress if institution coverage or keys are delayed.
- **Finicom-only** — faster webhook story for Crew; weaker unified coverage for Wealthfront; another vendor dependency.
- **Spreadsheet sync (Sheets → app)** — workable personally, poor product fit inside BudgetBrain.
