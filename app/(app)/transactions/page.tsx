import { Suspense } from 'react';
import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/app/queries/getCurrentUser';
import { Skeleton } from '@/components/ui/skeleton';
import { getBudgetMonth } from '@/app/queries/getBudgetMonth';
import { ensureBudgetDefaults } from '@/app/mutations/ensureBudgetDefaults';
import { unassignedCount } from '@/lib/budget/math';
import { BudgetTransactionList } from './components/BudgetTransactionList';

type Params = {
  month?: string;
  account?: string;
  track?: string;
};

export default async function TransactionsPage({
  searchParams,
}: {
  searchParams: Promise<Params>;
}) {
  const params = await searchParams;
  const { currentUser } = await getCurrentUser();

  if (!currentUser) redirect('/welcome');

  return (
    <div className='flex flex-col gap-[18px] pb-20'>
      <Suspense
        key={`${params.month ?? ''}:${params.track ?? ''}:${params.account ?? ''}`}
        fallback={<Skeleton className='h-[600px] rounded-2xl' />}
      >
        <BudgetTransactions
          month={params.month}
          track={params.track}
          accountId={params.account}
        />
      </Suspense>
    </div>
  );
}

async function BudgetTransactions({
  month,
  track,
  accountId,
}: {
  month: string | undefined;
  track: string | undefined;
  accountId: string | undefined;
}) {
  await ensureBudgetDefaults(month);
  const budget = await getBudgetMonth(month);
  const accountFilter = budget.accountsLinked ? accountId : undefined;
  const scoped = budget.transactions.filter((txn) => {
    if (!accountFilter) return true;
    return txn.accountId === accountFilter;
  });
  const openCount = unassignedCount(scoped);
  const rows = scoped.filter((txn) => {
    if (track === 'open' && txn.lineItemId) return false;
    return true;
  });

  return (
    <BudgetTransactionList
      rows={rows}
      groups={budget.groups}
      accounts={budget.accounts}
      accountsLinked={budget.accountsLinked}
      monthParam={budget.monthParam}
      track={track}
      accountId={accountFilter}
      unassigned={openCount}
    />
  );
}
