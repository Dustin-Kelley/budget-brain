/**
 * Category identity colors. Stored on `categories.color` as a key, never a hex.
 *
 * Warm and purple only: amber, clay, sand, mustard, copper, rose, orchid,
 * violet, plum, mauve, taupe, and graphite. No blue, no green, and no true
 * red, so these tags stay clear of the under-budget green and over-budget
 * red. Light and dark hexes live in `app/globals.css` as `--bb-cat-<key>`.
 *
 * This array is the app's source of truth, and its order is the default
 * sequence. A group with no saved color uses its place in the month
 * (`created_at`, then `id`). The first group gets Honey.
 *
 * The SQL check constraint in
 * `supabase/migrations/20261125160000_category_color.sql` repeats these keys
 * in this same order for the one-time backfill. That list has to be kept in
 * sync by hand when a key is added or renamed.
 */

export const CATEGORY_COLORS = [
  { key: 'honey', name: 'Honey', cssVar: '--bb-cat-honey' },
  { key: 'violet', name: 'Violet', cssVar: '--bb-cat-violet' },
  { key: 'clay', name: 'Clay', cssVar: '--bb-cat-clay' },
  { key: 'plum', name: 'Plum', cssVar: '--bb-cat-plum' },
  { key: 'sand', name: 'Sand', cssVar: '--bb-cat-sand' },
  { key: 'rose', name: 'Rose', cssVar: '--bb-cat-rose' },
  { key: 'mustard', name: 'Mustard', cssVar: '--bb-cat-mustard' },
  { key: 'orchid', name: 'Orchid', cssVar: '--bb-cat-orchid' },
  { key: 'taupe', name: 'Taupe', cssVar: '--bb-cat-taupe' },
  { key: 'mauve', name: 'Mauve', cssVar: '--bb-cat-mauve' },
  { key: 'copper', name: 'Copper', cssVar: '--bb-cat-copper' },
  { key: 'graphite', name: 'Graphite', cssVar: '--bb-cat-graphite' },
] as const;

export type CategoryColorKey = (typeof CATEGORY_COLORS)[number]['key'];

const COLOR_KEYS = new Set<string>(CATEGORY_COLORS.map((color) => color.key));

export function isCategoryColorKey(
  value: string | null | undefined,
): value is CategoryColorKey {
  if (!value) return false;
  return COLOR_KEYS.has(value);
}

export function categoryColorByKey(key: CategoryColorKey) {
  const match = CATEGORY_COLORS.find((color) => color.key === key);
  if (!match) return CATEGORY_COLORS[0];
  return match;
}

/** Saved key when it is in the palette, otherwise the color for this position. */
export function resolveCategoryColorKey(
  stored: string | null | undefined,
  index: number,
) {
  if (isCategoryColorKey(stored)) return stored;
  const safeIndex = index >= 0 ? index : 0;
  return CATEGORY_COLORS[safeIndex % CATEGORY_COLORS.length].key;
}

export function resolveCategoryColor(
  stored: string | null | undefined,
  index: number,
) {
  const key = resolveCategoryColorKey(stored, index);
  return `var(${categoryColorByKey(key).cssVar})`;
}

export function defaultCategoryColorKey(index: number) {
  return resolveCategoryColorKey(null, index);
}

/** First palette color that is not already showing on a group in this month. */
export function nextCategoryColorKey(
  rows: { color: string | null | undefined }[],
) {
  const taken = new Set(
    rows.map((row, index) => resolveCategoryColorKey(row.color, index)),
  );
  const free = CATEGORY_COLORS.find((color) => !taken.has(color.key));
  if (free) return free.key;
  return defaultCategoryColorKey(rows.length);
}
