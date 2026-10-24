import { PlanSummaryCard } from '@/components/home/PlanSummaryCard';
import type { BudgetMonth } from '@/lib/budget/types';

export function HomeView({ budget }: { budget: BudgetMonth }) {
  return (
    <div className='flex flex-col gap-[18px]'>
      <PlanSummaryCard budget={budget} />
    </div>
  );
}
