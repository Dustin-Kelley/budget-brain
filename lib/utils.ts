import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}


export function getMonthAndYearNumberFromDate(date: string | undefined) {
  const currentDate = new Date();
  const monthNumber = date 
    ? new Date(date).getMonth() + 1 
    : currentDate.getMonth() + 1;
  const yearNumber = date 
    ? new Date(date).getFullYear() 
    : currentDate.getFullYear();

  return { monthNumber, yearNumber };
};

export const formatDateForInput = (dateString: string | null) => {
  if (!dateString) return '';
  const d = new Date(dateString);
  if (isNaN(d.getTime())) return '';
  return d.toISOString().split('T')[0];
};

export function getPreviousMonth(dateStr: string | undefined): string | undefined {
  if (!dateStr) return undefined;
  // Expecting format 'Month-YYYY'
  const [monthName, yearStr] = dateStr.split('-');
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  const monthIndex = months.findIndex(
    m => m.toLowerCase() === monthName.toLowerCase()
  );
  if (monthIndex === -1 || !yearStr) return undefined;
  const prevMonthIndex = monthIndex === 0 ? 11 : monthIndex - 1;
  let prevYear = Number(yearStr);
  if (monthIndex === 0) {
    prevYear -= 1;
  }
  return `${months[prevMonthIndex]}-${prevYear}`;
}

export function parseMonthYearDisplay(monthStr: string | undefined): string {
  if (!monthStr) {
    const now = new Date();
    return `${now.toLocaleString('default', { month: 'long' })} ${now.getFullYear()}`;
  }
  const [month, year] = monthStr.split('-');
  return `${month} ${year}`;
}

