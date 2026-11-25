/**
 * Category identity colors. Stored on `categories.color` as a key, never a hex.
 *
 * A warm, varied set: gold, purple, sage, berry, terracotta, magenta, sand,
 * rose, gray, and one muted blue near the end. Light and dark hexes live in
 * `app/globals.css` as `--bb-cat-*`.
 *
 * Status green and status red are not in this set. Over and under budget stay
 * on the money text (and the over-budget bar). These colors are dots, chips,
 * and chart slices.
 *
 * Order is the default sequence. A group with no saved color uses its place
 * in the month. The first group gets Honey, not a blue.
 */

export const CATEGORY_COLORS = [
  { key: 'honey', name: 'Honey', cssVar: '--bb-cat-honey' },
  { key: 'violet', name: 'Violet', cssVar: '--bb-cat-violet' },
  { key: 'sage', name: 'Sage', cssVar: '--bb-cat-sage' },
  { key: 'wine', name: 'Wine', cssVar: '--bb-cat-wine' },
  { key: 'clay', name: 'Clay', cssVar: '--bb-cat-clay' },
  { key: 'plum', name: 'Plum', cssVar: '--bb-cat-plum' },
  { key: 'sand', name: 'Sand', cssVar: '--bb-cat-sand' },
  { key: 'rose', name: 'Rose', cssVar: '--bb-cat-rose' },
  { key: 'slate', name: 'Slate', cssVar: '--bb-cat-slate' },
  { key: 'berry', name: 'Berry', cssVar: '--bb-cat-berry' },
  { key: 'dusk', name: 'Dusk', cssVar: '--bb-cat-dusk' },
  { key: 'ash', name: 'Ash', cssVar: '--bb-cat-ash' },
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
