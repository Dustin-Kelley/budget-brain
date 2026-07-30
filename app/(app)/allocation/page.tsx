import { Suspense } from 'react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/app/queries/getCurrentUser';
import { getCashFlowSummary } from '@/app/queries/getCashFlowSummary';
import { formatCurrency } from '@/lib/ledger/constants';
import { ALLOCATION_TARGETS, TARGET_META } from '@/lib/ledger/targets';
import { rampColor, type Bucket } from '@/lib/ledger/buckets';
import { Donut } from '@/components/bb/Donut';
import { TargetBar } from '@/components/bb/TargetBar';
import { Skeleton } from '@/components/ui/skeleton';

export default async function AllocationPage({
  searchParams,
}: {
  searchParams: Promise<{ month?: string }>;
}) {
  const { month } = await searchParams;
  const { currentUser } = await getCurrentUser();

  if (!currentUser) redirect('/welcome');

  return (
    <div className='flex flex-col gap-5'>
      <div>
        <h1 className='bb-title'>Allocation</h1>
        <p className='mt-1.5 text-[14px] text-[var(--bb-sub)]'>
          Where your money went · measured against {ALLOCATION_TARGETS.needs} /{' '}
          {ALLOCATION_TARGETS.wants} / {ALLOCATION_TARGETS.savings}
        </p>
      </div>

      <Suspense
        key={month ?? 'current'}
        fallback={<Skeleton className='h-[520px] rounded-2xl' />}
      >
        <AllocationBody month={month} />
      </Suspense>
    </div>
  );
}

