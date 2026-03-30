// lib/watchtower/relative-time.ts

export function relativeTime(date: string): string {
  const d = new Date(date);
  if (isNaN(d.getTime())) return date; // fall back to raw string (static pins say "MAR 2026")
  const diff = Date.now() - d.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 2) return "just now";
  if (mins < 60) return `${mins} minutes ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} hour${hrs > 1 ? "s" : ""} ago`;
  const days = Math.floor(hrs / 24);
  return `${days} day${days > 1 ? "s" : ""} ago`;
}
