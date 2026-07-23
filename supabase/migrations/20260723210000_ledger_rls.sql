-- Enable RLS on ledger tables and restrict rows to the caller's household.
-- Idempotent: safe if foundation migration already included these policies.

create or replace function public.current_household_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select u.household_id
  from public.users u
  where u.id = auth.uid()
$$;

revoke all on function public.current_household_id() from public;
grant execute on function public.current_household_id() to authenticated, service_role;

-- ---------------------------------------------------------------------------
-- accounts
-- ---------------------------------------------------------------------------
alter table public.accounts enable row level security;

drop policy if exists accounts_select_household on public.accounts;
drop policy if exists accounts_insert_household on public.accounts;
drop policy if exists accounts_update_household on public.accounts;
drop policy if exists accounts_delete_household on public.accounts;

create policy accounts_select_household
  on public.accounts
  for select
  to authenticated
  using (household_id = public.current_household_id());

create policy accounts_insert_household
  on public.accounts
  for insert
  to authenticated
  with check (household_id = public.current_household_id());

create policy accounts_update_household
  on public.accounts
  for update
  to authenticated
  using (household_id = public.current_household_id())
  with check (household_id = public.current_household_id());

create policy accounts_delete_household
  on public.accounts
  for delete
  to authenticated
  using (household_id = public.current_household_id());

-- ---------------------------------------------------------------------------
-- spend_categories
-- ---------------------------------------------------------------------------
alter table public.spend_categories enable row level security;

drop policy if exists spend_categories_select_household on public.spend_categories;
drop policy if exists spend_categories_insert_household on public.spend_categories;
drop policy if exists spend_categories_update_household on public.spend_categories;
drop policy if exists spend_categories_delete_household on public.spend_categories;

create policy spend_categories_select_household
  on public.spend_categories
  for select
  to authenticated
  using (household_id = public.current_household_id());

create policy spend_categories_insert_household
  on public.spend_categories
  for insert
  to authenticated
  with check (household_id = public.current_household_id());

create policy spend_categories_update_household
  on public.spend_categories
  for update
  to authenticated
  using (household_id = public.current_household_id())
  with check (household_id = public.current_household_id());

create policy spend_categories_delete_household
  on public.spend_categories
  for delete
  to authenticated
  using (household_id = public.current_household_id());

-- ---------------------------------------------------------------------------
-- ledger_transactions
-- ---------------------------------------------------------------------------
alter table public.ledger_transactions enable row level security;

drop policy if exists ledger_transactions_select_household on public.ledger_transactions;
drop policy if exists ledger_transactions_insert_household on public.ledger_transactions;
drop policy if exists ledger_transactions_update_household on public.ledger_transactions;
drop policy if exists ledger_transactions_delete_household on public.ledger_transactions;

create policy ledger_transactions_select_household
  on public.ledger_transactions
  for select
  to authenticated
  using (household_id = public.current_household_id());

create policy ledger_transactions_insert_household
  on public.ledger_transactions
  for insert
  to authenticated
  with check (household_id = public.current_household_id());

create policy ledger_transactions_update_household
  on public.ledger_transactions
  for update
  to authenticated
  using (household_id = public.current_household_id())
  with check (household_id = public.current_household_id());

create policy ledger_transactions_delete_household
  on public.ledger_transactions
  for delete
  to authenticated
  using (household_id = public.current_household_id());

-- ---------------------------------------------------------------------------
-- category_rules
-- ---------------------------------------------------------------------------
alter table public.category_rules enable row level security;

drop policy if exists category_rules_select_household on public.category_rules;
drop policy if exists category_rules_insert_household on public.category_rules;
drop policy if exists category_rules_update_household on public.category_rules;
drop policy if exists category_rules_delete_household on public.category_rules;

create policy category_rules_select_household
  on public.category_rules
  for select
  to authenticated
  using (household_id = public.current_household_id());

create policy category_rules_insert_household
  on public.category_rules
  for insert
  to authenticated
  with check (household_id = public.current_household_id());

create policy category_rules_update_household
  on public.category_rules
  for update
  to authenticated
  using (household_id = public.current_household_id())
  with check (household_id = public.current_household_id());

create policy category_rules_delete_household
  on public.category_rules
  for delete
  to authenticated
  using (household_id = public.current_household_id());

-- Anon should not touch ledger data even with table grants.
revoke all on table public.accounts from anon;
revoke all on table public.spend_categories from anon;
revoke all on table public.ledger_transactions from anon;
revoke all on table public.category_rules from anon;

grant select, insert, update, delete on table public.accounts to authenticated;
grant select, insert, update, delete on table public.spend_categories to authenticated;
grant select, insert, update, delete on table public.ledger_transactions to authenticated;
grant select, insert, update, delete on table public.category_rules to authenticated;

grant all on table public.accounts to service_role;
grant all on table public.spend_categories to service_role;
grant all on table public.ledger_transactions to service_role;
grant all on table public.category_rules to service_role;
