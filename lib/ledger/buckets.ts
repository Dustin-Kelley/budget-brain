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

/** Grayscale slices. Green and red are reserved for under and over budget. */
const NEEDS_RAMP = [
  'var(--bb-g1)',
  'var(--bb-g2)',
  'var(--bb-g3)',
  'var(--bb-g4)',
  'var(--bb-g5)',
  'var(--bb-g6)',
];

const WANTS_RAMP = [
  'var(--bb-g2)',
  'var(--bb-g3)',
  'var(--bb-g4)',
  'var(--bb-g5)',
  'var(--bb-g6)',
];

export function rampColor(bucket: Bucket, indexWithinBucket: number): string {
  const ramp = bucket === 'needs' ? NEEDS_RAMP : WANTS_RAMP;
  return ramp[Math.min(indexWithinBucket, ramp.length - 1)];
}
