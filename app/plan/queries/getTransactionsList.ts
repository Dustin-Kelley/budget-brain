import { getMonthAndYearNumberFromDate } from '@/lib/utils';
import { createClient } from '@/utils/supabase/server';
import { cache } from 'react';
import type { TransactionWithLineItem } from '@/types/types';

function groupTransactionsByDate(transactions: TransactionWithLineItem[]) {
  return transactions.reduce(
    (groups: Record<string, TransactionWithLineItem[]>, transaction) => {
      const dateKey = transaction.date
        ? new Date(transaction.date).toISOString().split('T')[0]
        : 'Unknown Date';
      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      groups[dateKey].push(transaction);
      return groups;
    },
    {}
  );
}

export const getTransactionsList = cache(
  async ({
    date,
  }: {
    date: string | undefined;
  }): Promise<{
    groupedTransactions: Record<string, TransactionWithLineItem[]>;
    sortedDates: string[];
    error: unknown;
  }> => {
    const supabase = await createClient();

    const { monthNumber, yearNumber } = getMonthAndYearNumberFromDate(date);

    const { data, error } = await supabase
      .from('transactions')
      .select('*, line_items(*, categories(*))')
      .eq('month', monthNumber)
      .eq('year', yearNumber)
      .order('date', { ascending: false });

    if (error) {
      console.error(error);
      return { groupedTransactions: {}, sortedDates: [], error };
    }

    if (!data) {
      return { groupedTransactions: {}, sortedDates: [], error: null };
    }

    const groupedTransactions = groupTransactionsByDate(data);
    const sortedDates = Object.keys(groupedTransactions).sort(
      (a, b) => new Date(b).getTime() - new Date(a).getTime()
    );

    return { groupedTransactions, sortedDates, error: null };
  }
);
