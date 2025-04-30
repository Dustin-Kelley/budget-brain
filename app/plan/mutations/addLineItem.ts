'use server';

import { getCurrentUser } from '@/app/queries/getCurrentUser';
import { getMonthAndYearNumberFromDate } from '@/lib/utils';
import { createClient } from '@/utils/supabase/server';

export const addLineItem = async ({
  lineItemName,
  categoryId,
  plannedAmount,
  date,
}: {
  lineItemName: string;
  categoryId: string;
  plannedAmount: number;
  date: string | undefined;
}) => {
  const { currentUser } = await getCurrentUser();
  const supabase = await createClient();

  const { monthNumber, yearNumber } = getMonthAndYearNumberFromDate(date);
 

  const { error } = await supabase.from('line_items').insert({
    name: lineItemName,
    category_id: categoryId,
    created_by: currentUser?.id,
    planned_amount: plannedAmount,
    month: monthNumber,
    year: yearNumber,
  });

  return { error };
};
