'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Logo } from '@/components/ui/logo';
import { Icon } from './Icon';
import { ThemeCycle } from './ThemeCycle';
import { NAV_ITEMS, SETTINGS_ITEM, isNavActive } from './nav';

export function SideNav({ initial }: { initial: string }) {
  const pathname = usePathname();

  return (
    <aside className='sticky top-0 hidden h-screen w-[228px] flex-none flex-col border-r border-[var(--bb-line)] bg-[var(--bb-side)] p-[20px_14px] md:flex'>
      <Link
        href='/'
        className='flex items-center gap-[11px] px-2 pt-0.5 pb-5 text-[var(--bb-text)] hover:text-[var(--bb-text)]'
      >
        <Logo
          size={30}
          className='flex-none text-[var(--bb-cy-text)]'
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
          <span className='flex size-[30px] flex-none items-center justify-center rounded-full bg-[var(--bb-w2)] text-[13px] font-semibold text-white'>
            {initial}
          </span>
          <div className='min-w-0'>
            <div className='text-[13.5px] leading-tight font-semibold'>
              Household
            </div>
            <div className='text-[11.5px] text-[var(--bb-dim)]'>
              Budget Brain
            </div>
          </div>
          <ThemeCycle className='ml-auto' />
        </div>
      </div>
    </aside>
  );
}
