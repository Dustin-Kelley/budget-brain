import { MonthlyBudgetProgress } from './components/MonthlyBudgetProgress';
import { Suspense } from 'react';
import { BudgetSummary } from './components/BudgetSummary';
import { BudgetHeader } from './components/BudgetHeader';
import { getCurrentUser } from './queries/getCurrentUser';
import { redirect } from 'next/navigation';
import { Charts } from './components/Charts';
import { Skeleton } from '@/components/ui/skeleton';
import { getCategories } from './queries/getCategories';
import { RolloverBudgetState } from './components/RolloverBudgetState';

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

  const { categories } = await getCategories({ date: month });

  if (!categories || categories.length === 0) {
    return (
      <main className='flex flex-col gap-4'>
        <BudgetHeader month={month} />

        <RolloverBudgetState month={month} />
      </main>
    );
  }

  return (
    <main className='flex flex-col gap-4'>
      <BudgetHeader month={month} />

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
