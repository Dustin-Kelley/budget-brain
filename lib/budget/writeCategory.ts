import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/supabase/supabase';
import { isMissingCategoryColor } from '@/lib/budget/schema';

type Client = SupabaseClient<Database>;
type CategoryInsert = Database['public']['Tables']['categories']['Insert'];

/**
 * Insert a budget group. If the color column is not on this database yet,
 * save the row without it so planning still works.
 */
export async function insertCategory(supabase: Client, row: CategoryInsert) {
  const attempt = await supabase
    .from('categories')
    .insert(row)
    .select('id')
    .single();

  if (!attempt.error) return attempt;
  if (row.color == null) return attempt;
  if (!isMissingCategoryColor(attempt.error)) return attempt;

  const rest = { ...row };
  delete rest.color;
  return supabase.from('categories').insert(rest).select('id').single();
}
