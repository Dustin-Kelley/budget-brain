import { Suspense } from 'react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/app/queries/getCurrentUser';
import { getAccounts } from '@/app/queries/getAccounts';
import { getBudgetMonth } from '@/app/queries/getBudgetMonth';
import { accountActivity } from '@/lib/budget/math';
import {
  createAccount,
  updateAccountBalance,
} from '@/app/mutations/accountMutations';
import { ACCOUNT_PURPOSES, formatCurrency } from '@/lib/ledger/constants';
import { withMonth } from '@/lib/budget/month';
import { Icon } from '@/components/shell/Icon';
import { Skeleton } from '@/components/ui/skeleton';

export default async function AccountsPage({
  searchParams,
}: {
  searchParams: Promise<{ month?: string }>;
}) {
  const params = await searchParams;
  const { currentUser } = await getCurrentUser();

  if (!currentUser) redirect('/welcome');

  return (
    <div className='flex flex-col gap-5'>
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
  const [{ accounts }, budget] = await Promise.all([
    getAccounts(),
    getBudgetMonth(month),
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
              ? 'Add a checking, savings, or card account and type in today’s balance.'
              : `${formatCurrency(totalBalance)} across ${accounts.length} account${
                  accounts.length === 1 ? '' : 's'
                }. You keep these balances by hand.`}
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

      {accounts.length > 0 && (
        <div className='grid grid-cols-1 gap-4 lg:grid-cols-2'>
          {accounts.map((account) => {
            const budgetOnAccount = accountActivity(
              budget.transactions,
              account.id,
            );
            const transactionsHref = budget.accountsLinked
              ? withMonth(
                  `/transactions?account=${account.id}`,
                  budget.monthParam,
                )
              : withMonth('/transactions', budget.monthParam);

            return (
              <div
                key={account.id}
                className='bb-card flex min-w-0 flex-col gap-[18px] p-4 sm:p-6'
              >
                <div className='flex items-start gap-3'>
                  <span className='flex size-11 flex-none items-center justify-center rounded-xl bg-[var(--bb-surface-2)]'>
                    <Icon
                      name='bank'
                      size={22}
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
                    <div className='mt-1 text-[22px] font-semibold tracking-[-0.03em] tabular-nums sm:hidden'>
                      {account.current_balance == null
                        ? '—'
                        : formatCurrency(Number(account.current_balance))}
                    </div>
                  </div>
                  <div className='hidden text-[24px] font-semibold tracking-[-0.03em] tabular-nums sm:block'>
                    {account.current_balance == null
                      ? '—'
                      : formatCurrency(Number(account.current_balance))}
                  </div>
                </div>

                {budget.accountsLinked ? (
                  <div className='grid grid-cols-3 gap-2 text-[13px]'>
                    <div className='min-w-0'>
                      <div className='text-[11px] text-[var(--bb-dim)]'>Spent</div>
                      <div className='mt-0.5 text-[16px] font-semibold tabular-nums'>
                        {formatCurrency(budgetOnAccount.spent)}
                      </div>
                    </div>
                    <div className='min-w-0'>
                      <div className='text-[11px] text-[var(--bb-dim)]'>Income</div>
                      <div className='mt-0.5 text-[16px] font-semibold tabular-nums'>
                        {formatCurrency(budgetOnAccount.income)}
                      </div>
                    </div>
                    <div className='min-w-0'>
                      <div className='text-[11px] text-[var(--bb-dim)]'>Assigned</div>
                      <div className='mt-0.5 text-[16px] font-semibold tabular-nums'>
                        {budgetOnAccount.rows.length}
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className='text-[13.5px] text-[var(--bb-sub)]'>
                    Balance is kept by hand for this month.
                  </p>
                )}

                {budget.accountsLinked ? (
                  <div className='flex flex-col gap-1 text-[13.5px]'>
                    {budgetOnAccount.rows.length === 0 ? (
                      <p className='text-[var(--bb-sub)]'>
                        No budget transactions on this account this month.
                      </p>
                    ) : (
                      budgetOnAccount.rows.slice(0, 4).map((txn) => (
                        <div
                          key={txn.id}
                          className='flex items-baseline justify-between gap-3'
                        >
                          <span className='min-w-0 flex-1 truncate'>
                            {txn.description.trim() || 'Transaction'}
                          </span>
                          <span className='flex-none font-semibold'>
                            {formatCurrency(txn.amount)}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                ) : null}

                <div className='flex flex-col items-stretch gap-2.5 sm:flex-row sm:flex-wrap sm:items-end'>
                  <Link
                    href={transactionsHref}
                    className='bb-ghost'
                  >
                    View transactions
                  </Link>
                  <form
                    action={async (formData: FormData) => {
                      'use server';
                      await updateAccountBalance(formData);
                    }}
                    className='flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-end'
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
                        className='bb-field w-full bg-[var(--bb-surface-2)] sm:w-36'
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

      <div
        id='add-account'
        className='bb-card flex flex-col gap-4 px-4 py-5 sm:px-6 sm:py-[22px]'
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
              placeholder='e.g. Chase'
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

const CONTROL = 'bb-field bg-[var(--bb-surface-2)]';

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
