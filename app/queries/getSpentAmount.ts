import { getMonthAndYearNumberFromDate } from "@/lib/utils";
import { createClient } from "@/utils/supabase/server";
import { cache } from "react";

export const getSpentAmount = cache(async ({ date }: { date: string | undefined }) => {
  const supabase = await createClient();

  const { monthNumber, yearNumber } = getMonthAndYearNumberFromDate(date);

  const { data, error } = await supabase
    .from('transactions')
    .select('*')
    .eq('month', monthNumber)
    .eq('year', yearNumber)

  if (error) {
    return { spentAmount: 0, spentAmountError: error };
  }

  if (!data) {
    return { spentAmount: 0, spentAmountError: null };
  }

  const spentAmount = data.reduce(
    (acc, transaction) => acc + (transaction.amount ?? 0),
    0
  );

  return { spentAmount, spentAmountError: null };
});

