-- Local development schema for Budget Brain.
-- Reconstructed from supabase/supabase.ts (generated types) since the repo ships
-- no SQL migrations. This is intended for local Supabase development only.
-- NOTE: RLS is intentionally left disabled for local dev; access is via the
-- authenticated session using the anon key. See AGENTS.md for context.

create extension if not exists "pgcrypto";

create table if not exists public.household (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  name text
);

create table if not exists public.users (
  id uuid primary key references auth.users (id) on delete cascade,
  created_at timestamptz not null default now(),
  email text,
  first_name text,
  last_name text,
  household_id uuid not null references public.household (id) on delete cascade
);

create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  household_id uuid not null references public.household (id) on delete cascade,
  month integer,
  name text,
  updated_at timestamptz,
  year integer
);

create table if not exists public.line_items (
  id uuid primary key default gen_random_uuid(),
  category_id uuid not null references public.categories (id) on delete cascade,
  created_at timestamptz not null default now(),
  created_by uuid references public.users (id) on delete set null,
  month integer,
  name text,
  planned_amount numeric,
  updated_at timestamptz,
  year integer
);

create table if not exists public.income (
  id uuid primary key default gen_random_uuid(),
  amount numeric not null,
  created_at timestamptz not null default now(),
  created_by uuid not null default auth.uid() references public.users (id) on delete cascade,
  household_id uuid not null references public.household (id) on delete cascade,
  month integer,
  name text,
  updated_at timestamptz,
  year integer
);

create table if not exists public.transactions (
  id uuid primary key default gen_random_uuid(),
  amount numeric,
  created_at timestamptz not null default now(),
  created_by uuid references public.users (id) on delete set null,
  date date,
  description text,
  household_id uuid not null references public.household (id) on delete cascade,
  line_item_id uuid references public.line_items (id) on delete set null,
  month integer,
  type text,
  updated_at timestamptz,
  year integer
);

grant usage on schema public to anon, authenticated, service_role;
grant all on all tables in schema public to anon, authenticated, service_role;
grant all on all sequences in schema public to anon, authenticated, service_role;
grant all on all functions in schema public to anon, authenticated, service_role;
