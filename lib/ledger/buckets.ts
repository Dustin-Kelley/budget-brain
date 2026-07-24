/**
 * Buckets are the design's vocabulary for the ledger: every transaction reads
 * as needs, wants, savings, income, or not yet sorted. They derive from the
 * category's `group_kind` plus the sign of the amount — no new storage.
 */
export type Bucket =
  | 'needs'
  | 'wants'
  | 'savings'
  | 'income'
  | 'uncategorized';

export const BUCKET_LABELS: Record<Bucket, string> = {
  needs: 'Needs',
  wants: 'Wants',
  savings: 'Savings',
  income: 'Income',
  uncategorized: 'Uncategorised',
};

export function bucketFor({
  amount,
  groupKind,
  categoryName,
}: {
  amount: number;
  groupKind: string | null | undefined;
  categoryName: string | null | undefined;
}): Bucket {
  if (categoryName === 'Income' || (amount > 0 && !groupKind)) return 'income';
  if (groupKind === 'fixed') return 'needs';
  if (groupKind === 'variable') return 'wants';
  if (groupKind === 'system') {
    return categoryName === 'Income' ? 'income' : 'savings';
  }
  return 'uncategorized';
}

/**
 * Slice colours for the allocation donut and category list. Needs walk down
 * the cyan ramp, wants down the magenta ramp — the design's two-family scheme,
 * so the chart reads as "how much of this is necessity" at a glance.
 */
const NEEDS_RAMP = [
  'var(--bb-n1)',
  'var(--bb-n2)',
  'var(--bb-n3)',
  'var(--bb-n4)',
  'var(--bb-n5)',
  'var(--bb-n6)',
];

const WANTS_RAMP = [
  'var(--bb-w1)',
  'var(--bb-w2)',
  'var(--bb-w3)',
  'var(--bb-w4)',
  'var(--bb-w5)',
];

export function rampColor(bucket: Bucket, indexWithinBucket: number): string {
  const ramp = bucket === 'needs' ? NEEDS_RAMP : WANTS_RAMP;
  return ramp[Math.min(indexWithinBucket, ramp.length - 1)];
}
