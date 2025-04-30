'use server';

import { getCurrentUser } from '@/app/queries/getCurrentUser';
import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';

export const updateLineItem = async ({
  lineItemId,
  lineItemName,
  categoryId,
  plannedAmount,
}: {
  lineItemId: string;
  lineItemName: string;
  categoryId: string;
  plannedAmount: number;
}) => {
  const { currentUser } = await getCurrentUser();

  if (!currentUser) {
    redirect('/login');
  }

  const supabase = await createClient();


  const { error } = await supabase
    .from('line_items')
    .update({
      name: lineItemName,
      category_id: categoryId,
      planned_amount: plannedAmount,
    })
    .eq('id', lineItemId)
    .eq('created_by', currentUser.id);

  return { error };
};
