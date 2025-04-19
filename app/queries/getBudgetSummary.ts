import { createClient } from "@/utils/supabase/server";
import { getCurrentUser } from "./getCurrentUser";

export const getBudgetSummary = async () => {
  const { currentUser } = await getCurrentUser();
const supabase = await createClient();

if (!currentUser) {
  throw new Error('User not found');
}

const { data: income, error: incomeError } = await supabase
  .from('income')
  .select('*')
  .eq('household_id', currentUser.household_id)
  .eq('created_by', currentUser.id);


  const { data: transactions, error: transactionsError } = await supabase
  .from('transactions')
  .select('*')
  .eq('household_id', currentUser.household_id)
  .eq('created_by', currentUser.id);
  
  return {
    income,
    transactions,
    incomeError,
    transactionsError,
  }
}