import { cache } from 'react';
import { getTotalPlannedAmount } from './getTotalPlannedAmount';
import { getBudgetSummary } from './getBudgetSummary';

export const getMonthlyBudgetProgress = cache(
  async ({ date }: { date: string | undefined }) => {
    const { totalPlanned, totalPlannedError } = await getTotalPlannedAmount({ date });
    const { transactions, transactionsError } = await getBudgetSummary({ date });

    if (totalPlannedError || transactionsError) {
      return {
        totalPlanned: 0,
        spent: 0,
        percentSpent: 0,
        error: totalPlannedError || transactionsError,
      };
    }

    if (!transactions) {
      return {
        totalPlanned,
        spent: 0,
        percentSpent: 0,
        error: null,
      };
    }

    ;
    const spent = transactions.reduce(
      (acc, transaction) => acc + (transaction.amount ?? 0),
      0
    );

    const percentSpent = totalPlanned > 0 ? Math.round((spent / totalPlanned) * 100) : 0;

    return {
      totalPlanned,
      spent,
      percentSpent,
      error: null,
    };
  }
);
