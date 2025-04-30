'use server';

import { getCurrentUser } from '@/app/queries/getCurrentUser';
import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import { getMonthAndYearNumberFromDate } from '@/lib/utils';
export const addCategory = async ({
  categoryName,
  date,
}: {
  categoryName: string;
  date: string | undefined;
}) => {
  const { currentUser } = await getCurrentUser();

  if (!currentUser) {
    redirect('/login');
  }

  const supabase = await createClient();

  const { monthNumber, yearNumber } = getMonthAndYearNumberFromDate(date);

  const { data, error } = await supabase.from('categories').insert({
    name: categoryName,
    household_id: currentUser?.household_id,
    month: monthNumber,
    year: yearNumber,
  });

  return { data, error };
};
