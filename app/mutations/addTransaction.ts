'use server';

import { createClient } from '@/utils/supabase/server';
import { getCurrentUser } from '../queries/getCurrentUser';
import { redirect } from 'next/navigation';
import { getMonthAndYearNumberFromDate } from '@/lib/utils';

export const addTransaction = async ({
  amount,
  description,
  lineItemId,
  dateOfTransaction,
  dateOfInput
}: {
  amount: number;
  description: string;
  lineItemId: string;
  dateOfTransaction: string;
  dateOfInput: string | undefined;
}) => {
  const supabase = await createClient();

  const { currentUser } = await getCurrentUser();

  if (!currentUser) {
    redirect('/login');
  }

  const { monthNumber, yearNumber } = getMonthAndYearNumberFromDate(dateOfInput);

  const { error } = await supabase
    .from('transactions')
    .insert({
      amount,
      description,
      date: dateOfTransaction,
      line_item_id: lineItemId,
      year: yearNumber,
      month: monthNumber,
      household_id: currentUser.household_id,
      created_by: currentUser.id,
    })

  if (error) {
    console.error(error);
  }

  return { error };
};
