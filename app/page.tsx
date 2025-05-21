import { MonthlyBudgetProgress } from './components/MonthlyBudgetProgress';
import { Suspense } from 'react';
import { BudgetSummary } from './components/BudgetSummary';
import { BudgetHeader } from './components/BudgetHeader';
import { getCurrentUser } from './queries/getCurrentUser';
import { redirect } from 'next/navigation';
import { CategoryPieChart } from './components/CategoryPieChart';

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
      <Suspense fallback={<div>Loading...</div>}>
        <MonthlyBudgetProgress date={month} />
      </Suspense>

      <Suspense fallback={<div>Loading...</div>}>
        <BudgetSummary date={month} />
      </Suspense>

      <CategoryPieChart />
    </main>
  );
}
