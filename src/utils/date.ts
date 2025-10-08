/**
 * Format a date to DD/MM/YYYY format
 * @param date - Date object, string, or null/undefined
 * @returns Formatted date string or empty string if invalid
 */
export const formatDate = (date: Date | string | null | undefined): string => {
  if (!date) return '';

  const dateObj = typeof date === 'string' ? new Date(date) : date;

  if (isNaN(dateObj.getTime())) return '';

  const day = String(dateObj.getDate()).padStart(2, '0');
  const month = String(dateObj.getMonth() + 1).padStart(2, '0');
  const year = dateObj.getFullYear();

  return `${day}/${month}/${year}`;
};
