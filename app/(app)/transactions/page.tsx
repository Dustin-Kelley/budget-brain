import { Suspense } from 'react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/app/queries/getCurrentUser';
import { getLedgerTransactions } from '@/app/queries/getLedgerTransactions';
import { getSpendCategories } from '@/app/queries/getSpendCategories';
import { getAccounts } from '@/app/queries/getAccounts';
import { formatCurrency } from '@/lib/ledger/constants';
import { BUCKET_LABELS, bucketFor, type Bucket } from '@/lib/ledger/buckets';
import { Icon } from '@/components/shell/Icon';
import { Skeleton } from '@/components/ui/skeleton';
import { CategorySelect } from './components/CategorySelect';
import { SearchField } from './components/SearchField';

const PAGE_SIZE = 25;

type Params = {
  month?: string;
  account?: string;
  bucket?: string;
  q?: string;
  show?: string;
};

export default async function TransactionsPage({
  searchParams,
}: {
  searchParams: Promise<Params>;
}) {
  const params = await searchParams;
  const { currentUser } = await getCurrentUser();

  if (!currentUser) redirect('/welcome');

  return (
    <div className='flex flex-col gap-[18px]'>
      <Suspense
        key={JSON.stringify(params)}
        fallback={<Skeleton className='h-[600px] rounded-2xl' />}
      >
        <TransactionsBody params={params} />
      </Suspense>
    </div>
  );
}

