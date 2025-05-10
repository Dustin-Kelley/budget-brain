import { getBudgetSummary } from "./getBudgetSummary";
import { getCurrentUser } from "./getCurrentUser";
import { cache } from 'react';

export const getMonthlyBudgetProgress = cache(async ({date}: {date: string | undefined}) => {
  const { currentUser } = await getCurrentUser();
  const { income, transactions, incomeError, transactionsError } = await getBudgetSummary({date});

  if (!currentUser || !income || !transactions) {
    return {
      planned: 0,
      spent: 0,
      percentSpent: 0,
      error: incomeError || transactionsError,
    };
  }

  const planned = income.reduce((acc, income) => acc + (income.amount || 0), 0) || 0;
  const spent = transactions.reduce((acc, transaction) => acc + (transaction.amount || 0), 0) || 0;

  const percentSpent = Math.round((spent / planned) * 100) || 0;

  return {
    planned,
    spent,
    percentSpent,
    incomeError,
    transactionsError,
  };
});

