export type NavMode = 'sidebar' | 'top';

export const NAV_MODE_COOKIE = 'bb-nav';

export const NAV_ITEMS = [
  { href: '/', label: 'Overview', icon: 'squares-four' },
  { href: '/allocation', label: 'Allocation', icon: 'chart-donut' },
  { href: '/accounts', label: 'Accounts', icon: 'bank' },
  { href: '/transactions', label: 'Transactions', icon: 'arrows-left-right' },
  { href: '/plan', label: 'Plan', icon: 'target' },
] as const;

export const SETTINGS_ITEM = {
  href: '/settings',
  label: 'Settings',
  icon: 'gear',
} as const;

export type NavItem = (typeof NAV_ITEMS)[number] | typeof SETTINGS_ITEM;

export function screenTitle(pathname: string): string {
  const match = [...NAV_ITEMS, SETTINGS_ITEM].find((item) =>
    item.href === '/' ? pathname === '/' : pathname.startsWith(item.href),
  );
  return match?.label ?? 'Budget Brain';
}

export function isNavActive(href: string, pathname: string): boolean {
  return href === '/' ? pathname === '/' : pathname.startsWith(href);
}
