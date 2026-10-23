import { Suspense } from 'react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/app/queries/getCurrentUser';
import { getBudgetMonth } from '@/app/queries/getBudgetMonth';
import { ensureBudgetDefaults } from '@/app/mutations/ensureBudgetDefaults';
import { withMonth } from '@/lib/budget/month';
import { Icon } from '@/components/shell/Icon';
import { Skeleton } from '@/components/ui/skeleton';
import { BudgetScreen } from './components/BudgetScreen';

export default async function PlanPage({
  searchParams,
}: {
  searchParams: Promise<{ month?: string }>;
}) {
  const { month } = await searchParams;
  const { currentUser } = await getCurrentUser();

  if (!currentUser) redirect('/welcome');

  return (
    <div className='flex flex-col gap-5'>
      <Suspense
        key={month ?? 'current'}
        fallback={<Skeleton className='h-[640px] rounded-2xl' />}
      >
        <BudgetBody month={month} />
      </Suspense>
    </div>
  );
}

async function BudgetBody({ month }: { month: string | undefined }) {
  await ensureBudgetDefaults(month);
  const budget = await getBudgetMonth(month);

  return (
    <>
      <div className='flex flex-wrap items-end justify-between gap-3'>
        <div>
          <h1 className='bb-title'>Budget</h1>
          <p className='mt-1.5 text-[14px] text-[var(--bb-sub)]'>
            Give every dollar of {budget.monthLabel} a job, then track what
            you spend.
          </p>
        </div>
        <Link
          href={withMonth('/transactions', budget.monthParam)}
          className='bb-ghost'
        >
          <Icon
            name='arrows-left-right'
            size={15}
          />
          Transactions
        </Link>
      </div>
      <BudgetScreen budget={budget} />
    </>
  );
}
