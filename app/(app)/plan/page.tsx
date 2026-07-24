import { Suspense } from 'react';
import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/app/queries/getCurrentUser';
import { getCashFlowSummary } from '@/app/queries/getCashFlowSummary';
import { getCategories } from '@/app/queries/getCategories';
import { formatCurrency } from '@/lib/ledger/constants';
import { ALLOCATION_TARGETS, TARGET_META } from '@/lib/ledger/targets';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { AddExpenseForm } from '@/app/components/AddExpenseForm';
import { RemainingSpentTab } from './components/RemainingSpentTab';
import { IncomeCard } from './components/IncomeCard';
import { CategoryCards } from './components/CategoryCards';
import { TransactionsTab } from './components/TransactionsTab';

export default async function PlanPage({
  searchParams,
}: {
  searchParams: Promise<{ month?: string }>;
}) {
  const { month } = await searchParams;
  const { currentUser } = await getCurrentUser();

  if (!currentUser) redirect('/welcome');

  return (
    <div className='flex flex-col gap-5'>
      <div>
        <h1 className='bb-title'>Plan</h1>
        <p className='mt-1.5 text-[14px] text-[var(--bb-sub)]'>
          The split you are holding yourself to, and what it is paying for
        </p>
      </div>

      <Suspense
        key={month ?? 'current'}
        fallback={<Skeleton className='h-[220px] rounded-2xl' />}
      >
        <SplitCard month={month} />
      </Suspense>

      <Suspense fallback={<Skeleton className='h-[400px] rounded-2xl' />}>
        <Planner month={month} />
      </Suspense>
    </div>
  );
}

/**
 * The 50/30/20 split, with each band's target set against what actually ran
 * this period. Targets are constants for now — see docs/DESIGN_REFRESH_PLAN.md.
 */
async function SplitCard({ month }: { month: string | undefined }) {
  const summary = await getCashFlowSummary(month);

  const actuals: Record<keyof typeof ALLOCATION_TARGETS, number> = {
    needs: summary.fixedOutflow,
    wants: summary.discretionaryOutflow,
    savings: summary.wealthMoveVolume,
  };

  const keys = ['needs', 'wants', 'savings'] as const;

  return (
    <div className='bb-card flex flex-col gap-5 px-6 py-[22px]'>
      <div className='flex flex-wrap items-center justify-between gap-4'>
        <span className='bb-kicker'>Income this period</span>
        <span className='rounded-[10px] border border-[var(--bb-line)] bg-[var(--bb-surface-2)] px-3.5 py-2 text-[15px] font-semibold'>
          {formatCurrency(summary.inflow)}
        </span>
      </div>

      <div className='flex h-3.5 overflow-hidden rounded-[7px]'>
        {keys.map((key) => (
          <div
            key={key}
            style={{
              width: `${ALLOCATION_TARGETS[key]}%`,
              background: TARGET_META[key].color,
            }}
          />
        ))}
      </div>

      <div className='grid gap-4 sm:grid-cols-3'>
        {keys.map((key) => (
          <div
            key={key}
            className='flex flex-col gap-1'
          >
            <div className='flex items-center gap-2'>
              <span
                className='size-[9px] rounded-[2px]'
                style={{ background: TARGET_META[key].color }}
              />
              <span className='text-[14px] font-semibold'>
                {TARGET_META[key].label} {ALLOCATION_TARGETS[key]}%
              </span>
            </div>
            <span className='text-[12.5px] text-[var(--bb-sub)]'>
              {formatCurrency(
                (ALLOCATION_TARGETS[key] / 100) * summary.inflow,
              )}{' '}
              target · running {formatCurrency(actuals[key])}
            </span>
          </div>
        ))}
      </div>

      <p className='text-[12px] text-[var(--bb-dim)]'>
        The standard split. Editable per-household targets are not stored yet.
      </p>
    </div>
  );
}

/** The envelope planner — unchanged behaviour, new chrome. */
async function Planner({ month }: { month: string | undefined }) {
  const { categories } = await getCategories({ date: month });

  return (
    <div className='flex flex-col gap-4'>
      <div className='flex flex-wrap items-center justify-between gap-3'>
        <div>
          <span className='bb-kicker'>Envelopes</span>
          <p className='mt-1 text-[13.5px] text-[var(--bb-sub)]'>
            What the plan is paying for, category by category
          </p>
        </div>
        <AddExpenseForm categories={categories} />
      </div>

      <Tabs defaultValue='planned'>
        <TabsList className='grid grid-cols-3'>
          <TabsTrigger value='planned'>Planned</TabsTrigger>
          <TabsTrigger value='remaining'>Remaining</TabsTrigger>
          <TabsTrigger value='transactions'>Transactions</TabsTrigger>
        </TabsList>

        <TabsContent
          value='planned'
          className='flex flex-col gap-4'
        >
          <IncomeCard month={month} />
          <CategoryCards month={month} />
        </TabsContent>

        <TabsContent
          value='remaining'
          className='flex flex-col gap-4'
        >
          <RemainingSpentTab month={month} />
        </TabsContent>

        <TabsContent value='transactions'>
          <TransactionsTab month={month} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
