'use client';

import { Suspense } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Logo } from '@/components/ui/logo';
import { ThemeCycle } from './ThemeCycle';
import { MonthStepper } from './MonthStepper';
import {
  NAV_ITEMS,
  SETTINGS_ITEM,
  isNavActive,
  screenTitle,
  type NavMode,
} from './nav';

/**
 * Sticky app header. In top-bar mode it carries the brand and the tab nav; in
 * sidebar mode it carries just the screen title. On narrow screens it always
 * shows the tabs, since the sidebar is hidden there.
 */
export function AppHeader({
  mode,
  initial,
}: {
  mode: NavMode;
  initial: string;
}) {
  const pathname = usePathname();
  const isTop = mode === 'top';
  const tabs = [...NAV_ITEMS, SETTINGS_ITEM];

  return (
    <header className='sticky top-0 z-10 flex min-h-[58px] flex-none flex-wrap items-center gap-x-5 gap-y-2 border-b border-[var(--bb-line)] bg-[var(--bb-surface)] px-4 py-2 sm:px-6'>
      {isTop ? (
        <div className='flex min-w-0 items-center gap-[18px]'>
          <Link
            href='/'
            className='flex items-center gap-2.5 text-[var(--bb-text)] hover:text-[var(--bb-text)]'
          >
            <Logo
              size={25}
              className='flex-none text-[var(--bb-cy-text)]'
            />
            <span className='text-[15.5px] font-semibold tracking-[-0.01em]'>
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
        <span className='text-[15px] font-semibold tracking-[-0.01em]'>
          {screenTitle(pathname)}
        </span>
      )}

      <div className='ml-auto flex items-center gap-3.5'>
        <ThemeCycle size={19} />
        <Suspense
          fallback={
            <span className='h-[30px] w-[150px] rounded-[9px] bg-[var(--bb-surface-2)]' />
          }
        >
          <MonthStepper />
        </Suspense>
        {isTop && (
          <span className='hidden size-7 flex-none items-center justify-center rounded-full bg-[var(--bb-w2)] text-[12.5px] font-semibold text-white sm:flex'>
            {initial}
          </span>
        )}
      </div>

      {/* The sidebar is hidden below md, so the tabs carry navigation there. */}
      <nav className='-mx-4 flex w-[calc(100%+2rem)] gap-5 overflow-x-auto px-4 pb-0.5 md:hidden'>
        {tabs.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className='bb-tab whitespace-nowrap'
            data-on={isNavActive(item.href, pathname)}
          >
            {item.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}
