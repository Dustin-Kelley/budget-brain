'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { formatCurrency } from '@/lib/ledger/constants';
import {
  budgetTotals,
  figureFor,
  groupFigures,
  isZeroBased,
  itemActivity,
  spentByItemId,
  transactionTitle,
} from '@/lib/budget/math';
import type { BudgetMonth, BudgetView } from '@/lib/budget/types';
import {
  addGroup,
  addIncomeLine,
  addItem,
  copyPreviousBudget,
  removeGroup,
  removeIncomeLine,
  removeItem,
  renameGroup,
  saveIncomeLine,
  saveItem,
} from '../actions';
import { MoneyField, NameField } from './BudgetFields';
import { AddTransactionFab } from './AddTransactionFab';
import {
  TransactionFormDialog,
  draftForEdit,
  draftForNew,
  type TransactionEditor,
} from './TransactionFormDialog';

const VIEWS: { id: BudgetView; label: string }[] = [
  { id: 'planned', label: 'Planned' },
  { id: 'spent', label: 'Spent' },
  { id: 'remaining', label: 'Remaining' },
];

export function BudgetScreen({ budget }: { budget: BudgetMonth }) {
  const router = useRouter();
  const [view, setView] = useState<BudgetView>('planned');
  const [activityId, setActivityId] = useState<string | null>(null);
  const [editor, setEditor] = useState<TransactionEditor | null>(null);
  const [copying, setCopying] = useState(false);
  const [confirmCopy, setConfirmCopy] = useState(false);

  const totals = budgetTotals(budget);
  const figures = groupFigures(budget);
  const spent = spentByItemId(budget.transactions);
  const zero = isZeroBased(totals.left);

  async function commit(
    action: () => Promise<{ error: string | null }>,
    success?: string,
  ) {
    const result = await action();
    if (result.error) {
      toast.error(result.error);
      return false;
    }
    if (success) toast.success(success);
    router.refresh();
    return true;
  }

  function openNew(lineItemId?: string) {
    setEditor({
      token: Date.now(),
      draft: draftForNew(budget.monthParam, lineItemId),
    });
  }

  async function onCopy() {
    setCopying(true);
    const saved = await commit(
      () =>
        copyPreviousBudget({
          fromMonth: budget.previousMonthParam,
          toMonth: budget.monthParam,
        }),
      `Copied ${budget.previousMonthLabel}`,
    );
    setCopying(false);
    if (saved) setConfirmCopy(false);
  }

  const adding = editor !== null && !editor.draft.id;

  function onAddOpenChange(next: boolean) {
    if (next) {
      openNew();
      return;
    }
    setEditor((current) => {
      if (current && !current.draft.id) return null;
      return current;
    });
  }

  return (
    <div className='flex flex-col gap-4 pb-20'>
      {budget.loadError ? (
        <p className='rounded-[14px] border border-[var(--bb-mg)] bg-[var(--bb-mg-tint)] px-4 py-3 text-[13.5px] text-[var(--bb-mg-text)]'>
          {budget.loadError}
        </p>
      ) : null}

      <BudgetBanner
        income={totals.income}
        budgeted={totals.budgeted}
        spent={totals.spent}
        left={totals.left}
        zero={zero}
      />

      <div
        className='bb-segments'
        role='radiogroup'
        aria-label='Budget view'
      >
        {VIEWS.map((option) => (
          <button
            key={option.id}
            type='button'
            role='radio'
            aria-checked={view === option.id}
            className='bb-chip'
            data-on={view === option.id}
            onClick={() => setView(option.id)}
          >
            {option.label}
          </button>
        ))}
      </div>

      <IncomeSection
        budget={budget}
        onCommit={commit}
      />

      {budget.groups.length === 0 ? (
        <EmptyMonth
          previousLabel={budget.previousMonthLabel}
          canCopy={budget.canCopyPrevious}
          confirmCopy={confirmCopy}
          copying={copying}
          onAskCopy={() => setConfirmCopy(true)}
          onCancelCopy={() => setConfirmCopy(false)}
          onCopy={() => {
            void onCopy();
          }}
        />
      ) : (
        figures.map((group) => {
          const source = budget.groups.find((row) => row.id === group.id);
          if (!source) return null;
          return (
            <GroupCard
              key={group.id}
              group={source}
              planned={group.planned}
              spentTotal={group.spent}
              remaining={group.remaining}
              color={group.color}
              view={view}
              activityId={activityId}
              spentByItem={spent}
              transactions={budget.transactions}
              monthParam={budget.monthParam}
              onToggleActivity={(id) =>
                setActivityId((current) => (current === id ? null : id))
              }
              onCommit={commit}
              onAddTransaction={openNew}
              onEditTransaction={(id) => {
                const txn = budget.transactions.find((row) => row.id === id);
                if (!txn) return;
                setEditor({
                  token: Date.now(),
                  draft: draftForEdit(txn, budget.monthParam),
                });
              }}
            />
          );
        })
      )}

      <AddGroupForm
        monthParam={budget.monthParam}
        onCommit={commit}
      />

      <AddTransactionFab
        open={adding}
        editor={adding ? editor : null}
        onOpenChange={onAddOpenChange}
        onClose={() => setEditor(null)}
        groups={budget.groups}
        accounts={budget.accounts}
        accountsLinked={budget.accountsLinked}
        monthParam={budget.monthParam}
      />

      <TransactionFormDialog
        editor={editor?.draft.id ? editor : null}
        groups={budget.groups}
        accounts={budget.accounts}
        accountsLinked={budget.accountsLinked}
        monthParam={budget.monthParam}
        onClose={() => setEditor(null)}
      />
    </div>
  );
}

