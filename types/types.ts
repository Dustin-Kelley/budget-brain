type LineItem = {
  id: string;
  category_id: string;
  name: string | null;
  month: number | null;
  year: number | null;
  planned_amount: number | null;
  spent_amount: number | null;
  created_by: string | null;
  created_at: string;
  updated_at: string | null;
};

export type Category = {
  id: string;
  household_id: string;
  name: string | null;
  created_at: string;
  updated_at: string | null;
  color?: string;
  month?: number | null;
  year?: number | null;
  planned_amount?: number | null;
  spent_amount?: number | null;
  line_items: LineItem[];
};