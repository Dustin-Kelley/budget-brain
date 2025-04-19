import { createClient } from "@/utils/supabase/server";
import { getCurrentUser } from "./getCurrentUser";

export const getBudgetSummary = async ({monthIndex, year}: {monthIndex: number, year: number}) => {
  const { currentUser } = await getCurrentUser();
const supabase = await createClient();

if (!currentUser) {
  throw new Error('User not found');
}

const { data: income, error: incomeError } = await supabase
  .from('income')
  .select('*')
  .eq('household_id', currentUser.household_id)
  .eq('created_by', currentUser.id)
  .eq('month', monthIndex)
  .eq('year', year);


  const { data: transactions, error: transactionsError } = await supabase
  .from('transactions')
  .select('*')
  .eq('household_id', currentUser.household_id)
  .eq('created_by', currentUser.id)
  .eq('month', monthIndex)
  .eq('year', year);
  
  return {
    income,
    transactions,
    incomeError,
    transactionsError,
  }
}