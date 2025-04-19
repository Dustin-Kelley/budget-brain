import { createClient } from '@/utils/supabase/server';

export const getAuthUser = async () => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return { user };
};
