-- Category identity color. Stores a palette key from lib/category-colors.ts,
-- never a raw hex. The key list and its order must match CATEGORY_COLORS.
--
-- Hosted Supabase may already have categories.color from an older
-- add_category_color migration that is not in this repo. Those rows can hold
-- raw hex. This script replaces anything that is not one of the 12 keys,
-- then adds the check. Safe to run more than once.

alter table public.categories
  add column if not exists color text;

comment on column public.categories.color is
  'Palette key from lib/category-colors.ts. Anything else is replaced from the group''s place in the month (created_at, then id). The first default is honey.';

alter table public.categories
  alter column color drop default;

alter table public.categories
  drop constraint if exists categories_color_palette;

-- Drop any other check on this column, whatever it was named.
do $$
declare
  constraint_name text;
begin
  for constraint_name in
    select con.conname
    from pg_constraint as con
    join pg_class as rel on rel.oid = con.conrelid
    join pg_namespace as nsp on nsp.oid = rel.relnamespace
    where nsp.nspname = 'public'
      and rel.relname = 'categories'
      and con.contype = 'c'
      and pg_get_constraintdef(con.oid) ilike '%color%'
  loop
    execute format(
      'alter table public.categories drop constraint if exists %I',
      constraint_name
    );
  end loop;
end $$;

-- Replace nulls and legacy values (hex or retired keys). A saved palette key
-- is left alone. The index is the group's place among every group in that
-- household and month, same as the app: created_at, then id.
with numbered as (
  select
    id,
    (
      row_number() over (
        partition by household_id, year, month
        order by created_at asc, id asc
      ) - 1
    ) as idx
  from public.categories
)
update public.categories as category
set color = (
  array[
    'honey',
    'violet',
    'sand',
    'plum',
    'clay',
    'rose',
    'mustard',
    'orchid',
    'copper',
    'mauve',
    'taupe',
    'graphite'
  ]
)[(numbered.idx % 12) + 1]
from numbered
where category.id = numbered.id
  and (
    category.color is null
    or category.color not in (
      'honey',
      'violet',
      'sand',
      'plum',
      'clay',
      'rose',
      'mustard',
      'orchid',
      'copper',
      'mauve',
      'taupe',
      'graphite'
    )
  );

alter table public.categories
  add constraint categories_color_palette
  check (
    color is null
    or color in (
      'honey',
      'violet',
      'sand',
      'plum',
      'clay',
      'rose',
      'mustard',
      'orchid',
      'copper',
      'mauve',
      'taupe',
      'graphite'
    )
  );
