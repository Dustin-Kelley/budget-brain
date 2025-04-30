'use server';

import { createClient } from '@/utils/supabase/server';

export const deleteLineItem = async (lineItemId: string) => {
  const supabase = await createClient();
  
  const { error } = await supabase
    .from('line_items')
    .delete()
    .eq('id', lineItemId);

  return { error };
};
