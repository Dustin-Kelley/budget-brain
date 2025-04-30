import { createClient } from '@/utils/supabase/server';
import { cache } from 'react';

export const getAuthUser = cache(async () => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('User not found');
  }

  return { user };
});
