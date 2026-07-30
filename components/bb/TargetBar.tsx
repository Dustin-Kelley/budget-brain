import { targetVerdict, type TargetKey } from '@/lib/ledger/targets';

/**
 * A share measured against its target. The bar is scaled so the target sits at
 * a fixed 60% of the track — the design's trick for making "how far off am I"
 * legible across three rows with different targets.
 */
export function TargetBar({
  bucket,
  label,
  blurb,
  amount,
  actualPercent,
  targetPercent,
  color,
}: {
  bucket: TargetKey;
  label: string;
  blurb: string;
  amount: string;
  actualPercent: number;
  targetPercent: number;
  color: string;
}) {
  const TARGET_STOP = 60;
  const scale = targetPercent > 0 ? TARGET_STOP / targetPercent : 1;
  const fill = Math.min(actualPercent * scale, 100);
  const verdict = targetVerdict(actualPercent, targetPercent, bucket);

  return (
    <div>
      <div className='mb-2 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1'>
        <div className='flex items-baseline gap-2.5'>
          <span className='text-[15.5px] font-semibold'>{label}</span>
          <span className='text-[12px] text-[var(--bb-dim)]'>{blurb}</span>
        </div>
        <div className='flex items-baseline gap-2.5'>
          <span className='text-[15.5px] font-semibold'>{amount}</span>
          <span className='text-[12.5px] text-[var(--bb-sub)]'>
            {actualPercent.toFixed(0)}%
          </span>
        </div>
      </div>

      <div className='relative h-2.5 rounded-[5px] bg-[var(--bb-track)]'>
        <div
          className='absolute top-0 bottom-0 left-0 rounded-[5px]'
          style={{ width: `${fill}%`, background: color }}
        />
        <div
          className='absolute -top-1 -bottom-1 w-0.5 -translate-x-px bg-[var(--bb-text)] opacity-70'
          style={{ left: `${TARGET_STOP}%` }}
        />
      </div>

      <div className='mt-1.5 flex justify-between text-[12px] text-[var(--bb-dim)]'>
        <span>Target {targetPercent}%</span>
        <span
          className='font-semibold'
          style={{
            color:
              verdict.tone === 'good'
                ? 'var(--bb-cy-text)'
                : 'var(--bb-mg-text)',
          }}
        >
          {verdict.text}
        </span>
      </div>
    </div>
  );
}
