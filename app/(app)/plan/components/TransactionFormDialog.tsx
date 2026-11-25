'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMediaQuery } from '@/hooks/use-media-query';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Drawer,
  DrawerContent,
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

export type TransactionFormSurface = 'dialog' | 'drawer';

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
  const isMobile = useMediaQuery('(max-width: 767px)');
  const form = editor ? (
    <TransactionForm
      key={editor.token}
      initial={editor.draft}
      groups={groups}
      accounts={accounts}
      accountsLinked={accountsLinked}
      monthParam={monthParam}
      onClose={onClose}
      surface={isMobile ? 'drawer' : 'dialog'}
    />
  ) : null;

  if (isMobile) {
    return (
      <Drawer
        open={editor !== null}
        onOpenChange={(open) => {
          if (!open) onClose();
        }}
      >
        <DrawerContent className='rounded-t-2xl data-[vaul-drawer-direction=bottom]:max-h-[min(92dvh,760px)]!'>
          <div className='max-h-[min(84dvh,700px)] overflow-y-auto overscroll-contain px-4 pt-2 pb-[max(1.25rem,env(safe-area-inset-bottom,0px))]'>
            {form}
          </div>
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Dialog
      open={editor !== null}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <DialogContent className='sm:max-w-[440px]'>
        {form}
      </DialogContent>
    </Dialog>
  );
}

function TransactionFormHeading({
  surface,
  title,
  description,
}: {
  surface: TransactionFormSurface;
  title: string;
  description: string;
}) {
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
    <DialogHeader>
      <DialogTitle>{title}</DialogTitle>
      <DialogDescription>{description}</DialogDescription>
    </DialogHeader>
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
}: {
  initial: TransactionDraft;
  groups: BudgetGroup[];
  accounts: BudgetAccount[];
  accountsLinked: boolean;
  monthParam: string;
  onClose: () => void;
  surface?: TransactionFormSurface;
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
            className='bb-field'
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
            className='bb-field'
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
            className='bb-field'
          />
        </label>
        <div className='flex flex-col gap-1 text-[13px] text-[var(--bb-sub)]'>
          Type
          <div
            className='bb-segments'
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
            className='bb-field'
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
              className='bb-field'
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
              className='inline-flex min-h-11 cursor-pointer items-center text-[14px] text-[var(--bb-mg-text)] md:min-h-0 md:text-[13px]'
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
