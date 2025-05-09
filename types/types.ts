import { Database } from "@/types/supabase";

// Example: type for a row in the transactions table
export type Transaction = Database['public']['Tables']['transactions']['Row']; 

export type LineItem = Database['public']['Tables']['line_items']['Row'];

export type Category = Database['public']['Tables']['categories']['Row'];

export type CategoryWithLineItems = Category & {
  line_items: LineItem[];
};
