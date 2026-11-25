# Apply ledger migration on hosted Supabase

Before (or right after) merging the finance-overview work to `main`, run these
migrations against the **production** Supabase project used by Vercel:

1. `supabase/migrations/20260723200000_ledger_foundation.sql` — tables
2. `supabase/migrations/20260723210000_ledger_rls.sql` — **RLS** (household-scoped)
3. `supabase/migrations/20261023203956_budget_account_link_rls.sql` — nullable
   `transactions.account_id`, plus household RLS on `categories`, `line_items`,
   `income`, and `transactions`
4. `supabase/migrations/20261125160000_category_color.sql` — `categories.color`
   as a palette key

On the hosted project this column already exists. An older `add_category_color`
migration (not in this repo) stored raw hex such as `#3b82f6`, `#ec4899`, and
`#10b981`. The script in this repo adds the column only if it is missing,
drops whatever check or default is already on it, and replaces nulls and those
legacy hex values with a palette key. Groups that already store one of the 12
keys are left as they are. Run the file as written. Do not skip it because the
column is already there.

The app keeps working if steps 3 and 4 land a few minutes after the deploy.
Until `account_id` exists, budget transactions save without an account. Until
`categories.color` exists, groups still show a color from their order in the
month, and picking a color waits for the column.

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
- `20261023203956_budget_account_link_rls.sql` also enables RLS on `categories`,
  `line_items`, `income`, and `transactions` (line items follow their group’s household)
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
