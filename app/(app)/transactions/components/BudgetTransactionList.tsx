'use client';

import { useState } from 'react';
import Link from 'next/link';
import { formatCurrency } from '@/lib/ledger/constants';
import { transactionTitle } from '@/lib/budget/math';
import { withMonth } from '@/lib/budget/month';
import type {
  BudgetAccount,
  BudgetGroup,
  BudgetTransaction,
} from '@/lib/budget/types';
import {
  TransactionFormDialog,
  draftForEdit,
  draftForNew,
  type TransactionEditor,
} from '@/app/(app)/plan/components/TransactionFormDialog';

export function BudgetTransactionList({
  rows,
  groups,
  accounts,
  accountsLinked,
  monthParam,
  track,
  accountId,
  unassigned,
}: {
  rows: BudgetTransaction[];
  groups: BudgetGroup[];
  accounts: BudgetAccount[];
  accountsLinked: boolean;
  monthParam: string;
  track?: string;
  accountId?: string;
  unassigned: number;
}) {
  const [editor, setEditor] = useState<TransactionEditor | null>(null);
  const openOnly = track === 'open';
  const account = accounts.find((row) => row.id === accountId);

  const allHref = withMonth(keepAccount('/transactions', accountId), monthParam);
  const openHref = withMonth(
    keepAccount('/transactions?track=open', accountId),
    monthParam,
  );
  const clearAccountHref = withMonth('/transactions', monthParam);

  const grouped = groupByDate(rows);

  return (
    <>
      <div className='flex flex-wrap items-end justify-between gap-3'>
        <div>
          <h1 className='bb-title'>Transactions</h1>
          <p className='mt-1.5 text-[14px] text-[var(--bb-sub)]'>
            Spending and income recorded on this month&apos;s budget.
            {account
              ? ` Showing ${account.name}.`
              : ''}
            {unassigned > 0 ? ` ${unassigned} still unassigned.` : ''}
          </p>
        </div>
        <div className='flex flex-wrap items-center gap-2'>
          <SourceSwitch
            list='budget'
            monthParam={monthParam}
            accountId={accountId}
          />
          <button
            type='button'
            className='bb-solid'
            onClick={() =>
              setEditor({
                token: Date.now(),
                draft: draftForNew(monthParam, undefined, accountId),
              })
            }
          >
            Add transaction
          </button>
        </div>
      </div>

      <div className='flex flex-wrap gap-2'>
        {accountId ? (
          <Link
            href={clearAccountHref}
            className='bb-chip'
          >
            All accounts
          </Link>
        ) : null}
        <Link
          href={allHref}
          className='bb-chip'
          data-on={!openOnly}
        >
          All
        </Link>
        <Link
          href={openHref}
          className='bb-chip'
          data-on={openOnly}
        >
          Unassigned{unassigned > 0 ? ` · ${unassigned}` : ''}
        </Link>
      </div>

      <div className='bb-card px-6 pt-2 pb-4'>
        {rows.length === 0 ? (
          <p className='py-10 text-center text-[13.5px] text-[var(--bb-sub)]'>
            {openOnly
              ? 'No unassigned transactions this month.'
              : 'No transactions this month yet. Add one and assign it to a budget item.'}
          </p>
        ) : (
          grouped.map((day) => (
            <div key={day.date}>
              <div className='pt-4 pb-1 text-[12.5px] font-semibold tracking-[0.04em] text-[var(--bb-dim)] uppercase'>
                {day.label}
              </div>
              {day.rows.map((txn) => (
                <button
                  key={txn.id}
                  type='button'
                  className='bb-row w-full cursor-pointer text-left'
                  onClick={() =>
                    setEditor({
                      token: Date.now(),
                      draft: draftForEdit(txn, monthParam),
                    })
                  }
                >
                  <span className='min-w-0 flex-1'>
                    <span className='block truncate font-semibold'>
                      {transactionTitle(txn.description)}
                    </span>
                    <span className='block truncate text-[12.5px] text-[var(--bb-dim)]'>
                      {transactionDetail(txn)}
                    </span>
                  </span>
                  <span
                    className='bb-amount w-[96px] flex-none text-right font-semibold'
                    data-income={txn.kind === 'income'}
                  >
                    {formatCurrency(txn.amount)}
                  </span>
                </button>
              ))}
            </div>
          ))
        )}
      </div>

      <TransactionFormDialog
        editor={editor}
        groups={groups}
        accounts={accounts}
        accountsLinked={accountsLinked}
        monthParam={monthParam}
        onClose={() => setEditor(null)}
      />
    </>
  );
}

export function SourceSwitch({
  list,
  monthParam,
  accountId,
}: {
  list: 'budget' | 'bank';
  monthParam?: string;
  accountId?: string;
}) {
  const budgetHref = withMonth(
    keepAccount('/transactions', accountId),
    monthParam,
  );
  const bankHref = withMonth(
    keepAccount('/transactions?list=bank', accountId),
    monthParam,
  );

  return (
    <div className='flex gap-1'>
      <Link
        href={budgetHref}
        className='bb-chip'
        data-on={list === 'budget'}
      >
        Budget
      </Link>
      <Link
        href={bankHref}
        className='bb-chip'
        data-on={list === 'bank'}
      >
        Bank activity
      </Link>
    </div>
  );
}

function keepAccount(path: string, accountId: string | undefined) {
  if (!accountId) return path;
  const [pathname, query] = path.split('?');
  const params = new URLSearchParams(query ?? '');
  params.set('account', accountId);
  return `${pathname}?${params.toString()}`;
}

function transactionDetail(txn: BudgetTransaction) {
  let detail = 'Unassigned';
  if (txn.lineItemName) {
    detail = txn.lineItemName;
    if (txn.groupName) detail = `${txn.groupName} · ${detail}`;
  }
  if (txn.accountName) detail = `${detail} · ${txn.accountName}`;
  if (txn.kind === 'income') detail = `${detail} · Income`;
  return detail;
}

function groupByDate(rows: BudgetTransaction[]) {
  const groups: { date: string; label: string; rows: BudgetTransaction[] }[] =
    [];
  for (const row of rows) {
    const key = row.date ?? 'unknown';
    const last = groups[groups.length - 1];
    if (last && last.date === key) {
      last.rows.push(row);
      continue;
    }
    groups.push({
      date: key,
      label: key === 'unknown' ? 'No date' : longDate(key),
      rows: [row],
    });
  }
  return groups;
}

function longDate(iso: string) {
  const date = new Date(`${iso}T00:00:00`);
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });
}
