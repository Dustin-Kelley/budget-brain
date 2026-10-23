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
import { defaultTransactionDate } from '@/lib/budget/month';
import { money } from '@/lib/budget/math';
import type {
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
): TransactionDraft {
  return {
    amount: '',
    description: '',
    date: defaultTransactionDate(monthParam),
    lineItemId: lineItemId ?? '',
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
    kind: txn.kind,
  };
}

export function TransactionFormDialog({
  editor,
  groups,
  monthParam,
  onClose,
}: {
  editor: TransactionEditor | null;
  groups: BudgetGroup[];
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
            monthParam={monthParam}
            onClose={onClose}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}

function TransactionForm({
  initial,
  groups,
  monthParam,
  onClose,
}: {
  initial: TransactionDraft;
  groups: BudgetGroup[];
  monthParam: string;
  onClose: () => void;
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
    const result = await saveTransaction({
      id: form.id,
      amount,
      description: form.description,
      date: form.date,
      lineItemId: form.lineItemId || null,
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

  return (
    <>
      <DialogHeader>
        <DialogTitle>
          {editing ? 'Edit transaction' : 'Add transaction'}
        </DialogTitle>
        <DialogDescription>
          Record spending or income for {monthName}. Expenses count against
          the budget item you assign.
        </DialogDescription>
      </DialogHeader>
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
            className='rounded-[10px] border border-[var(--bb-line)] bg-[var(--bb-surface)] px-3 py-2 text-[14px] text-[var(--bb-text)]'
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
            className='rounded-[10px] border border-[var(--bb-line)] bg-[var(--bb-surface)] px-3 py-2 text-[14px] text-[var(--bb-text)]'
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
            className='rounded-[10px] border border-[var(--bb-line)] bg-[var(--bb-surface)] px-3 py-2 text-[14px] text-[var(--bb-text)]'
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
            className='rounded-[10px] border border-[var(--bb-line)] bg-[var(--bb-surface)] px-3 py-2 text-[14px] text-[var(--bb-text)]'
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
