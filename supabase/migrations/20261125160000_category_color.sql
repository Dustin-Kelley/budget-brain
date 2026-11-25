-- Category identity color. Stores a palette key from lib/category-colors.ts,
-- never a raw hex. The key list and its order must match CATEGORY_COLORS.
-- Safe to run more than once.

alter table public.categories
  add column if not exists color text;

comment on column public.categories.color is
  'Palette key from lib/category-colors.ts. Null is filled from the group''s place in the month (created_at, then id). The first default is honey.';

alter table public.categories
  drop constraint if exists categories_color_palette;

-- Freeze a color on every group that does not have one yet, using the same
-- order the app uses: created_at, then id, within each household and month.
-- Only nulls are updated, so a later run does not reshuffle saved colors.
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
    'clay',
    'plum',
    'sand',
    'rose',
    'mustard',
    'orchid',
    'taupe',
    'mauve',
    'copper',
    'graphite'
  ]
)[(numbered.idx % 12) + 1]
from numbered
where category.id = numbered.id
  and category.color is null;

alter table public.categories
  add constraint categories_color_palette
  check (
    color is null
    or color in (
      'honey',
      'violet',
      'clay',
      'plum',
      'sand',
      'rose',
      'mustard',
      'orchid',
      'taupe',
      'mauve',
      'copper',
      'graphite'
    )
  );
