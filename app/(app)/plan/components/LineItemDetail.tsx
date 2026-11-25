'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { useMediaQuery } from '@/hooks/use-media-query';
import { formatCurrency } from '@/lib/ledger/constants';
import {
  itemActivity,
  money,
  transactionTitle,
} from '@/lib/budget/math';
import type { BudgetItem, BudgetMonth } from '@/lib/budget/types';
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
import { parseMoneyInput } from './BudgetFields';
import { saveItem } from '../actions';

type Commit = (
  action: () => Promise<{ error: string | null }>,
  success?: string,
) => Promise<boolean>;

export function LineItemDetail({
  item,
  groupName,
  spent,
  transactions,
  onOpenChange,
  onCommit,
  onAddTransaction,
  onEditTransaction,
}: {
  item: BudgetItem | null;
  groupName: string;
  spent: number;
  transactions: BudgetMonth['transactions'];
  onOpenChange: (open: boolean) => void;
  onCommit: Commit;
  onAddTransaction: (lineItemId: string) => void;
  onEditTransaction: (id: string) => void;
}) {
  const isMobile = useMediaQuery('(max-width: 767px)');
  const open = item !== null;
  const body = item ? (
    <LineItemBody
      key={`${item.id}:${item.name}:${item.planned}`}
      item={item}
      groupName={groupName}
      spent={spent}
      transactions={transactions}
      surface={isMobile ? 'drawer' : 'dialog'}
      onCommit={onCommit}
      onClose={() => onOpenChange(false)}
      onAddTransaction={onAddTransaction}
      onEditTransaction={onEditTransaction}
    />
  ) : null;

  if (isMobile) {
    return (
      <Drawer
        open={open}
        onOpenChange={onOpenChange}
        autoFocus={false}
      >
        <DrawerContent className='rounded-t-2xl data-[vaul-drawer-direction=bottom]:max-h-[min(92dvh,760px)]!'>
          <div className='max-h-[min(84dvh,700px)] overflow-y-auto overscroll-contain px-4 pt-2 pb-[max(1.25rem,env(safe-area-inset-bottom,0px))]'>
            {body}
          </div>
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
    >
      <DialogContent className='max-h-[min(40rem,85vh)] overflow-y-auto sm:max-w-[440px]'>
        {body}
      </DialogContent>
    </Dialog>
  );
}

function LineItemBody({
  item,
  groupName,
  spent,
  transactions,
  surface,
  onCommit,
  onClose,
  onAddTransaction,
  onEditTransaction,
}: {
  item: BudgetItem;
  groupName: string;
  spent: number;
  transactions: BudgetMonth['transactions'];
  surface: 'dialog' | 'drawer';
  onCommit: Commit;
  onClose: () => void;
  onAddTransaction: (lineItemId: string) => void;
  onEditTransaction: (id: string) => void;
}) {
  const [name, setName] = useState(item.name);
  const [amount, setAmount] = useState(item.planned.toFixed(2));
  const [pending, setPending] = useState(false);
  const activity = itemActivity(transactions, item.id);
  const typed = parseMoneyInput(amount);
  const planned = typed === null ? item.planned : typed;
  const remaining = money(planned - spent);
  let remainingColor = 'var(--bb-text)';
  if (remaining < -0.004) remainingColor = 'var(--bb-bad-text)';
  if (remaining > 0.004) remainingColor = 'var(--bb-good-text)';

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    const nextAmount = parseMoneyInput(amount);
    const nextName = name.trim();
    if (!nextName) return;
    if (nextAmount === null) {
      toast.error('Enter a valid amount.');
      return;
    }
    setPending(true);
    const saved = await onCommit(
      () => saveItem({ id: item.id, name: nextName, planned: nextAmount }),
      'Item updated',
    );
    setPending(false);
    if (saved) onClose();
  }

  return (
    <div className='flex flex-col gap-4'>
      <ItemHeading
        surface={surface}
        title={item.name}
        description='Name, plan, and this month’s activity.'
      />
      <form
        onSubmit={(event) => {
          void onSubmit(event);
        }}
        className='flex flex-col gap-3'
      >
        <label className='flex flex-col gap-1 text-[13px] text-[var(--bb-sub)]'>
          Name
          <input
            required
            value={name}
            aria-label='Item name'
            onChange={(event) => setName(event.target.value)}
            className='bb-field'
          />
        </label>
        <label className='flex flex-col gap-1 text-[13px] text-[var(--bb-sub)]'>
          Planned amount
          <input
            required
            inputMode='decimal'
            value={amount}
            aria-label='Planned amount'
            onChange={(event) => setAmount(event.target.value)}
            className='bb-field'
          />
        </label>
        <div className='flex items-center justify-between gap-3 py-1 text-[14px]'>
          <span className='text-[var(--bb-sub)]'>Group</span>
          <span className='min-w-0 truncate font-semibold'>{groupName}</span>
        </div>
        <div className='grid grid-cols-2 gap-2'>
          <div className='rounded-xl bg-[var(--bb-surface-2)] px-3 py-2.5'>
            <div className='text-[11px] tracking-[0.08em] text-[var(--bb-dim)] uppercase'>
              Spent this month
            </div>
            <div className='mt-0.5 text-[16px] font-semibold tabular-nums'>
              {formatCurrency(spent)}
            </div>
          </div>
          <div className='rounded-xl bg-[var(--bb-surface-2)] px-3 py-2.5'>
            <div className='text-[11px] tracking-[0.08em] text-[var(--bb-dim)] uppercase'>
              Remaining
            </div>
            <div
              className='mt-0.5 text-[16px] font-semibold tabular-nums'
              style={{ color: remainingColor }}
            >
              {formatCurrency(remaining)}
            </div>
          </div>
        </div>
        <div className='mt-1 flex justify-end'>
          <button
            type='submit'
            className='bb-solid'
            disabled={pending}
          >
            {pending ? 'Saving…' : 'Save'}
          </button>
        </div>
      </form>
      <ActivityList
        itemName={item.name}
        rows={activity}
        onAdd={() => onAddTransaction(item.id)}
        onEdit={onEditTransaction}
      />
    </div>
  );
}

