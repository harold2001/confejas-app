import { format } from 'date-fns';

export const getFormattedDateToSave = (date: Date): string => {
  if (!date) return '';

  return format(date, 'yyyy-MM-dd');
};

export const transformDBDateToDDMMYYYY = (usaDate: string): string => {
  if (!usaDate) return '';

  const [year, month, day] = usaDate.split('-');
  return `${day}-${month}-${year}`;
};

export const getPercentageFromTotal = (part: number, total: number): number => {
  if (total === 0) return 0;
  const percentage = (part / total) * 100;
  return Number(percentage.toFixed(2));
};
