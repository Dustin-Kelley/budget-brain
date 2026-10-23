const MONTH_NAMES = [
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

export function shiftMonth(monthNumber: number, year: number, delta: number) {
  const date = new Date(year, monthNumber - 1 + delta, 1);
  return {
    monthNumber: date.getMonth() + 1,
    year: date.getFullYear(),
  };
}

export function toMonthParam(monthNumber: number, year: number) {
  return `${MONTH_NAMES[monthNumber - 1]}-${year}`;
}

export function monthLabel(monthNumber: number, year: number) {
  return `${MONTH_NAMES[monthNumber - 1]} ${year}`;
}

/** Keep the header month when linking between budget screens. */
export function withMonth(path: string, month: string | undefined) {
  if (!month) return path;
  const [pathname, query] = path.split('?');
  const params = new URLSearchParams(query ?? '');
  params.set('month', month);
  return `${pathname}?${params.toString()}`;
}

export function localIsoDate(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/** A date input default that sits inside the budget month being viewed. */
export function defaultTransactionDate(monthParam: string) {
  const now = new Date();
  const current = toMonthParam(now.getMonth() + 1, now.getFullYear());
  if (monthParam === current) return localIsoDate(now);

  const [name, yearStr] = monthParam.split('-');
  const index = MONTH_NAMES.findIndex(
    (month) => month.toLowerCase() === name?.toLowerCase(),
  );
  const year = Number(yearStr);
  if (index === -1 || !Number.isFinite(year)) return localIsoDate(now);
  return localIsoDate(new Date(year, index, 1));
}
