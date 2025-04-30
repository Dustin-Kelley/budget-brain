'use server';

import { getCurrentUser } from "@/app/queries/getCurrentUser";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

export const addCategory = async ({categoryName, date}: {categoryName: string, date: string | undefined}) => {

  const { currentUser } = await getCurrentUser();

  if (!currentUser) {
    redirect('/login');
  }

  const supabase = await createClient();

  const currentDate = new Date();
  const monthNumber = date 
    ? new Date(date).getMonth() + 1 
    : currentDate.getMonth() + 1;
  const yearNumber = date 
    ? new Date(date).getFullYear() 
    : currentDate.getFullYear();

  const { data, error } = await supabase.from('categories').insert({
    name: categoryName,
    household_id: currentUser?.household_id,
    month: monthNumber,
    year: yearNumber,
  });

  return { data, error };
};
