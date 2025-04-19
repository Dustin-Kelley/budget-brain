import { createClient } from '@/utils/supabase/server';
import { cache } from 'react';
import { getAuthUser } from './getAuthUser';

export const getCurrentUser = cache(async () => {
  const supabase = await createClient();
  const { user } = await getAuthUser();

  if (!user) return { userData: null };

  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single();

  if (error) {
    if (error.details !== 'The result contains 0 rows') {
      console.error(error);
    }
  }

  return { currentUser: data };
});
