/**
 * Date utility functions to handle timezone-safe date operations
 * Prevents UTC conversion issues that cause off-by-one date problems
 */

/**
 * Format a Date object to YYYY-MM-DD string using local timezone
 * Avoids UTC conversion that can cause date shifts
 */
export const formatDateToYMD = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/**
 * Parse a YYYY-MM-DD string to Date object in local timezone
 * Avoids UTC interpretation that can shift dates
 */
export const parseDateFromYMD = (dateString: string): Date => {
  const [year, month, day] = dateString.split('-').map(Number);
  return new Date(year, month - 1, day);
};

/**
 * Smart date parsing that handles both new timestamp format and old ISO string format
 * with proper timezone handling for backward compatibility
 */
export const parseStoredDate = (storedDate: string | number): Date => {
  if (typeof storedDate === 'number') {
    // New timestamp format - preserves exact date/time
    return new Date(storedDate);
  }

  if (typeof storedDate === 'string' && storedDate.includes('T')) {
    // Old ISO string format - parse the ISO string and extract local date components
    // to avoid timezone shifts from UTC date extraction
    const isoDate = new Date(storedDate);
    const year = isoDate.getFullYear();
    const month = isoDate.getMonth();
    const day = isoDate.getDate();
    return new Date(year, month, day);
  }

  // Fallback for other string formats
  return parseDateFromYMD(storedDate);
};

/**
 * Serialize a Date object to timestamp for storage
 * Preserves exact date/time without timezone conversion
 */
export const serializeDateForStorage = (date: Date): number => {
  return date.getTime();
};

/**
 * Format a Date object to MM/DD/YYYY string using local timezone
 */
export const formatDateToMDY = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${month}/${day}/${year}`;
};
