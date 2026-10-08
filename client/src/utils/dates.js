import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime.js';
import localizedFormat from 'dayjs/plugin/localizedFormat.js';
import utc from 'dayjs/plugin/utc.js';
import timezone from 'dayjs/plugin/timezone.js';
import isToday from 'dayjs/plugin/isToday.js';
import isTomorrow from 'dayjs/plugin/isTomorrow.js';

dayjs.extend(relativeTime);
dayjs.extend(localizedFormat);
dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(isToday);
dayjs.extend(isTomorrow);

export { dayjs };

/** Format a date for display */
export function formatDate(date, fmt = 'MMM D, YYYY') {
  if (!date) return '';
  return dayjs(date).format(fmt);
}

/** Format date + time */
export function formatDateTime(date) {
  if (!date) return '';
  return dayjs(date).format('MMM D, YYYY h:mm A');
}

/** Relative time (e.g. "2 days ago") */
export function fromNow(date) {
  if (!date) return '';
  return dayjs(date).fromNow();
}

/** Is a date overdue (in the past and not done)? */
export function isOverdue(date) {
  if (!date) return false;
  return dayjs(date).isBefore(dayjs());
}

/** Days until a date (negative = past) */
export function daysUntil(date) {
  if (!date) return null;
  return dayjs(date).diff(dayjs(), 'day');
}

/** Format date for <input type="date"> value */
export function toInputDate(date) {
  if (!date) return '';
  return dayjs(date).format('YYYY-MM-DD');
}

/** Format datetime for <input type="datetime-local"> */
export function toInputDateTime(date) {
  if (!date) return '';
  return dayjs(date).format('YYYY-MM-DDTHH:mm');
}


