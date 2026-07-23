import { cache } from 'react';
import { createClient } from '@/utils/supabase/server';
import { getCurrentUser } from '@/app/queries/getCurrentUser';
import { ensureLedgerDefaults } from '@/app/mutations/ensureLedgerDefaults';

export const getAccounts = cache(async () => {
  const { currentUser } = await getCurrentUser();
  if (!currentUser?.household_id) {
    return { accounts: [], error: 'Not signed in' as string | null };
  }

  await ensureLedgerDefaults(currentUser.household_id);

  const supabase = await createClient();
  const { data, error } = await supabase
    .from('accounts')
    .select('*')
    .eq('household_id', currentUser.household_id)
    .eq('is_active', true)
    .order('institution', { ascending: true })
    .order('name', { ascending: true });

  if (error) {
    console.error('getAccounts:', error);
    return { accounts: [], error: error.message };
  }

  return { accounts: data ?? [], error: null };
});
