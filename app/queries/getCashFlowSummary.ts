import { cache } from 'react';
import { createClient } from '@/utils/supabase/server';
import { getCurrentUser } from '@/app/queries/getCurrentUser';
import { getPeriodBoundsFromMonthParam } from '@/lib/ledger/period';
import { LIFESTYLE_PURPOSES, isLifestyleCategory } from '@/lib/ledger/constants';
import { ensureLedgerDefaults } from '@/app/mutations/ensureLedgerDefaults';

export type AllocationSlice = {
  categoryId: string | null;
  name: string;
  groupKind: string;
  amount: number;
  percent: number;
};

export type CashFlowSummary = {
  inflow: number;
  lifestyleOutflow: number;
  fixedOutflow: number;
  discretionaryOutflow: number;
  net: number;
  allocation: AllocationSlice[];
  transferVolume: number;
  wealthMoveVolume: number;
  uncategorizedOutflow: number;
  periodLabel: string;
  startDate: string;
  endDate: string;
};

export const getCashFlowSummary = cache(
  async (monthParam: string | undefined): Promise<CashFlowSummary> => {
    const period = getPeriodBoundsFromMonthParam(monthParam);
    const empty: CashFlowSummary = {
      inflow: 0,
      lifestyleOutflow: 0,
      fixedOutflow: 0,
      discretionaryOutflow: 0,
      net: 0,
      allocation: [],
      transferVolume: 0,
      wealthMoveVolume: 0,
      uncategorizedOutflow: 0,
      periodLabel: period.label,
      startDate: period.startDate,
      endDate: period.endDate,
    };

    const { currentUser } = await getCurrentUser();
    if (!currentUser?.household_id) return empty;

    await ensureLedgerDefaults(currentUser.household_id);

    const supabase = await createClient();
    const { data, error } = await supabase
      .from('ledger_transactions')
      .select(
        `
        id,
        amount,
        posted_at,
        transfer_group_id,
        spend_category_id,
        account:accounts!ledger_transactions_account_id_fkey (
          id,
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
      .lte('posted_at', period.endDate);

    if (error) {
      console.error('getCashFlowSummary:', error);
      return empty;
    }

    let inflow = 0;
    let lifestyleOutflow = 0;
    let fixedOutflow = 0;
    let discretionaryOutflow = 0;
    let transferVolume = 0;
    let wealthMoveVolume = 0;
    let uncategorizedOutflow = 0;
    const allocationMap = new Map<
      string,
      { name: string; groupKind: string; amount: number }
    >();

    for (const row of data ?? []) {
      const amount = Number(row.amount) || 0;
      const purpose = (row.account as { purpose?: string } | null)?.purpose;
      const category = row.category as {
        id: string;
        name: string;
        group_kind: string;
      } | null;

      const isTransfer =
        Boolean(row.transfer_group_id) ||
        (category?.group_kind === 'system' &&
          (category.name === 'Transfer' ||
            category.name === 'Savings' ||
            category.name === 'Investment'));

      const isWealthAccount =
        purpose === 'emergency' || purpose === 'investment';
      const isSystemNonLifestyle =
        category?.group_kind === 'system' && category.name !== 'Income';

      if (amount > 0) {
        if (category?.name === 'Transfer' || row.transfer_group_id) {
          transferVolume += amount;
          continue;
        }
        inflow += amount;
        continue;
      }

      const outflow = Math.abs(amount);

      if (isTransfer || (isWealthAccount && isSystemNonLifestyle)) {
        if (isWealthAccount) wealthMoveVolume += outflow;
        else transferVolume += outflow;
        continue;
      }

      if (isWealthAccount && !category) {
        wealthMoveVolume += outflow;
        continue;
      }

      if (category && !isLifestyleCategory(category.group_kind)) {
        if (category.name === 'Income') continue;
        wealthMoveVolume += outflow;
        continue;
      }

      // Lifestyle spend
      const isLifestyleAccount =
        !purpose || LIFESTYLE_PURPOSES.includes(purpose as never);

      if (!isLifestyleAccount && !category) {
        // Non-lifestyle account without category — treat as wealth move
        wealthMoveVolume += outflow;
        continue;
      }

      lifestyleOutflow += outflow;

      if (purpose === 'fixed_spend' || category?.group_kind === 'fixed') {
        fixedOutflow += outflow;
      } else if (
        purpose === 'discretionary_spend' ||
        category?.group_kind === 'variable'
      ) {
        discretionaryOutflow += outflow;
      } else if (category?.group_kind === 'fixed') {
        fixedOutflow += outflow;
      } else {
        discretionaryOutflow += outflow;
      }

      if (!category) {
        uncategorizedOutflow += outflow;
        const key = 'uncategorized';
        const existing = allocationMap.get(key) ?? {
          name: 'Uncategorized',
          groupKind: 'variable',
          amount: 0,
        };
        existing.amount += outflow;
        allocationMap.set(key, existing);
      } else {
        const key = category.id;
        const existing = allocationMap.get(key) ?? {
          name: category.name,
          groupKind: category.group_kind,
          amount: 0,
        };
        existing.amount += outflow;
        allocationMap.set(key, existing);
      }
    }

    const allocation: AllocationSlice[] = [...allocationMap.entries()]
      .map(([key, value]) => ({
        categoryId: key === 'uncategorized' ? null : key,
        name: value.name,
        groupKind: value.groupKind,
        amount: value.amount,
        percent:
          lifestyleOutflow > 0 ? (value.amount / lifestyleOutflow) * 100 : 0,
      }))
      .sort((a, b) => b.amount - a.amount);

    return {
      inflow,
      lifestyleOutflow,
      fixedOutflow,
      discretionaryOutflow,
      net: inflow - lifestyleOutflow,
      allocation,
      transferVolume,
      wealthMoveVolume,
      uncategorizedOutflow,
      periodLabel: period.label,
      startDate: period.startDate,
      endDate: period.endDate,
    };
  },
);
