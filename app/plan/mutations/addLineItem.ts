'use server';

import { getCurrentUser } from '@/app/queries/getCurrentUser';
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

  const currentDate = new Date();
  const monthNumber = date 
    ? new Date(date).getMonth() + 1 
    : currentDate.getMonth() + 1;
  const yearNumber = date 
    ? new Date(date).getFullYear() 
    : currentDate.getFullYear();

  const { data, error } = await supabase.from('line_items').insert({
    name: lineItemName,
    category_id: categoryId,
    created_by: currentUser?.id,
    planned_amount: plannedAmount,
    month: monthNumber,
    year: yearNumber,
  });

  if (error) {
    throw new Error(error.message);
  }
  return data;
};
