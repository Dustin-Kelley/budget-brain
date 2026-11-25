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
  spentByItemId,
} from '@/lib/budget/math';
import {
  categoryColorByKey,
  resolveCategoryColor,
  type CategoryColorKey,
} from '@/lib/category-colors';
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
  setGroupColor,
} from '../actions';
import {
  CategoryColorPicker,
  CategoryDot,
} from '@/components/bb/CategoryColorPicker';
import { MoneyField, NameField } from './BudgetFields';
import { AddTransactionFab } from './AddTransactionFab';
import { LineItemDetail } from './LineItemDetail';
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
  const [editing, setEditing] = useState(false);
  const [openItemId, setOpenItemId] = useState<string | null>(null);
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
  const openItem = findOpenItem(budget, openItemId, spent);
  let editClass = 'bb-ghost';
  if (editing) editClass = 'bb-ghost bb-ghost-accent';

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
    <div className='flex flex-col gap-4 pb-[calc(5rem+env(safe-area-inset-bottom,0px))]'>
      <div className='flex justify-end'>
        <button
          type='button'
          className={editClass}
          aria-pressed={editing}
          onClick={() => setEditing((current) => !current)}
        >
          {editing ? 'Done' : 'Edit'}
        </button>
      </div>

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
        editing={editing}
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
              colorKey={group.colorKey}
              view={view}
              editing={editing}
              spentByItem={spent}
              monthParam={budget.monthParam}
              onOpenItem={setOpenItemId}
              onCommit={commit}
            />
          );
        })
      )}

      {editing || budget.groups.length === 0 ? (
        <AddGroupForm
          monthParam={budget.monthParam}
          onCommit={commit}
        />
      ) : null}

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

      <LineItemDetail
        item={openItem ? openItem.item : null}
        groupName={openItem ? openItem.groupName : ''}
        groupColor={openItem ? openItem.groupColor : 'var(--bb-dim)'}
        spent={openItem ? openItem.spent : 0}
        transactions={budget.transactions}
        onOpenChange={(open) => {
          if (!open) setOpenItemId(null);
        }}
        onCommit={commit}
        onAddTransaction={(lineItemId) => {
          setOpenItemId(null);
          openNew(lineItemId);
        }}
        onEditTransaction={(id) => {
          const txn = budget.transactions.find((row) => row.id === id);
          setOpenItemId(null);
          if (!txn) return;
          setEditor({
            token: Date.now(),
            draft: draftForEdit(txn, budget.monthParam),
          });
        }}
      />
    </div>
  );
}

function findOpenItem(
  budget: BudgetMonth,
  openItemId: string | null,
  spent: Map<string, number>,
) {
  if (!openItemId) return null;
  for (let index = 0; index < budget.groups.length; index += 1) {
    const group = budget.groups[index];
    const item = group.items.find((row) => row.id === openItemId);
    if (!item) continue;
    return {
      item,
      groupName: group.name,
      groupColor: resolveCategoryColor(group.colorKey, index),
      spent: spent.get(item.id) ?? 0,
    };
  }
  return null;
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
      className='bb-card flex flex-col gap-4 px-4 py-4 sm:px-6 sm:py-5'
      style={{ background, borderColor: border }}
    >
      <div className='flex flex-col gap-4'>
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
        <dl className='grid grid-cols-3 gap-2 sm:gap-4 sm:text-right'>
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
      <dd className='text-[15px] font-semibold tabular-nums sm:text-base'>
        {formatCurrency(value)}
      </dd>
    </div>
  );
}

function IncomeSection({
  budget,
  editing,
  onCommit,
}: {
  budget: BudgetMonth;
  editing: boolean;
  onCommit: (
    action: () => Promise<{ error: string | null }>,
    success?: string,
  ) => Promise<boolean>;
}) {
  const showAdd = editing || budget.income.length === 0;

  return (
    <section className='bb-card px-4 py-4 sm:px-5'>
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
            <IncomeRow
              key={row.id}
              row={row}
              editing={editing}
              onCommit={onCommit}
            />
          ))}
        </ul>
      )}
      {showAdd ? (
        <AddIncomeForm
          monthParam={budget.monthParam}
          onCommit={onCommit}
        />
      ) : null}
    </section>
  );
}

