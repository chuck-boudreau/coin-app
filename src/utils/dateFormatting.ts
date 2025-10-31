/**
 * Format timestamp as absolute date and time
 * Current year: "Oct 30, 3:15 PM"
 * Past year: "Oct 30, 2024, 3:15 PM"
 *
 * This format is familiar (file manager style) and provides
 * precise sorting information to avoid cognitive friction.
 */
export function formatRelativeTime(timestamp: string): string {
  const now = new Date();
  const date = new Date(timestamp);

  const isSameYear = now.getFullYear() === date.getFullYear();

  const options: Intl.DateTimeFormatOptions = {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  };

  // Add year if not current year
  if (!isSameYear) {
    options.year = 'numeric';
  }

  return date.toLocaleString('en-US', options);
}
