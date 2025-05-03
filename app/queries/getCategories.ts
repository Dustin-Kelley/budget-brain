import { createClient } from '@/utils/supabase/server';
import { getCurrentUser } from './getCurrentUser';
import { redirect } from 'next/navigation';
import { cache } from 'react';
import { getMonthAndYearNumberFromDate } from '@/lib/utils';

export const getCategories = cache(async ({ date }: { date: string | undefined }) => {
  const supabase = await createClient();
  const { currentUser } = await getCurrentUser();

  if (!currentUser) {
    redirect('/login');
  }

  const { monthNumber, yearNumber } = getMonthAndYearNumberFromDate(date);

  const { data, error } = await supabase
    .from('categories')
    .select('*, line_items(*)')
    .eq('household_id', currentUser.household_id)
    .eq('year', yearNumber)
    .eq('month', monthNumber);

  if (error) {
    console.error(error);
  }

  return { data, error };
});
