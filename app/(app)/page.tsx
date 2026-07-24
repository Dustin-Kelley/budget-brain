import { Suspense } from 'react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/app/queries/getCurrentUser';
import { getCashFlowSummary } from '@/app/queries/getCashFlowSummary';
import { getAccounts } from '@/app/queries/getAccounts';
import { getLedgerTransactions } from '@/app/queries/getLedgerTransactions';
import { getNetByMonth } from '@/app/queries/getNetByMonth';
import { formatCurrency } from '@/lib/ledger/constants';
import { ALLOCATION_TARGETS } from '@/lib/ledger/targets';
import { bucketFor } from '@/lib/ledger/buckets';
import { deriveInsight } from '@/lib/ledger/insight';
import { Icon } from '@/components/shell/Icon';
import { Skeleton } from '@/components/ui/skeleton';

export default async function OverviewPage({
  searchParams,
}: {
  searchParams: Promise<{ month?: string }>;
}) {
  const { month } = await searchParams;
  const { currentUser } = await getCurrentUser();

  if (!currentUser) redirect('/welcome');

  return (
    <Suspense
      key={month ?? 'current'}
      fallback={<OverviewSkeleton />}
    >
      <OverviewBody
        month={month}
        name={currentUser.first_name}
      />
    </Suspense>
  );
}

