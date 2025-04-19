export interface BudgetSummary {
  planned: number;
  spent: number;
  remaining: number;
}

export interface IncomeSource {
  id: string;
  name: string;
  amount: number;
  frequency: 'monthly' | 'biweekly' | 'weekly' | 'one-time';
  startDate: string;
  endDate?: string;
}

export interface Subcategory {
  id: string;
  name: string;
  planned: number;
  spent: number;
  remaining: number;
}

export interface Category {
  id: string;
  name: string;
  planned: number;
  spent: number;
  remaining: number;
  color: string;
  subcategories: Subcategory[];
}

export interface Transaction {
  id: string;
  date: string;
  description: string;
  categoryId: string;
  subcategoryId: string;
  amount: number;
  type: 'expense' | 'income';
  status: 'pending' | 'completed' | 'cancelled';
  notes?: string;
}

export interface BudgetData {
  summary: BudgetSummary;
  income: IncomeSource[];
  categories: Category[];
  recentTransactions: Transaction[];
} 