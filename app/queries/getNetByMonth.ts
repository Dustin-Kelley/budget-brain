import { cache } from 'react';
import { createClient } from '@/utils/supabase/server';
import { getCurrentUser } from '@/app/queries/getCurrentUser';
import { getPeriodBoundsFromMonthParam } from '@/lib/ledger/period';
import { isLifestyleCategory } from '@/lib/ledger/constants';

const MONTHS_SHORT = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
];

export type NetMonth = {
  /** "Jul" */
  label: string;
  /** "July-2026" — the value the month param expects */
  monthParam: string;
  net: number;
};

/**
 * Net kept (inflow − lifestyle outflow) for the trailing `count` months ending
 * with the selected one. One query over the whole window, bucketed in memory —
 * cheaper than `count` round trips.
 */
export const getNetByMonth = cache(
  async (monthParam: string | undefined, count = 6): Promise<NetMonth[]> => {
    const period = getPeriodBoundsFromMonthParam(monthParam);

    // Window start: the 1st of the month (count - 1) months back.
    const windowStart = new Date(
      Date.UTC(period.yearNumber, period.monthNumber - count, 1),
    );

    const buckets: NetMonth[] = Array.from({ length: count }, (_, i) => {
      const d = new Date(
        Date.UTC(period.yearNumber, period.monthNumber - count + i, 1),
      );
      return {
        label: MONTHS_SHORT[d.getUTCMonth()],
        monthParam: `${
          [
            'January',
            'February',
            'March',
            'April',
            'May',
            'June',
            'July',
            'August',
            'September',
            'October',
            'November',
            'December',
          ][d.getUTCMonth()]
        }-${d.getUTCFullYear()}`,
        net: 0,
      };
    });

    const { currentUser } = await getCurrentUser();
    if (!currentUser?.household_id) return buckets;

    const supabase = await createClient();
    const { data, error } = await supabase
      .from('ledger_transactions')
      .select(
        `
        amount,
        posted_at,
        transfer_group_id,
        account:accounts!ledger_transactions_account_id_fkey ( purpose ),
        category:spend_categories!ledger_transactions_spend_category_id_fkey (
          name,
          group_kind
        )
      `,
      )
      .eq('household_id', currentUser.household_id)
      .gte('posted_at', windowStart.toISOString().slice(0, 10))
      .lte('posted_at', period.endDate);

    if (error) {
      console.error('getNetByMonth:', error);
      return buckets;
    }

    const indexOf = (posted: string) => {
      const d = new Date(`${posted}T00:00:00Z`);
      return (
        (d.getUTCFullYear() - windowStart.getUTCFullYear()) * 12 +
        (d.getUTCMonth() - windowStart.getUTCMonth())
      );
    };

    for (const row of data ?? []) {
      const index = indexOf(row.posted_at as string);
      if (index < 0 || index >= count) continue;

      const amount = Number(row.amount) || 0;
      const purpose = (row.account as { purpose?: string } | null)?.purpose;
      const category = row.category as {
        name: string;
        group_kind: string;
      } | null;

      const isTransfer =
        Boolean(row.transfer_group_id) ||
        (category?.group_kind === 'system' && category.name !== 'Income');

      if (isTransfer) continue;

      if (amount > 0) {
        buckets[index].net += amount;
        continue;
      }

      // Only lifestyle spend counts against net, mirroring getCashFlowSummary.
      const isWealthAccount =
        purpose === 'emergency' || purpose === 'investment';
      if (isWealthAccount) continue;
      if (category && !isLifestyleCategory(category.group_kind)) continue;

      buckets[index].net -= Math.abs(amount);
    }

    return buckets;
  },
);