function BudgetBanner({
  income,
  budgeted,
  spent,
  left,
  zero,
}: {
  income: number;
  budgeted: number;
  spent: number;
  left: number;
  zero: boolean;
}) {
  const over = left < 0 && !zero;
  const empty = income === 0 && budgeted === 0;
  let title = 'Left to budget';
  let detail = 'Assign the rest of this month’s income.';
  let tone = 'var(--bb-good-text)';
  let background = 'var(--bb-good-tint)';
  let border = 'var(--bb-good)';

  if (empty) {
    detail = 'Add this month’s income, then assign every dollar.';
    tone = 'var(--bb-text)';
    background = 'var(--bb-surface)';
    border = 'var(--bb-line)';
  } else if (zero) {
    title = 'Every dollar has a job';
    detail = 'Income and planned spending match.';
  } else if (over) {
    title = 'Over budget';
    detail = 'Planned spending is higher than income. Pull something back.';
    tone = 'var(--bb-bad-text)';
    background = 'var(--bb-bad-tint)';
    border = 'var(--bb-bad)';
  }

  return (
    <section
      aria-live='polite'
      className='bb-card flex flex-col gap-4 px-6 py-5'
      style={{ background, borderColor: border }}
    >
      <div className='flex flex-wrap items-end justify-between gap-4'>
        <div>
          <div
            className='text-[13px] font-semibold'
            style={{ color: tone }}
          >
            {title}
          </div>
          <div className='bb-display mt-1'>
            {zero ? formatCurrency(0) : formatCurrency(Math.abs(left))}
          </div>
          <p className='mt-1 text-[13.5px] text-[var(--bb-sub)]'>{detail}</p>
        </div>
        <dl className='grid grid-cols-3 gap-4 text-right'>
          <Stat
            label='Income'
            value={income}
          />
          <Stat
            label='Budgeted'
            value={budgeted}
          />
          <Stat
            label='Spent'
            value={spent}
          />
        </dl>
      </div>
    </section>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <dt className='text-[11px] tracking-[0.08em] text-[var(--bb-dim)] uppercase'>
        {label}
      </dt>
      <dd className='text-[16px] font-semibold'>{formatCurrency(value)}</dd>
    </div>
  );
}

