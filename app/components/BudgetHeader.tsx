import { MonthSelector } from './MonthSelector';
import { AddExpenseForm } from './AddExpenseForm';
import { getCategories } from '../queries/getCategories';
import { BudgetRolloverButton } from './BudgetRolloverButton';

export async function BudgetHeader({ month }: { month: string | undefined }) {
  const { categories } = await getCategories({ date: month });

  return (
    <div className='flex flex-col items-center gap-2 '>
      <MonthSelector selectedMonth={month} />

      <div className='flex flex-col gap-2'>
        <AddExpenseForm categories={categories} />
        <BudgetRolloverButton month={month} />
      </div>
    </div>
  );
}
