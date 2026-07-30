import { cookies } from 'next/headers';
import { getCurrentUser } from '@/app/queries/getCurrentUser';
import { SideNav } from './SideNav';
import { AppHeader } from './AppHeader';
import { NAV_MODE_COOKIE, type NavMode } from './nav';

export async function getNavMode(): Promise<NavMode> {
  const store = await cookies();
  return store.get(NAV_MODE_COOKIE)?.value === 'top' ? 'top' : 'sidebar';
}

/**
 * App chrome. Nav mode comes from a cookie so the correct layout is rendered
 * on the server — no flash of the wrong shell on first paint.
 */
export async function AppShell({ children }: { children: React.ReactNode }) {
  const [mode, { currentUser }] = await Promise.all([
    getNavMode(),
    getCurrentUser(),
  ]);

  const initial = (currentUser?.first_name || currentUser?.email || 'B')
    .charAt(0)
    .toUpperCase();

  return (
    <div
      data-nav={mode}
      className='flex min-h-screen bg-[var(--bb-bg)] text-[var(--bb-text)]'
    >
      {mode === 'sidebar' && <SideNav initial={initial} />}
      <div className='flex min-w-0 flex-1 flex-col'>
        <AppHeader
          mode={mode}
          initial={initial}
        />
        <main className='bb-page flex flex-1 flex-col gap-[22px]'>
          {children}
        </main>
      </div>
    </div>
  );
}
