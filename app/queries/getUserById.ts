import { createClient } from '@/utils/supabase/server';
import { cache } from 'react';

export const getUserById = cache(async (userId: string) => {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .maybeSingle();

  if (error) {
    console.error('getUserById:', error);
    return { currentUser: null };
  }

  return { currentUser: data };
});
