import { categoryColors } from '@/lib/constants';
import { getCategories } from '../queries/getCategories';
import { getTotalIncomePerMonth } from '../queries/getTotalIncome';
import { CategoryPieChart } from './CategoryPieChart';

export async function Charts({ date }: { date: string | undefined }) {
  const { categories } = await getCategories({ date: date });
  const { income } = await getTotalIncomePerMonth({ date: date });

  if (!categories) {
    return null;
  }

  const totalIncome =
    income?.reduce((acc, item) => acc + (item.amount ?? 0), 0) ?? 0;
  const categoriesWithLineItems = categories.map((category) => ({
    ...category,
    totalPlannedAmount: category.line_items?.reduce(
      (acc, item) => acc + (item?.planned_amount ?? 0),
      0
    ),
  }));

  const chartData = categoriesWithLineItems.map((category, index) => ({
    name: category.name,
    value: category.totalPlannedAmount,
    color: categoryColors[index % categoryColors.length],
  }));

  return (
    <div>
      <CategoryPieChart
        totalIncome={totalIncome}
        chartData={chartData}
      />
    </div>
  );
}
