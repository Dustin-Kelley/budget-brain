import { getCategories } from '@/app/queries/getCategories';
import { RemainingSpentCards } from './RemainingSpentCards';
import { getTotalIncomePerMonth } from '@/app/queries/getTotalIncome';
import { getSpentAmount } from '@/app/queries/getSpentAmount';

export const RemainingSpentTab = async ({ month }: { month: string | undefined }) => {
  const { totalIncome } = await getTotalIncomePerMonth({ date: month });
  const { categories } = await getCategories({ date: month });

  const { data: spent } = await getSpentAmount({ date: month });

  const spentByLineItem = spent?.map((s) => ({
    line_item_id: s.id,
    spent: s.amount ?? 0,
  })) ?? [];

  return (
    <RemainingSpentCards
      spentByLineItem={spentByLineItem}
      categories={categories}
      totalIncome={totalIncome}
    />
  );
};
