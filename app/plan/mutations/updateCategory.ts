'use server';

import { getCurrentUser } from '@/app/queries/getCurrentUser';
import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';

export const updateCategory = async ({
  categoryId,
  categoryName,
}: {
  categoryId: string;
  categoryName: string;
}) => {
  const { currentUser } = await getCurrentUser();

  if (!currentUser) {
    redirect('/login');
  }

  const supabase = await createClient();


  const { error } = await supabase
    .from('categories')
    .update({
      name: categoryName,
    })
    .eq('id', categoryId)
    .eq('created_by', currentUser.id);

  return { error };
};
