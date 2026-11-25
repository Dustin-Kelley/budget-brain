'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Icon } from './Icon';
import { NAV_ITEMS, isNavActive } from './nav';

/**
 * Thumb-reach navigation for phones. Desktop keeps the header tabs or sidebar.
 */
export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav
      className='bb-tabbar md:hidden'
      aria-label='Primary'
    >
      {NAV_ITEMS.map((item) => {
        const on = isNavActive(item.href, pathname);
        return (
          <Link
            key={item.href}
            href={item.href}
            className='bb-tabbar-item'
            data-on={on}
            aria-current={on ? 'page' : undefined}
          >
            <Icon
              name={item.icon}
              size={22}
            />
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
