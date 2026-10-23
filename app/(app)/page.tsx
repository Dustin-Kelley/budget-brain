import { Suspense } from 'react';
import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/app/queries/getCurrentUser';
import { getCashFlowSummary } from '@/app/queries/getCashFlowSummary';
import { getAccounts } from '@/app/queries/getAccounts';
import { getBudgetMonth } from '@/app/queries/getBudgetMonth';
import { ensureBudgetDefaults } from '@/app/mutations/ensureBudgetDefaults';
import { budgetTotals } from '@/lib/budget/math';
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
  await ensureBudgetDefaults(month);
  const [summary, { accounts }, budget] = await Promise.all([
    getCashFlowSummary(month),
    getAccounts(),
    getBudgetMonth(month),
  ]);

  const totals = budgetTotals(budget);
  const hasPlan = totals.income > 0 || totals.budgeted > 0 || budget.groups.length > 0;

  let leftover = summary.inflow - summary.lifestyleOutflow - summary.wealthMoveVolume;
  let leftoverSource: 'plan' | 'ledger' | 'empty' = 'empty';
  if (hasPlan) {
    leftover = totals.left;
    leftoverSource = 'plan';
  } else if (summary.inflow > 0) {
    leftoverSource = 'ledger';
  }

  return (
    <HomeView
      accounts={accounts}
      summary={summary}
      leftover={leftover}
      leftoverSource={leftoverSource}
      budgetInflow={totals.income > 0 ? totals.income : summary.inflow}
      budget={budget}
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