async function AllocationBody({ month }: { month: string | undefined }) {
  const summary = await getCashFlowSummary(month);

  // Needs walk down the cyan ramp, wants down the magenta ramp — so the donut
  // reads as "how much of this was necessity" before you read any label.
  let needsSeen = 0;
  let wantsSeen = 0;
  const slices = summary.allocation.map((slice) => {
    const bucket: Bucket = slice.groupKind === 'fixed' ? 'needs' : 'wants';
    const index = bucket === 'needs' ? needsSeen++ : wantsSeen++;
    return { ...slice, bucket, color: rampColor(bucket, index) };
  });

  const ordered = [...slices].sort((a, b) =>
    a.bucket === b.bucket ? b.amount - a.amount : a.bucket === 'needs' ? -1 : 1,
  );

  const needsShare =
    summary.lifestyleOutflow > 0
      ? (summary.fixedOutflow / summary.lifestyleOutflow) * 100
      : 0;

  // Shares for the 50/30/20 comparison are against income — that is what the
  // rule of thumb is defined on, not against spend.
  const base = summary.inflow > 0 ? summary.inflow : summary.lifestyleOutflow;
  const share = (value: number) => (base > 0 ? (value / base) * 100 : 0);

  const rows = [
    {
      key: 'needs' as const,
      amount: summary.fixedOutflow,
    },
    {
      key: 'wants' as const,
      amount: summary.discretionaryOutflow,
    },
    {
      key: 'savings' as const,
      amount: summary.wealthMoveVolume,
    },
  ];

  if (summary.lifestyleOutflow === 0 && summary.inflow === 0) {
    return (
      <div className='bb-card px-6 py-10 text-center'>
        <p className='text-[14px] text-[var(--bb-sub)]'>
          Nothing recorded for {summary.periodLabel}.{' '}
          <Link href='/accounts'>Import a file</Link> to see where money goes.
        </p>
      </div>
    );
  }

  return (
    <div className='flex flex-col gap-5'>
      {/* ── Summary strip ── */}
      <div className='bb-card flex flex-wrap gap-x-[26px] gap-y-4 px-6 py-5'>
        <div className='flex flex-col'>
          <span className='bb-kicker'>Income in</span>
          <span className='bb-num'>{formatCurrency(summary.inflow)}</span>
        </div>
        <div className='w-px bg-[var(--bb-line)]' />
        <div className='flex flex-col'>
          <span className='bb-kicker'>Lifestyle out</span>
          <span className='bb-num'>
            {formatCurrency(summary.lifestyleOutflow)}
          </span>
        </div>
        <div className='w-px bg-[var(--bb-line)]' />
        <div className='flex flex-col'>
          <span className='bb-kicker'>Net this month</span>
          <span
            className='bb-num'
            style={{
              color:
                summary.net >= 0 ? 'var(--bb-cy-text)' : 'var(--bb-mg-text)',
            }}
          >
            {summary.net >= 0 ? '+' : '−'}
            {formatCurrency(Math.abs(summary.net))}
          </span>
        </div>
        {summary.uncategorizedOutflow > 0 && (
          <div className='max-w-[240px] self-center text-[12.5px] text-[var(--bb-sub)] md:ml-auto md:text-right'>
            {formatCurrency(summary.uncategorizedOutflow)} is still
            uncategorised —{' '}
            <Link href='/transactions?bucket=uncategorized'>sort it out</Link>{' '}
            to sharpen this split.
          </div>
        )}
      </div>

      {/* ── Donut + targets ── */}
      <div className='grid gap-5 lg:grid-cols-[330px_1fr]'>
        <div className='bb-card flex flex-col items-center p-[22px]'>
          <span className='bb-kicker mb-2.5 self-start'>By category</span>
          <Donut
            slices={ordered.map((s) => ({
              name: s.name,
              amount: s.amount,
              color: s.color,
            }))}
            total={formatCurrency(summary.lifestyleOutflow)}
            caption={
              summary.lifestyleOutflow > 0
                ? `${needsShare.toFixed(0)}% needs · ${(
                    100 - needsShare
                  ).toFixed(0)}% wants`
                : undefined
            }
          />
          <div className='mt-3.5 flex gap-4 text-[12.5px] text-[var(--bb-sub)]'>
            <span className='flex items-center gap-1.5'>
              <span className='size-[9px] rounded-[2px] bg-[var(--bb-n2)]' />
              Needs
            </span>
            <span className='flex items-center gap-1.5'>
              <span className='size-[9px] rounded-[2px] bg-[var(--bb-w2)]' />
              Wants
            </span>
          </div>
        </div>

        <div className='bb-card flex flex-col gap-4 px-6 py-[22px]'>
          <span className='bb-kicker'>
            Against your {ALLOCATION_TARGETS.needs} / {ALLOCATION_TARGETS.wants}{' '}
            / {ALLOCATION_TARGETS.savings}
          </span>
          {rows.map((row) => (
            <TargetBar
              key={row.key}
              bucket={row.key}
              label={TARGET_META[row.key].label}
              blurb={TARGET_META[row.key].blurb}
              color={TARGET_META[row.key].color}
              amount={formatCurrency(row.amount)}
              actualPercent={share(row.amount)}
              targetPercent={ALLOCATION_TARGETS[row.key]}
            />
          ))}
          <p className='text-[12px] text-[var(--bb-dim)]'>
            Shares are of {formatCurrency(base)}{' '}
            {summary.inflow > 0 ? 'income' : 'lifestyle spend'} this period.
            Targets are the standard split — per-household targets are not
            editable yet.
          </p>
        </div>
      </div>

      {/* ── Every category ── */}
      {ordered.length > 0 && (
        <div className='bb-card px-6 py-[18px]'>
          <span className='bb-kicker'>Every category</span>
          <div className='mt-1.5 grid gap-x-[34px] md:grid-cols-2'>
            {ordered.map((slice) => (
              <div
                key={slice.categoryId ?? slice.name}
                className='flex items-center gap-2.5 border-b border-[var(--bb-line-2)] py-2'
              >
                <span
                  className='size-[9px] flex-none rounded-full'
                  style={{ background: slice.color }}
                />
                <span className='min-w-0 flex-1 truncate text-[13.5px]'>
                  {slice.name}
                </span>
                <span className='w-11 text-right text-[12px] text-[var(--bb-dim)]'>
                  {slice.percent.toFixed(1)}%
                </span>
                <span className='w-[70px] text-right text-[13.5px] font-semibold'>
                  {formatCurrency(slice.amount)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
