'use server';

import { createClient } from '@/utils/supabase/server';

export const deleteCategory = async ({
  categoryId,
}: {
  categoryId: string;
}) => {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('categories')
    .delete()
    .eq('id', categoryId);

  return { data, error };
};
