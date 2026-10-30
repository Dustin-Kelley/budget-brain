'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DrawerDescription,
  DrawerTitle,
} from '@/components/ui/drawer';
import { defaultTransactionDate } from '@/lib/budget/month';
import { money } from '@/lib/budget/math';
import type {
  BudgetAccount,
  BudgetGroup,
  BudgetKind,
  BudgetTransaction,
  TransactionDraft,
} from '@/lib/budget/types';
import { removeTransaction, saveTransaction } from '../actions';

export type TransactionEditor = {
  token: number;
  draft: TransactionDraft;
};

export function draftForNew(
  monthParam: string,
  lineItemId?: string,
  accountId?: string,
): TransactionDraft {
  return {
    amount: '',
    description: '',
    date: defaultTransactionDate(monthParam),
    lineItemId: lineItemId ?? '',
    accountId: accountId ?? '',
    kind: 'expense',
  };
}

export function draftForEdit(
  txn: BudgetTransaction,
  monthParam: string,
): TransactionDraft {
  return {
    id: txn.id,
    amount: txn.amount.toFixed(2),
    description: txn.description,
    date: txn.date ?? defaultTransactionDate(monthParam),
    lineItemId: txn.lineItemId ?? '',
    accountId: txn.accountId ?? '',
    kind: txn.kind,
  };
}

export type TransactionFormSurface = 'dialog' | 'popover' | 'drawer';