function IncomeSection({
  budget,
  onCommit,
}: {
  budget: BudgetMonth;
  onCommit: (
    action: () => Promise<{ error: string | null }>,
    success?: string,
  ) => Promise<boolean>;
}) {
  return (
    <section className='bb-card px-5 py-4'>
      <div className='mb-2 flex items-baseline justify-between gap-3'>
        <h2 className='text-[16px] font-semibold'>Income</h2>
        <span className='text-[13px] text-[var(--bb-sub)]'>
          {formatCurrency(budgetTotals(budget).income)} planned
        </span>
      </div>
      {budget.income.length === 0 ? (
        <p className='pb-2 text-[13.5px] text-[var(--bb-sub)]'>
          Add each paycheck you expect this month.
        </p>
      ) : (
        <ul>
          {budget.income.map((row) => (
            <li
              key={row.id}
              className='flex items-center gap-3 border-b border-[var(--bb-line-2)] py-2'
            >
              <NameField
                value={row.name}
                label={`Income name ${row.name}`}
                onSave={(name) =>
                  onCommit(() => saveIncomeLine({ id: row.id, name }))
                }
              />
              <MoneyField
                value={row.amount}
                label={`Planned amount for ${row.name}`}
                onSave={(amount) =>
                  onCommit(() => saveIncomeLine({ id: row.id, amount }))
                }
              />
              <RemoveButton
                label={`Remove ${row.name}`}
                onRemove={() =>
                  onCommit(
                    () => removeIncomeLine(row.id),
                    'Income removed',
                  )
                }
              />
            </li>
          ))}
        </ul>
      )}
      <AddIncomeForm
        monthParam={budget.monthParam}
        onCommit={onCommit}
      />
    </section>
  );
}

function AddIncomeForm({
  monthParam,
  onCommit,
}: {
  monthParam: string;
  onCommit: (
    action: () => Promise<{ error: string | null }>,
    success?: string,
  ) => Promise<boolean>;
}) {
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [pending, setPending] = useState(false);

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setPending(true);
    const saved = await onCommit(
      () =>
        addIncomeLine({
          name,
          amount: Number(amount.replace(/[$,\s]/g, '')),
          monthParam,
        }),
      'Income added',
    );
    setPending(false);
    if (saved) {
      setName('');
      setAmount('');
    }
  }

  return (
    <form
      onSubmit={(event) => {
        void onSubmit(event);
      }}
      className='mt-3 flex flex-wrap items-center gap-2'
    >
      <input
        aria-label='New income name'
        value={name}
        placeholder='Paycheck'
        onChange={(event) => setName(event.target.value)}
        className='min-w-[140px] flex-1 rounded-xl border border-[var(--bb-line)] bg-[var(--bb-surface)] px-3 py-1.5 text-[14px]'
      />
      <input
        aria-label='New income amount'
        inputMode='decimal'
        value={amount}
        placeholder='0.00'
        onChange={(event) => setAmount(event.target.value)}
        className='w-[108px] rounded-xl border border-[var(--bb-line)] bg-[var(--bb-surface)] px-2 py-1.5 text-right text-[14px]'
      />
      <button
        type='submit'
        className='bb-ghost'
        disabled={pending}
      >
        Add income
      </button>
    </form>
  );
}

