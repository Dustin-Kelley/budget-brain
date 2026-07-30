import { Suspense } from 'react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/app/queries/getCurrentUser';
import { getAccounts } from '@/app/queries/getAccounts';
import { getSpendCategories } from '@/app/queries/getSpendCategories';
import { getAccountActivity } from '@/app/queries/getAccountActivity';
import {
  createAccount,
  updateAccountBalance,
} from '@/app/mutations/accountMutations';
import { importLedgerFile } from '@/app/mutations/importLedgerFile';
import { ACCOUNT_PURPOSES, formatCurrency } from '@/lib/ledger/constants';
import { Icon } from '@/components/shell/Icon';
import { Sparkline } from '@/components/bb/Sparkline';
import { Skeleton } from '@/components/ui/skeleton';

type Params = {
  month?: string;
  imported?: string;
  skipped?: string;
  error?: string;
};

export default async function AccountsPage({
  searchParams,
}: {
  searchParams: Promise<Params>;
}) {
  const params = await searchParams;
  const { currentUser } = await getCurrentUser();

  if (!currentUser) redirect('/welcome');

  return (
    <div className='flex flex-col gap-5'>
      {params.error && (
        <p className='rounded-[14px] border border-[var(--bb-mg)] bg-[var(--bb-mg-tint)] px-4 py-3 text-[13.5px] text-[var(--bb-mg-text)]'>
          {decodeURIComponent(params.error)}
        </p>
      )}
      {params.imported && (
        <p className='rounded-[14px] border border-[var(--bb-cy)] bg-[var(--bb-cy-tint)] px-4 py-3 text-[13.5px] text-[var(--bb-cy-text)]'>
          Imported {params.imported} transaction
          {params.imported === '1' ? '' : 's'}
          {params.skipped && Number(params.skipped) > 0
            ? ` — ${params.skipped} duplicate${
                params.skipped === '1' ? '' : 's'
              } skipped`
            : ''}
          .
        </p>
      )}

      <Suspense
        key={params.month ?? 'current'}
        fallback={<Skeleton className='h-[520px] rounded-2xl' />}
      >
        <AccountsBody month={params.month} />
      </Suspense>
    </div>
  );
}

