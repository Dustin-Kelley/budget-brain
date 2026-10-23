import { cache } from 'react';
import { redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';
import { getCurrentUser } from '@/app/queries/getCurrentUser';
import { getMonthAndYearNumberFromDate } from '@/lib/utils';
import { kindFromType, money } from '@/lib/budget/math';
import { transactionsHaveAccountLink } from '@/app/queries/budgetAccountLink';
import { isMissingAccountColumn } from '@/lib/budget/schema';
import {
  monthLabel,
  shiftMonth,
  toMonthParam,
} from '@/lib/budget/month';
import type {
  BudgetAccount,
  BudgetGroup,
  BudgetIncome,
  BudgetMonth,
  BudgetTransaction,
} from '@/lib/budget/types';

function asOne<T>(value: T | T[] | null | undefined): T | null {
  if (!value) return null;
  if (Array.isArray(value)) return value[0] ?? null;
  return value;
}

function emptyMonth(
  monthParam: string,
  label: string,
  previousMonthParam: string,
  previousMonthLabel: string,
  loadError: string | null,
): BudgetMonth {
  return {
    monthParam,
    monthLabel: label,
    previousMonthParam,
    previousMonthLabel,
    canCopyPrevious: false,
    income: [],
    groups: [],
    transactions: [],
    accounts: [],
    accountsLinked: false,
    loadError,
  };
}

export const getBudgetMonth = cache(async function getBudgetMonth(
  date: string | undefined,
): Promise<BudgetMonth> {
  const { currentUser } = await getCurrentUser();
  if (!currentUser?.household_id) redirect('/welcome');

  const supabase = await createClient();
  const householdId = currentUser.household_id;
  const { monthNumber, yearNumber } = getMonthAndYearNumberFromDate(date);
  const previous = shiftMonth(monthNumber, yearNumber, -1);
  const monthParam = toMonthParam(monthNumber, yearNumber);
  const label = monthLabel(monthNumber, yearNumber);
  const previousMonthParam = toMonthParam(previous.monthNumber, previous.year);
  const previousLabel = monthLabel(previous.monthNumber, previous.year);

  const linkedAtStart = await transactionsHaveAccountLink();

  const [incomeRes, categoryRes, prevRes] = await Promise.all([
    supabase
      .from('income')
      .select('id, name, amount, created_at')
      .eq('household_id', householdId)
      .eq('month', monthNumber)
      .eq('year', yearNumber)
      .order('created_at', { ascending: true }),
    supabase
      .from('categories')
      .select('id, name, created_at, line_items(id, name, planned_amount, created_at)')
      .eq('household_id', householdId)
      .eq('month', monthNumber)
      .eq('year', yearNumber)
      .order('created_at', { ascending: true }),
    supabase
      .from('categories')
      .select('id', { count: 'exact', head: true })
      .eq('household_id', householdId)
      .eq('month', previous.monthNumber)
      .eq('year', previous.year),
  ]);

  const txnLoad = await loadMonthTransactions(
    supabase,
    householdId,
    monthNumber,
    yearNumber,
    linkedAtStart,
  );

  const failed = incomeRes.error ?? categoryRes.error ?? txnLoad.error;
  if (failed) {
    console.error(failed);
    return emptyMonth(
      monthParam,
      label,
      previousMonthParam,
      previousLabel,
      'The budget could not be loaded. Refresh and try again.',
    );
  }

  const income: BudgetIncome[] = (incomeRes.data ?? []).map((row) => ({
    id: row.id,
    name: row.name?.trim() || 'Income',
    amount: money(row.amount),
  }));

  const groups: BudgetGroup[] = (categoryRes.data ?? []).map((row) => {
    const items = [...(row.line_items ?? [])].sort((a, b) =>
      (a.created_at ?? '').localeCompare(b.created_at ?? ''),
    );
    return {
      id: row.id,
      name: row.name?.trim() || 'Group',
      items: items.map((item) => ({
        id: item.id,
        name: item.name?.trim() || 'Item',
        planned: money(item.planned_amount),
      })),
    };
  });

  const accountNames = new Map(
    txnLoad.accounts.map((account) => [account.id, account.name]),
  );

  const transactions: BudgetTransaction[] = [...txnLoad.rows]
    .sort((a, b) => {
      const dateCompare = (b.date ?? '').localeCompare(a.date ?? '');
      if (dateCompare !== 0) return dateCompare;
      return (b.created_at ?? '').localeCompare(a.created_at ?? '');
    })
    .map((row) => {
      const lineItem = asOne(row.line_items);
      const category = lineItem ? asOne(lineItem.categories) : null;
      const accountId = row.account_id;
      return {
        id: row.id,
        amount: money(row.amount),
        date: row.date,
        description: row.description?.trim() ?? '',
        lineItemId: row.line_item_id,
        lineItemName: lineItem?.name ?? null,
        groupName: category?.name ?? null,
        accountId,
        accountName: accountId ? (accountNames.get(accountId) ?? null) : null,
        kind: kindFromType(row.type),
      };
    });

  const previousCount = prevRes.count ?? 0;

  return {
    monthParam,
    monthLabel: label,
    previousMonthParam,
    previousMonthLabel: previousLabel,
    canCopyPrevious: groups.length === 0 && previousCount > 0 && !prevRes.error,
    income,
    groups,
    transactions,
    accounts: txnLoad.accounts,
    accountsLinked: txnLoad.linked,
    loadError: null,
  };
});

type TxnRow = {
  id: string;
  amount: number | null;
  date: string | null;
  description: string | null;
  line_item_id: string | null;
  type: string | null;
  created_at: string;
  account_id: string | null;
  line_items:
    | {
        name: string | null;
        categories:
          | { name: string | null }
          | { name: string | null }[]
          | null;
      }
    | {
        name: string | null;
        categories:
          | { name: string | null }
          | { name: string | null }[]
          | null;
      }[]
    | null;
};

async function loadMonthTransactions(
  supabase: Awaited<ReturnType<typeof createClient>>,
  householdId: string,
  monthNumber: number,
  yearNumber: number,
  linked: boolean,
) {
  const rows = await readTransactions(
    supabase,
    householdId,
    monthNumber,
    yearNumber,
    linked,
  );

  let accounts: BudgetAccount[] = [];
  if (rows.linked) {
    const accountRes = await supabase
      .from('accounts')
      .select('id, name, institution')
      .eq('household_id', householdId)
      .eq('is_active', true)
      .order('name', { ascending: true });
    if (accountRes.error) {
      console.error(accountRes.error);
    } else {
      accounts = (accountRes.data ?? []).map((account) => ({
        id: account.id,
        name: account.name,
        institution: account.institution,
      }));
    }
  }

  return {
    linked: rows.linked,
    error: rows.error,
    rows: rows.rows,
    accounts,
  };
}

async function readTransactions(
  supabase: Awaited<ReturnType<typeof createClient>>,
  householdId: string,
  monthNumber: number,
  yearNumber: number,
  linked: boolean,
): Promise<{ linked: boolean; error: { message: string } | null; rows: TxnRow[] }> {
  if (linked) {
    const withAccount = await supabase
      .from('transactions')
      .select(
        'id, amount, date, description, line_item_id, type, created_at, account_id, line_items(name, categories(name))',
      )
      .eq('household_id', householdId)
      .eq('month', monthNumber)
      .eq('year', yearNumber)
      .order('date', { ascending: false });

    if (!withAccount.error) {
      return { linked: true, error: null, rows: withAccount.data ?? [] };
    }
    if (!isMissingAccountColumn(withAccount.error)) {
      return { linked: true, error: withAccount.error, rows: [] };
    }
  }

  const plain = await supabase
    .from('transactions')
    .select(
      'id, amount, date, description, line_item_id, type, created_at, line_items(name, categories(name))',
    )
    .eq('household_id', householdId)
    .eq('month', monthNumber)
    .eq('year', yearNumber)
    .order('date', { ascending: false });

  const rows = (plain.data ?? []).map((row) => ({
    ...row,
    account_id: null,
  }));

  return { linked: false, error: plain.error, rows };
}
