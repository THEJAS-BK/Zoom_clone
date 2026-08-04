export function formatRelativeTime(date: string | Date): string {
  const now = new Date();
  const past = new Date(date);
  const diffMs = now.getTime() - past.getTime();
  const diffSec = Math.floor(diffMs / 1000);

  // Just now / seconds
  if (diffSec < 60) {
    return diffSec <= 3 ? "just now" : `${diffSec}s ago`;
  }

  // Minutes
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) {
    return `${diffMin}m ago`;
  }

  // Hours
  const diffHour = Math.floor(diffMin / 60);
  if (diffHour < 24) {
    return `${diffHour}h ago`;
  }

  // Days
  const diffDay = Math.floor(diffHour / 24);
  if (diffDay < 30) {
    return `${diffDay}d ago`;
  }

  // Months
  const diffMonth = Math.floor(diffDay / 30);
  if (diffMonth < 12) {
    return `${diffMonth}mo ago`;
  }

  // Years
  const diffYear = Math.floor(diffMonth / 12);
  return `${diffYear}y ago`;
}