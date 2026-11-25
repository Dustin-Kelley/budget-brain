/**
 * Category identity colors. Stored on `categories.color` as a key, never a hex.
 *
 * Harbor is a cool set (blues, teal, violet) with a few warm anchors so a
 * donut is still readable when many groups are on screen. Light and dark
 * hexes live in `app/globals.css` as `--bb-cat-*` so a chart can use
 * `var(--bb-cat-cobalt)` and follow the theme.
 *
 * Status green and status red are not in this set. Over and under budget stay
 * on the money text. These colors are dots, chips, and chart slices.
 *
 * Order is the default sequence: a group with no saved color uses its place
 * in the month (created first gets Cobalt). The first colors are the ones
 * furthest apart.
 */

export const CATEGORY_COLORS = [
  { key: 'cobalt', name: 'Cobalt', cssVar: '--bb-cat-cobalt' },
  { key: 'honey', name: 'Honey', cssVar: '--bb-cat-honey' },
  { key: 'violet', name: 'Violet', cssVar: '--bb-cat-violet' },
  { key: 'cyan', name: 'Cyan', cssVar: '--bb-cat-cyan' },
  { key: 'orchid', name: 'Orchid', cssVar: '--bb-cat-orchid' },
  { key: 'wine', name: 'Wine', cssVar: '--bb-cat-wine' },
  { key: 'slate', name: 'Slate', cssVar: '--bb-cat-slate' },
  { key: 'plum', name: 'Plum', cssVar: '--bb-cat-plum' },
  { key: 'navy', name: 'Navy', cssVar: '--bb-cat-navy' },
  { key: 'sky', name: 'Sky', cssVar: '--bb-cat-sky' },
  { key: 'indigo', name: 'Indigo', cssVar: '--bb-cat-indigo' },
  { key: 'clay', name: 'Clay', cssVar: '--bb-cat-clay' },
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
