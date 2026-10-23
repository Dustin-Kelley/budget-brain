'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';
import { getCurrentUser } from '@/app/queries/getCurrentUser';
import { getMonthAndYearNumberFromDate } from '@/lib/utils';
import { money } from '@/lib/budget/math';
import { rolloverBudget } from '@/app/mutations/rolloverBudget';
import type { BudgetKind } from '@/lib/budget/types';

function revalidateBudget() {
  revalidatePath('/');
  revalidatePath('/plan');
  revalidatePath('/transactions');
}

async function context() {
  const { currentUser } = await getCurrentUser();
  if (!currentUser?.household_id || !currentUser.id) {
    redirect('/welcome');
  }

  const supabase = await createClient();
  return {
    supabase,
    userId: currentUser.id,
    householdId: currentUser.household_id,
  };
}

function cleanName(value: string) {
  const name = value.trim();
  if (!name) return null;
  if (name.length > 80) return name.slice(0, 80);
  return name;
}

async function categoryOwned(
  supabase: Awaited<ReturnType<typeof createClient>>,
  categoryId: string,
  householdId: string,
) {
  const { data } = await supabase
    .from('categories')
    .select('id')
    .eq('id', categoryId)
    .eq('household_id', householdId)
    .maybeSingle();
  return Boolean(data);
}

async function lineItemOwned(
  supabase: Awaited<ReturnType<typeof createClient>>,
  lineItemId: string,
  householdId: string,
) {
  const { data: item } = await supabase
    .from('line_items')
    .select('id, category_id')
    .eq('id', lineItemId)
    .maybeSingle();

  if (!item) return false;

  const { data: category } = await supabase
    .from('categories')
    .select('id')
    .eq('id', item.category_id)
    .eq('household_id', householdId)
    .maybeSingle();

  return Boolean(category);
}

export async function addIncomeLine(input: {
  name: string;
  amount: number;
  monthParam: string;
}) {
  const { supabase, userId, householdId } = await context();
  const name = cleanName(input.name);
  const amount = money(input.amount);
  if (!name) return { error: 'Name the paycheck.' };
  if (amount < 0) return { error: 'Amount cannot be negative.' };

  const { monthNumber, yearNumber } = getMonthAndYearNumberFromDate(
    input.monthParam,
  );
  const { error } = await supabase.from('income').insert({
    name,
    amount,
    created_by: userId,
    household_id: householdId,
    month: monthNumber,
    year: yearNumber,
  });

  if (error) return { error: 'Could not add that income line.' };
  revalidateBudget();
  return { error: null };
}

export async function saveIncomeLine(input: {
  id: string;
  name?: string;
  amount?: number;
}) {
  const { supabase, householdId } = await context();
  const patch: { name?: string; amount?: number } = {};

  if (input.name !== undefined) {
    const name = cleanName(input.name);
    if (!name) return { error: 'Name the paycheck.' };
    patch.name = name;
  }

  if (input.amount !== undefined) {
    const amount = money(input.amount);
    if (amount < 0) return { error: 'Amount cannot be negative.' };
    patch.amount = amount;
  }

  if (Object.keys(patch).length === 0) return { error: null };

  const { error } = await supabase
    .from('income')
    .update(patch)
    .eq('id', input.id)
    .eq('household_id', householdId);

  if (error) return { error: 'Could not update that income line.' };
  revalidateBudget();
  return { error: null };
}

export async function removeIncomeLine(id: string) {
  const { supabase, householdId } = await context();
  const { error } = await supabase
    .from('income')
    .delete()
    .eq('id', id)
    .eq('household_id', householdId);

  if (error) return { error: 'Could not remove that income line.' };
  revalidateBudget();
  return { error: null };
}

export async function addGroup(input: { name: string; monthParam: string }) {
  const { supabase, householdId } = await context();
  const name = cleanName(input.name);
  if (!name) return { error: 'Name the group.' };

  const { monthNumber, yearNumber } = getMonthAndYearNumberFromDate(
    input.monthParam,
  );
  const { error } = await supabase.from('categories').insert({
    name,
    household_id: householdId,
    month: monthNumber,
    year: yearNumber,
  });

  if (error) return { error: 'Could not add that group.' };
  revalidateBudget();
  return { error: null };
}

export async function renameGroup(input: { id: string; name: string }) {
  const { supabase, householdId } = await context();
  const name = cleanName(input.name);
  if (!name) return { error: 'Name the group.' };

  const { error } = await supabase
    .from('categories')
    .update({ name })
    .eq('id', input.id)
    .eq('household_id', householdId);

  if (error) return { error: 'Could not rename that group.' };
  revalidateBudget();
  return { error: null };
}

export async function removeGroup(id: string) {
  const { supabase, householdId } = await context();
  const { error } = await supabase
    .from('categories')
    .delete()
    .eq('id', id)
    .eq('household_id', householdId);

  if (error) return { error: 'Could not remove that group.' };
  revalidateBudget();
  return { error: null };
}

