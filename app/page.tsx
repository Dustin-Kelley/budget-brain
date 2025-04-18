import { MonthlyBudgetProgress } from './components/MonthlyBudgetProgress';
import { Suspense } from 'react';
import { BudgetSummary } from './components/BudgetSummary';
import { BudgetHeader } from './components/BudgetHeader';
import { getData } from './queries/getData';

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ month?: string }>;
}) {
  const { month } = await searchParams;
 
  const data = await getData()
  console.log("🚀 ~ data:", data)

  return (
    <main className='flex flex-col gap-4'>
      <BudgetHeader month={month} />
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
