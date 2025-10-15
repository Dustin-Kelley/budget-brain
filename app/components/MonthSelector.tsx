'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

const months = [
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

export function MonthSelector({
  selectedMonth,
}: {
  selectedMonth: string | undefined;
}) {
  const router = useRouter();
  const params = useSearchParams();
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().toLocaleString('default', { month: 'long' });

  // Parse the selected month or default to current month
  const getCurrentDisplayMonth = () => {
    if (!selectedMonth) {
      return { month: currentMonth, year: currentYear };
    }
    const [month, year] = selectedMonth.split('-');
    return { month, year: parseInt(year) };
  };

  const { month: displayMonth, year: displayYear } = getCurrentDisplayMonth();

  const updateMonthParam = (newMonth: string) => {
    const newParams = new URLSearchParams(params);
    newParams.set('month', newMonth);
    router.push(`?${newParams.toString()}`);
  };

  const handlePreviousMonth = () => {
    const currentMonthIndex = months.indexOf(displayMonth);
    let newMonthIndex = currentMonthIndex - 1;
    let newYear = displayYear;

    if (newMonthIndex < 0) {
      newMonthIndex = 11; // December
      newYear = displayYear - 1;
    }

    const newMonthString = `${months[newMonthIndex]}-${newYear}`;
    updateMonthParam(newMonthString);
  };

  const handleNextMonth = () => {
    const currentMonthIndex = months.indexOf(displayMonth);
    let newMonthIndex = currentMonthIndex + 1;
    let newYear = displayYear;

    if (newMonthIndex > 11) {
      newMonthIndex = 0; // January
      newYear = displayYear + 1;
    }

    const newMonthString = `${months[newMonthIndex]}-${newYear}`;
    updateMonthParam(newMonthString);
  };

  return (
    <div className='flex items-center gap-3'>
      <Button
        variant='ghost'
        size='icon'
        onClick={handlePreviousMonth}
      >
        <ChevronLeft className='size-5' />
      </Button>

      <div className='px-4 py-2 text-3xl font-bold text-secondary tracking-tight min-w-[200px] text-center'>
        {displayMonth} {displayYear}
      </div>

      <Button
        size='icon'
        onClick={handleNextMonth}
        variant='ghost'
      >
        <ChevronRight className='size-5' />
      </Button>
    </div>
  );
}
