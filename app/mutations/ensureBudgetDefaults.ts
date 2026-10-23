'use server';

import { createClient } from '@/utils/supabase/server';
import { getCurrentUser } from '@/app/queries/getCurrentUser';
import { getMonthAndYearNumberFromDate } from '@/lib/utils';
import { DEFAULT_BUDGET_GROUPS } from '@/lib/budget/defaults';

/**
 * Gives a household its first month of groups when it has never planned one.
 * Later months stay empty so last month can be copied forward.
 */
export async function ensureBudgetDefaults(date: string | undefined) {
  const { currentUser } = await getCurrentUser();
  if (!currentUser?.household_id || !currentUser.id) {
    return { ok: false as const, seeded: false, error: 'Not signed in' };
  }

  const supabase = await createClient();
  const householdId = currentUser.household_id;

  const { data: existing, error: readError } = await supabase
    .from('categories')
    .select('id')
    .eq('household_id', householdId)
    .limit(1);

  if (readError) {
    console.error('ensureBudgetDefaults read:', readError);
    return { ok: false as const, seeded: false, error: readError.message };
  }

  if (existing && existing.length > 0) {
    return { ok: true as const, seeded: false, error: null };
  }

  const { monthNumber, yearNumber } = getMonthAndYearNumberFromDate(date);
  const started = Date.now();

  for (let index = 0; index < DEFAULT_BUDGET_GROUPS.length; index += 1) {
    const group = DEFAULT_BUDGET_GROUPS[index];
    const { data: category, error: categoryError } = await supabase
      .from('categories')
      .insert({
        name: group.name,
        household_id: householdId,
        month: monthNumber,
        year: yearNumber,
        created_at: new Date(started + index * 1000).toISOString(),
      })
      .select('id')
      .single();

    if (categoryError || !category) {
      console.error('ensureBudgetDefaults category:', categoryError);
      return {
        ok: false as const,
        seeded: false,
        error: categoryError?.message ?? 'Could not add a starter group',
      };
    }

    if (group.items.length === 0) continue;

    const { error: itemError } = await supabase.from('line_items').insert(
      group.items.map((name, itemIndex) => ({
        name,
        category_id: category.id,
        created_by: currentUser.id,
        planned_amount: 0,
        month: monthNumber,
        year: yearNumber,
        created_at: new Date(started + index * 1000 + itemIndex + 1).toISOString(),
      })),
    );

    if (itemError) {
      console.error('ensureBudgetDefaults items:', itemError);
      return { ok: false as const, seeded: false, error: itemError.message };
    }
  }

  return { ok: true as const, seeded: true, error: null };
}
