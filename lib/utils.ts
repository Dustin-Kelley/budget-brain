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

