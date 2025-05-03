'use server';

import { createClient } from '@/utils/supabase/server';

export const updateIncome = async ({
  incomeId,
  incomeName,
  incomeAmount,
}: {
  incomeId: string;
  incomeName: string;
  incomeAmount: number;
}) => {
  const supabase = await createClient();
  const { error } = await supabase
    .from('income')
    .update({
      name: incomeName,
      amount: incomeAmount,
    })
    .eq('id', incomeId);

  return { error };
};
