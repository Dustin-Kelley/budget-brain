/**
 * The 50 / 30 / 20 split the Allocation and Plan screens measure against.
 *
 * These are constants, not user data. Storing per-household targets needs a
 * migration and a Settings editor — see docs/DESIGN_REFRESH_PLAN.md §5.
 */
export const ALLOCATION_TARGETS = {
  needs: 50,
  wants: 30,
  savings: 20,
} as const;

export type TargetKey = keyof typeof ALLOCATION_TARGETS;

export const TARGET_META: Record<
  TargetKey,
  { label: string; blurb: string; color: string }
> = {
  needs: {
    label: 'Needs',
    blurb: 'Housing · utilities · insurance · subscriptions',
    color: 'var(--bb-n2)',
  },
  wants: {
    label: 'Wants',
    blurb: 'Groceries · dining · transport · shopping',
    color: 'var(--bb-w2)',
  },
  savings: {
    label: 'Savings',
    blurb: 'Moved to emergency and investment accounts',
    color: 'var(--bb-w1)',
  },
};

/** How a share reads against its target, in the design's language. */
export function targetVerdict(
  actualPercent: number,
  targetPercent: number,
  key: TargetKey,
): { text: string; tone: 'good' | 'warn' } {
  const delta = Math.round(actualPercent - targetPercent);

  if (delta === 0) return { text: 'On target', tone: 'good' };

  // Under-spending on needs/wants is good; under-saving is not.
  if (delta < 0) {
    return key === 'savings'
      ? { text: `${Math.abs(delta)} pts under · below your goal`, tone: 'warn' }
      : { text: `${Math.abs(delta)} pts under · on track`, tone: 'good' };
  }

  return key === 'savings'
    ? { text: `${delta} pts over · ahead of your goal`, tone: 'good' }
    : { text: `${delta} pts over · above plan`, tone: 'warn' };
}
