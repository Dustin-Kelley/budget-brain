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

const SHORT_MONTHS = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
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
    <span className='inline-flex h-11 items-center rounded-full border border-[var(--bb-line)] bg-[var(--bb-surface-2)] text-[13px] whitespace-nowrap text-[var(--bb-text)] md:h-9'>
      <button
        type='button'
        onClick={() => step(-1)}
        className='inline-flex size-11 cursor-pointer items-center justify-center rounded-full text-[var(--bb-dim)] transition-colors hover:text-[var(--bb-text)] md:size-8'
        aria-label='Previous month'
      >
        <Icon
          name='caret-left'
          size={16}
        />
      </button>
      <span className='min-w-[4.6rem] px-0.5 text-center font-medium tabular-nums md:min-w-[7.25rem]'>
        <span className='md:hidden'>
          {SHORT_MONTHS[monthIndex]} {year}
        </span>
        <span className='hidden md:inline'>
          {MONTHS[monthIndex]} {year}
        </span>
      </span>
      <button
        type='button'
        onClick={() => step(1)}
        className='inline-flex size-11 cursor-pointer items-center justify-center rounded-full text-[var(--bb-dim)] transition-colors hover:text-[var(--bb-text)] md:size-8'
        aria-label='Next month'
      >
        <Icon
          name='caret-right'
          size={16}
        />
      </button>
    </span>
  );
}
