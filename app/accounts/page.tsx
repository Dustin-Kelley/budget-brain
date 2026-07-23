import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/app/queries/getCurrentUser';
import { getAccounts } from '@/app/queries/getAccounts';
import { getSpendCategories } from '@/app/queries/getSpendCategories';
import { createAccount, updateAccountBalance } from '@/app/mutations/accountMutations';
import { importLedgerFile } from '@/app/mutations/importLedgerFile';
import { ACCOUNT_PURPOSES, formatCurrency } from '@/lib/ledger/constants';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default async function AccountsPage({
  searchParams,
}: {
  searchParams: Promise<{ imported?: string; skipped?: string; error?: string }>;
}) {
  const { currentUser } = await getCurrentUser();
  if (!currentUser) redirect('/welcome');

  const params = await searchParams;
  const [{ accounts }, { categories }] = await Promise.all([
    getAccounts(),
    getSpendCategories(),
  ]);

  return (
    <main className='flex flex-col gap-6'>
      <div>
        <h1 className='text-2xl font-bold tracking-tight'>Accounts</h1>
        <p className='text-sm text-muted-foreground'>
          Link your money pots and import CSV / QFX / OFX files. Bank Link (Plaid)
          comes next.
        </p>
      </div>

      {params.error && (
        <p className='rounded-2xl border border-rose-300 bg-rose-50 px-4 py-3 text-sm text-rose-800 dark:border-rose-900 dark:bg-rose-950 dark:text-rose-200'>
          {decodeURIComponent(params.error)}
        </p>
      )}
      {params.imported && (
        <p className='rounded-2xl border border-emerald-300 bg-emerald-50 px-4 py-3 text-sm text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-200'>
          Imported {params.imported} transaction
          {params.imported === '1' ? '' : 's'}
          {params.skipped && Number(params.skipped) > 0
            ? ` (${params.skipped} duplicate${params.skipped === '1' ? '' : 's'} skipped)`
            : ''}
          .
        </p>
      )}

      <section className='rounded-3xl border bg-card p-6 shadow-md'>
        <h2 className='mb-4 text-lg font-semibold'>Import file</h2>
        <form
          action={async (formData) => {
            'use server';
            const result = await importLedgerFile(formData);
            const { redirect: redir } = await import('next/navigation');
            if (result.error) {
              redir(
                `/accounts?error=${encodeURIComponent(result.error)}`,
              );
            }
            redir(
              `/accounts?imported=${result.imported ?? 0}&skipped=${result.skipped ?? 0}`,
            );
          }}
          className='grid gap-4 sm:grid-cols-2'
        >
          <div className='grid gap-2 sm:col-span-2'>
            <Label htmlFor='file'>CSV, OFX, or QFX file</Label>
            <Input
              id='file'
              name='file'
              type='file'
              accept='.csv,.ofx,.qfx,text/csv,application/x-ofx,application/vnd.intu.qfx'
              required
            />
          </div>
          <div className='grid gap-2'>
            <Label htmlFor='account_id'>Destination account</Label>
            <select
              id='account_id'
              name='account_id'
              required
              className='border-input bg-background h-9 w-full rounded-md border px-3 text-sm'
              defaultValue=''
            >
              <option
                value=''
                disabled
              >
                Select account
              </option>
              {accounts.map((account) => (
                <option
                  key={account.id}
                  value={account.id}
                >
                  {account.institution
                    ? `${account.institution} — ${account.name}`
                    : account.name}
                </option>
              ))}
            </select>
          </div>
          <div className='grid gap-2'>
            <Label htmlFor='spend_category_id'>
              Default category for outflows (optional)
            </Label>
            <select
              id='spend_category_id'
              name='spend_category_id'
              className='border-input bg-background h-9 w-full rounded-md border px-3 text-sm'
              defaultValue='none'
            >
              <option value='none'>Leave uncategorized</option>
              {categories
                .filter((c) => c.group_kind !== 'system')
                .map((category) => (
                  <option
                    key={category.id}
                    value={category.id}
                  >
                    {category.name}
                  </option>
                ))}
            </select>
          </div>
          <div className='sm:col-span-2'>
            <Button type='submit'>Import transactions</Button>
          </div>
        </form>
      </section>

      <section className='rounded-3xl border bg-card p-6 shadow-md'>
        <h2 className='mb-4 text-lg font-semibold'>Your accounts</h2>
        <ul className='flex flex-col gap-4'>
          {accounts.map((account) => (
            <li
              key={account.id}
              className='flex flex-col gap-3 rounded-2xl border p-4 sm:flex-row sm:items-end sm:justify-between'
            >
              <div>
                <div className='font-medium'>{account.name}</div>
                <div className='text-xs text-muted-foreground'>
                  {[account.institution, account.purpose.replaceAll('_', ' '), account.account_type]
                    .filter(Boolean)
                    .join(' · ')}
                </div>
                <div className='mt-1 text-sm'>
                  Balance:{' '}
                  <span className='font-semibold'>
                    {account.current_balance == null
                      ? '—'
                      : formatCurrency(Number(account.current_balance))}
                  </span>
                </div>
              </div>
              <form
                action={async (formData) => {
                  'use server';
                  await updateAccountBalance(formData);
                }}
                className='flex items-end gap-2'
              >
                <input
                  type='hidden'
                  name='account_id'
                  value={account.id}
                />
                <div className='grid gap-1'>
                  <Label
                    htmlFor={`balance-${account.id}`}
                    className='text-xs'
                  >
                    Update balance
                  </Label>
                  <Input
                    id={`balance-${account.id}`}
                    name='current_balance'
                    type='number'
                    step='0.01'
                    className='w-36'
                    defaultValue={
                      account.current_balance != null
                        ? String(account.current_balance)
                        : ''
                    }
                  />
                </div>
                <Button
                  type='submit'
                  variant='outline'
                  size='sm'
                >
                  Save
                </Button>
              </form>
            </li>
          ))}
        </ul>
      </section>

      <section className='rounded-3xl border bg-card p-6 shadow-md'>
        <h2 className='mb-4 text-lg font-semibold'>Add account</h2>
        <form
          action={async (formData) => {
            'use server';
            await createAccount(formData);
          }}
          className='grid gap-4 sm:grid-cols-2'
        >
          <div className='grid gap-2'>
            <Label htmlFor='name'>Name</Label>
            <Input
              id='name'
              name='name'
              required
              placeholder='Checking'
            />
          </div>
          <div className='grid gap-2'>
            <Label htmlFor='institution'>Institution</Label>
            <Input
              id='institution'
              name='institution'
              placeholder='e.g. Wealthfront, Crew, Chase'
            />
          </div>
          <div className='grid gap-2'>
            <Label htmlFor='purpose'>Purpose</Label>
            <select
              id='purpose'
              name='purpose'
              className='border-input bg-background h-9 w-full rounded-md border px-3 text-sm'
              defaultValue='other'
            >
              {ACCOUNT_PURPOSES.map((purpose) => (
                <option
                  key={purpose}
                  value={purpose}
                >
                  {purpose.replaceAll('_', ' ')}
                </option>
              ))}
            </select>
          </div>
          <div className='grid gap-2'>
            <Label htmlFor='account_type'>Type</Label>
            <select
              id='account_type'
              name='account_type'
              className='border-input bg-background h-9 w-full rounded-md border px-3 text-sm'
              defaultValue='checking'
            >
              <option value='checking'>Checking</option>
              <option value='savings'>Savings</option>
              <option value='investment'>Investment</option>
              <option value='credit'>Credit</option>
              <option value='other'>Other</option>
            </select>
          </div>
          <div className='grid gap-2'>
            <Label htmlFor='current_balance'>Balance (optional)</Label>
            <Input
              id='current_balance'
              name='current_balance'
              type='number'
              step='0.01'
            />
          </div>
          <div className='flex items-end'>
            <Button type='submit'>Add account</Button>
          </div>
        </form>
      </section>
    </main>
  );
}
