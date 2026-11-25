-- Category identity color. Stores a palette key from lib/category-colors.ts,
-- never a raw hex. Null means the app paints a default from sort order.
-- Safe to run more than once.

alter table public.categories
  add column if not exists color text;

comment on column public.categories.color is
  'Palette key (cobalt, honey, violet, cyan, orchid, wine, slate, plum, navy, sky, indigo, clay). Null uses a default by sort order.';

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'categories_color_palette'
      and conrelid = 'public.categories'::regclass
  ) then
    alter table public.categories
      add constraint categories_color_palette
      check (
        color is null
        or color in (
          'cobalt',
          'honey',
          'violet',
          'cyan',
          'orchid',
          'wine',
          'slate',
          'plum',
          'navy',
          'sky',
          'indigo',
          'clay'
        )
      );
  end if;
end $$;
