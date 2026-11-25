import { cache } from 'react';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/supabase/supabase';
import { createClient } from '@/utils/supabase/server';
import { isMissingCategoryColor } from '@/lib/budget/schema';

type Client = SupabaseClient<Database>;

/**
 * The color column is optional until the category-color migration is applied.
 * A missing column is a normal state, not a failed budget.
 */
export const categoriesHaveColor = cache(async function categoriesHaveColor() {
  const supabase = await createClient();
  const { error } = await supabase.from('categories').select('color').limit(1);

  if (!error) return true;
  if (!isMissingCategoryColor(error)) {
    console.error('categories color column:', error.message);
  }
  return false;
});

export async function listCategoryColorSlots(
  supabase: Client,
  householdId: string,
  month: number,
  year: number,
) {
  const withColor = await supabase
    .from('categories')
    .select('color, created_at')
    .eq('household_id', householdId)
    .eq('month', month)
    .eq('year', year)
    .order('created_at', { ascending: true })
    .order('id', { ascending: true });

  if (!withColor.error) {
    const rows = (withColor.data ?? []).map((row) => ({ color: row.color }));
    return { rows, error: null };
  }

  if (!isMissingCategoryColor(withColor.error)) {
    return { rows: [], error: 'Could not read group colors.' };
  }

  const plain = await supabase
    .from('categories')
    .select('created_at')
    .eq('household_id', householdId)
    .eq('month', month)
    .eq('year', year)
    .order('created_at', { ascending: true })
    .order('id', { ascending: true });

  if (plain.error) {
    return { rows: [], error: 'Could not read groups.' };
  }

  const rows = (plain.data ?? []).map(() => ({ color: null }));
  return { rows, error: null };
}
