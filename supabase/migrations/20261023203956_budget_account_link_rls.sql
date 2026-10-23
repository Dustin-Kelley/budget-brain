-- Link a budget transaction to a manual account, and lock the budget tables
-- to the caller's household.
--
-- Depends on public.accounts from 20260723200000_ledger_foundation.sql.
-- The app treats a missing account_id column as "not linked yet", so a deploy
-- can go out before this file is applied.
--
-- household and users are left alone so signup can still insert and read
-- those rows with the existing grants.

do $$
begin
  if to_regclass('public.accounts') is null then
    raise exception
      'Apply 20260723200000_ledger_foundation.sql before 20261023203956_budget_account_link_rls.sql';
  end if;
end $$;

alter table public.transactions
  add column if not exists account_id uuid;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'transactions_account_id_fkey'
      and conrelid = 'public.transactions'::regclass
  ) then
    alter table public.transactions
      add constraint transactions_account_id_fkey
      foreign key (account_id)
      references public.accounts (id)
      on delete set null;
  end if;
end $$;

create index if not exists transactions_account_id_idx
  on public.transactions (account_id)
  where account_id is not null;

-- Same helper as 20260723210000_ledger_rls.sql. Replaced in place.
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

alter table public.categories enable row level security;
alter table public.line_items enable row level security;
alter table public.income enable row level security;
alter table public.transactions enable row level security;

drop policy if exists categories_select_household on public.categories;
drop policy if exists categories_insert_household on public.categories;
drop policy if exists categories_update_household on public.categories;
drop policy if exists categories_delete_household on public.categories;

create policy categories_select_household
  on public.categories
  for select
  to authenticated
  using (household_id = (select public.current_household_id()));

create policy categories_insert_household
  on public.categories
  for insert
  to authenticated
  with check (household_id = (select public.current_household_id()));

create policy categories_update_household
  on public.categories
  for update
  to authenticated
  using (household_id = (select public.current_household_id()))
  with check (household_id = (select public.current_household_id()));

create policy categories_delete_household
  on public.categories
  for delete
  to authenticated
  using (household_id = (select public.current_household_id()));

drop policy if exists line_items_select_household on public.line_items;
drop policy if exists line_items_insert_household on public.line_items;
drop policy if exists line_items_update_household on public.line_items;
drop policy if exists line_items_delete_household on public.line_items;

create policy line_items_select_household
  on public.line_items
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.categories c
      where c.id = line_items.category_id
        and c.household_id = (select public.current_household_id())
    )
  );

create policy line_items_insert_household
  on public.line_items
  for insert
  to authenticated
  with check (
    exists (
      select 1
      from public.categories c
      where c.id = line_items.category_id
        and c.household_id = (select public.current_household_id())
    )
  );

create policy line_items_update_household
  on public.line_items
  for update
  to authenticated
  using (
    exists (
      select 1
      from public.categories c
      where c.id = line_items.category_id
        and c.household_id = (select public.current_household_id())
    )
  )
  with check (
    exists (
      select 1
      from public.categories c
      where c.id = line_items.category_id
        and c.household_id = (select public.current_household_id())
    )
  );

create policy line_items_delete_household
  on public.line_items
  for delete
  to authenticated
  using (
    exists (
      select 1
      from public.categories c
      where c.id = line_items.category_id
        and c.household_id = (select public.current_household_id())
    )
  );

drop policy if exists income_select_household on public.income;
drop policy if exists income_insert_household on public.income;
drop policy if exists income_update_household on public.income;
drop policy if exists income_delete_household on public.income;

create policy income_select_household
  on public.income
  for select
  to authenticated
  using (household_id = (select public.current_household_id()));

create policy income_insert_household
  on public.income
  for insert
  to authenticated
  with check (household_id = (select public.current_household_id()));

create policy income_update_household
  on public.income
  for update
  to authenticated
  using (household_id = (select public.current_household_id()))
  with check (household_id = (select public.current_household_id()));

create policy income_delete_household
  on public.income
  for delete
  to authenticated
  using (household_id = (select public.current_household_id()));

drop policy if exists transactions_select_household on public.transactions;
drop policy if exists transactions_insert_household on public.transactions;
drop policy if exists transactions_update_household on public.transactions;
drop policy if exists transactions_delete_household on public.transactions;

create policy transactions_select_household
  on public.transactions
  for select
  to authenticated
  using (household_id = (select public.current_household_id()));

create policy transactions_insert_household
  on public.transactions
  for insert
  to authenticated
  with check (
    household_id = (select public.current_household_id())
    and (
      account_id is null
      or exists (
        select 1
        from public.accounts a
        where a.id = account_id
          and a.household_id = (select public.current_household_id())
      )
    )
    and (
      line_item_id is null
      or exists (
        select 1
        from public.line_items li
        join public.categories c on c.id = li.category_id
        where li.id = line_item_id
          and c.household_id = (select public.current_household_id())
      )
    )
  );

create policy transactions_update_household
  on public.transactions
  for update
  to authenticated
  using (household_id = (select public.current_household_id()))
  with check (
    household_id = (select public.current_household_id())
    and (
      account_id is null
      or exists (
        select 1
        from public.accounts a
        where a.id = account_id
          and a.household_id = (select public.current_household_id())
      )
    )
    and (
      line_item_id is null
      or exists (
        select 1
        from public.line_items li
        join public.categories c on c.id = li.category_id
        where li.id = line_item_id
          and c.household_id = (select public.current_household_id())
      )
    )
  );

create policy transactions_delete_household
  on public.transactions
  for delete
  to authenticated
  using (household_id = (select public.current_household_id()));

revoke all on table public.categories from anon;
revoke all on table public.line_items from anon;
revoke all on table public.income from anon;
revoke all on table public.transactions from anon;

grant select, insert, update, delete on table public.categories to authenticated;
grant select, insert, update, delete on table public.line_items to authenticated;
grant select, insert, update, delete on table public.income to authenticated;
grant select, insert, update, delete on table public.transactions to authenticated;

grant all on table public.categories to service_role;
grant all on table public.line_items to service_role;
grant all on table public.income to service_role;
grant all on table public.transactions to service_role;
