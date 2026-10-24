import type {
  BudgetGroup,
  BudgetIncome,
  BudgetKind,
  BudgetMonth,
  BudgetTransaction,
  BudgetView,
} from './types';

/** Grayscale shades for group charts. Green and red stay semantic. */
export const BUDGET_GROUP_COLORS = [
  'var(--bb-g1)',
  'var(--bb-g2)',
  'var(--bb-g3)',
  'var(--bb-g4)',
  'var(--bb-g5)',
  'var(--bb-g6)',
  'var(--bb-g2)',
  'var(--bb-g3)',
  'var(--bb-g4)',
  'var(--bb-g5)',
] as const;

export function groupColor(index: number) {
  return BUDGET_GROUP_COLORS[index % BUDGET_GROUP_COLORS.length];
}

export function money(value: unknown) {
  const numeric = typeof value === 'number' ? value : Number(value);
  if (!Number.isFinite(numeric)) return 0;
  return Math.round(numeric * 100) / 100;
}

export function isZeroBased(left: number) {
  return Math.abs(left) < 0.005;
}

export function kindFromType(type: string | null | undefined): BudgetKind {
  if (type === 'income') return 'income';
  return 'expense';
}

export function budgetTotals(input: {
  income: BudgetIncome[];
  groups: BudgetGroup[];
  transactions: BudgetTransaction[];
}) {
  let income = 0;
  for (const row of input.income) income += row.amount;

  let budgeted = 0;
  for (const group of input.groups) {
    for (const item of group.items) budgeted += item.planned;
  }

  let spent = 0;
  let unassignedSpent = 0;
  for (const txn of input.transactions) {
    if (txn.kind !== 'expense') continue;
    spent += txn.amount;
    if (!txn.lineItemId) unassignedSpent += txn.amount;
  }

  return {
    income: money(income),
    budgeted: money(budgeted),
    spent: money(spent),
    unassignedSpent: money(unassignedSpent),
    left: money(income - budgeted),
  };
}

export type GroupFigure = {
  id: string;
  name: string;
  planned: number;
  spent: number;
  remaining: number;
  color: string;
};

export function spentByItemId(transactions: BudgetTransaction[]) {
  const spent = new Map<string, number>();
  for (const txn of transactions) {
    if (txn.kind !== 'expense' || !txn.lineItemId) continue;
    const current = spent.get(txn.lineItemId) ?? 0;
    spent.set(txn.lineItemId, current + txn.amount);
  }
  return spent;
}

export function groupFigures(budget: Pick<BudgetMonth, 'groups' | 'transactions'>) {
  const spent = spentByItemId(budget.transactions);
  return budget.groups.map((group, index) => {
    let planned = 0;
    let groupSpent = 0;
    for (const item of group.items) {
      planned += item.planned;
      groupSpent += spent.get(item.id) ?? 0;
    }
    return {
      id: group.id,
      name: group.name,
      planned: money(planned),
      spent: money(groupSpent),
      remaining: money(planned - groupSpent),
      color: groupColor(index),
    } satisfies GroupFigure;
  });
}

export function figureFor(view: BudgetView, planned: number, spent: number) {
  if (view === 'planned') return planned;
  if (view === 'spent') return spent;
  return money(planned - spent);
}

export function itemActivity(
  transactions: BudgetTransaction[],
  itemId: string,
) {
  return transactions.filter((txn) => txn.lineItemId === itemId);
}

export function transactionTitle(description: string) {
  return description.trim() || 'Transaction';
}

export function unassignedCount(transactions: BudgetTransaction[]) {
  let count = 0;
  for (const txn of transactions) {
    if (!txn.lineItemId) count += 1;
  }
  return count;
}

export function accountActivity(
  transactions: BudgetTransaction[],
  accountId: string,
) {
  const rows = transactions.filter((txn) => txn.accountId === accountId);
  let spent = 0;
  let income = 0;
  for (const txn of rows) {
    if (txn.kind === 'income') {
      income += txn.amount;
    } else {
      spent += txn.amount;
    }
  }
  return {
    rows,
    spent: money(spent),
    income: money(income),
  };
}
