import { MonthlyBudgetProgress } from "./components/MonthlyBudgetProgress";
import { Suspense } from "react";
import { BudgetSummary } from "./components/BudgetSummary";
import { AddExpenseForm } from "./components/AddExpenseForm";
import { MonthSelector } from "./components/MonthSelector";

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ month?: string }>;
}) {
  const { month } = await searchParams;
  const parsedMonth = month?.split('-')[0] || new Date().toLocaleString('default', { month: 'long' });

  return (
    <main className="flex flex-col gap-4">
        <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-3xl font-bold text-primary tracking-tight'>
            {parsedMonth}
          </h1>
          <p className='text-muted-foreground'>Budget Overview</p>
        </div>
        <div className='flex items-center gap-2'>
          <MonthSelector selectedMonth={month} />
          <AddExpenseForm />
        </div>
      </div>

      <Suspense fallback={<div>Loading...</div>}>
        <MonthlyBudgetProgress />
      </Suspense>

      <Suspense fallback={<div>Loading...</div>}>
        <BudgetSummary />
      </Suspense>

      <div>
        pie chart breakdown
      </div>
   
    </main>
  );
}