export function TransactionFormDialog({
  editor,
  groups,
  accounts,
  accountsLinked,
  monthParam,
  onClose,
}: {
  editor: TransactionEditor | null;
  groups: BudgetGroup[];
  accounts: BudgetAccount[];
  accountsLinked: boolean;
  monthParam: string;
  onClose: () => void;
}) {
  return (
    <Dialog
      open={editor !== null}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <DialogContent className='sm:max-w-[440px]'>
        {editor && (
          <TransactionForm
            key={editor.token}
            initial={editor.draft}
            groups={groups}
            accounts={accounts}
            accountsLinked={accountsLinked}
            monthParam={monthParam}
            onClose={onClose}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}

function TransactionFormHeading({
  surface,
  title,
  description,
  titleId,
  descriptionId,
}: {
  surface: TransactionFormSurface;
  title: string;
  description: string;
  titleId?: string;
  descriptionId?: string;
}) {
  if (surface === 'dialog') {
    return (
      <DialogHeader>
        <DialogTitle>{title}</DialogTitle>
        <DialogDescription>{description}</DialogDescription>
      </DialogHeader>
    );
  }

  if (surface === 'drawer') {
    return (
      <div className='flex flex-col gap-1.5 pb-1 text-left'>
        <DrawerTitle className='text-left text-[16px] font-semibold'>
          {title}
        </DrawerTitle>
        <DrawerDescription className='text-left text-[13.5px]'>
          {description}
        </DrawerDescription>
      </div>
    );
  }

  return (
    <div className='flex flex-col gap-1.5 text-left'>
      <h2
        id={titleId}
        className='text-[16px] font-semibold tracking-[-0.02em]'
      >
        {title}
      </h2>
      <p
        id={descriptionId}
        className='text-[13.5px] text-[var(--bb-sub)]'
      >
        {description}
      </p>
    </div>
  );
}

export function TransactionForm({
  initial,
  groups,
  accounts,
  accountsLinked,
  monthParam,
  onClose,
  surface = 'dialog',
  titleId,
  descriptionId,
}: {
  initial: TransactionDraft;
  groups: BudgetGroup[];
  accounts: BudgetAccount[];
  accountsLinked: boolean;
  monthParam: string;
  onClose: () => void;
  surface?: TransactionFormSurface;
  titleId?: string;
  descriptionId?: string;
}) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [form, setForm] = useState(initial);
  const editing = Boolean(form.id);
  const monthName = monthParam.replace('-', ' ');

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    const amount = money(form.amount.replace(/[$,\s]/g, ''));
    setPending(true);
    let accountId: string | null | undefined;
    if (accountsLinked) {
      accountId = form.accountId || null;
    }
    const result = await saveTransaction({
      id: form.id,
      amount,
      description: form.description,
      date: form.date,
      lineItemId: form.lineItemId || null,
      accountId,
      kind: form.kind,
      monthParam,
    });
    setPending(false);
    if (result.error) {
      toast.error(result.error);
      return;
    }
    toast.success(editing ? 'Transaction updated' : 'Transaction added');
    onClose();
    router.refresh();
  }

  async function onDelete() {
    if (!form.id) return;
    setPending(true);
    const result = await removeTransaction(form.id);
    setPending(false);
    if (result.error) {
      toast.error(result.error);
      return;
    }
    toast.success('Transaction removed');
    onClose();
    router.refresh();
  }

  const title = editing ? 'Edit transaction' : 'Add transaction';
  const description = `Record spending or income for ${monthName}. Expenses count against the budget item you assign.`;

  return (
    <>
      <TransactionFormHeading
        surface={surface}
        title={title}
        description={description}
        titleId={titleId}
        descriptionId={descriptionId}
      />
      <form
        onSubmit={(event) => {
          void onSubmit(event);
        }}
        className='flex flex-col gap-3'
      >
        <label className='flex flex-col gap-1 text-[13px] text-[var(--bb-sub)]'>
          Date
          <input
            required
            type='date'
            value={form.date}
            onChange={(event) =>
              setForm({ ...form, date: event.target.value })
            }
            className='rounded-xl border border-[var(--bb-line)] bg-[var(--bb-surface)] px-3 py-2 text-[14px] text-[var(--bb-text)]'
          />
        </label>
        <label className='flex flex-col gap-1 text-[13px] text-[var(--bb-sub)]'>
          Amount
          <input
            required
            inputMode='decimal'
            value={form.amount}
            placeholder='0.00'
            onChange={(event) =>
              setForm({ ...form, amount: event.target.value })
            }
            className='rounded-xl border border-[var(--bb-line)] bg-[var(--bb-surface)] px-3 py-2 text-[14px] text-[var(--bb-text)]'
          />
        </label>
        <label className='flex flex-col gap-1 text-[13px] text-[var(--bb-sub)]'>
          Merchant or note
          <input
            value={form.description}
            placeholder='Grocery store'
            onChange={(event) =>
              setForm({ ...form, description: event.target.value })
            }
            className='rounded-xl border border-[var(--bb-line)] bg-[var(--bb-surface)] px-3 py-2 text-[14px] text-[var(--bb-text)]'
          />
        </label>
        <div className='flex flex-col gap-1 text-[13px] text-[var(--bb-sub)]'>
          Type
          <div
            className='flex gap-2'
            role='group'
            aria-label='Transaction type'
          >
            {(['expense', 'income'] as BudgetKind[]).map((kind) => (
              <button
                key={kind}
                type='button'
                className='bb-chip capitalize'
                data-on={form.kind === kind}
                aria-pressed={form.kind === kind}
                onClick={() => setForm({ ...form, kind })}
              >
                {kind}
              </button>
            ))}
          </div>
        </div>
        <label className='flex flex-col gap-1 text-[13px] text-[var(--bb-sub)]'>
          Budget item
          <select
            value={form.lineItemId}
            onChange={(event) =>
              setForm({ ...form, lineItemId: event.target.value })
            }
            className='rounded-xl border border-[var(--bb-line)] bg-[var(--bb-surface)] px-3 py-2 text-[14px] text-[var(--bb-text)]'
          >
            <option value=''>Unassigned</option>
            {groups.map((group) => (
              <optgroup
                key={group.id}
                label={group.name}
              >
                {group.items.map((item) => (
                  <option
                    key={item.id}
                    value={item.id}
                  >
                    {item.name}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
        </label>
        {accountsLinked ? (
          <label className='flex flex-col gap-1 text-[13px] text-[var(--bb-sub)]'>
            Account
            <select
              value={form.accountId}
              onChange={(event) =>
                setForm({ ...form, accountId: event.target.value })
              }
              className='rounded-xl border border-[var(--bb-line)] bg-[var(--bb-surface)] px-3 py-2 text-[14px] text-[var(--bb-text)]'
            >
              <option value=''>No account</option>
              {accounts.map((account) => (
                <option
                  key={account.id}
                  value={account.id}
                >
                  {account.institution
                    ? `${account.name} · ${account.institution}`
                    : account.name}
                </option>
              ))}
              {form.accountId &&
              !accounts.some((account) => account.id === form.accountId) ? (
                <option value={form.accountId}>Saved account</option>
              ) : null}
            </select>
            {accounts.length === 0 ? (
              <span className='text-[12px] text-[var(--bb-dim)]'>
                Add an account if you want this tied to a balance.
              </span>
            ) : null}
          </label>
        ) : null}
        <div className='mt-2 flex items-center justify-between gap-3'>
          {editing ? (
            <button
              type='button'
              className='cursor-pointer text-[13px] text-[var(--bb-mg-text)]'
              disabled={pending}
              onClick={() => {
                void onDelete();
              }}
            >
              Delete
            </button>
          ) : (
            <span />
          )}
          <button
            type='submit'
            className='bb-solid'
            disabled={pending}
          >
            {pending ? 'Saving…' : 'Save'}
          </button>
        </div>
      </form>
    </>
  );
}
