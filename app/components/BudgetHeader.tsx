import React from 'react';
import { MonthSelector } from './MonthSelector';
import { AddExpenseForm } from './AddExpenseForm';
import { getCategories } from '../queries/getCategories';

export async function BudgetHeader({ month }: { month: string | undefined }) {
  const parsedMonth = month?.split('-')[0] || new Date().toLocaleString('default', { month: 'long' });

  const { categories } = await getCategories({ date: month });

  return (
    <div className='flex flex-col md:flex-row gap-2 justify-between'>
      <div>
        <h1 className='text-3xl font-bold text-primary tracking-tight'>
          {parsedMonth}
        </h1>
        <p className='text-muted-foreground'>Budget Overview</p>
      </div>
      <div className='flex items-center gap-2'>
        <MonthSelector selectedMonth={month} />
        <AddExpenseForm categories={categories} />
      </div>
    </div>
  );
}
