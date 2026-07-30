import { cache } from 'react';
import { createClient } from '@/utils/supabase/server';
import { getCurrentUser } from '@/app/queries/getCurrentUser';
import { getPeriodBoundsFromMonthParam } from '@/lib/ledger/period';

export type AccountActivity = {
  outflow: number;
  inflow: number;
  transactionCount: number;
  /** Outflow per day across the period — the account card's sparkline. */
  daily: number[];
  averagePerDay: number;
  /**
   * Month-end outflow at the current run rate. Null for closed periods, where
   * `outflow` is already the final number.
   */
  projected: number | null;
};

const EMPTY: AccountActivity = {
  outflow: 0,
  inflow: 0,
  transactionCount: 0,
  daily: [],
  averagePerDay: 0,
  projected: null,
};

/** Per-account activity for the period, keyed by account id. */
export const getAccountActivity = cache(
  async (
    monthParam: string | undefined,
  ): Promise<Record<string, AccountActivity>> => {
    const { currentUser } = await getCurrentUser();
    if (!currentUser?.household_id) return {};

    const period = getPeriodBoundsFromMonthParam(monthParam);
    const supabase = await createClient();

    const { data, error } = await supabase
      .from('ledger_transactions')
      .select('account_id, amount, posted_at')
      .eq('household_id', currentUser.household_id)
      .gte('posted_at', period.startDate)
      .lte('posted_at', period.endDate);

    if (error) {
      console.error('getAccountActivity:', error);
      return {};
    }

    const daysInPeriod = Number(period.endDate.slice(8, 10));

    // How far through the period are we? Only meaningful for the live month.
    const now = new Date();
    const isCurrentPeriod =
      now.getUTCFullYear() === period.yearNumber &&
      now.getUTCMonth() + 1 === period.monthNumber;
    const daysElapsed = isCurrentPeriod ? now.getUTCDate() : daysInPeriod;

    const result: Record<string, AccountActivity> = {};

    for (const row of data ?? []) {
      const id = row.account_id as string;
      if (!id) continue;

      const entry = (result[id] ??= {
        ...EMPTY,
        daily: Array(daysInPeriod).fill(0),
      });

      const amount = Number(row.amount) || 0;
      entry.transactionCount += 1;

      if (amount > 0) {
        entry.inflow += amount;
        continue;
      }

      const outflow = Math.abs(amount);
      entry.outflow += outflow;

      const day = Number((row.posted_at as string).slice(8, 10));
      if (day >= 1 && day <= daysInPeriod) entry.daily[day - 1] += outflow;
    }

    for (const entry of Object.values(result)) {
      entry.averagePerDay = daysElapsed > 0 ? entry.outflow / daysElapsed : 0;
      entry.projected =
        isCurrentPeriod && daysElapsed < daysInPeriod
          ? entry.averagePerDay * daysInPeriod
          : null;
    }

    return result;
  },
);
