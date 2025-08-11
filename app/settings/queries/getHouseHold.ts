import { createClient } from '@/utils/supabase/server';
import { cache } from 'react';

export const getHouseHoldById = cache(
  async ({ householdId }: { householdId: string }) => {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('household')
      .select('*, users(*)')
      .eq('id', householdId)
      .maybeSingle();

    return { data, error };
  }
);
