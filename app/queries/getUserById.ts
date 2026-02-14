import { createClient } from '@/utils/supabase/server';
import { cache } from 'react';

/**
 * Fetches a user by id (e.g. from Stripe session client_reference_id).
 * Uses service role so it can look up any user without the current request's auth.
 */
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
