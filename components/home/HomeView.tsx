import Link from 'next/link';
import { deriveInsight } from '@/lib/ledger/insight';
import type { CashFlowSummary } from '@/app/queries/getCashFlowSummary';
import { Icon } from '@/components/shell/Icon';
import { FooPathCard } from '@/components/home/FooPathCard';
import { NextUpCard } from '@/components/home/NextUpCard';
import { MoneySnapshotCard } from '@/components/home/MoneySnapshotCard';
import { BudgetStripCard } from '@/components/home/BudgetStripCard';
import { FooUnlockBanner } from '@/components/home/FooUnlockBanner';
import type { SnapshotAccount } from '@/lib/ledger/snapshot';

export function HomeView({
  accounts,
  summary,
  leftover,
  leftoverSource,
  budgetInflow,
}: {
  accounts: SnapshotAccount[];
  summary: CashFlowSummary;
  leftover: number;
  leftoverSource: 'plan' | 'ledger' | 'empty';
  budgetInflow: number;
}) {
  const insight = deriveInsight(summary);
  const showInsight =
    insight &&
    (summary.uncategorizedCount > 0 ||
      summary.net < 0 ||
      (summary.inflow === 0 && summary.lifestyleOutflow === 0));

  return (
    <div className='flex flex-col gap-[18px]'>
      <FooPathCard />
      <NextUpCard />

      <div className='grid gap-4 lg:grid-cols-2'>
        <MoneySnapshotCard accounts={accounts} />
        <BudgetStripCard
          inflow={budgetInflow}
          needs={summary.fixedOutflow}
          wants={summary.discretionaryOutflow}
          savings={summary.wealthMoveVolume}
          leftover={leftover}
          leftoverSource={leftoverSource}
        />
      </div>

      {showInsight && insight && (
        <div className='bb-card flex flex-wrap items-center gap-4 px-6 py-5'>
          <Icon
            name={insight.icon}
            size={22}
            className='flex-none'
            color='var(--bb-cy-text)'
          />
          <div className='min-w-[220px] flex-1'>
            <div className='text-[14.5px] font-semibold'>{insight.title}</div>
            <div className='mt-0.5 text-[13px] text-[var(--bb-sub)]'>
              {insight.body}
            </div>
          </div>
          {insight.action && (
            <Link
              href={insight.action.href}
              className='bb-solid'
            >
              {insight.action.label}
            </Link>
          )}
        </div>
      )}

      <FooUnlockBanner />
    </div>
  );
}