function GroupCard({
  group,
  planned,
  spentTotal,
  remaining,
  color,
  view,
  activityId,
  spentByItem,
  transactions,
  monthParam,
  onToggleActivity,
  onCommit,
  onAddTransaction,
  onEditTransaction,
}: {
  group: BudgetMonth['groups'][number];
  planned: number;
  spentTotal: number;
  remaining: number;
  color: string;
  view: BudgetView;
  activityId: string | null;
  spentByItem: Map<string, number>;
  transactions: BudgetMonth['transactions'];
  monthParam: string;
  onToggleActivity: (id: string) => void;
  onCommit: (
    action: () => Promise<{ error: string | null }>,
    success?: string,
  ) => Promise<boolean>;
  onAddTransaction: (lineItemId?: string) => void;
  onEditTransaction: (id: string) => void;
}) {
  const headline = figureFor(view, planned, spentTotal);
  const over = view !== 'planned' && spentTotal > planned && planned > 0;
  let headlineColor: string | undefined;
  if (over) {
    headlineColor = 'var(--bb-bad-text)';
  } else if (view === 'remaining' && planned > 0) {
    headlineColor = 'var(--bb-good-text)';
  }

  return (
    <section className='bb-card px-5 py-4'>
      <div className='flex items-center gap-3 border-b border-[var(--bb-line-2)] pb-2'>
        <span
          className='size-2.5 flex-none rounded-full'
          style={{ background: color }}
        />
        <NameField
          value={group.name}
          label={`Group name ${group.name}`}
          onSave={(name) => onCommit(() => renameGroup({ id: group.id, name }))}
          className='min-w-0 flex-1 bg-transparent text-[16px] font-semibold outline-none'
        />
        <span
          className='text-[14px] font-semibold'
          style={{ color: headlineColor }}
        >
          {formatCurrency(headline)}
        </span>
        <RemoveButton
          label={`Remove group ${group.name}`}
          onRemove={() =>
            onCommit(() => removeGroup(group.id), 'Group removed')
          }
        />
      </div>
      <p className='pt-1 text-[12px] text-[var(--bb-dim)]'>
        {viewCaption(view, planned, remaining)}
      </p>
      <ul>
        {group.items.map((item) => {
          const itemSpent = moneySafe(spentByItem.get(item.id));
          const shown = figureFor(view, item.planned, itemSpent);
          const itemOver = item.planned > 0 && itemSpent > item.planned;
          let itemColor: string | undefined;
          if (view !== 'planned' && itemOver) {
            itemColor = 'var(--bb-bad-text)';
          } else if (view === 'remaining' && item.planned > 0 && !itemOver) {
            itemColor = 'var(--bb-good-text)';
          }
          const open = activityId === item.id;
          const activity = itemActivity(transactions, item.id);
          return (
            <li
              key={item.id}
              className='border-b border-[var(--bb-line-2)] py-2'
            >
              <div className='flex items-center gap-3'>
                <NameField
                  value={item.name}
                  label={`Item name ${item.name}`}
                  onSave={(name) =>
                    onCommit(() => saveItem({ id: item.id, name }))
                  }
                  className='min-w-0 flex-1 bg-transparent text-[14.5px] outline-none'
                />
                {view === 'planned' ? (
                  <MoneyField
                    value={item.planned}
                    label={`Planned amount for ${item.name}`}
                    onSave={(amount) =>
                      onCommit(() => saveItem({ id: item.id, planned: amount }))
                    }
                  />
                ) : (
                  <span
                    className='w-[108px] text-right text-[14px] font-semibold'
                    style={{ color: itemColor }}
                  >
                    {formatCurrency(shown)}
                  </span>
                )}
                <RemoveButton
                  label={`Remove ${item.name}`}
                  onRemove={() =>
                    onCommit(() => removeItem(item.id), 'Item removed')
                  }
                />
              </div>
              <button
                type='button'
                className='mt-1 cursor-pointer text-[12px] text-[var(--bb-dim)]'
                aria-expanded={open}
                onClick={() => onToggleActivity(item.id)}
              >
                {open ? 'Hide activity' : 'Activity this month'}
              </button>
              {open ? (
                <ActivityList
                  itemName={item.name}
                  rows={activity}
                  onAdd={() => onAddTransaction(item.id)}
                  onEdit={onEditTransaction}
                />
              ) : null}
            </li>
          );
        })}
      </ul>
      <AddItemForm
        categoryId={group.id}
        monthParam={monthParam}
        onCommit={onCommit}
      />
    </section>
  );
}

function viewCaption(view: BudgetView, planned: number, remaining: number) {
  if (view === 'planned') return 'Planned';
  if (view === 'spent') return `Spent of ${formatCurrency(planned)} planned`;
  return `${formatCurrency(remaining)} remaining of ${formatCurrency(planned)}`;
}

function moneySafe(value: number | undefined) {
  return value ?? 0;
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
    <div className='mt-2 rounded-[12px] bg-[var(--bb-surface-2)] px-3 py-2'>
      <div className='mb-1 flex items-center justify-between gap-2'>
        <span className='text-[12px] font-semibold tracking-[0.06em] text-[var(--bb-dim)] uppercase'>
          Activity this month
        </span>
        <button
          type='button'
          className='cursor-pointer text-[12.5px] text-[var(--bb-cy-text)]'
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
                className='flex w-full cursor-pointer items-center gap-3 py-1.5 text-left text-[13.5px]'
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
                  className='bb-amount font-semibold'
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

function AddItemForm({
  categoryId,
  monthParam,
  onCommit,
}: {
  categoryId: string;
  monthParam: string;
  onCommit: (
    action: () => Promise<{ error: string | null }>,
    success?: string,
  ) => Promise<boolean>;
}) {
  const [name, setName] = useState('');
  const [pending, setPending] = useState(false);

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setPending(true);
    const saved = await onCommit(
      () => addItem({ categoryId, name, monthParam }),
      'Item added',
    );
    setPending(false);
    if (saved) setName('');
  }

  return (
    <form
      onSubmit={(event) => {
        void onSubmit(event);
      }}
      className='mt-3 flex flex-wrap items-center gap-2'
    >
      <input
        aria-label='New item name'
        value={name}
        placeholder='Add an item'
        onChange={(event) => setName(event.target.value)}
        className='min-w-[160px] flex-1 rounded-xl border border-[var(--bb-line)] bg-[var(--bb-surface)] px-3 py-1.5 text-[14px]'
      />
      <button
        type='submit'
        className='bb-ghost'
        disabled={pending}
      >
        Add item
      </button>
    </form>
  );
}

