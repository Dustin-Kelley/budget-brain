import { MonthlyBudgetProgress } from './components/MonthlyBudgetProgress';
import { Suspense } from 'react';
import { BudgetSummary } from './components/BudgetSummary';
import { BudgetHeader } from './components/BudgetHeader';

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ month?: string }>;
}) {
  const { month } = await searchParams;
  const parsedMonth =
    month?.split('-')[0] ||
    new Date().toLocaleString('default', { month: 'long' });

  return (
    <main className='flex flex-col gap-4'>
      <BudgetHeader month={parsedMonth} />

      <Suspense fallback={<div>Loading...</div>}>
        <MonthlyBudgetProgress />
      </Suspense>

      <Suspense fallback={<div>Loading...</div>}>
        <BudgetSummary />
      </Suspense>

      <div>pie chart breakdown</div>
    </main>
  );
}
