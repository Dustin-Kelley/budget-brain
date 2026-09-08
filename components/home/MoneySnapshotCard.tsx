import Link from 'next/link';
import { Icon } from '@/components/shell/Icon';
import { formatCurrency } from '@/lib/ledger/constants';
import {
  groupAccountsForSnapshot,
  type SnapshotAccount,
} from '@/lib/ledger/snapshot';

export function MoneySnapshotCard({
  accounts,
}: {
  accounts: SnapshotAccount[];
}) {
  const groups = groupAccountsForSnapshot(accounts);

  return (
    <section className='bb-card flex flex-col px-6 py-[22px]'>
      <div className='mb-1 flex items-baseline justify-between gap-3'>
        <h2 className='text-[18px] font-semibold tracking-[-0.015em]'>
          Money snapshot
        </h2>
        <Link
          href='/accounts'
          className='text-[13px]'
        >
          View accounts →
        </Link>
      </div>

      {groups.length === 0 ? (
        <div className='py-6'>
          <p className='text-[13.5px] text-[var(--bb-sub)]'>
            No accounts yet. Checking, cards, and retirement will show here
            once you add them.
          </p>
          <Link
            href='/accounts'
            className='mt-3 inline-block text-[13px]'
          >
            Add an account →
          </Link>
        </div>
      ) : (
        groups.map((group, index) => (
          <div
            key={group.key}
            className={index === groups.length - 1 ? 'bb-row bb-row-last' : 'bb-row'}
          >
            <span
              className='flex size-9 flex-none items-center justify-center rounded-full'
              style={{ background: group.tint, color: group.color }}
            >
              <Icon
                name={group.icon}
                size={18}
              />
            </span>
            <span className='min-w-0 flex-1 truncate'>
              {group.label}
              {group.count > 1 ? (
                <span className='ml-1.5 text-[12px] text-[var(--bb-dim)]'>
                  · {group.count}
                </span>
              ) : null}
            </span>
            <span
              className='font-semibold'
              style={{
                color:
                  group.balance < 0 ? 'var(--bb-mg-text)' : 'var(--bb-text)',
              }}
            >
              {formatCurrency(group.balance)}
            </span>
          </div>
        ))
      )}

      <p className='mt-3 flex items-start gap-2 text-[12px] text-[var(--bb-dim)]'>
        <Icon
          name='lock'
          size={14}
          className='mt-0.5 flex-none'
        />
        <span>
          Balances come from accounts you add here. Bank sync is coming soon.
        </span>
      </p>
    </section>
  );
}
