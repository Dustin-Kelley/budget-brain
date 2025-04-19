import { MonthlyBudgetProgress } from './components/MonthlyBudgetProgress';
import { Suspense } from 'react';
import { BudgetSummary } from './components/BudgetSummary';
import { BudgetHeader } from './components/BudgetHeader';
import { getCurrentUser } from './queries/getCurrentUser';
import { redirect } from 'next/navigation';

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ month?: string }>;
}) {
  const { month } = await searchParams;
  console.log("🚀 ~ month:", month)

  const { currentUser } = await getCurrentUser();

  if (!currentUser) {
    redirect('/login');
  }

  return (
    <main className='flex flex-col gap-4'>
      <BudgetHeader month={month} />
      <Suspense fallback={<div>Loading...</div>}>
        <MonthlyBudgetProgress date={month} />
      </Suspense>

      <Suspense fallback={<div>Loading...</div>}>
        <BudgetSummary date={month} />
      </Suspense>

      <div>pie chart breakdown</div>
    </main>
  );
}
