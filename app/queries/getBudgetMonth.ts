import { cache } from 'react';
import { redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';
import { getCurrentUser } from '@/app/queries/getCurrentUser';
import { getMonthAndYearNumberFromDate } from '@/lib/utils';
import { kindFromType, money } from '@/lib/budget/math';
import { resolveCategoryColor } from '@/lib/category-colors';
import { categoriesHaveColor } from '@/app/queries/categoryColors';
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

  const [linkedAtStart, colorLinked] = await Promise.all([
    transactionsHaveAccountLink(),
    categoriesHaveColor(),
  ]);

  const [incomeRes, categoryRes, prevRes] = await Promise.all([
    supabase
      .from('income')
      .select('id, name, amount, created_at')
      .eq('household_id', householdId)
      .eq('month', monthNumber)
      .eq('year', yearNumber)
      .order('created_at', { ascending: true }),
    loadMonthCategories(
      supabase,
      householdId,
      monthNumber,
      yearNumber,
      colorLinked,
    ),
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
    colorLinked,
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
      colorKey: row.color,
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
      const groupIndex = category
        ? groups.findIndex((group) => group.id === category.id)
        : -1;
      let groupColor: string | null = null;
      if (category) {
        const colorIndex = groupIndex >= 0 ? groupIndex : groups.length;
        groupColor = resolveCategoryColor(category.color, colorIndex);
      }
      return {
        id: row.id,
        amount: money(row.amount),
        date: row.date,
        description: row.description?.trim() ?? '',
        lineItemId: row.line_item_id,
        lineItemName: lineItem?.name ?? null,
        groupName: category?.name ?? null,
        groupColor,
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
          | { id: string; name: string | null; color: string | null }
          | { id: string; name: string | null; color: string | null }[]
          | null;
      }
    | {
        name: string | null;
        categories:
          | { id: string; name: string | null; color: string | null }
          | { id: string; name: string | null; color: string | null }[]
          | null;
      }[]
    | null;
};

type CategoryRow = {
  id: string;
  name: string | null;
  color: string | null;
  created_at: string;
  line_items:
    | {
        id: string;
        name: string | null;
        planned_amount: number | null;
        created_at: string;
      }[]
    | null;
};

async function loadMonthCategories(
  supabase: Awaited<ReturnType<typeof createClient>>,
  householdId: string,
  monthNumber: number,
  yearNumber: number,
  colorLinked: boolean,
): Promise<{ data: CategoryRow[] | null; error: { message: string } | null }> {
  if (colorLinked) {
    const result = await supabase
      .from('categories')
      .select(
        'id, name, color, created_at, line_items(id, name, planned_amount, created_at)',
      )
      .eq('household_id', householdId)
      .eq('month', monthNumber)
      .eq('year', yearNumber)
      .order('created_at', { ascending: true })
      .order('id', { ascending: true });
    return { data: result.data, error: result.error };
  }

  const result = await supabase
    .from('categories')
    .select(
      'id, name, created_at, line_items(id, name, planned_amount, created_at)',
    )
    .eq('household_id', householdId)
    .eq('month', monthNumber)
    .eq('year', yearNumber)
    .order('created_at', { ascending: true })
    .order('id', { ascending: true });
  const data = (result.data ?? []).map((row) => ({
    ...row,
    color: null,
  }));
  return { data, error: result.error };
}

async function loadMonthTransactions(
  supabase: Awaited<ReturnType<typeof createClient>>,
  householdId: string,
  monthNumber: number,
  yearNumber: number,
  linked: boolean,
  colorLinked: boolean,
) {
  const rows = await readTransactions(
    supabase,
    householdId,
    monthNumber,
    yearNumber,
    linked,
    colorLinked,
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

function asTxnRows(rows: unknown[], accountFallback: string | null | undefined) {
  return rows.map((value) => {
    const row = value as {
      id: string;
      amount: number | null;
      date: string | null;
      description: string | null;
      line_item_id: string | null;
      type: string | null;
      created_at: string;
      account_id?: string | null;
      line_items: unknown;
    };
    let accountId = row.account_id ?? null;
    if (accountFallback !== undefined) accountId = accountFallback;
    return {
      id: row.id,
      amount: row.amount,
      date: row.date,
      description: row.description,
      line_item_id: row.line_item_id,
      type: row.type,
      created_at: row.created_at,
      account_id: accountId,
      line_items: asLineItems(row.line_items),
    } satisfies TxnRow;
  });
}

function asLineItems(value: unknown): TxnRow['line_items'] {
  if (!value || typeof value !== 'object') return null;
  if (Array.isArray(value)) {
    return value.map((item) => asLineItem(item));
  }
  return asLineItem(value);
}

function asLineItem(value: unknown) {
  const row = value as { name?: string | null; categories?: unknown };
  return {
    name: row.name ?? null,
    categories: asCategory(row.categories),
  };
}

function asCategory(value: unknown) {
  if (!value || typeof value !== 'object') return null;
  if (Array.isArray(value)) {
    return value.map((item) => asOneCategory(item));
  }
  return asOneCategory(value);
}

function asOneCategory(value: unknown) {
  const row = value as {
    id?: string;
    name?: string | null;
    color?: string | null;
  };
  return {
    id: row.id ?? '',
    name: row.name ?? null,
    color: row.color ?? null,
  };
}

async function readTransactions(
  supabase: Awaited<ReturnType<typeof createClient>>,
  householdId: string,
  monthNumber: number,
  yearNumber: number,
  linked: boolean,
  colorLinked: boolean,
): Promise<{ linked: boolean; error: { message: string } | null; rows: TxnRow[] }> {
  if (linked) {
    const withAccount = colorLinked
      ? await supabase
          .from('transactions')
          .select(
            'id, amount, date, description, line_item_id, type, created_at, account_id, line_items(name, categories(id, name, color))',
          )
          .eq('household_id', householdId)
          .eq('month', monthNumber)
          .eq('year', yearNumber)
          .order('date', { ascending: false })
      : await supabase
          .from('transactions')
          .select(
            'id, amount, date, description, line_item_id, type, created_at, account_id, line_items(name, categories(id, name))',
          )
          .eq('household_id', householdId)
          .eq('month', monthNumber)
          .eq('year', yearNumber)
          .order('date', { ascending: false });

    if (!withAccount.error) {
      return {
        linked: true,
        error: null,
        rows: asTxnRows(withAccount.data ?? [], undefined),
      };
    }
    if (!isMissingAccountColumn(withAccount.error)) {
      return { linked: true, error: withAccount.error, rows: [] };
    }
  }

  const plain = colorLinked
    ? await supabase
        .from('transactions')
        .select(
          'id, amount, date, description, line_item_id, type, created_at, line_items(name, categories(id, name, color))',
        )
        .eq('household_id', householdId)
        .eq('month', monthNumber)
        .eq('year', yearNumber)
        .order('date', { ascending: false })
    : await supabase
        .from('transactions')
        .select(
          'id, amount, date, description, line_item_id, type, created_at, line_items(name, categories(id, name))',
        )
        .eq('household_id', householdId)
        .eq('month', monthNumber)
        .eq('year', yearNumber)
        .order('date', { ascending: false });

  return {
    linked: false,
    error: plain.error,
    rows: asTxnRows(plain.data ?? [], null),
  };
}
