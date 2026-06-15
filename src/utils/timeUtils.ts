/**
 * Formats a Date object into a time string 'HH:mm'.
 * @param date The date to format.
 * @returns The formatted time string.
 */
export const formatTimeToHM = (date: Date): string => {
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  return `${hours}:${minutes}`;
};

/**
 * Parses a time string 'HH:mm:ss' into a Date object.
 * Assumes the current date for the date parts.
 * @param time The time string to parse.
 * @returns The parsed Date object.
 */
export const parseTimeFromHMS = (time: string): Date => {
  if (!time || typeof time !== 'string') {
    return new Date();
  }
  const parts = time.split(':');
  const hours = parseInt(parts[0] || '0', 10);
  const minutes = parseInt(parts[1] || '0', 10);
  const seconds = parseInt(parts[2] || '0', 10);

  if (isNaN(hours) || isNaN(minutes) || isNaN(seconds)) {
    return new Date();
  }

  const date = new Date();
  date.setHours(hours, minutes, seconds, 0);
  return date;
};

/**
 * Formats a Date object into a time string with AM/PM format, e.g., '1:00 PM'.
 * @param date The date to format.
 * @returns The formatted time string.
 */
export const formatTimeToAMPM = (date: Date): string => {
  if (!(date instanceof Date) || isNaN(date.getTime())) {
    return 'Invalid time';
  }
  let hours = date.getHours();
  const minutes = date.getMinutes();
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours %= 12;
  hours = hours || 12; // the hour '0' should be '12'
  const minutesStr = minutes.toString().padStart(2, '0');
  return `${hours}:${minutesStr} ${ampm}`;
};
