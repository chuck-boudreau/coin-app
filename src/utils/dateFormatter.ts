export function formatDate(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffHours = diffMs / (1000 * 60 * 60);
  
  // Less than 24 hours: relative time
  if (diffHours < 24) {
    if (diffHours < 1) {
      const minutes = Math.round(diffHours * 60);
      return minutes <= 1 ? 'Just now' : `${minutes} minutes ago`;
    }
    const hours = Math.round(diffHours);
    return hours === 1 ? '1 hour ago' : `${hours} hours ago`;
  }
  
  // This week: day name
  const diffDays = diffHours / 24;
  if (diffDays < 7) {
    if (diffDays < 2) return 'Yesterday';
    return date.toLocaleDateString('en-US', { weekday: 'long' });
  }
  
  // This year: Month Day
  if (date.getFullYear() === now.getFullYear()) {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }
  
  // Older: Full date
  return date.toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric', 
    year: 'numeric' 
  });
}