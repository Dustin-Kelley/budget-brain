'use server';

import { createClient } from '@/utils/supabase/server';
import { getCurrentUser } from '@/app/queries/getCurrentUser';
import { redirect } from 'next/navigation';
import { getMonthAndYearNumberFromDate } from '@/lib/utils';

export const rolloverBudget = async ({ fromDate, toDate }: { fromDate: string; toDate: string }) => {
  const supabase = await createClient();
  const { currentUser } = await getCurrentUser();

  if (!currentUser) {
    redirect('/login');
  }

  // Parse months/years
  const { monthNumber: fromMonth, yearNumber: fromYear } = getMonthAndYearNumberFromDate(fromDate);
  const { monthNumber: toMonth, yearNumber: toYear } = getMonthAndYearNumberFromDate(toDate);

  // Fetch previous month's categories and line items
  const { data: prevCategories, error: prevCatError } = await supabase
    .from('categories')
    .select('*, line_items(*)')
    .eq('household_id', currentUser.household_id)
    .eq('month', fromMonth)
    .eq('year', fromYear);

  if (prevCatError) {
    return { error: prevCatError };
  }

  // Delete current month's categories (line_items should cascade)
  const { error: delCatError } = await supabase
    .from('categories')
    .delete()
    .eq('household_id', currentUser.household_id)
    .eq('month', toMonth)
    .eq('year', toYear);

  if (delCatError) {
    return { error: delCatError };
  }

  // Insert duplicated categories and line items for the current month
  for (const category of prevCategories || []) {
    // Insert category for current month
    const { data: newCat, error: newCatError } = await supabase
      .from('categories')
      .insert({
        name: category.name,
        household_id: currentUser.household_id,
        month: toMonth,
        year: toYear,
      })
      .select()
      .single();
    if (newCatError) {
      return { error: newCatError };
    }
    // Insert line items for this category
    for (const lineItem of category.line_items || []) {
      const { error: newLineItemError } = await supabase
        .from('line_items')
        .insert({
          name: lineItem.name,
          category_id: newCat.id,
          created_by: currentUser.id,
          planned_amount: lineItem.planned_amount,
          month: toMonth,
          year: toYear,
        });
      if (newLineItemError) {
        return { error: newLineItemError };
      }
    }
  }

  return { success: true };
}; 