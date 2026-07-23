import { Suspense } from 'react';
import { redirect } from 'next/navigation';
import { getCurrentUser } from './queries/getCurrentUser';
import { getCashFlowSummary } from './queries/getCashFlowSummary';
import { getAccounts } from './queries/getAccounts';
import { getLedgerTransactions } from './queries/getLedgerTransactions';
import { MonthSelector } from './components/MonthSelector';
import { CashFlowCard } from './components/overview/CashFlowCard';
import { FixedVsDiscretionaryCard } from './components/overview/FixedVsDiscretionaryCard';
import { AllocationCard } from './components/overview/AllocationCard';
import { AccountsStrip } from './components/overview/AccountsStrip';
import { RecentActivityCard } from './components/overview/RecentActivityCard';
import { Skeleton } from '@/components/ui/skeleton';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ month?: string }>;
}) {
  const { month } = await searchParams;
  const { currentUser } = await getCurrentUser();

  if (!currentUser) {
    redirect('/welcome');
  }

  return (
    <main className='flex flex-col gap-4'>
      <div className='flex flex-col items-center gap-3 sm:flex-row sm:justify-between'>
        <div>
          <h1 className='text-2xl font-bold tracking-tight'>Overview</h1>
          <p className='text-sm text-muted-foreground'>
            Lifestyle cash flow and allocation across your accounts
          </p>
        </div>
        <div className='flex flex-wrap items-center justify-center gap-2'>
          <MonthSelector selectedMonth={month} />
          <Button
            asChild
            variant='outline'
          >
            <Link href='/accounts'>Import</Link>
          </Button>
        </div>
      </div>

      <Suspense fallback={<Skeleton className='h-[160px] rounded-3xl' />}>
        <OverviewBody month={month} />
      </Suspense>
    </main>
  );
}

async function OverviewBody({ month }: { month: string | undefined }) {
  const [summary, { accounts }, { transactions }] = await Promise.all([
    getCashFlowSummary(month),
    getAccounts(),
    getLedgerTransactions({ month, limit: 8 }),
  ]);

  return (
    <div className='flex flex-col gap-4'>
      <CashFlowCard summary={summary} />
      <FixedVsDiscretionaryCard summary={summary} />
      <AllocationCard
        allocation={summary.allocation}
        lifestyleOutflow={summary.lifestyleOutflow}
      />
      <AccountsStrip accounts={accounts} />
      <RecentActivityCard
        transactions={transactions.map((txn) => ({
          id: txn.id,
          posted_at: txn.posted_at,
          amount: Number(txn.amount),
          description: txn.description,
          account: txn.account as { name: string } | null,
          category: txn.category as { name: string } | null,
        }))}
      />
    </div>
  );
}
