import { cache } from 'react';
import { createClient } from '@/utils/supabase/server';
import { isMissingAccountColumn } from '@/lib/budget/schema';

/**
 * The account column is optional until the budget migration is applied.
 * A missing column is a normal state, not a failed budget.
 */
export const transactionsHaveAccountLink = cache(
  async function transactionsHaveAccountLink() {
    const supabase = await createClient();
    const { error } = await supabase
      .from('transactions')
      .select('account_id')
      .limit(1);

    if (!error) return true;
    if (!isMissingAccountColumn(error)) {
      console.error('transactions account link:', error.message);
    }
    return false;
  },
);
