import { createClient } from "@/utils/supabase/server";
import { getAuthUser } from "./getAuthUser";

export async function getCurrentUser() {
  const supabase = await createClient()
 const { user } = await getAuthUser()

 const {data} = await supabase.from('users').select('*').eq('id', user?.id).single()
 
 return {currentUser: data}
} 