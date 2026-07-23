import { formatCurrency } from '@/lib/ledger/constants';
import type { CashFlowSummary } from '@/app/queries/getCashFlowSummary';
import { cn } from '@/lib/utils';

export function CashFlowCard({ summary }: { summary: CashFlowSummary }) {
  const isPositive = summary.net >= 0;

  return (
    <section className='rounded-3xl border bg-card p-6 shadow-md'>
      <div className='mb-4'>
        <h2 className='text-lg font-semibold'>Cash flow</h2>
        <p className='text-sm text-muted-foreground'>{summary.periodLabel}</p>
      </div>
      <div className='grid gap-4 sm:grid-cols-3'>
        <Metric
          label='In'
          value={formatCurrency(summary.inflow)}
          tone='neutral'
        />
        <Metric
          label='Lifestyle out'
          value={formatCurrency(summary.lifestyleOutflow)}
          tone='neutral'
        />
        <Metric
          label='Net'
          value={formatCurrency(summary.net)}
          tone={isPositive ? 'positive' : 'negative'}
        />
      </div>
      {(summary.transferVolume > 0 || summary.wealthMoveVolume > 0) && (
        <p className='mt-4 text-xs text-muted-foreground'>
          Excluded from net:{' '}
          {summary.transferVolume > 0 &&
            `${formatCurrency(summary.transferVolume)} transfers`}
          {summary.transferVolume > 0 &&
            summary.wealthMoveVolume > 0 &&
            ' · '}
          {summary.wealthMoveVolume > 0 &&
            `${formatCurrency(summary.wealthMoveVolume)} wealth moves`}
        </p>
      )}
    </section>
  );
}

function Metric({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone: 'neutral' | 'positive' | 'negative';
}) {
  return (
    <div className='flex flex-col gap-1'>
      <span className='text-sm text-muted-foreground'>{label}</span>
      <span
        className={cn(
          'text-2xl font-semibold tracking-tight',
          tone === 'positive' && 'text-emerald-600 dark:text-emerald-400',
          tone === 'negative' && 'text-rose-600 dark:text-rose-400',
        )}
      >
        {value}
      </span>
    </div>
  );
}
