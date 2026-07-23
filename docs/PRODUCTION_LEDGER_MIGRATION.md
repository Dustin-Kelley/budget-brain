# Apply ledger migration on hosted Supabase

Before (or right after) merging the finance-overview work to `main`, run the
SQL in `supabase/migrations/20260723200000_ledger_foundation.sql` against the
**production** Supabase project used by Vercel.

## Option A — Supabase SQL editor

1. Open the project in [Supabase Dashboard](https://supabase.com/dashboard)
2. SQL → New query
3. Paste the contents of `20260723200000_ledger_foundation.sql`
4. Run

## Option B — CLI (linked project)

```bash
supabase db push
# or
supabase migration up --linked
```

## Verify

Tables present: `accounts`, `spend_categories`, `ledger_transactions`, `category_rules`.

Overview seeds default categories + account presets on first authenticated visit.
