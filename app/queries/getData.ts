import { createClient } from "@/utils/supabase/server"

export const getData = async () => {
  const supabase = await createClient()
  const { data } = await supabase.from('instruments').select('*')
  console.log("🚀 ~ getData ~ data:", data)
  return data
}

