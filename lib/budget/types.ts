export type BudgetKind = 'expense' | 'income';

export type BudgetView = 'planned' | 'spent' | 'remaining';

export type BudgetIncome = {
  id: string;
  name: string;
  amount: number;
};

export type BudgetItem = {
  id: string;
  name: string;
  planned: number;
};

export type BudgetGroup = {
  id: string;
  name: string;
  items: BudgetItem[];
};

export type BudgetTransaction = {
  id: string;
  amount: number;
  date: string | null;
  description: string;
  lineItemId: string | null;
  lineItemName: string | null;
  groupName: string | null;
  kind: BudgetKind;
};

export type BudgetMonth = {
  monthParam: string;
  monthLabel: string;
  previousMonthParam: string;
  previousMonthLabel: string;
  canCopyPrevious: boolean;
  income: BudgetIncome[];
  groups: BudgetGroup[];
  transactions: BudgetTransaction[];
  loadError: string | null;
};

export type TransactionDraft = {
  id?: string;
  amount: string;
  description: string;
  date: string;
  lineItemId: string;
  kind: BudgetKind;
};
