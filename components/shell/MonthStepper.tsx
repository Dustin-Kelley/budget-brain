'use client';

import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { Icon } from './Icon';

const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

/**
 * The header month pill. Reads/writes the `month` search param that every
 * ledger query already understands ("July-2026").
 */
export function MonthStepper() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  const selected = params.get('month');
  const now = new Date();

  let monthIndex = now.getMonth();
  let year = now.getFullYear();

  if (selected) {
    const [name, yearStr] = selected.split('-');
    const parsed = MONTHS.findIndex(
      (m) => m.toLowerCase() === name?.toLowerCase(),
    );
    const parsedYear = Number(yearStr);
    if (parsed !== -1 && Number.isFinite(parsedYear)) {
      monthIndex = parsed;
      year = parsedYear;
    }
  }

  const step = (delta: number) => {
    let nextIndex = monthIndex + delta;
    let nextYear = year;
    if (nextIndex < 0) {
      nextIndex = 11;
      nextYear -= 1;
    } else if (nextIndex > 11) {
      nextIndex = 0;
      nextYear += 1;
    }
    const next = new URLSearchParams(params);
    next.set('month', `${MONTHS[nextIndex]}-${nextYear}`);
    router.push(`${pathname}?${next.toString()}`);
  };

  return (
    <span className='flex items-center gap-2.5 rounded-[9px] border border-[var(--bb-line)] bg-[var(--bb-surface-2)] px-3 py-1.5 text-[13px] whitespace-nowrap'>
      <button
        type='button'
        onClick={() => step(-1)}
        className='cursor-pointer text-[var(--bb-dim)] transition-colors hover:text-[var(--bb-text)]'
        aria-label='Previous month'
      >
        <Icon
          name='caret-left'
          size={14}
        />
      </button>
      <span className='min-w-[86px] text-center'>
        {MONTHS[monthIndex]} {year}
      </span>
      <button
        type='button'
        onClick={() => step(1)}
        className='cursor-pointer text-[var(--bb-dim)] transition-colors hover:text-[var(--bb-text)]'
        aria-label='Next month'
      >
        <Icon
          name='caret-right'
          size={14}
        />
      </button>
    </span>
  );
}
