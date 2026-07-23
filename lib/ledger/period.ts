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
] as const;

/**
 * Parse UI month param ("January-2026") into inclusive date bounds (ISO dates).
 * Falls back to the current calendar month when missing/invalid.
 */
export function getPeriodBoundsFromMonthParam(monthParam: string | undefined): {
  startDate: string;
  endDate: string;
  monthNumber: number;
  yearNumber: number;
  label: string;
} {
  const now = new Date();
  let monthIndex = now.getMonth();
  let yearNumber = now.getFullYear();

  if (monthParam) {
    const [monthName, yearStr] = monthParam.split('-');
    const parsedIndex = MONTHS.findIndex(
      (m) => m.toLowerCase() === monthName?.toLowerCase(),
    );
    const parsedYear = Number(yearStr);
    if (parsedIndex !== -1 && Number.isFinite(parsedYear)) {
      monthIndex = parsedIndex;
      yearNumber = parsedYear;
    }
  }

  const start = new Date(Date.UTC(yearNumber, monthIndex, 1));
  const end = new Date(Date.UTC(yearNumber, monthIndex + 1, 0));

  const toIso = (d: Date) => d.toISOString().slice(0, 10);

  return {
    startDate: toIso(start),
    endDate: toIso(end),
    monthNumber: monthIndex + 1,
    yearNumber,
    label: `${MONTHS[monthIndex]} ${yearNumber}`,
  };
}
