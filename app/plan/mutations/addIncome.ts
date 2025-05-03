'use server';

import { getCurrentUser } from '@/app/queries/getCurrentUser';
import { getMonthAndYearNumberFromDate } from '@/lib/utils';
import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';

export const addIncome = async ({
  incomeName,
  incomeAmount,
  date,
}: {
  incomeName: string;
  incomeAmount: number;
  date: string | undefined;
}) => {
  const { currentUser } = await getCurrentUser();

  if (!currentUser) {
    redirect('/login');
  }

  const supabase = await createClient();

  const { monthNumber, yearNumber } = getMonthAndYearNumberFromDate(date);
 

  const { error } = await supabase.from('income').insert({
    name: incomeName,
    amount: incomeAmount,
    created_by: currentUser?.id,
    household_id: currentUser?.household_id,
    month: monthNumber,
    year: yearNumber,
  });

  return { error };
};
