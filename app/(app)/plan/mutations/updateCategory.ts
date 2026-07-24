'use server';

import { createClient } from '@/utils/supabase/server';

export const updateCategory = async ({
  categoryId,
  categoryName,
}: {
  categoryId: string;
  categoryName: string;
}) => {
  const supabase = await createClient();

  const { error } = await supabase
    .from('categories')
    .update({
      name: categoryName,
    })
    .eq('id', categoryId);

  return { error };
};
