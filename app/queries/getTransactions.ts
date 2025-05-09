import { getMonthAndYearNumberFromDate } from "@/lib/utils";
import { createClient } from "@/utils/supabase/server";
import { cache } from "react";

export const getTransactions = cache(async ({ date }: { date: string | undefined }) => {
  const supabase = await createClient();

  const { monthNumber, yearNumber } = getMonthAndYearNumberFromDate(date);

  const { data, error } = await supabase
    .from('transactions')
    .select('*, line_items(*, categories(*))')
    .eq('month', monthNumber)
    .eq('year', yearNumber)

  if (error) {
    console.error(error);
  }

  return { transactions: data, error };
});
