import { createClient } from "@/utils/supabase/server";
import { getCurrentUser } from "./getCurrentUser";
import { redirect } from "next/navigation";
export async function getCategories() {
  const supabase = await createClient();
  const { currentUser } = await getCurrentUser();

  if (!currentUser) {
    redirect("/login");
  }

  const { data, error } = await supabase
    .from("categories")
    .select("*, line_items(*)")
    .eq("household_id", currentUser.household_id);

  if (error) {
    console.error(error);
  }

  return { data, error };
}
