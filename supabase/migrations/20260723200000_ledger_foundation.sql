-- Ledger foundation: accounts, spend categories, ledger transactions, rules.
-- Coexists with existing envelope plan tables (categories / line_items / transactions).

create table if not exists public.accounts (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz,
  household_id uuid not null references public.household (id) on delete cascade,
  name text not null,
  institution text,
  account_type text not null default 'checking',
  purpose text not null default 'other',
  currency text not null default 'USD',
  current_balance numeric,
  external_id text,
  is_active boolean not null default true,
  unique (household_id, name)
);

create table if not exists public.spend_categories (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  household_id uuid not null references public.household (id) on delete cascade,
  name text not null,
  group_kind text not null default 'variable',
  is_system boolean not null default false,
  sort_order integer not null default 100,
  unique (household_id, name)
);

create table if not exists public.ledger_transactions (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz,
  household_id uuid not null references public.household (id) on delete cascade,
  account_id uuid not null references public.accounts (id) on delete cascade,
  spend_category_id uuid references public.spend_categories (id) on delete set null,
  amount numeric not null,
  posted_at date not null,
  description text,
  merchant text,
  source text not null default 'manual',
  external_id text,
  transfer_group_id uuid,
  created_by uuid references public.users (id) on delete set null,
  unique (account_id, external_id)
);

create index if not exists ledger_transactions_household_posted_idx
  on public.ledger_transactions (household_id, posted_at desc);

create index if not exists ledger_transactions_account_posted_idx
  on public.ledger_transactions (account_id, posted_at desc);

create table if not exists public.category_rules (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  household_id uuid not null references public.household (id) on delete cascade,
  match_field text not null default 'description',
  match_type text not null default 'contains',
  match_value text not null,
  spend_category_id uuid not null references public.spend_categories (id) on delete cascade,
  account_id uuid references public.accounts (id) on delete cascade,
  priority integer not null default 100
);

grant all on table public.accounts to anon, authenticated, service_role;
grant all on table public.spend_categories to anon, authenticated, service_role;
grant all on table public.ledger_transactions to anon, authenticated, service_role;
grant all on table public.category_rules to anon, authenticated, service_role;
