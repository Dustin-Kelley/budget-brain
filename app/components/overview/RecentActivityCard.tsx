import Link from 'next/link';
import { formatCurrency } from '@/lib/ledger/constants';

type RecentTxn = {
  id: string;
  posted_at: string;
  amount: number;
  description: string | null;
  account: { name: string } | null;
  category: { name: string } | null;
};

export function RecentActivityCard({
  transactions,
}: {
  transactions: RecentTxn[];
}) {
  return (
    <section className='rounded-3xl border bg-card p-6 shadow-md'>
      <div className='mb-4 flex items-center justify-between gap-2'>
        <div>
          <h2 className='text-lg font-semibold'>Recent activity</h2>
          <p className='text-sm text-muted-foreground'>This period</p>
        </div>
        <Link
          href='/transactions'
          className='text-sm underline underline-offset-2'
        >
          View all
        </Link>
      </div>

      {transactions.length === 0 ? (
        <p className='text-sm text-muted-foreground'>
          No ledger activity yet. Import a CSV or QFX from{' '}
          <Link
            href='/accounts'
            className='underline underline-offset-2'
          >
            Accounts
          </Link>
          .
        </p>
      ) : (
        <ul className='divide-y'>
          {transactions.slice(0, 8).map((txn) => (
            <li
              key={txn.id}
              className='flex items-center justify-between gap-3 py-3 text-sm'
            >
              <div className='min-w-0'>
                <div className='truncate font-medium'>
                  {txn.description || 'Transaction'}
                </div>
                <div className='text-xs text-muted-foreground'>
                  {txn.posted_at}
                  {txn.account?.name ? ` · ${txn.account.name}` : ''}
                  {txn.category?.name ? ` · ${txn.category.name}` : ''}
                </div>
              </div>
              <span
                className={
                  txn.amount >= 0
                    ? 'shrink-0 font-medium text-emerald-600 dark:text-emerald-400'
                    : 'shrink-0 font-medium'
                }
              >
                {formatCurrency(txn.amount)}
              </span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
