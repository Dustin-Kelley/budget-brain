import { cache } from 'react';
import { redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';
import { getCurrentUser } from '@/app/queries/getCurrentUser';
import { getMonthAndYearNumberFromDate } from '@/lib/utils';
import { kindFromType, money } from '@/lib/budget/math';
import {
  monthLabel,
  shiftMonth,
  toMonthParam,
} from '@/lib/budget/month';
import type {
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

  const [incomeRes, categoryRes, txnRes, prevRes] = await Promise.all([
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
      .from('transactions')
      .select(
        'id, amount, date, description, line_item_id, type, created_at, line_items(name, categories(name))',
      )
      .eq('household_id', householdId)
      .eq('month', monthNumber)
      .eq('year', yearNumber)
      .order('date', { ascending: false }),
    supabase
      .from('categories')
      .select('id', { count: 'exact', head: true })
      .eq('household_id', householdId)
      .eq('month', previous.monthNumber)
      .eq('year', previous.year),
  ]);

  const failed = incomeRes.error ?? categoryRes.error ?? txnRes.error;
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

  const transactions: BudgetTransaction[] = [...(txnRes.data ?? [])]
    .sort((a, b) => {
      const dateCompare = (b.date ?? '').localeCompare(a.date ?? '');
      if (dateCompare !== 0) return dateCompare;
      return (b.created_at ?? '').localeCompare(a.created_at ?? '');
    })
    .map((row) => {
      const lineItem = asOne(row.line_items);
      const category = lineItem ? asOne(lineItem.categories) : null;
      return {
        id: row.id,
        amount: money(row.amount),
        date: row.date,
        description: row.description?.trim() ?? '',
        lineItemId: row.line_item_id,
        lineItemName: lineItem?.name ?? null,
        groupName: category?.name ?? null,
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
    loadError: null,
  };
});
