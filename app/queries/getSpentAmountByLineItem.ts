import { getMonthAndYearNumberFromDate } from "@/lib/utils";
import { createClient } from "@/utils/supabase/server";
import { cache } from "react";

export const getSpentAmountByLineItem = cache(async ({ date }: { date: string | undefined }) => {
  const supabase = await createClient();

  const { monthNumber, yearNumber } = getMonthAndYearNumberFromDate(date);

  const { data, error } = await supabase
    .from('transactions')
    .select('*')
    .eq('month', monthNumber)
    .eq('year', yearNumber)

  if (error) {
    console.error(error);
    return { transactions: [], error };
  }

  return { transactions: data || [], error: null };
});
