'use client';

import { Suspense } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Logo } from '@/components/ui/logo';
import { MonthStepper } from './MonthStepper';
import { UserAvatar } from './UserAvatar';
import { NAV_ITEMS, isNavActive, screenTitle, type NavMode } from './nav';

/**
 * Sticky app header. In top-bar mode it carries the brand and, from the md
 * breakpoint up, the tab nav. Phones use the bottom bar instead, so this row
 * stays a single line: brand, month, and settings.
 */
export function AppHeader({
  mode,
  initial,
  imageUrl,
}: {
  mode: NavMode;
  initial: string;
  imageUrl?: string | null;
}) {
  const pathname = usePathname();
  const isTop = mode === 'top';
  const tabs = [...NAV_ITEMS];

  return (
    <header className='bb-header sticky top-0 z-20 flex min-h-14 flex-none flex-nowrap items-center gap-2 border-b border-[var(--bb-line)] bg-[var(--bb-surface)]'>
      {isTop ? (
        <div className='flex min-w-0 flex-1 items-center gap-3 md:gap-[18px]'>
          <Link
            href='/'
            className='flex min-w-0 items-center gap-2.5 text-[var(--bb-text)] hover:text-[var(--bb-text)]'
          >
            <Logo
              size={25}
              className='flex-none text-[var(--bb-text)]'
            />
            <span className='hidden truncate text-[15.5px] font-semibold tracking-[-0.01em] sm:inline'>
              Budget Brain
            </span>
          </Link>
          <nav className='hidden gap-5 md:flex'>
            {tabs.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className='bb-tab'
                data-on={isNavActive(item.href, pathname)}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      ) : (
        <span className='min-w-0 flex-1 truncate text-[15px] font-semibold tracking-[-0.01em]'>
          {screenTitle(pathname)}
        </span>
      )}

      <div className='ml-auto flex shrink-0 items-center gap-1 md:gap-3.5'>
        <Suspense
          fallback={
            <span className='h-11 w-[148px] rounded-full bg-[var(--bb-surface-2)] md:h-9 md:w-[168px]' />
          }
        >
          <MonthStepper />
        </Suspense>
        <Link
          href='/settings'
          className={`bb-avatar-link rounded-full ${isTop ? '' : 'md:hidden'}`}
          aria-label='Settings'
        >
          <UserAvatar
            initial={initial}
            imageUrl={imageUrl}
            className='size-11 md:size-8 md:text-[12px]'
          />
        </Link>
      </div>
    </header>
  );
}
