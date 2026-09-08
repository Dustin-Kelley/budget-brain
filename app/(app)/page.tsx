import { Suspense } from 'react';
import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/app/queries/getCurrentUser';
import { getCashFlowSummary } from '@/app/queries/getCashFlowSummary';
import { getAccounts } from '@/app/queries/getAccounts';
import { getTotalIncomePerMonth } from '@/app/queries/getTotalIncome';
import { getTotalPlannedAmount } from '@/app/queries/getTotalPlannedAmount';
import { deriveInsight } from '@/lib/ledger/insight';
import { Icon } from '@/components/shell/Icon';
import { Skeleton } from '@/components/ui/skeleton';
import { FooPathCard } from '@/components/home/FooPathCard';
import { NextUpCard } from '@/components/home/NextUpCard';
import { MoneySnapshotCard } from '@/components/home/MoneySnapshotCard';
import { BudgetStripCard } from '@/components/home/BudgetStripCard';
import { FooUnlockBanner } from '@/components/home/FooUnlockBanner';
import Link from 'next/link';

export default async function HomePage({
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
      fallback={<HomeSkeleton />}
    >
      <HomeBody month={month} />
    </Suspense>
  );
}

async function HomeBody({ month }: { month: string | undefined }) {
  const [summary, { accounts }, income, planned] = await Promise.all([
    getCashFlowSummary(month),
    getAccounts(),
    getTotalIncomePerMonth({ date: month }),
    getTotalPlannedAmount({ date: month }),
  ]);

  const planIncome = income.totalIncome ?? 0;
  const planAssigned = planned.totalPlanned ?? 0;
  const hasPlan = planIncome > 0 || planAssigned > 0;

  const leftover = hasPlan
    ? planIncome - planAssigned
    : summary.inflow - summary.lifestyleOutflow - summary.wealthMoveVolume;
  const leftoverSource = hasPlan
    ? 'plan'
    : summary.inflow > 0
      ? 'ledger'
      : 'empty';

  const budgetInflow = planIncome > 0 ? planIncome : summary.inflow;
  const insight = deriveInsight(summary);
  const showInsight =
    insight &&
    (summary.uncategorizedCount > 0 ||
      summary.net < 0 ||
      (summary.inflow === 0 && summary.lifestyleOutflow === 0));

  return (
    <div className='flex flex-col gap-[18px]'>
      <FooPathCard />
      <NextUpCard />

      <div className='grid gap-4 lg:grid-cols-2'>
        <MoneySnapshotCard accounts={accounts} />
        <BudgetStripCard
          inflow={budgetInflow}
          needs={summary.fixedOutflow}
          wants={summary.discretionaryOutflow}
          savings={summary.wealthMoveVolume}
          leftover={leftover}
          leftoverSource={leftoverSource}
        />
      </div>

      {showInsight && insight && (
        <div className='bb-card flex flex-wrap items-center gap-4 px-6 py-5'>
          <Icon
            name={insight.icon}
            size={22}
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

      <FooUnlockBanner />
    </div>
  );
}

function HomeSkeleton() {
  return (
    <div className='flex flex-col gap-[18px]'>
      <Skeleton className='h-[180px] rounded-2xl' />
      <Skeleton className='h-[96px] rounded-2xl' />
      <div className='grid gap-4 lg:grid-cols-2'>
        <Skeleton className='h-[260px] rounded-2xl' />
        <Skeleton className='h-[260px] rounded-2xl' />
      </div>
      <Skeleton className='h-14 rounded-2xl' />
    </div>
  );
}
