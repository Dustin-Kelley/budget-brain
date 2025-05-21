import { MonthSelector } from './MonthSelector';
import { AddExpenseForm } from './AddExpenseForm';
import { getCategories } from '../queries/getCategories';

export async function BudgetHeader({ month }: { month: string | undefined }) {
  const parsedMonth =
    month?.split('-')[0] ||
    new Date().toLocaleString('default', { month: 'long' });
  const { categories } = await getCategories({ date: month });

  return (
    <div className='flex md:flex-row gap-2 items-end justify-between'>
      <h1 className='text-3xl font-bold text-secondary tracking-tight'>
        {parsedMonth}
      </h1>

      <div className='flex flex-col md:flex-row items-end gap-2'>
        <MonthSelector selectedMonth={month} />
        <AddExpenseForm categories={categories} />
      </div>
    </div>
  );
}
