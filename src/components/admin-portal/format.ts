// Display formatters for the Admin Portal screens. UTC-based so a charge dated
// 2026-07-01T00:00Z renders "Jul 1, 2026" regardless of the viewer's timezone
// (toLocaleDateString would shift the day in negative-offset zones).
const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

// "2026-07-01T00:00:00.000Z" → "Jul 1, 2026"
export const formatChargeDate = (iso: string): string => {
  const d = new Date(iso);
  return `${MONTHS[d.getUTCMonth()]} ${d.getUTCDate()}, ${d.getUTCFullYear()}`;
};

// "2026-06-22T14:32:00.000Z" → "2026-06-22 14:32" (raw ISO slice — TZ-stable)
export const formatAuditTime = (iso: string): string =>
  `${iso.slice(0, 10)} ${iso.slice(11, 16)}`;