function ItemHeading({
  surface,
  title,
  description,
}: {
  surface: 'dialog' | 'drawer';
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

function ActivityList({
  itemName,
  rows,
  onAdd,
  onEdit,
}: {
  itemName: string;
  rows: BudgetMonth['transactions'];
  onAdd: () => void;
  onEdit: (id: string) => void;
}) {
  return (
    <div className='rounded-[12px] bg-[var(--bb-surface-2)] px-3 py-2'>
      <div className='mb-1 flex flex-col items-start gap-1 sm:flex-row sm:items-center sm:justify-between'>
        <span className='text-[12px] font-semibold tracking-[0.06em] text-[var(--bb-dim)] uppercase'>
          Activity this month
        </span>
        <button
          type='button'
          className='inline-flex min-h-11 cursor-pointer items-center text-[13px] text-[var(--bb-text)] md:min-h-0 md:text-[12.5px]'
          onClick={onAdd}
        >
          Add to {itemName}
        </button>
      </div>
      {rows.length === 0 ? (
        <p className='py-1 text-[13px] text-[var(--bb-sub)]'>
          Nothing assigned here yet.
        </p>
      ) : (
        <ul>
          {rows.map((txn) => (
            <li key={txn.id}>
              <button
                type='button'
                className='flex min-h-11 w-full cursor-pointer items-center gap-3 py-2 text-left text-[14px]'
                onClick={() => onEdit(txn.id)}
              >
                <span className='w-12 flex-none text-[12px] text-[var(--bb-dim)]'>
                  {shortDate(txn.date)}
                </span>
                <span className='min-w-0 flex-1 truncate'>
                  {transactionTitle(txn.description)}
                  {txn.accountName ? ` · ${txn.accountName}` : ''}
                </span>
                <span
                  className='bb-amount shrink-0 font-semibold tabular-nums'
                  data-income={txn.kind === 'income'}
                >
                  {formatCurrency(txn.amount)}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function shortDate(iso: string | null) {
  if (!iso) return '—';
  const date = new Date(`${iso}T00:00:00`);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}
