import { getCategories } from '@/app/queries/getCategories';
import { RemainingSpentCards } from './RemainingSpentCards';
import { getTotalIncomePerMonth } from '@/app/queries/getTotalIncome';

export const RemainingSpentTab = async ({ month }: { month: string | undefined }) => {
  const { totalIncome } = await getTotalIncomePerMonth({ date: month });
  const { data: categories } = await getCategories({ date: month });

  const spent =
    categories?.reduce(
      (acc, category) =>
        acc + (category.line_items?.reduce((sum, item) => sum + (item.spent_amount || 0), 0) || 0),
      0
    ) || 0;
  const remaining = totalIncome - spent;
  const percentRemaining = totalIncome > 0 ? Math.round((remaining / totalIncome) * 100) : 0;
  const percentSpent = totalIncome > 0 ? Math.round((spent / totalIncome) * 100) : 0;

  return (
    <RemainingSpentCards
      categories={categories}
      remaining={remaining}
      spent={spent}
      percentRemaining={percentRemaining}
      percentSpent={percentSpent}
    />
  );
};
