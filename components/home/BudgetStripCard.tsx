import Link from 'next/link';
import { Icon } from '@/components/shell/Icon';
import { formatCurrency } from '@/lib/ledger/constants';
import { ALLOCATION_TARGETS, TARGET_META } from '@/lib/ledger/targets';
import type { IconName } from '@/components/shell/Icon';

type BucketKey = keyof typeof ALLOCATION_TARGETS;

const BUCKET_ICONS: Record<BucketKey, IconName> = {
  needs: 'house',
  wants: 'shopping-bag',
  savings: 'piggy-bank',
};

export function BudgetStripCard({
  inflow,
  needs,
  wants,
  savings,
  leftover,
  leftoverSource,
}: {
  inflow: number;
  needs: number;
  wants: number;
  savings: number;
  leftover: number;
  leftoverSource: 'plan' | 'ledger' | 'empty';
}) {
  const rows: { key: BucketKey; spent: number }[] = [
    { key: 'needs', spent: needs },
    { key: 'wants', spent: wants },
    { key: 'savings', spent: savings },
  ];

  const leftoverLabel =
    leftoverSource === 'empty'
      ? 'Add income on Plan to see what is left to assign'
      : leftover >= 0
        ? `${formatCurrency(leftover)} left to assign`
        : `${formatCurrency(Math.abs(leftover))} over assigned`;

  return (
    <section className='bb-card flex flex-col gap-4 px-6 py-[22px]'>
      <div className='flex items-start justify-between gap-3'>
        <div>
          <h2 className='text-[18px] font-semibold tracking-[-0.015em]'>
            This month&apos;s budget
          </h2>
          <p
            className='mt-0.5 text-[13px]'
            style={{
              color:
                leftover < 0 && leftoverSource !== 'empty'
                  ? 'var(--bb-mg-text)'
                  : 'var(--bb-sub)',
            }}
          >
            {leftoverLabel}
          </p>
        </div>
        <Link
          href='/plan'
          className='flex-none text-[13px]'
        >
          See full budget →
        </Link>
      </div>

      {inflow === 0 && needs === 0 && wants === 0 && savings === 0 ? (
        <p className='py-4 text-[13.5px] text-[var(--bb-sub)]'>
          Nothing to measure yet.{' '}
          <Link href='/accounts'>Import a file</Link> or{' '}
          <Link href='/plan'>set this month&apos;s plan</Link>.
        </p>
      ) : (
        <div className='flex flex-col gap-3.5'>
          {rows.map(({ key, spent }) => {
            const target =
              inflow > 0 ? (ALLOCATION_TARGETS[key] / 100) * inflow : 0;
            const percent =
              target > 0 ? Math.round((spent / target) * 100) : spent > 0 ? 100 : 0;
            const over = target > 0 && spent > target;
            const fill = Math.min(percent, 100);

            return (
              <div
                key={key}
                className='flex flex-col gap-1.5'
              >
                <div className='flex items-center gap-2.5'>
                  <span
                    className='flex size-7 flex-none items-center justify-center rounded-full'
                    style={{
                      background:
                        key === 'needs'
                          ? 'var(--bb-cy-tint)'
                          : 'var(--bb-mg-tint)',
                      color: TARGET_META[key].color,
                    }}
                  >
                    <Icon
                      name={BUCKET_ICONS[key]}
                      size={15}
                    />
                  </span>
                  <span className='min-w-0 flex-1 text-[14px] font-semibold'>
                    {TARGET_META[key].label}
                  </span>
                  <span className='text-[13px] text-[var(--bb-sub)]'>
                    {formatCurrency(spent)}
                    {target > 0 ? ` / ${formatCurrency(target)}` : ''}
                  </span>
                  <span
                    className='w-10 text-right text-[12.5px] font-semibold'
                    style={{
                      color: over ? 'var(--bb-mg-text)' : 'var(--bb-dim)',
                    }}
                  >
                    {percent}%
                  </span>
                </div>
                <div className='h-2 overflow-hidden rounded-[4px] bg-[var(--bb-track)]'>
                  <div
                    className='h-full rounded-[4px]'
                    style={{
                      width: `${fill}%`,
                      background: TARGET_META[key].color,
                    }}
                  />
                </div>
                {over && (
                  <p className='text-[12px] text-[var(--bb-mg-text)]'>
                    Over plan by {formatCurrency(spent - target)}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