async function TransactionsBody({ params }: { params: Params }) {
  const [{ transactions }, { categories }, { accounts }] = await Promise.all([
    // Bucket and text filters derive from joined rows, so the period is pulled
    // once and narrowed in memory rather than round-tripping per filter.
    getLedgerTransactions({
      month: params.month,
      accountId: params.account,
      limit: 500,
    }),
    getSpendCategories(),
    getAccounts(),
  ]);

  const rows = transactions.map((txn) => {
    const category = txn.category as {
      id: string;
      name: string;
      group_kind: string;
    } | null;
    const account = txn.account as { id: string; name: string } | null;
    const amount = Number(txn.amount);

    return {
      id: txn.id as string,
      date: txn.posted_at as string,
      description: (txn.description as string) || 'Transaction',
      categoryId: (txn.spend_category_id as string | null) ?? null,
      categoryName: category?.name ?? null,
      accountName: account?.name ?? '—',
      amount,
      bucket: bucketFor({
        amount,
        groupKind: category?.group_kind,
        categoryName: category?.name,
      }),
    };
  });

  const query = (params.q ?? '').trim().toLowerCase();
  const activeBucket = params.bucket as Bucket | undefined;

  const filtered = rows.filter((row) => {
    if (activeBucket && row.bucket !== activeBucket) return false;
    if (query && !row.description.toLowerCase().includes(query)) return false;
    return true;
  });

  const show = Math.max(Number(params.show) || PAGE_SIZE, PAGE_SIZE);
  const visible = filtered.slice(0, show);

  const inflow = filtered
    .filter((r) => r.amount > 0)
    .reduce((acc, r) => acc + r.amount, 0);
  const outflow = filtered
    .filter((r) => r.amount < 0)
    .reduce((acc, r) => acc + Math.abs(r.amount), 0);

  const counts = rows.reduce<Record<string, number>>((acc, row) => {
    acc[row.bucket] = (acc[row.bucket] ?? 0) + 1;
    return acc;
  }, {});

  const href = (patch: Partial<Params>) => {
    const next = new URLSearchParams();
    const merged = { ...params, ...patch };
    for (const [key, value] of Object.entries(merged)) {
      if (value) next.set(key, String(value));
    }
    const qs = next.toString();
    return qs ? `/transactions?${qs}` : '/transactions';
  };

  const bucketChips: { label: string; bucket?: Bucket }[] = [
    { label: 'All' },
    ...(
      ['needs', 'wants', 'savings', 'income', 'uncategorized'] as Bucket[]
    ).map((bucket) => ({
      label:
        bucket === 'uncategorized' && counts.uncategorized
          ? `${BUCKET_LABELS[bucket]} · ${counts.uncategorized}`
          : BUCKET_LABELS[bucket],
      bucket,
    })),
  ];

  return (
    <>
      <div className='flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end'>
        <div>
          <h1 className='bb-title'>Transactions</h1>
          <p className='mt-1.5 text-[14px] text-[var(--bb-sub)]'>
            {filtered.length} in this view · {formatCurrency(outflow)} out,{' '}
            {formatCurrency(inflow)} in
          </p>
        </div>
        <div className='flex flex-wrap items-center gap-2.5'>
          <SearchField initial={params.q ?? ''} />
          <Link
            href='/accounts'
            className='bb-ghost'
          >
            <Icon
              name='plus'
              size={15}
            />
            Import
          </Link>
        </div>
      </div>

      {/* ── Filters ── */}
      <div className='flex flex-wrap gap-2'>
        {bucketChips.map((chip) => (
          <Link
            key={chip.label}
            href={href({ bucket: chip.bucket, show: undefined })}
            className='bb-chip'
            data-on={activeBucket === chip.bucket}
          >
            {chip.label}
          </Link>
        ))}
      </div>

      {accounts.length > 1 && (
        <div className='flex flex-wrap gap-2'>
          <Link
            href={href({ account: undefined, show: undefined })}
            className='bb-chip'
            data-on={!params.account}
          >
            All accounts
          </Link>
          {accounts.map((account) => (
            <Link
              key={account.id}
              href={href({ account: account.id, show: undefined })}
              className='bb-chip'
              data-on={params.account === account.id}
            >
              {account.name}
            </Link>
          ))}
        </div>
      )}

      {/* ── Table ── */}
      <div className='bb-card px-6 pt-2 pb-4'>
        {visible.length === 0 ? (
          <p className='py-10 text-center text-[13.5px] text-[var(--bb-sub)]'>
            {rows.length === 0 ? (
              <>
                No transactions in this period.{' '}
                <Link href='/accounts'>Import a file</Link> to get started.
              </>
            ) : (
              'Nothing matches these filters.'
            )}
          </p>
        ) : (
          <>
            <div className='flex items-center gap-3.5 border-b border-[var(--bb-line)] py-3 text-[11.5px] tracking-[0.1em] text-[var(--bb-dim)] uppercase'>
              <span className='w-14'>Date</span>
              <span className='flex-1'>Merchant</span>
              <span className='hidden w-[130px] md:block'>Category</span>
              <span className='hidden w-[120px] lg:block'>Account</span>
              <span className='w-[86px] text-right'>Amount</span>
            </div>

            {visible.map((row) => (
              <div
                key={row.id}
                className='bb-row'
              >
                <span className='w-14 flex-none text-[12.5px] text-[var(--bb-dim)]'>
                  {shortDate(row.date)}
                </span>
                <span className='min-w-0 flex-1 truncate'>
                  {row.description}
                </span>
                <span className='hidden w-[130px] flex-none items-center gap-2 md:flex'>
                  <span
                    className='bb-dot'
                    data-bucket={row.bucket}
                  />
                  <CategorySelect
                    transactionId={row.id}
                    value={row.categoryId}
                    categories={categories}
                  />
                </span>
                <span className='hidden w-[120px] flex-none truncate text-[12.5px] text-[var(--bb-dim)] lg:block'>
                  {row.accountName}
                </span>
                <span
                  className='bb-amount w-[86px] flex-none text-right font-semibold'
                  data-income={row.amount > 0}
                >
                  {formatCurrency(row.amount)}
                </span>
              </div>
            ))}

            <div className='flex items-center justify-between pt-4'>
              <span className='text-[12.5px] text-[var(--bb-dim)]'>
                Showing {visible.length} of {filtered.length}
              </span>
              {visible.length < filtered.length && (
                <Link
                  href={href({ show: String(show + PAGE_SIZE) })}
                  className='bb-ghost'
                  scroll={false}
                >
                  Load more
                </Link>
              )}
            </div>
          </>
        )}
      </div>
    </>
  );
}

/** "Jul 22" — the design's compact date column. */
function shortDate(iso: string) {
  const date = new Date(`${iso}T00:00:00Z`);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    timeZone: 'UTC',
  });
}