export async function addItem(input: {
  categoryId: string;
  name: string;
  monthParam: string;
}) {
  const { supabase, userId, householdId } = await context();
  const name = cleanName(input.name);
  if (!name) return { error: 'Name the item.' };

  const owned = await categoryOwned(supabase, input.categoryId, householdId);
  if (!owned) return { error: 'That group is not in this household.' };

  const { monthNumber, yearNumber } = getMonthAndYearNumberFromDate(
    input.monthParam,
  );
  const { error } = await supabase.from('line_items').insert({
    name,
    category_id: input.categoryId,
    created_by: userId,
    planned_amount: 0,
    month: monthNumber,
    year: yearNumber,
  });

  if (error) return { error: 'Could not add that item.' };
  revalidateBudget();
  return { error: null };
}

export async function saveItem(input: {
  id: string;
  name?: string;
  planned?: number;
}) {
  const { supabase, householdId } = await context();
  const owned = await lineItemOwned(supabase, input.id, householdId);
  if (!owned) return { error: 'That item is not in this household.' };

  const patch: { name?: string; planned_amount?: number } = {};
  if (input.name !== undefined) {
    const name = cleanName(input.name);
    if (!name) return { error: 'Name the item.' };
    patch.name = name;
  }
  if (input.planned !== undefined) {
    const planned = money(input.planned);
    if (planned < 0) return { error: 'Planned amount cannot be negative.' };
    patch.planned_amount = planned;
  }
  if (Object.keys(patch).length === 0) return { error: null };

  const { error } = await supabase
    .from('line_items')
    .update(patch)
    .eq('id', input.id);

  if (error) return { error: 'Could not update that item.' };
  revalidateBudget();
  return { error: null };
}

export async function removeItem(id: string) {
  const { supabase, householdId } = await context();
  const owned = await lineItemOwned(supabase, id, householdId);
  if (!owned) return { error: 'That item is not in this household.' };

  const { error } = await supabase.from('line_items').delete().eq('id', id);
  if (error) return { error: 'Could not remove that item.' };
  revalidateBudget();
  return { error: null };
}

export async function saveTransaction(input: {
  id?: string;
  amount: number;
  description: string;
  date: string;
  lineItemId: string | null;
  kind: BudgetKind;
  monthParam: string;
}) {
  const { supabase, userId, householdId } = await context();
  const amount = money(input.amount);
  if (amount <= 0) return { error: 'Enter an amount greater than zero.' };
  if (input.kind !== 'expense' && input.kind !== 'income') {
    return { error: 'Choose expense or income.' };
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(input.date)) {
    return { error: 'Enter a valid date.' };
  }

  let lineItemId = input.lineItemId;
  if (lineItemId) {
    const owned = await lineItemOwned(supabase, lineItemId, householdId);
    if (!owned) return { error: 'That budget item is not in this household.' };
  } else {
    lineItemId = null;
  }

  const description = input.description.trim().slice(0, 200) || null;
  const { monthNumber, yearNumber } = getMonthAndYearNumberFromDate(
    input.monthParam,
  );
  const row = {
    amount,
    description,
    date: input.date,
    line_item_id: lineItemId,
    type: input.kind,
    year: yearNumber,
    month: monthNumber,
    household_id: householdId,
  };

  if (input.id) {
    const { error } = await supabase
      .from('transactions')
      .update(row)
      .eq('id', input.id)
      .eq('household_id', householdId);
    if (error) return { error: 'Could not update that transaction.' };
  } else {
    const { error } = await supabase.from('transactions').insert({
      ...row,
      created_by: userId,
    });
    if (error) return { error: 'Could not add that transaction.' };
  }

  revalidateBudget();
  return { error: null };
}

export async function removeTransaction(id: string) {
  const { supabase, householdId } = await context();
  const { error } = await supabase
    .from('transactions')
    .delete()
    .eq('id', id)
    .eq('household_id', householdId);

  if (error) return { error: 'Could not remove that transaction.' };
  revalidateBudget();
  return { error: null };
}

export async function copyPreviousBudget(input: {
  fromMonth: string;
  toMonth: string;
}) {
  const { supabase, householdId } = await context();
  const { monthNumber, yearNumber } = getMonthAndYearNumberFromDate(
    input.toMonth,
  );
  const { count, error: countError } = await supabase
    .from('categories')
    .select('id', { count: 'exact', head: true })
    .eq('household_id', householdId)
    .eq('month', monthNumber)
    .eq('year', yearNumber);

  if (countError) return { error: 'Could not check this month.' };
  if ((count ?? 0) > 0) {
    return {
      error: 'This month already has groups. Copy is only for an empty month.',
    };
  }

  const result = await rolloverBudget({
    fromDate: input.fromMonth,
    toDate: input.toMonth,
  });
  revalidateBudget();
  if (!result.success) {
    return { error: result.error?.message ?? 'Could not copy last month.' };
  }
  return { error: null };
}
