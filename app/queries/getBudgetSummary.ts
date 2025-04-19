import { createClient } from "@/utils/supabase/server";
import { getCurrentUser } from "./getCurrentUser";

export const getBudgetSummary = async ({month, year}: {month: string, year: string}) => {
  const { currentUser } = await getCurrentUser();
const supabase = await createClient();

console.log("🚀 ~ month:", month)
console.log("🚀 ~ year:", year) 

if (!currentUser) {
  throw new Error('User not found');
}

const monthNumber = Number(month);
const yearNumber = Number(year);

const { data: income, error: incomeError } = await supabase
  .from('income')
  .select('*')
  .eq('household_id', currentUser.household_id)
  .eq('created_by', currentUser.id)
  .eq('month', monthNumber)
  .eq('year', yearNumber);


  const { data: transactions, error: transactionsError } = await supabase
  .from('transactions')
  .select('*')
  .eq('household_id', currentUser.household_id)
  .eq('created_by', currentUser.id)
  .eq('month', monthNumber)
  .eq('year', yearNumber);
  
  return {
    income,
    transactions,
    incomeError,
    transactionsError,
  }
}