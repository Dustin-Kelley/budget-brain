import { getBudgetSummary } from './getBudgetSummary';
import { getTotalPlannedAmount } from './getTotalPlannedAmount';
import { cache } from 'react';

export const getMonthlyBudgetProgress = cache(
  async ({ date }: { date: string | undefined }) => {
    const { transactions, transactionsError } = await getBudgetSummary({
      date,
    });
    const { totalPlanned, totalPlannedError } = await getTotalPlannedAmount({
      date,
    });

    if (!transactions || !totalPlanned || transactionsError || totalPlannedError) {
      return {
        totalPlanned: 0,
        spent: 0,
        percentSpent: 0,
        error: transactionsError || totalPlannedError,
      };
    }

    const spent = transactions.reduce(
      (acc, transaction) => acc + (transaction.amount ?? 0),
      0
    );

    const percentSpent =
      totalPlanned > 0 ? Math.round((spent / totalPlanned) * 100) : 0;

    return {
      totalPlanned,
      spent,
      percentSpent,
      error: totalPlannedError,
    };
  }
);
