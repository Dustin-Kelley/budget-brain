import { cookies } from 'next/headers';
import { getCurrentUser } from '@/app/queries/getCurrentUser';
import { getAuthUser } from '@/app/queries/getAuthUser';
import { avatarUrlFromMetadata, initialsFromName } from '@/lib/avatar';
import { SideNav } from './SideNav';
import { AppHeader } from './AppHeader';
import { MobileNav } from './MobileNav';
import { NAV_MODE_COOKIE, type NavMode } from './nav';

export async function getNavMode(): Promise<NavMode> {
  const store = await cookies();
  return store.get(NAV_MODE_COOKIE)?.value === 'sidebar' ? 'sidebar' : 'top';
}

/**
 * App chrome. Nav mode comes from a cookie so the correct layout is rendered
 * on the server — no flash of the wrong shell on first paint.
 */
export async function AppShell({ children }: { children: React.ReactNode }) {
  const [mode, { currentUser }, { user }] = await Promise.all([
    getNavMode(),
    getCurrentUser(),
    getAuthUser(),
  ]);

  const initial = initialsFromName(
    currentUser?.first_name,
    currentUser?.last_name,
    currentUser?.email || user.email,
  );
  const imageUrl = avatarUrlFromMetadata(user.user_metadata);

  return (
    <div
      data-nav={mode}
      className='flex min-h-dvh bg-[var(--bb-bg)] text-[var(--bb-text)]'
    >
      {mode === 'sidebar' && (
        <SideNav
          initial={initial}
          imageUrl={imageUrl}
        />
      )}
      <div className='flex min-w-0 flex-1 flex-col'>
        <AppHeader
          mode={mode}
          initial={initial}
          imageUrl={imageUrl}
        />
        <main className='bb-page flex flex-1 flex-col gap-[22px]'>
          {children}
        </main>
        <MobileNav />
      </div>
    </div>
  );
}
