'use server';

import { createClient } from '@/utils/supabase/server';
import { getCurrentUser } from '@/app/queries/getCurrentUser';
import { redirect } from 'next/navigation';
import { getMonthAndYearNumberFromDate } from '@/lib/utils';
import { insertCategory } from '@/lib/budget/writeCategory';
import { resolveCategoryColorKey } from '@/lib/category-colors';

export const rolloverBudget = async ({ fromDate, toDate }: { fromDate: string; toDate: string }) => {
  const supabase = await createClient();
  const { currentUser } = await getCurrentUser();

  if (!currentUser) {
    redirect('/welcome');
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
    .eq('year', fromYear)
    .order('created_at', { ascending: true })
    .order('id', { ascending: true });
    
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
  for (const [index, category] of (prevCategories || []).entries()) {
    // Insert category for current month, keeping the color the user already picked.
    const { data: newCat, error: newCatError } = await insertCategory(
      supabase,
      {
        name: category.name,
        household_id: currentUser.household_id,
        month: toMonth,
        year: toYear,
        color: resolveCategoryColorKey(category.color, index),
      },
    );
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

  // Fetch previous month's income
  const { data: prevIncome, error: prevIncomeError } = await supabase
    .from('income')
    .select('*')
    .eq('household_id', currentUser.household_id)
    .eq('month', fromMonth)
    .eq('year', fromYear);

  if (prevIncomeError) {
    return { error: prevIncomeError };
  }

  // Delete current month's income
  const { error: delIncomeError } = await supabase
    .from('income')
    .delete()
    .eq('household_id', currentUser.household_id)
    .eq('month', toMonth)
    .eq('year', toYear);

  if (delIncomeError) {
    return { error: delIncomeError };
  }

  // Insert previous month's income for the current month
  for (const income of prevIncome || []) {
    const { error: newIncomeError } = await supabase
      .from('income')
      .insert({
        ...income,
        id: undefined, // Let the DB generate a new ID
        month: toMonth,
        year: toYear,
        created_at: undefined,
        updated_at: undefined,
      });
    if (newIncomeError) {
      return { error: newIncomeError };
    }
  }

  return { success: true };
};