async function OverviewBody({
  month,
  name,
}: {
  month: string | undefined;
  name: string | null;
}) {
  const [summary, { accounts }, { transactions }, netMonths] =
    await Promise.all([
      getCashFlowSummary(month),
      getAccounts(),
      getLedgerTransactions({ month, limit: 5 }),
      getNetByMonth(month),
    ]);

  const totalBalance = accounts.reduce(
    (acc, account) => acc + Number(account.current_balance ?? 0),
    0,
  );

  const insight = deriveInsight(summary);
  const spendShare =
    summary.inflow > 0
      ? Math.min((summary.lifestyleOutflow / summary.inflow) * 100, 100)
      : 0;

  const savingsShortfall = summary.savingsRate < ALLOCATION_TARGETS.savings;
  const netAverage =
    netMonths.length > 0
      ? netMonths.reduce((acc, m) => acc + m.net, 0) / netMonths.length
      : 0;
  const netMax = Math.max(...netMonths.map((m) => Math.abs(m.net)), 1);

  return (
    <div className='flex flex-col gap-[22px]'>
      <div>
        <h1 className='bb-title'>
          {greeting()}
          {name ? `, ${name}` : ''}
        </h1>
        <p className='mt-1.5 text-[14px] text-[var(--bb-sub)]'>
          {accounts.length === 0 ? (
            'Add an account to start seeing one picture of your money.'
          ) : (
            <>
              {accounts.length} account{accounts.length === 1 ? '' : 's'}, one
              picture. You are{' '}
              <strong
                style={{
                  color:
                    summary.net >= 0
                      ? 'var(--bb-cy-text)'
                      : 'var(--bb-mg-text)',
                }}
              >
                {formatCurrency(Math.abs(summary.net))}{' '}
                {summary.net >= 0 ? 'ahead' : 'down'}
              </strong>{' '}
              in {summary.periodLabel}.
            </>
          )}
        </p>
      </div>

      {/* ── Stat row ── */}
      <div className='grid gap-4 lg:grid-cols-[1.4fr_1fr_1fr]'>
        <div className='bb-card flex flex-col gap-3.5 px-6 py-[22px]'>
          <span className='bb-kicker'>Total balance</span>
          <span className='bb-display'>{formatCurrency(totalBalance)}</span>
          <div className='flex flex-wrap gap-2.5'>
            {accounts.length === 0 ? (
              <Link
                href='/accounts'
                className='text-[13px]'
              >
                Add your first account →
              </Link>
            ) : (
              accounts.slice(0, 4).map((account) => (
                <span
                  key={account.id}
                  className='flex items-center gap-2 rounded-[20px] bg-[var(--bb-surface-2)] px-3 py-1.5 text-[13px]'
                >
                  <Icon
                    name={
                      account.purpose === 'discretionary_spend'
                        ? 'wallet'
                        : 'bank'
                    }
                    size={15}
                    color={
                      account.purpose === 'discretionary_spend'
                        ? 'var(--bb-mg-text)'
                        : 'var(--bb-cy-text)'
                    }
                  />
                  {account.name}
                  <span className='font-semibold'>
                    {account.current_balance == null
                      ? '—'
                      : formatCurrency(Number(account.current_balance))}
                  </span>
                </span>
              ))
            )}
          </div>
        </div>

        <div className='bb-card flex flex-col gap-2 px-6 py-[22px]'>
          <span className='bb-kicker'>Left this month</span>
          <span className='bb-num'>{formatCurrency(summary.net)}</span>
          <span className='text-[12.5px] text-[var(--bb-sub)]'>
            of {formatCurrency(summary.inflow)} in, after lifestyle spend
          </span>
          <div className='relative mt-auto h-1.5 rounded-[3px] bg-[var(--bb-track)]'>
            <div
              className='absolute inset-y-0 left-0 rounded-[3px] bg-[var(--bb-n2)]'
              style={{ width: `${spendShare}%` }}
            />
          </div>
        </div>

        <div className='bb-card flex flex-col gap-2 px-6 py-[22px]'>
          <span className='bb-kicker'>Savings rate</span>
          <span
            className='bb-num'
            style={{
              color: savingsShortfall
                ? 'var(--bb-mg-text)'
                : 'var(--bb-cy-text)',
            }}
          >
            {summary.savingsRate.toFixed(0)}%
          </span>
          <span className='text-[12.5px] text-[var(--bb-sub)]'>
            {savingsShortfall
              ? `${Math.round(
                  ALLOCATION_TARGETS.savings - summary.savingsRate,
                )} points under your ${ALLOCATION_TARGETS.savings}% floor`
              : `At or above your ${ALLOCATION_TARGETS.savings}% floor`}
          </span>
          <Link
            href='/plan'
            className='mt-auto text-[13px]'
          >
            Adjust the plan →
          </Link>
        </div>
      </div>

      {/* ── Net trend + latest activity ── */}
      <div className='grid gap-4 lg:grid-cols-2'>
        <div className='bb-card flex flex-col gap-[18px] px-6 py-[22px]'>
          <div className='flex items-baseline justify-between gap-3'>
            <span className='bb-kicker'>
              Net kept, last {netMonths.length} months
            </span>
            <span className='text-[12.5px] text-[var(--bb-sub)]'>
              avg{' '}
              <strong className='text-[var(--bb-text)]'>
                {formatCurrency(netAverage)}
              </strong>
            </span>
          </div>
          <div className='flex h-[150px] items-end gap-3.5'>
            {netMonths.map((m) => (
              <div
                key={m.monthParam}
                className='flex h-full flex-1 flex-col items-center justify-end gap-2'
              >
                <span className='text-[11.5px] text-[var(--bb-sub)]'>
                  {compactCurrency(m.net)}
                </span>
                <div
                  className='w-full rounded-t-[4px]'
                  style={{
                    height: `${Math.max((Math.abs(m.net) / netMax) * 100, 2)}%`,
                    background: m.net >= 0 ? 'var(--bb-n3)' : 'var(--bb-w3)',
                  }}
                />
                <span className='text-[11.5px] text-[var(--bb-dim)]'>
                  {m.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className='bb-card flex flex-col px-6 py-[22px]'>
          <div className='mb-1.5 flex items-center justify-between'>
            <span className='bb-kicker'>Latest activity</span>
            <Link
              href='/transactions'
              className='text-[12.5px]'
            >
              All transactions
            </Link>
          </div>
          {transactions.length === 0 ? (
            <p className='py-6 text-[13.5px] text-[var(--bb-sub)]'>
              Nothing recorded in {summary.periodLabel} yet.{' '}
              <Link href='/accounts'>Import a file</Link> to get started.
            </p>
          ) : (
            transactions.map((txn) => {
              const category = txn.category as {
                name: string;
                group_kind: string;
              } | null;
              const amount = Number(txn.amount);
              const bucket = bucketFor({
                amount,
                groupKind: category?.group_kind,
                categoryName: category?.name,
              });
              return (
                <div
                  key={txn.id}
                  className='bb-row'
                >
                  <span
                    className='bb-dot'
                    data-bucket={bucket}
                  />
                  <span className='min-w-0 flex-1 truncate'>
                    {txn.description || 'Transaction'}
                  </span>
                  <span className='hidden text-[12.5px] text-[var(--bb-dim)] sm:inline'>
                    {category?.name ?? 'Uncategorised'}
                  </span>
                  <span
                    className='bb-amount w-[78px] text-right font-semibold'
                    data-income={amount > 0}
                  >
                    {formatCurrency(amount)}
                  </span>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* ── Insight ── */}
      {insight && (
        <div className='bb-card bb-card-accent flex flex-wrap items-center gap-4 px-6 py-5'>
          <Icon
            name={insight.icon}
            size={26}
            className='flex-none'
            color='var(--bb-cy-text)'
          />
          <div className='min-w-[220px] flex-1'>
            <div className='text-[14.5px] font-semibold'>{insight.title}</div>
            <div className='mt-0.5 text-[13px] text-[var(--bb-sub)]'>
              {insight.body}
            </div>
          </div>
          {insight.action && (
            <Link
              href={insight.action.href}
              className='bb-solid'
            >
              {insight.action.label}
            </Link>
          )}
        </div>
      )}
    </div>
  );
}

function greeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
}

/** "$1.7k" for the bar labels, matching the design's compact figures. */
function compactCurrency(value: number) {
  const sign = value < 0 ? '−' : '';
  const abs = Math.abs(value);
  if (abs >= 1000) return `${sign}$${(abs / 1000).toFixed(1)}k`;
  return `${sign}$${Math.round(abs)}`;
}

function OverviewSkeleton() {
  return (
    <div className='flex flex-col gap-[22px]'>
      <Skeleton className='h-16 w-80 rounded-2xl' />
      <div className='grid gap-4 lg:grid-cols-[1.4fr_1fr_1fr]'>
        <Skeleton className='h-[164px] rounded-2xl' />
        <Skeleton className='h-[164px] rounded-2xl' />
        <Skeleton className='h-[164px] rounded-2xl' />
      </div>
      <div className='grid gap-4 lg:grid-cols-2'>
        <Skeleton className='h-[250px] rounded-2xl' />
        <Skeleton className='h-[250px] rounded-2xl' />
      </div>
    </div>
  );
}
