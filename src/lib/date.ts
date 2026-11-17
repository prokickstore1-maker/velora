// src/lib/date.ts
// Date and Time Helper Functions for Storefront & Admin

/**
 * Format a deadline string (ISO or local datetime) into a clean, human-readable format.
 * Example input: "2026-11-17T09:00" -> "Tuesday, 17 Nov 2026, 09:00 MYT"
 */
export function formatPreOrderDeadline(raw?: string | null): string {
  if (!raw) return "";

  // If already freeform text with no parseable date, return as-is
  const parsed = new Date(raw);
  if (isNaN(parsed.getTime())) {
    return raw;
  }

  try {
    return new Intl.DateTimeFormat("en-GB", {
      weekday: "long",
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
      timeZone: "Asia/Kuala_Lumpur",
    }).format(parsed) + " MYT";
  } catch {
    return raw;
  }
}

/**
 * Check whether a deadline has passed (is in the past).
 */
export function isDeadlinePassed(raw?: string | null): boolean {
  if (!raw) return false;
  const parsed = new Date(raw);
  if (isNaN(parsed.getTime())) return false;
  return parsed.getTime() < Date.now();
}
