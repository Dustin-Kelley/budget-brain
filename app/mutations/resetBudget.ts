'use server';

import { createClient } from '@/utils/supabase/server';
import { getCurrentUser } from '../queries/getCurrentUser';
import { redirect } from 'next/navigation';
import { getMonthAndYearNumberFromDate } from '@/lib/utils';

export const resetBudget = async ({ date }: { date: string | undefined }) => {
  const supabase = await createClient();

  const { currentUser } = await getCurrentUser();

  if (!currentUser) {
    redirect('/login');
  }

  const { monthNumber, yearNumber } = getMonthAndYearNumberFromDate(date);
  const { error: categoryError } = await supabase
    .from('categories')
    .delete()
    .eq('household_id', currentUser.household_id)
    .eq('month', monthNumber)
    .eq('year', yearNumber);

  if (categoryError) {
    console.error(categoryError);
  }

  const { error: incomeError } = await supabase
    .from('income')
    .delete()
    .eq('household_id', currentUser.household_id)
    .eq('month', monthNumber)
    .eq('year', yearNumber);

  if (incomeError) {
    console.error(incomeError);
  }

  return { categoryError, incomeError };
};
