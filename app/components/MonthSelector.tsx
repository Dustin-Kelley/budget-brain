'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
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
  const [direction, setDirection] = useState<'left' | 'right' | null>(null);

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
    setDirection('left');
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
    setDirection('right');
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

      <div className='text-3xl font-bold'>
        <AnimatePresence
          mode='wait'
          onExitComplete={() => setDirection(null)}
        >
          <motion.div
            key={`${displayMonth}-${displayYear}`}
            initial={{
              opacity: 0,
              x: direction === 'left' ? -50 : direction === 'right' ? 50 : 0,
            }}
            animate={{ opacity: 1, x: 0 }}
            exit={{
              opacity: 0,
              x: direction === 'left' ? 50 : direction === 'right' ? -50 : 0,
            }}
            transition={{
              duration: 0.3,
              ease: 'easeInOut',
            }}
          >
            {displayMonth} {displayYear}
          </motion.div>
        </AnimatePresence>
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
