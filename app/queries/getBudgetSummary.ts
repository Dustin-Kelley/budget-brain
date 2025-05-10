import { createClient } from '@/utils/supabase/server';
import { getCurrentUser } from './getCurrentUser';
import { cache } from 'react';
import { getMonthAndYearNumberFromDate } from '@/lib/utils';

export const getBudgetSummary = cache(
  async ({ date }: { date: string | undefined }) => {
    const { currentUser } = await getCurrentUser();
    const supabase = await createClient();

    if (!currentUser) {
      throw new Error('User not found');
    }

    const { monthNumber, yearNumber } = getMonthAndYearNumberFromDate(date);

    const { data: income, error: incomeError } = await supabase
      .from('income')
      .select('*')
      .eq('household_id', currentUser.household_id)
      .eq('created_by', currentUser.id)
      .eq('month', monthNumber)
      .eq('year', yearNumber);

    const { data: transactions, error: transactionsError } = await supabase
      .from('transactions')
      .select('*')
      .eq('household_id', currentUser.household_id)
      .eq('created_by', currentUser.id)
      .eq('month', monthNumber)
      .eq('year', yearNumber);

    return {
      income,
      transactions,
      incomeError,
      transactionsError,
    };
  }
);
