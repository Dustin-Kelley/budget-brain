'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Logo } from '@/components/ui/logo';
import { Icon } from './Icon';
import { UserAvatar } from './UserAvatar';
import { NAV_ITEMS, SETTINGS_ITEM, isNavActive } from './nav';

export function SideNav({
  initial,
  imageUrl,
}: {
  initial: string;
  imageUrl?: string | null;
}) {
  const pathname = usePathname();

  return (
    <aside className='bb-sidenav sticky top-0 hidden h-dvh w-[228px] flex-none flex-col border-r border-[var(--bb-line)] bg-[var(--bb-side)] md:flex'>
      <Link
        href='/'
        className='flex items-center gap-[11px] px-2 pt-0.5 pb-5 text-[var(--bb-text)] hover:text-[var(--bb-text)]'
      >
        <Logo
          size={30}
          className='flex-none text-[var(--bb-text)]'
        />
        <span className='text-[16.5px] font-semibold tracking-[-0.01em]'>
          Budget Brain
        </span>
      </Link>

      <nav className='flex flex-col gap-[3px]'>
        {NAV_ITEMS.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className='bb-navi'
            data-on={isNavActive(item.href, pathname)}
            aria-current={isNavActive(item.href, pathname) ? 'page' : undefined}
          >
            <Icon
              name={item.icon}
              size={19}
            />
            {item.label}
          </Link>
        ))}
      </nav>

      <div className='mt-auto flex flex-col gap-[3px]'>
        <Link
          href={SETTINGS_ITEM.href}
          className='bb-navi'
          data-on={isNavActive(SETTINGS_ITEM.href, pathname)}
        >
          <Icon
            name={SETTINGS_ITEM.icon}
            size={19}
          />
          {SETTINGS_ITEM.label}
        </Link>
        <div className='mt-2 flex items-center gap-2.5 border-t border-[var(--bb-line)] px-2 pt-3 pb-1'>
          <Link
            href='/settings'
            className='bb-avatar-link rounded-full'
            aria-label='Settings'
          >
            <UserAvatar
              initial={initial}
              imageUrl={imageUrl}
              className='size-[30px] text-[12px]'
            />
          </Link>
          <div className='min-w-0'>
            <div className='text-[13.5px] leading-tight font-semibold'>
              Household
            </div>
            <div className='text-[11.5px] text-[var(--bb-dim)]'>
              Budget Brain
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