function AddGroupForm({
  monthParam,
  onCommit,
}: {
  monthParam: string;
  onCommit: (
    action: () => Promise<{ error: string | null }>,
    success?: string,
  ) => Promise<boolean>;
}) {
  const [name, setName] = useState('');
  const [pending, setPending] = useState(false);

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setPending(true);
    const saved = await onCommit(
      () => addGroup({ name, monthParam }),
      'Group added',
    );
    setPending(false);
    if (saved) setName('');
  }

  return (
    <form
      onSubmit={(event) => {
        void onSubmit(event);
      }}
      className='flex flex-wrap items-center gap-2'
    >
      <input
        aria-label='New group name'
        value={name}
        placeholder='New group'
        onChange={(event) => setName(event.target.value)}
        className='min-w-[180px] flex-1 rounded-xl border border-[var(--bb-line)] bg-[var(--bb-surface)] px-3 py-2 text-[14px]'
      />
      <button
        type='submit'
        className='bb-ghost'
        disabled={pending}
      >
        Add group
      </button>
    </form>
  );
}

function EmptyMonth({
  previousLabel,
  canCopy,
  confirmCopy,
  copying,
  onAskCopy,
  onCancelCopy,
  onCopy,
}: {
  previousLabel: string;
  canCopy: boolean;
  confirmCopy: boolean;
  copying: boolean;
  onAskCopy: () => void;
  onCancelCopy: () => void;
  onCopy: () => void;
}) {
  return (
    <section className='bb-card flex flex-col items-start gap-3 px-6 py-6'>
      <h2 className='text-[16px] font-semibold'>This month is empty</h2>
      <p className='max-w-[52ch] text-[14px] text-[var(--bb-sub)]'>
        Add a group below
        {canCopy ? `, or copy the groups and income from ${previousLabel}` : ''}
        .
      </p>
      {canCopy && !confirmCopy ? (
        <button
          type='button'
          className='bb-solid'
          onClick={onAskCopy}
        >
          Copy {previousLabel}
        </button>
      ) : null}
      {canCopy && confirmCopy ? (
        <div className='flex flex-wrap items-center gap-2'>
          <p className='text-[13.5px] text-[var(--bb-sub)]'>
            This replaces any income already entered for this month.
          </p>
          <button
            type='button'
            className='bb-solid'
            disabled={copying}
            onClick={onCopy}
          >
            {copying ? 'Copying…' : 'Copy month'}
          </button>
          <button
            type='button'
            className='bb-ghost'
            disabled={copying}
            onClick={onCancelCopy}
          >
            Cancel
          </button>
        </div>
      ) : null}
    </section>
  );
}

function RemoveButton({
  label,
  onRemove,
}: {
  label: string;
  onRemove: () => Promise<boolean>;
}) {
  const [armed, setArmed] = useState(false);

  if (!armed) {
    return (
      <button
        type='button'
        className='cursor-pointer text-[12px] text-[var(--bb-dim)]'
        aria-label={label}
        onClick={() => setArmed(true)}
      >
        Remove
      </button>
    );
  }

  return (
    <span className='flex items-center gap-2 text-[12px]'>
      <button
        type='button'
        className='cursor-pointer text-[var(--bb-mg-text)]'
        onClick={() => {
          void onRemove();
        }}
      >
        Confirm
      </button>
      <button
        type='button'
        className='cursor-pointer text-[var(--bb-dim)]'
        onClick={() => setArmed(false)}
      >
        Keep
      </button>
    </span>
  );
}
