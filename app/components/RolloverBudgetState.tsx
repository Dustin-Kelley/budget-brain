import { BudgetRolloverButton } from './BudgetRolloverButton';
import { parseMonthYearDisplay } from '@/lib/utils';

interface RolloverBudgetStateProps {
  month: string | undefined;
}

export function RolloverBudgetState({ month }: RolloverBudgetStateProps) {
  const displayMonthYear = parseMonthYearDisplay(month);

  return (
    <div className='flex flex-col mt-4 items-center gap-4 text-center'>
      <div className='flex flex-col gap-2'>
        <h2 className='text-2xl font-semibold text-secondary'>
          Create your budget for {displayMonthYear}
        </h2>
        <p className='text-muted-foreground'>
          It looks like you don&apos;t have your budget set up for this month
          yet.
        </p>
      </div>

      <p className='text-sm text-muted-foreground max-w-md'>
        Roll over your budget from the previous month to get started with
        planning!
      </p>

      <BudgetRolloverButton month={month} />
    </div>
  );
}
