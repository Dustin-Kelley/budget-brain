import { cache } from 'react';
import { createClient } from '@/utils/supabase/server';
import { getCurrentUser } from '@/app/queries/getCurrentUser';
import { ensureLedgerDefaults } from '@/app/mutations/ensureLedgerDefaults';

export const getSpendCategories = cache(async () => {
  const { currentUser } = await getCurrentUser();
  if (!currentUser?.household_id) {
    return { categories: [], error: 'Not signed in' as string | null };
  }

  await ensureLedgerDefaults(currentUser.household_id);

  const supabase = await createClient();
  const { data, error } = await supabase
    .from('spend_categories')
    .select('*')
    .eq('household_id', currentUser.household_id)
    .order('sort_order', { ascending: true });

  if (error) {
    console.error('getSpendCategories:', error);
    return { categories: [], error: error.message };
  }

  return { categories: data ?? [], error: null };
});
