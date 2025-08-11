import { cache } from 'react';
import { getTotalPlannedAmount } from './getTotalPlannedAmount';
import { getSpentAmount } from './getSpentAmount';

export const getMonthlyBudgetProgress = cache(
  async ({ date }: { date: string | undefined }) => {
    const { totalPlanned, totalPlannedError } = await getTotalPlannedAmount({
      date,
    });
    const { spentAmount, spentAmountError } = await getSpentAmount({ date });

    if (totalPlannedError || spentAmountError) {
      return {
        totalPlanned: 0,
        spentAmount: 0,
        percentSpent: 0,
        error: totalPlannedError || spentAmountError,
      };
    }

    
    const percentSpent =
      totalPlanned > 0 ? Math.round((spentAmount / totalPlanned) * 100) : 0;

    return {
      totalPlanned,
      spentAmount,
      percentSpent,
      error: null,
    };
  }
);
