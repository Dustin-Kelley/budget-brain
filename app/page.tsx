import { MonthlyBudgetProgress } from './components/MonthlyBudgetProgress';
import { Suspense } from 'react';
import { BudgetSummary } from './components/BudgetSummary';
import { BudgetHeader } from './components/BudgetHeader';
import { getCurrentUser } from './queries/getCurrentUser';
import { redirect } from 'next/navigation';
import { Charts } from './components/Charts';
import { Skeleton } from '@/components/ui/skeleton';

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ month?: string }>;
}) {
  const { month } = await searchParams;

  const { currentUser } = await getCurrentUser();

  if (!currentUser) {
    redirect('/login');
  }

  return (
    <main className='flex flex-col gap-4'>
      <div className='flex flex-col'>
        <BudgetHeader month={month} />
        <p className='text-muted-foreground'>Budget Overview</p>
      </div>

    
      <Suspense fallback={<Skeleton className='h-[140px]' />}>
        <BudgetSummary date={month} />
      </Suspense>

      <Suspense fallback={<Skeleton className='h-[140px]' />}>
        <MonthlyBudgetProgress date={month} />
      </Suspense>


      <Suspense fallback={<Skeleton className='h-[140px]' />}>
        <Charts date={month} />
      </Suspense>
    </main>
  );
}
