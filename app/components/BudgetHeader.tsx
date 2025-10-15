import { MonthSelector } from './MonthSelector';
import { AddExpenseForm } from './AddExpenseForm';
import { getCategories } from '../queries/getCategories';

export async function BudgetHeader({ month }: { month: string | undefined }) {
  const { categories } = await getCategories({ date: month });

  return (
    <div className='flex flex-col items-center gap-2 '>
      <MonthSelector selectedMonth={month} />

      <div className='flex flex-col gap-2'>
        <AddExpenseForm categories={categories} />
      </div>
    </div>
  );
}
