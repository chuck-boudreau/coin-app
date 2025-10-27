/**
 * Format timestamp as relative time (e.g., "2 hours ago")
 * or absolute date for older items (e.g., "Oct 15")
 */
export function formatRelativeTime(timestamp: string): string {
  const now = new Date();
  const date = new Date(timestamp);
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  // Less than 1 minute
  if (diffMins < 1) return 'Just now';

  // Less than 1 hour
  if (diffMins < 60) {
    return `${diffMins} min${diffMins > 1 ? 's' : ''} ago`;
  }

  // Less than 24 hours
  if (diffHours < 24) {
    return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  }

  // Less than 7 days
  if (diffDays < 7) {
    return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  }

  // More than 1 week - show absolute date
  const options: Intl.DateTimeFormatOptions = {
    month: 'short',
    day: 'numeric'
  };
  return date.toLocaleDateString('en-US', options);
}
