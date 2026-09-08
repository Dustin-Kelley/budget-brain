import { Suspense } from 'react';
import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/app/queries/getCurrentUser';
import { getCashFlowSummary } from '@/app/queries/getCashFlowSummary';
import { getAccounts } from '@/app/queries/getAccounts';
import { getTotalIncomePerMonth } from '@/app/queries/getTotalIncome';
import { getTotalPlannedAmount } from '@/app/queries/getTotalPlannedAmount';
import { Skeleton } from '@/components/ui/skeleton';
import { HomeView } from '@/components/home/HomeView';

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

  return (
    <HomeView
      accounts={accounts}
      summary={summary}
      leftover={leftover}
      leftoverSource={leftoverSource}
      budgetInflow={planIncome > 0 ? planIncome : summary.inflow}
    />
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
