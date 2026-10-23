import Link from 'next/link';
import { Donut, type DonutSlice } from '@/components/bb/Donut';
import { formatCurrency } from '@/lib/ledger/constants';
import {
  budgetTotals,
  groupFigures,
  isZeroBased,
} from '@/lib/budget/math';
import { withMonth } from '@/lib/budget/month';
import type { BudgetMonth } from '@/lib/budget/types';

export function PlanSummaryCard({ budget }: { budget: BudgetMonth }) {
  const totals = budgetTotals(budget);
  const groups = groupFigures(budget);
  const zero = isZeroBased(totals.left);
  const over = totals.left < 0 && !zero;
  const budgetHref = withMonth('/plan', budget.monthParam);

  const slices: DonutSlice[] = groups
    .filter((group) => group.spent > 0)
    .map((group) => ({
      name: group.name,
      amount: group.spent,
      color: group.color,
    }));

  if (totals.unassignedSpent > 0) {
    slices.push({
      name: 'Unassigned',
      amount: totals.unassignedSpent,
      color: 'var(--bb-dim)',
    });
  }

  let status = `${formatCurrency(totals.left)} left to budget`;
  let statusColor = 'var(--bb-sub)';
  if (zero && totals.income > 0) {
    status = 'Every dollar has a job';
    statusColor = 'var(--bb-cy-text)';
  } else if (over) {
    status = `${formatCurrency(Math.abs(totals.left))} over budget`;
    statusColor = 'var(--bb-mg-text)';
  } else if (totals.income === 0 && totals.budgeted === 0) {
    status = 'Add income, then assign every dollar';
  }

  const hasGroups = groups.length > 0;

  return (
    <section className='bb-card flex flex-col gap-5 px-6 py-[22px]'>
      <div className='flex flex-wrap items-start justify-between gap-3'>
        <div>
          <h2 className='text-[18px] font-semibold tracking-[-0.015em]'>
            {budget.monthLabel}
          </h2>
          <p
            className='mt-0.5 text-[13.5px]'
            style={{ color: statusColor }}
          >
            {status}
          </p>
        </div>
        <Link
          href={budgetHref}
          className='text-[13px]'
        >
          Open budget →
        </Link>
      </div>

      <dl className='grid grid-cols-3 gap-3'>
        <Total
          label='Income'
          value={totals.income}
        />
        <Total
          label='Budgeted'
          value={totals.budgeted}
        />
        <Total
          label='Spent'
          value={totals.spent}
        />
      </dl>

      {hasGroups ? (
        <div className='flex flex-col items-center gap-6 lg:flex-row lg:items-start'>
          <Donut
            slices={slices}
            total={formatCurrency(totals.spent)}
            label='Spent'
            caption={
              totals.spent === 0 ? 'Nothing spent yet' : 'By group'
            }
            size={200}
          />
          <ul className='flex w-full min-w-0 flex-1 flex-col gap-3'>
            {groups.map((group) => {
              const width = barWidth(group.planned, group.spent);
              const itemOver = group.planned > 0 && group.spent > group.planned;
              return (
                <li
                  key={group.id}
                  className='flex flex-col gap-1'
                >
                  <div className='flex items-baseline justify-between gap-3 text-[13.5px]'>
                    <span className='flex min-w-0 items-center gap-2'>
                      <span
                        className='size-2 flex-none rounded-full'
                        style={{ background: group.color }}
                      />
                      <span className='truncate font-semibold'>{group.name}</span>
                    </span>
                    <span
                      style={{
                        color: itemOver ? 'var(--bb-mg-text)' : 'var(--bb-sub)',
                      }}
                    >
                      {formatCurrency(group.spent)} / {formatCurrency(group.planned)}
                    </span>
                  </div>
                  <div className='h-2 overflow-hidden rounded-[4px] bg-[var(--bb-track)]'>
                    <div
                      className='h-full rounded-[4px]'
                      style={{
                        width: `${width}%`,
                        background: itemOver ? 'var(--bb-mg)' : group.color,
                      }}
                    />
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      ) : (
        <p className='text-[13.5px] text-[var(--bb-sub)]'>
          No groups for this month yet.{' '}
          <Link href={budgetHref}>Set up the budget</Link>
          {budget.canCopyPrevious
            ? `, or copy ${budget.previousMonthLabel}`
            : ''}
          .
        </p>
      )}
    </section>
  );
}

function barWidth(planned: number, spent: number) {
  if (planned > 0) {
    return Math.min(100, Math.round((spent / planned) * 100));
  }
  if (spent > 0) return 100;
  return 0;
}

function Total({ label, value }: { label: string; value: number }) {
  return (
    <div className='rounded-[12px] bg-[var(--bb-surface-2)] px-3 py-2.5'>
      <dt className='text-[11px] tracking-[0.08em] text-[var(--bb-dim)] uppercase'>
        {label}
      </dt>
      <dd className='mt-0.5 text-[18px] font-semibold tracking-[-0.02em]'>
        {formatCurrency(value)}
      </dd>
    </div>
  );
}
