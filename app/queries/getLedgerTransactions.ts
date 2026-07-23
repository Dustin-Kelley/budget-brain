import { cache } from 'react';
import { createClient } from '@/utils/supabase/server';
import { getCurrentUser } from '@/app/queries/getCurrentUser';
import { getPeriodBoundsFromMonthParam } from '@/lib/ledger/period';
import { ensureLedgerDefaults } from '@/app/mutations/ensureLedgerDefaults';

export const getLedgerTransactions = cache(
  async ({
    month,
    accountId,
    limit = 100,
  }: {
    month?: string;
    accountId?: string;
    limit?: number;
  }) => {
    const { currentUser } = await getCurrentUser();
    if (!currentUser?.household_id) {
      return { transactions: [], error: 'Not signed in' as string | null };
    }

    await ensureLedgerDefaults(currentUser.household_id);
    const period = getPeriodBoundsFromMonthParam(month);

    const supabase = await createClient();
    let query = supabase
      .from('ledger_transactions')
      .select(
        `
        *,
        account:accounts!ledger_transactions_account_id_fkey (
          id,
          name,
          institution,
          purpose
        ),
        category:spend_categories!ledger_transactions_spend_category_id_fkey (
          id,
          name,
          group_kind
        )
      `,
      )
      .eq('household_id', currentUser.household_id)
      .gte('posted_at', period.startDate)
      .lte('posted_at', period.endDate)
      .order('posted_at', { ascending: false })
      .limit(limit);

    if (accountId) {
      query = query.eq('account_id', accountId);
    }

    const { data, error } = await query;

    if (error) {
      console.error('getLedgerTransactions:', error);
      return { transactions: [], error: error.message };
    }

    return { transactions: data ?? [], error: null };
  },
);