async function AccountsBody({ month }: { month: string | undefined }) {
  const [{ accounts }, { categories }, activity] = await Promise.all([
    getAccounts(),
    getSpendCategories(),
    getAccountActivity(month),
  ]);

  const totalBalance = accounts.reduce(
    (acc, account) => acc + Number(account.current_balance ?? 0),
    0,
  );

  return (
    <>
      <div className='flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end'>
        <div>
          <h1 className='bb-title'>Accounts</h1>
          <p className='mt-1.5 text-[14px] text-[var(--bb-sub)]'>
            {accounts.length === 0
              ? 'No accounts yet — add one below, then import a file.'
              : `${formatCurrency(totalBalance)} across ${accounts.length} account${
                  accounts.length === 1 ? '' : 's'
                }`}
          </p>
        </div>
        <a
          href='#add-account'
          className='bb-solid'
        >
          <Icon
            name='plus'
            size={15}
          />
          Add an account
        </a>
      </div>

      {/* ── Account cards ── */}
      {accounts.length > 0 && (
        <div className='grid gap-4 lg:grid-cols-2'>
          {accounts.map((account) => {
            const stats = activity[account.id];
            const isDiscretionary =
              account.purpose === 'discretionary_spend';

            return (
              <div
                key={account.id}
                className='bb-card flex flex-col gap-[18px] p-6'
              >
                <div className='flex items-center gap-3'>
                  <span
                    className='flex size-[42px] flex-none items-center justify-center rounded-[11px]'
                    style={{
                      background: isDiscretionary
                        ? 'var(--bb-mg-tint)'
                        : 'var(--bb-cy-tint)',
                    }}
                  >
                    <Icon
                      name={isDiscretionary ? 'wallet' : 'bank'}
                      size={22}
                      color={
                        isDiscretionary
                          ? 'var(--bb-mg-text)'
                          : 'var(--bb-cy-text)'
                      }
                    />
                  </span>
                  <div className='min-w-0 flex-1'>
                    <div className='truncate text-[16px] font-semibold'>
                      {account.name}
                    </div>
                    <div className='truncate text-[12.5px] text-[var(--bb-dim)]'>
                      {[
                        account.institution,
                        account.purpose.replaceAll('_', ' '),
                      ]
                        .filter(Boolean)
                        .join(' · ')}
                    </div>
                  </div>
                  <div className='text-[24px] font-semibold tracking-[-0.015em]'>
                    {account.current_balance == null
                      ? '—'
                      : formatCurrency(Number(account.current_balance))}
                  </div>
                </div>

                <div className='flex flex-wrap gap-6 text-[13px]'>
                  <div>
                    <div className='bb-kicker'>Out this period</div>
                    <div className='mt-0.5 text-[16px] font-semibold'>
                      {formatCurrency(stats?.outflow ?? 0)}
                    </div>
                  </div>
                  <div>
                    <div className='bb-kicker'>Avg per day</div>
                    <div className='mt-0.5 text-[16px] font-semibold'>
                      {formatCurrency(stats?.averagePerDay ?? 0)}
                    </div>
                  </div>
                  <div>
                    <div className='bb-kicker'>
                      {stats?.projected != null ? 'On track for' : 'Movements'}
                    </div>
                    <div className='mt-0.5 text-[16px] font-semibold'>
                      {stats?.projected != null
                        ? formatCurrency(stats.projected)
                        : (stats?.transactionCount ?? 0)}
                    </div>
                  </div>
                </div>

                {stats && stats.daily.length > 0 && (
                  <Sparkline
                    values={stats.daily}
                    color={isDiscretionary ? 'var(--bb-w4)' : 'var(--bb-n4)'}
                  />
                )}

                <div className='flex flex-wrap items-end gap-2.5'>
                  <Link
                    href={`/transactions?account=${account.id}${
                      month ? `&month=${month}` : ''
                    }`}
                    className='bb-ghost'
                  >
                    View transactions
                  </Link>
                  <form
                    action={async (formData: FormData) => {
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
                    <label className='flex flex-col gap-1'>
                      <span className='bb-kicker'>Balance</span>
                      <input
                        name='current_balance'
                        type='number'
                        step='0.01'
                        defaultValue={
                          account.current_balance != null
                            ? String(account.current_balance)
                            : ''
                        }
                        className='w-32 rounded-[10px] border border-[var(--bb-line)] bg-[var(--bb-surface-2)] px-3 py-2 text-[14px] outline-none focus-visible:border-[var(--bb-cy)]'
                      />
                    </label>
                    <button
                      type='submit'
                      className='bb-ghost'
                    >
                      Save
                    </button>
                  </form>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Import ── */}
      <div className='bb-card flex flex-col gap-4 px-6 py-[22px]'>
        <div>
          <span className='bb-kicker'>Import</span>
          <p className='mt-1 text-[13.5px] text-[var(--bb-sub)]'>
            CSV, OFX, or QFX. Duplicates are skipped automatically. Bank Link
            comes next.
          </p>
        </div>
        <form
          action={async (formData: FormData) => {
            'use server';
            const result = await importLedgerFile(formData);
            const { redirect: redir } = await import('next/navigation');
            if (result.error) {
              redir(`/accounts?error=${encodeURIComponent(result.error)}`);
            }
            redir(
              `/accounts?imported=${result.imported ?? 0}&skipped=${
                result.skipped ?? 0
              }`,
            );
          }}
          className='grid gap-4 sm:grid-cols-2'
        >
          <Field
            label='File'
            className='sm:col-span-2'
          >
            <input
              name='file'
              type='file'
              accept='.csv,.ofx,.qfx,text/csv,application/x-ofx,application/vnd.intu.qfx'
              required
              className='w-full rounded-[10px] border border-[var(--bb-line)] bg-[var(--bb-surface-2)] px-3 py-2 text-[13.5px] file:mr-3 file:rounded-md file:border-0 file:bg-[var(--bb-cy-tint)] file:px-3 file:py-1 file:text-[var(--bb-cy-text)]'
            />
          </Field>
          <Field label='Destination account'>
            <Select
              name='account_id'
              required
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
            </Select>
          </Field>
          <Field label='Default category for outflows'>
            <Select
              name='spend_category_id'
              defaultValue='none'
            >
              <option value='none'>Leave uncategorised</option>
              {categories
                .filter((category) => category.group_kind !== 'system')
                .map((category) => (
                  <option
                    key={category.id}
                    value={category.id}
                  >
                    {category.name}
                  </option>
                ))}
            </Select>
          </Field>
          <div className='sm:col-span-2'>
            <button
              type='submit'
              className='bb-solid'
              disabled={accounts.length === 0}
            >
              Import transactions
            </button>
          </div>
        </form>
      </div>

      {/* ── Add account ── */}
      <div
        id='add-account'
        className='bb-card flex flex-col gap-4 px-6 py-[22px]'
      >
        <span className='bb-kicker'>Add an account</span>
        <form
          action={async (formData: FormData) => {
            'use server';
            await createAccount(formData);
          }}
          className='grid gap-4 sm:grid-cols-2'
        >
          <Field label='Name'>
            <TextInput
              name='name'
              required
              placeholder='Checking'
            />
          </Field>
          <Field label='Institution'>
            <TextInput
              name='institution'
              placeholder='e.g. Wealthfront, Crew, Chase'
            />
          </Field>
          <Field label='Purpose'>
            <Select
              name='purpose'
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
            </Select>
          </Field>
          <Field label='Type'>
            <Select
              name='account_type'
              defaultValue='checking'
            >
              <option value='checking'>Checking</option>
              <option value='savings'>Savings</option>
              <option value='investment'>Investment</option>
              <option value='credit'>Credit</option>
              <option value='other'>Other</option>
            </Select>
          </Field>
          <Field label='Balance (optional)'>
            <TextInput
              name='current_balance'
              type='number'
              step='0.01'
            />
          </Field>
          <div className='flex items-end'>
            <button
              type='submit'
              className='bb-solid'
            >
              Add account
            </button>
          </div>
        </form>
      </div>
    </>
  );
}

function Field({
  label,
  children,
  className,
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <label className={`flex flex-col gap-1.5 ${className ?? ''}`}>
      <span className='bb-kicker'>{label}</span>
      {children}
    </label>
  );
}

const CONTROL =
  'w-full rounded-[10px] border border-[var(--bb-line)] bg-[var(--bb-surface-2)] px-3 py-2 text-[14px] outline-none transition-colors focus-visible:border-[var(--bb-cy)]';

function TextInput(props: React.ComponentProps<'input'>) {
  return (
    <input
      {...props}
      className={CONTROL}
    />
  );
}

function Select(props: React.ComponentProps<'select'>) {
  return (
    <select
      {...props}
      className={`${CONTROL} cursor-pointer`}
    />
  );
}
