import { getCategories } from '@/app/queries/getCategories';
import { RemainingSpentCards } from './RemainingSpentCards';
import { getTotalIncome } from '@/app/queries/getTotalIncome';

export const RemainingSpentTab = async ({ month }: { month: string | undefined }) => {
  const { data } = await getTotalIncome();
  const { data: categories } = await getCategories({ date: month });

  const totalIncome =
    data?.reduce((total, income) => total + (income.amount || 0), 0) || 0;
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
