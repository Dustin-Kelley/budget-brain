'use server';

import { createClient } from '@/utils/supabase/server';
import { getCurrentUser } from '@/app/queries/getCurrentUser';
import { redirect } from 'next/navigation';
import { getMonthAndYearNumberFromDate } from '@/lib/utils';

export const updateTransaction = async ({
  amount,
  description,
  lineItemId,
  dateOfTransaction,
  dateOfInput,
  transactionId
}: {
  amount: number;
  description: string | undefined;
  lineItemId: string;
  dateOfTransaction: string;
  transactionId: string;
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
    .update({
      amount,
      description,
      date: dateOfTransaction,
      line_item_id: lineItemId,
      year: yearNumber,
      month: monthNumber,
      household_id: currentUser.household_id,
      created_by: currentUser.id,
    })
    .eq('id', transactionId);

  if (error) {
    console.error(error);
  }

  return { error };
};
