# Apply ledger migration on hosted Supabase

Before (or right after) merging the finance-overview work to `main`, run these
migrations against the **production** Supabase project used by Vercel:

1. `supabase/migrations/20260723200000_ledger_foundation.sql` — tables
2. `supabase/migrations/20260723210000_ledger_rls.sql` — **RLS** (household-scoped)

## Option A — Supabase SQL editor

1. Open the project in [Supabase Dashboard](https://supabase.com/dashboard)
2. SQL → New query
3. Paste and run **foundation**, then **RLS**, in order
4. Confirm policies exist (see Verify)

## Option B — CLI (linked project)

```bash
supabase db push
# or
supabase migration up --linked
```

## What RLS does

- Enables RLS on `accounts`, `spend_categories`, `ledger_transactions`, `category_rules`
- Authenticated users only see/mutate rows where `household_id` matches their
  `users.household_id` (via `current_household_id()`)
- Revokes anon access to ledger tables
- `service_role` retains full access (bypasses RLS)

## Verify

Tables present: `accounts`, `spend_categories`, `ledger_transactions`, `category_rules`.

```sql
select tablename, rowsecurity
from pg_tables
where schemaname = 'public'
  and tablename in ('accounts', 'spend_categories', 'ledger_transactions', 'category_rules');

select policyname, tablename
from pg_policies
where schemaname = 'public'
  and tablename in ('accounts', 'spend_categories', 'ledger_transactions', 'category_rules')
order by tablename, policyname;
```

Overview seeds default categories + account presets on first authenticated visit.
