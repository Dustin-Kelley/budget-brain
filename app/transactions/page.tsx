import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/app/queries/getCurrentUser';
import { getLedgerTransactions } from '@/app/queries/getLedgerTransactions';
import { getSpendCategories } from '@/app/queries/getSpendCategories';
import { getAccounts } from '@/app/queries/getAccounts';
import { updateLedgerCategory } from '@/app/mutations/importLedgerFile';
import { MonthSelector } from '@/app/components/MonthSelector';
import { formatCurrency } from '@/lib/ledger/constants';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default async function TransactionsPage({
  searchParams,
}: {
  searchParams: Promise<{ month?: string; account?: string }>;
}) {
  const { currentUser } = await getCurrentUser();
  if (!currentUser) redirect('/welcome');

  const { month, account } = await searchParams;
  const [{ transactions }, { categories }, { accounts }] = await Promise.all([
    getLedgerTransactions({ month, accountId: account, limit: 200 }),
    getSpendCategories(),
    getAccounts(),
  ]);

  return (
    <main className='flex flex-col gap-6'>
      <div className='flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between'>
        <div>
          <h1 className='text-2xl font-bold tracking-tight'>Transactions</h1>
          <p className='text-sm text-muted-foreground'>
            Unified ledger across accounts
          </p>
        </div>
        <div className='flex flex-wrap items-center gap-2'>
          <MonthSelector selectedMonth={month} />
          <Button
            asChild
            variant='outline'
          >
            <Link href='/accounts'>Import</Link>
          </Button>
        </div>
      </div>

      <div className='flex flex-wrap gap-2'>
        <FilterChip
          href={month ? `/transactions?month=${month}` : '/transactions'}
          active={!account}
          label='All accounts'
        />
        {accounts.map((acct) => {
          const href = month
            ? `/transactions?month=${month}&account=${acct.id}`
            : `/transactions?account=${acct.id}`;
          return (
            <FilterChip
              key={acct.id}
              href={href}
              active={account === acct.id}
              label={acct.name}
            />
          );
        })}
      </div>

      <section className='rounded-3xl border bg-card shadow-md'>
        {transactions.length === 0 ? (
          <p className='p-6 text-sm text-muted-foreground'>
            No transactions in this period. Import a file from Accounts.
          </p>
        ) : (
          <ul className='divide-y'>
            {transactions.map((txn) => {
              const accountName = (txn.account as { name?: string } | null)
                ?.name;
              return (
                <li
                  key={txn.id}
                  className='flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between'
                >
                  <div className='min-w-0'>
                    <div className='truncate font-medium'>
                      {txn.description || 'Transaction'}
                    </div>
                    <div className='text-xs text-muted-foreground'>
                      {txn.posted_at}
                      {accountName ? ` · ${accountName}` : ''}
                      {txn.source ? ` · ${txn.source}` : ''}
                    </div>
                  </div>
                  <div className='flex flex-wrap items-center gap-3 sm:justify-end'>
                    <span
                      className={
                        Number(txn.amount) >= 0
                          ? 'font-semibold text-emerald-600 dark:text-emerald-400'
                          : 'font-semibold'
                      }
                    >
                      {formatCurrency(Number(txn.amount))}
                    </span>
                    <form
                      action={async (formData) => {
                        'use server';
                        await updateLedgerCategory(formData);
                      }}
                      className='flex items-center gap-2'
                    >
                      <input
                        type='hidden'
                        name='transaction_id'
                        value={txn.id}
                      />
                      <select
                        name='spend_category_id'
                        defaultValue={txn.spend_category_id ?? 'none'}
                        className='border-input bg-background h-8 rounded-md border px-2 text-xs'
                      >
                        <option value='none'>Uncategorized</option>
                        {categories.map((category) => (
                          <option
                            key={category.id}
                            value={category.id}
                          >
                            {category.name}
                          </option>
                        ))}
                      </select>
                      <Button
                        type='submit'
                        size='sm'
                        variant='ghost'
                      >
                        Save
                      </Button>
                    </form>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </main>
  );
}

function FilterChip({
  href,
  active,
  label,
}: {
  href: string;
  active: boolean;
  label: string;
}) {
  return (
    <Link
      href={href}
      className={
        active
          ? 'rounded-full border border-foreground bg-foreground px-3 py-1 text-xs text-background'
          : 'rounded-full border px-3 py-1 text-xs text-muted-foreground hover:text-foreground'
      }
    >
      {label}
    </Link>
  );
}
