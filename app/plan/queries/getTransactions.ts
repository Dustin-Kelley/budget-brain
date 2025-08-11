import { getMonthAndYearNumberFromDate } from '@/lib/utils';
import { createClient } from '@/utils/supabase/server';
import { cache } from 'react';
import type { Transaction } from '@/types/types';

// Type for transaction with nested line_items and categories
interface TransactionWithLineItem extends Transaction {
  line_items?: {
    name?: string | null;
    categories?: {
      name?: string | null;
    } | null;
  } | null;
}

export const getTransactionsList = cache(
  async ({
    date,
  }: {
    date: string | undefined;
  }): Promise<{
    transactions: TransactionWithLineItem[] | null;
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
    }

    return { transactions: data, error };
  }
);
