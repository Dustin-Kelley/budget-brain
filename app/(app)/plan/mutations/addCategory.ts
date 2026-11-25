'use server';

import { getCurrentUser } from '@/app/queries/getCurrentUser';
import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import { getMonthAndYearNumberFromDate } from '@/lib/utils';
import { insertCategory } from '@/lib/budget/writeCategory';
import { nextCategoryColorKey } from '@/lib/category-colors';
import { listCategoryColorSlots } from '@/app/queries/categoryColors';
export const addCategory = async ({
  categoryName,
  date,
}: {
  categoryName: string;
  date: string | undefined;
}) => {
  const { currentUser } = await getCurrentUser();

  if (!currentUser) {
    redirect('/welcome');
  }

  const supabase = await createClient();

  const { monthNumber, yearNumber } = getMonthAndYearNumberFromDate(date);
  const householdId = currentUser.household_id;
  const slots = await listCategoryColorSlots(
    supabase,
    householdId,
    monthNumber,
    yearNumber,
  );
  const color = slots.error ? null : nextCategoryColorKey(slots.rows);

  const { data, error } = await insertCategory(supabase, {
    name: categoryName,
    household_id: householdId,
    month: monthNumber,
    year: yearNumber,
    color,
  });

  return { data, error };
};
