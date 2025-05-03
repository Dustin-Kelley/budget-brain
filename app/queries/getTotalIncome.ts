import { createClient } from '@/utils/supabase/server';
import { getCurrentUser } from './getCurrentUser';
import { redirect } from 'next/navigation';
import { cache } from 'react';
import { getMonthAndYearNumberFromDate } from '@/lib/utils';

export const getTotalIncomePerMonth = cache(async ({ date }: { date: string | undefined }) => {
  const supabase = await createClient();
  const { currentUser } = await getCurrentUser();

  if (!currentUser) {
    redirect('/login');
  }

  const { monthNumber, yearNumber } = getMonthAndYearNumberFromDate(date);

  const { data, error } = await supabase
    .from('income')
    .select('*')
    .eq('household_id', currentUser.household_id)
    .eq('created_by', currentUser.id)
    .eq('year', yearNumber)
    .eq('month', monthNumber);

  if (error) {
    console.error(error);
  }

  if (!data) {
    return {
      data: [],
      error: 'No data found',
      totalIncome: 0,
    };
  }

  const totalIncome =
  data.reduce((total, income) => total + (income.amount ?? 0), 0);


  return {
    income: data,
    error,
    totalIncome,
  };
});
