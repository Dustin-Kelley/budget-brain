import { MonthSelector } from './MonthSelector';
import { AddExpenseForm } from './AddExpenseForm';
import { getCategories } from '../queries/getCategories';
import { BudgetRolloverButton } from './BudgetRolloverButton';

export async function BudgetHeader({ month }: { month: string | undefined }) {
  const { categories } = await getCategories({ date: month });

  return (
    <div className='flex md:flex-row gap-2 items-end justify-between'>
      <div className='flex flex-col gap-1'>
        <MonthSelector selectedMonth={month} />
      </div>

      <div className='flex flex-col md:flex-row items-end gap-2'>
        <AddExpenseForm categories={categories} />
        <BudgetRolloverButton month={month} />
      </div>
    </div>
  );
}
