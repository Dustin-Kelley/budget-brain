import { createClient } from '@/utils/supabase/server';
import { getCurrentUser } from './getCurrentUser';
import { redirect } from 'next/navigation';
import { cache } from 'react';

export const getTotalIncome = cache(async () => {
  const supabase = await createClient();
  const { currentUser } = await getCurrentUser();

  if (!currentUser) {
    redirect('/login');
  }

  const { data, error } = await supabase
    .from('income')
    .select('*')
    .eq('household_id', currentUser.household_id)
    .eq('created_by', currentUser.id);

  if (error) {
    console.error(error);
  }

  return {
    data,
    error,
  };
});