function IncomeRow({
  row,
  editing,
  onCommit,
}: {
  row: BudgetMonth['income'][number];
  editing: boolean;
  onCommit: (
    action: () => Promise<{ error: string | null }>,
    success?: string,
  ) => Promise<boolean>;
}) {
  if (!editing) {
    return (
      <li className='flex min-h-11 items-center gap-3 border-b border-[var(--bb-line-2)] py-2'>
        <span className='min-w-0 flex-1 truncate text-base'>{row.name}</span>
        <span className='shrink-0 text-right text-[14px] font-semibold tabular-nums'>
          {formatCurrency(row.amount)}
        </span>
      </li>
    );
  }

  return (
    <li className='flex items-center gap-2 border-b border-[var(--bb-line-2)] py-1 sm:gap-3'>
      <NameField
        value={row.name}
        label={`Income name ${row.name}`}
        onSave={(name) => onCommit(() => saveIncomeLine({ id: row.id, name }))}
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
          onCommit(() => removeIncomeLine(row.id), 'Income removed')
        }
      />
    </li>
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
      className='mt-3 flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center'
    >
      <input
        aria-label='New income name'
        value={name}
        placeholder='Paycheck'
        onChange={(event) => setName(event.target.value)}
        className='bb-field sm:min-w-[140px] sm:flex-1'
      />
      <input
        aria-label='New income amount'
        inputMode='decimal'
        value={amount}
        placeholder='0.00'
        onChange={(event) => setAmount(event.target.value)}
        className='bb-field text-right sm:w-[7.5rem] sm:flex-none'
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
  colorKey,
  view,
  editing,
  spentByItem,
  monthParam,
  onOpenItem,
  onCommit,
}: {
  group: BudgetMonth['groups'][number];
  planned: number;
  spentTotal: number;
  remaining: number;
  color: string;
  colorKey: CategoryColorKey;
  view: BudgetView;
  editing: boolean;
  spentByItem: Map<string, number>;
  monthParam: string;
  onOpenItem: (id: string) => void;
  onCommit: (
    action: () => Promise<{ error: string | null }>,
    success?: string,
  ) => Promise<boolean>;
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
    <section className='bb-card px-4 py-4 sm:px-5'>
      <div className='flex items-center gap-2 border-b border-[var(--bb-line-2)] pb-2 sm:gap-3'>
        {editing ? (
          <CategoryColorPicker
            name={group.name}
            color={color}
            colorKey={colorKey}
            onPick={(key) =>
              onCommit(() => setGroupColor({ id: group.id, color: key }))
            }
          />
        ) : (
          <span
            className='inline-flex size-6 flex-none items-center justify-center'
            title={categoryColorByKey(colorKey).name}
          >
            <CategoryDot color={color} />
          </span>
        )}
        {editing ? (
          <NameField
            value={group.name}
            label={`Group name ${group.name}`}
            onSave={(name) =>
              onCommit(() => renameGroup({ id: group.id, name }))
            }
            className='min-h-11 min-w-0 flex-1 bg-transparent text-base font-semibold outline-none md:min-h-0'
          />
        ) : (
          <h2 className='min-w-0 flex-1 truncate text-base font-semibold'>
            {group.name}
          </h2>
        )}
        <span
          className='shrink-0 text-[14px] font-semibold tabular-nums'
          style={{ color: headlineColor }}
        >
          {formatCurrency(headline)}
        </span>
        {editing ? (
          <RemoveButton
            label={`Remove group ${group.name}`}
            onRemove={() =>
              onCommit(() => removeGroup(group.id), 'Group removed')
            }
          />
        ) : null}
      </div>
      <p className='pt-1 text-[12px] text-[var(--bb-dim)]'>
        {viewCaption(view, planned, remaining)}
      </p>
      <ul>
        {group.items.map((item) => {
          const itemSpent = spentByItem.get(item.id) ?? 0;
          const shown = figureFor(view, item.planned, itemSpent);
          const itemOver = item.planned > 0 && itemSpent > item.planned;
          let itemColor: string | undefined;
          if (view !== 'planned' && itemOver) {
            itemColor = 'var(--bb-bad-text)';
          } else if (view === 'remaining' && item.planned > 0 && !itemOver) {
            itemColor = 'var(--bb-good-text)';
          }
          return (
            <li
              key={item.id}
              className='border-b border-[var(--bb-line-2)]'
            >
              <div className='flex items-center gap-1 sm:gap-2'>
                <button
                  type='button'
                  className='flex min-h-11 min-w-0 flex-1 cursor-pointer items-center gap-3 py-2 text-left'
                  onClick={() => onOpenItem(item.id)}
                >
                  <span className='min-w-0 flex-1 truncate text-base md:text-[14.5px]'>
                    {item.name}
                  </span>
                  <span
                    className='shrink-0 text-right text-[14px] font-semibold tabular-nums'
                    style={{ color: itemColor }}
                  >
                    {formatCurrency(shown)}
                  </span>
                </button>
                {editing ? (
                  <RemoveButton
                    label={`Remove ${item.name}`}
                    onRemove={() =>
                      onCommit(() => removeItem(item.id), 'Item removed')
                    }
                  />
                ) : null}
              </div>
            </li>
          );
        })}
      </ul>
      {editing || group.items.length === 0 ? (
        <AddItemForm
          categoryId={group.id}
          monthParam={monthParam}
          onCommit={onCommit}
        />
      ) : null}
    </section>
  );
}

function viewCaption(view: BudgetView, planned: number, remaining: number) {
  if (view === 'planned') return 'Planned';
  if (view === 'spent') return `Spent of ${formatCurrency(planned)} planned`;
  return `${formatCurrency(remaining)} remaining of ${formatCurrency(planned)}`;
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
      className='mt-3 flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center'
    >
      <input
        aria-label='New item name'
        value={name}
        placeholder='Add an item'
        onChange={(event) => setName(event.target.value)}
        className='bb-field sm:min-w-[160px] sm:flex-1'
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
      className='flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center'
    >
      <input
        aria-label='New group name'
        value={name}
        placeholder='New group'
        onChange={(event) => setName(event.target.value)}
        className='bb-field sm:min-w-[180px] sm:flex-1'
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
    <section className='bb-card flex flex-col items-start gap-3 px-4 py-5 sm:px-6 sm:py-6'>
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
        className='inline-flex min-h-11 cursor-pointer items-center px-1 text-[13px] text-[var(--bb-dim)] md:min-h-0 md:px-0 md:text-[12px]'
        aria-label={label}
        onClick={() => setArmed(true)}
      >
        Remove
      </button>
    );
  }

  return (
    <span className='flex items-center gap-1 text-[13px] md:text-[12px]'>
      <button
        type='button'
        className='inline-flex min-h-11 cursor-pointer items-center px-1 text-[var(--bb-mg-text)] md:min-h-0'
        onClick={() => {
          void onRemove();
        }}
      >
        Confirm
      </button>
      <button
        type='button'
        className='inline-flex min-h-11 cursor-pointer items-center px-1 text-[var(--bb-dim)] md:min-h-0'
        onClick={() => setArmed(false)}
      >
        Keep
      </button>
    </span>
  );
}
