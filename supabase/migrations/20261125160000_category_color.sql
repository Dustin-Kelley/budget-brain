-- Category identity color. Stores a palette key from lib/category-colors.ts,
-- never a raw hex. Null means the app paints a default from sort order.
-- Safe to run more than once. Re-running replaces the allowed key list.

alter table public.categories
  add column if not exists color text;

comment on column public.categories.color is
  'Palette key (honey, violet, sage, wine, clay, plum, sand, rose, slate, berry, dusk, ash). Null uses a default by sort order. The first default is honey.';

alter table public.categories
  drop constraint if exists categories_color_palette;

alter table public.categories
  add constraint categories_color_palette
  check (
    color is null
    or color in (
      'honey',
      'violet',
      'sage',
      'wine',
      'clay',
      'plum',
      'sand',
      'rose',
      'slate',
      'berry',
      'dusk',
      'ash'
    )
  );
