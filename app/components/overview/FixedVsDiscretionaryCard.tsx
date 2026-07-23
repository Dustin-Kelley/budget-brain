import { formatCurrency } from '@/lib/ledger/constants';
import type { CashFlowSummary } from '@/app/queries/getCashFlowSummary';

export function FixedVsDiscretionaryCard({
  summary,
}: {
  summary: CashFlowSummary;
}) {
  const total = summary.lifestyleOutflow;
  const fixedPct = total > 0 ? (summary.fixedOutflow / total) * 100 : 0;
  const discPct = total > 0 ? (summary.discretionaryOutflow / total) * 100 : 0;

  return (
    <section className='rounded-3xl border bg-card p-6 shadow-md'>
      <div className='mb-4'>
        <h2 className='text-lg font-semibold'>Fixed vs discretionary</h2>
        <p className='text-sm text-muted-foreground'>
          By account purpose and category group
        </p>
      </div>

      <div className='flex h-3 overflow-hidden rounded-full bg-muted'>
        <div
          className='bg-sky-600 transition-all'
          style={{ width: `${fixedPct}%` }}
          title={`Fixed ${fixedPct.toFixed(1)}%`}
        />
        <div
          className='bg-amber-500 transition-all'
          style={{ width: `${discPct}%` }}
          title={`Discretionary ${discPct.toFixed(1)}%`}
        />
      </div>

      <div className='mt-4 grid gap-3 sm:grid-cols-2'>
        <div className='flex items-center justify-between gap-2'>
          <div className='flex items-center gap-2'>
            <span className='h-2.5 w-2.5 rounded-full bg-sky-600' />
            <span className='text-sm'>Fixed</span>
          </div>
          <div className='text-right text-sm'>
            <div className='font-medium'>
              {formatCurrency(summary.fixedOutflow)}
            </div>
            <div className='text-muted-foreground'>{fixedPct.toFixed(1)}%</div>
          </div>
        </div>
        <div className='flex items-center justify-between gap-2'>
          <div className='flex items-center gap-2'>
            <span className='h-2.5 w-2.5 rounded-full bg-amber-500' />
            <span className='text-sm'>Discretionary</span>
          </div>
          <div className='text-right text-sm'>
            <div className='font-medium'>
              {formatCurrency(summary.discretionaryOutflow)}
            </div>
            <div className='text-muted-foreground'>{discPct.toFixed(1)}%</div>
          </div>
        </div>
      </div>
    </section>
  );
}
