'use server';

import { getCurrentUser } from '@/app/queries/getCurrentUser';
import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';

export const deleteIncome = async ({ incomeId }: { incomeId: string }) => {
  const { currentUser } = await getCurrentUser();
  const supabase = await createClient();

  if (!currentUser) {
    redirect('/login');
  }

  const { error } = await supabase
    .from('income')
    .delete()
    .eq('id', incomeId)
    .eq('created_by', currentUser.id);
    
  return { error };
};
