import type { IconName } from '@/components/shell/Icon';

export type SnapshotAccount = {
  name?: string | null;
  account_type: string;
  purpose: string;
  current_balance: number | null;
};

export type SnapshotGroup = {
  key: 'checking' | 'credit' | 'savings' | 'investment' | 'other';
  label: string;
  icon: IconName;
  color: string;
  tint: string;
  balance: number;
  count: number;
};

const GROUP_META: Record<
  SnapshotGroup['key'],
  Pick<SnapshotGroup, 'label' | 'icon' | 'color' | 'tint'>
> = {
  checking: {
    label: 'Checking',
    icon: 'bank',
    color: 'var(--bb-cy-text)',
    tint: 'var(--bb-cy-tint)',
  },
  credit: {
    label: 'Credit cards',
    icon: 'credit-card',
    color: 'var(--bb-mg-text)',
    tint: 'var(--bb-mg-tint)',
  },
  savings: {
    label: 'Savings',
    icon: 'piggy-bank',
    color: 'var(--bb-n1)',
    tint: 'var(--bb-cy-tint)',
  },
  investment: {
    label: 'Investments',
    icon: 'chart-bar',
    color: 'var(--bb-w1)',
    tint: 'var(--bb-mg-tint)',
  },
  other: {
    label: 'Other',
    icon: 'wallet',
    color: 'var(--bb-sub)',
    tint: 'var(--bb-surface-2)',
  },
};

function groupKeyFor(account: SnapshotAccount): SnapshotGroup['key'] {
  const type = account.account_type;
  const purpose = account.purpose;

  if (type === 'credit') return 'credit';
  if (type === 'investment' || purpose === 'investment') return 'investment';
  if (type === 'savings' || purpose === 'emergency') return 'savings';
  if (type === 'checking') return 'checking';
  return 'other';
}

/**
 * Credit balances are often entered as what is owed (positive). The snapshot
 * shows that as a negative figure so the card reads like the mock.
 */
export function displayBalance(account: SnapshotAccount): number {
  const raw = Number(account.current_balance ?? 0);
  if (account.account_type === 'credit' && raw > 0) return -raw;
  return raw;
}

export function groupAccountsForSnapshot(
  accounts: SnapshotAccount[],
): SnapshotGroup[] {
  const totals = new Map<SnapshotGroup['key'], { balance: number; count: number }>();

  for (const account of accounts) {
    const key = groupKeyFor(account);
    const existing = totals.get(key) ?? { balance: 0, count: 0 };
    existing.balance += displayBalance(account);
    existing.count += 1;
    totals.set(key, existing);
  }

  const order: SnapshotGroup['key'][] = [
    'checking',
    'credit',
    'savings',
    'investment',
    'other',
  ];

  return order
    .filter((key) => (totals.get(key)?.count ?? 0) > 0)
    .map((key) => {
      const { balance, count } = totals.get(key)!;
      const meta = GROUP_META[key];
      const looksLike401k =
        key === 'investment' &&
        accounts.some(
          (account) =>
            groupKeyFor(account) === 'investment' &&
            /401/.test(account.name ?? ''),
        );

      return {
        key,
        ...meta,
        label: looksLike401k ? '401k' : meta.label,
        balance,
        count,
      };
    });
}
