export const ACCOUNT_PURPOSES = [
  'fixed_spend',
  'discretionary_spend',
  'emergency',
  'investment',
  'other',
] as const;

export type AccountPurpose = (typeof ACCOUNT_PURPOSES)[number];

export const LIFESTYLE_PURPOSES: AccountPurpose[] = [
  'fixed_spend',
  'discretionary_spend',
];

export const WEALTH_PURPOSES: AccountPurpose[] = ['emergency', 'investment'];

export const SPEND_CATEGORY_SEEDS: {
  name: string;
  group_kind: 'fixed' | 'variable' | 'system';
  sort_order: number;
  is_system?: boolean;
}[] = [
  { name: 'Housing', group_kind: 'fixed', sort_order: 10 },
  { name: 'Utilities', group_kind: 'fixed', sort_order: 20 },
  { name: 'Insurance', group_kind: 'fixed', sort_order: 30 },
  { name: 'Subscriptions', group_kind: 'fixed', sort_order: 40 },
  { name: 'Groceries', group_kind: 'variable', sort_order: 50 },
  { name: 'Gas & Transport', group_kind: 'variable', sort_order: 60 },
  { name: 'Dining', group_kind: 'variable', sort_order: 70 },
  { name: 'Entertainment', group_kind: 'variable', sort_order: 80 },
  { name: 'Shopping', group_kind: 'variable', sort_order: 90 },
  { name: 'Health', group_kind: 'variable', sort_order: 100 },
  { name: 'Other', group_kind: 'variable', sort_order: 110 },
  { name: 'Income', group_kind: 'system', sort_order: 200, is_system: true },
  { name: 'Transfer', group_kind: 'system', sort_order: 210, is_system: true },
  { name: 'Savings', group_kind: 'system', sort_order: 220, is_system: true },
  {
    name: 'Investment',
    group_kind: 'system',
    sort_order: 230,
    is_system: true,
  },
];

/** Optional owner presets — data only, not product hardcoding. */
export const DEFAULT_ACCOUNT_PRESETS: {
  name: string;
  institution: string;
  account_type: string;
  purpose: AccountPurpose;
}[] = [
  {
    name: 'Checking',
    institution: 'Wealthfront',
    account_type: 'checking',
    purpose: 'fixed_spend',
  },
  {
    name: 'Emergency Fund',
    institution: 'Wealthfront',
    account_type: 'savings',
    purpose: 'emergency',
  },
  {
    name: 'Investments',
    institution: 'Wealthfront',
    account_type: 'investment',
    purpose: 'investment',
  },
  {
    name: 'Spending',
    institution: 'Crew',
    account_type: 'checking',
    purpose: 'discretionary_spend',
  },
];

export function formatCurrency(amount: number, currency = 'USD') {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function isLifestyleCategory(groupKind: string | null | undefined) {
  return groupKind === 'fixed' || groupKind === 'variable';
}
