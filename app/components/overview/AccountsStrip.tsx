import Link from 'next/link';
import { formatCurrency } from '@/lib/ledger/constants';
import type { Tables } from '@/supabase/supabase';

type Account = Tables<'accounts'>;

export function AccountsStrip({ accounts }: { accounts: Account[] }) {
  if (accounts.length === 0) {
    return (
      <section className='rounded-3xl border bg-card p-6 shadow-md'>
        <h2 className='text-lg font-semibold'>Accounts</h2>
        <p className='mt-2 text-sm text-muted-foreground'>
          No accounts yet.{' '}
          <Link
            href='/accounts'
            className='underline underline-offset-2'
          >
            Add accounts
          </Link>{' '}
          or import a file.
        </p>
      </section>
    );
  }

  return (
    <section className='rounded-3xl border bg-card p-6 shadow-md'>
      <div className='mb-4 flex items-center justify-between gap-2'>
        <div>
          <h2 className='text-lg font-semibold'>Accounts</h2>
          <p className='text-sm text-muted-foreground'>Balances at a glance</p>
        </div>
        <Link
          href='/accounts'
          className='text-sm underline underline-offset-2'
        >
          Manage
        </Link>
      </div>
      <ul className='grid gap-3 sm:grid-cols-2'>
        {accounts.map((account) => (
          <li
            key={account.id}
            className='flex items-start justify-between gap-3 rounded-2xl border px-4 py-3'
          >
            <div className='min-w-0'>
              <div className='truncate font-medium'>{account.name}</div>
              <div className='text-xs text-muted-foreground'>
                {[account.institution, account.purpose.replaceAll('_', ' ')]
                  .filter(Boolean)
                  .join(' · ')}
              </div>
            </div>
            <div className='shrink-0 text-sm font-semibold'>
              {account.current_balance == null
                ? '—'
                : formatCurrency(Number(account.current_balance))}
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
