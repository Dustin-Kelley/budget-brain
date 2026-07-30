import { Suspense } from 'react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/app/queries/getCurrentUser';
import { getAccounts } from '@/app/queries/getAccounts';
import { getNavMode } from '@/components/shell/AppShell';
import { Icon } from '@/components/shell/Icon';
import { Skeleton } from '@/components/ui/skeleton';
import LogoutButton from '@/components/app/LogoutButton';
import { ResetBudgetButton } from '@/app/components/ResetBudgetButton';
import { AppearanceSettings } from './components/AppearanceSettings';
import { HouseHold } from './components/HouseHold';
import { Profile } from './components/Profile';

export default async function SettingsPage({
  searchParams,
}: {
  searchParams: Promise<{ month?: string }>;
}) {
  const { month } = await searchParams;
  const [{ currentUser }, navMode] = await Promise.all([
    getCurrentUser(),
    getNavMode(),
  ]);

  if (!currentUser) redirect('/welcome');

  return (
    <div className='flex max-w-[820px] flex-col gap-[30px]'>
      <div>
        <span className='bb-kicker'>Settings</span>
        <h1 className='bb-title mt-1.5'>Appearance</h1>
        <p className='mt-1.5 text-[14px] text-[var(--bb-sub)]'>
          Pick a theme, and choose whether the app navigates from a sidebar or a
          top bar. Both apply the moment you tap them.
        </p>
      </div>

      <AppearanceSettings navMode={navMode} />

      <section>
        <div className='bb-kicker mb-3'>Connections</div>
        <Suspense fallback={<Skeleton className='h-32 rounded-2xl' />}>
          <Connections />
        </Suspense>
      </section>

      <section>
        <div className='bb-kicker mb-3'>Preferences</div>
        <div className='bb-card px-[22px] py-2'>
          <div className='bb-row'>
            <span className='flex-1'>Currency</span>
            <span className='text-[var(--bb-sub)]'>US dollar · $</span>
          </div>
          <div className='bb-row'>
            <span className='flex-1'>Month starts on</span>
            <span className='text-[var(--bb-sub)]'>The 1st</span>
          </div>
          <div className='bb-row bb-row-last'>
            <span className='flex-1'>Period used across the app</span>
            <span className='text-[var(--bb-sub)]'>Calendar month</span>
          </div>
        </div>
        <p className='mt-2 text-[12px] text-[var(--bb-dim)]'>
          These are fixed for now. Making them editable is a follow-up.
        </p>
      </section>

      <section className='flex flex-col gap-4'>
        <div className='bb-kicker'>Household &amp; profile</div>
        <Suspense fallback={<Skeleton className='h-40 rounded-2xl' />}>
          <HouseHold />
        </Suspense>
        <Suspense fallback={<Skeleton className='h-40 rounded-2xl' />}>
          <Profile />
        </Suspense>
      </section>

      <section>
        <div className='bb-kicker mb-3'>Danger zone</div>
        <div className='bb-card flex flex-wrap items-center gap-3 px-6 py-5'>
          <p className='min-w-[220px] flex-1 text-[13px] text-[var(--bb-sub)]'>
            Resetting clears the envelope plan for the selected month. It does
            not touch imported ledger transactions.
          </p>
          <ResetBudgetButton month={month} />
          <LogoutButton />
        </div>
      </section>

      <div className='flex items-center gap-3.5 border-t border-[var(--bb-line)] pt-4'>
        <span className='text-[12.5px] text-[var(--bb-dim)]'>
          Appearance changes apply immediately on this device.
        </span>
      </div>
    </div>
  );
}

async function Connections() {
  const { accounts } = await getAccounts();

  return (
    <div className='bb-card px-[22px] pt-2 pb-4'>
      {accounts.length === 0 ? (
        <p className='py-6 text-[13.5px] text-[var(--bb-sub)]'>
          No accounts connected yet.
        </p>
      ) : (
        accounts.map((account) => (
          <div
            key={account.id}
            className='bb-row'
          >
            <Icon
              name={
                account.purpose === 'discretionary_spend' ? 'wallet' : 'bank'
              }
              size={19}
              className='flex-none'
              color={
                account.purpose === 'discretionary_spend'
                  ? 'var(--bb-mg-text)'
                  : 'var(--bb-cy-text)'
              }
            />
            <span className='min-w-0 flex-1 truncate'>
              {account.institution
                ? `${account.institution} — ${account.name}`
                : account.name}
            </span>
            <span className='hidden text-[12.5px] text-[var(--bb-dim)] sm:inline'>
              {account.purpose.replaceAll('_', ' ')}
            </span>
            <Link href='/accounts'>Manage</Link>
          </div>
        ))
      )}
      <div className='pt-4'>
        <Link
          href='/accounts'
          className='bb-ghost'
        >
          <Icon
            name='plus'
            size={15}
          />
          Connect an account
        </Link>
      </div>
    </div>
  );
}
