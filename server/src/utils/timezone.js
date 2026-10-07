/**
 * Timezone-aware date helpers.
 * Uses the Intl API (built into Node 18+) — no external dependencies.
 */

/**
 * Returns { start, end } UTC Dates representing midnight-to-midnight
 * of "today" in the given IANA timezone.
 */
export function getTodayRange(timezone = 'UTC') {
  const now = new Date();
  const dateStr = now.toLocaleDateString('en-CA', { timeZone: timezone }); // 'YYYY-MM-DD'
  return {
    start: toUTCDate(`${dateStr}T00:00:00`, timezone),
    end:   toUTCDate(`${dateStr}T23:59:59.999`, timezone),
  };
}

/**
 * Returns { start, end } UTC Dates for "now" through now+7 days
 * in the user's timezone.
 */
export function getUpcomingRange(timezone = 'UTC', days = 7) {
  const { start } = getTodayRange(timezone);
  const end = new Date(start);
  end.setUTCDate(end.getUTCDate() + days);
  end.setUTCHours(23, 59, 59, 999);
  return { start, end };
}

/**
 * Given a local datetime string (YYYY-MM-DDTHH:mm:ss) in `timezone`,
 * return the equivalent UTC Date.
 */
export function toUTCDate(localStr, timezone = 'UTC') {
  // Build a Date as if it were UTC, then offset by the tz difference
  const naive = new Date(localStr + 'Z'); // treat as UTC momentarily
  const tzOffset = getTzOffsetMs(naive, timezone);
  return new Date(naive.getTime() - tzOffset);
}

/**
 * Returns the offset in milliseconds between the given IANA timezone
 * and UTC at the given moment. Positive = east of UTC.
 */
function getTzOffsetMs(date, timezone) {
  const utcStr = date.toLocaleString('en-US', { timeZone: 'UTC' });
  const tzStr  = date.toLocaleString('en-US', { timeZone: timezone });
  return new Date(tzStr).getTime() - new Date(utcStr).getTime();
}

/**
 * Compute the next calendar occurrence of a month/day event (e.g. birthday).
 * Returns a UTC Date at midnight UTC of that day.
 */
export function getNextYearlyOccurrence(originalDate, timezone = 'UTC') {
  const now = new Date();
  const month = originalDate.getUTCMonth(); // 0-indexed
  const day   = originalDate.getUTCDate();

  let year = now.getUTCFullYear();
  let candidate = new Date(Date.UTC(year, month, day));

  // If that date is today or in the past, move to next year
  if (candidate.getTime() <= now.getTime()) {
    candidate = new Date(Date.UTC(year + 1, month, day));
  }
  return candidate;
}

/**
 * Add `days` to a Date, returning a new Date.
 */
export function addDays(date, days) {
  const d = new Date(date);
  d.setUTCDate(d.getUTCDate() + days);
  return d;
}
