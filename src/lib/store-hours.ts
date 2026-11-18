import type { StoreSettings } from "@/db/schema";

export interface MalaysiaTimeParts {
  dateStr: string; // YYYY-MM-DD in Asia/Kuala_Lumpur
  hour: number; // 0 - 23
  minute: number; // 0 - 59
  formattedTime: string; // e.g. "22:05 MYT"
}

/**
 * Extracts calendar date and 24-hour time strictly in Malaysia Time (Asia/Kuala_Lumpur, UTC+8)
 */
export function getMalaysiaTimeParts(date: Date = new Date()): MalaysiaTimeParts {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kuala_Lumpur",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });

  const parts = formatter.formatToParts(date);
  const get = (type: string) => parts.find((p) => p.type === type)?.value || "00";

  const year = get("year");
  const month = get("month");
  const day = get("day");
  // Handle midnight '24' edge case in some Intl implementations
  const rawHour = parseInt(get("hour"), 10);
  const hour = rawHour === 24 ? 0 : rawHour;
  const minute = parseInt(get("minute"), 10);

  return {
    dateStr: `${year}-${month}-${day}`,
    hour,
    minute,
    formattedTime: `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")} MYT`,
  };
}

export interface StorePaymentStatus {
  isOpen: boolean;
  reason: "open" | "night_cutoff" | "awaiting_daily_account" | "disabled";
  nowMyt: MalaysiaTimeParts;
  uploadedToday: boolean;
  hasPaymentDetails: boolean;
}

/**
 * Evaluates whether the store's daily rotating Malaysian bank account is active and checkout is open.
 * Rules:
 * 1. Every night at 10:00 PM MYT (hour >= 22) until morning (hour < 6), the bank account auto-expires
 *    and checkout closes ("Store is Closed Now").
 * 2. Even after morning arrives (e.g. 10:00 AM MYT), the store remains closed and yesterday's bank account
 *    stays hidden until the Admin uploads/saves a fresh bank account or DuitNow QR on the current MYT calendar day.
 * 3. Once Admin saves a valid bank account / QR today (before 10:00 PM MYT), the store is OPEN until 10:00 PM MYT tonight.
 */
export function evaluateStorePaymentStatus(
  settings?: StoreSettings | null,
  now: Date = new Date()
): StorePaymentStatus {
  const nowMyt = getMalaysiaTimeParts(now);

  const hasPaymentDetails = Boolean(
    settings?.paymentEnabled &&
      (settings?.bankAccountNumber?.trim() || settings?.duitnowQrImageUrl?.trim())
  );

  // Check if settings were updated today in Malaysia Time (between 06:00 and 21:59 MYT)
  let uploadedToday = false;
  if (settings?.updatedAt) {
    const updatedDate =
      settings.updatedAt instanceof Date
        ? settings.updatedAt
        : new Date(settings.updatedAt);

    if (!isNaN(updatedDate.getTime())) {
      const updatedMyt = getMalaysiaTimeParts(updatedDate);
      uploadedToday =
        updatedMyt.dateStr === nowMyt.dateStr &&
        updatedMyt.hour >= 6 &&
        updatedMyt.hour < 22;
    }
  }

  // Rule 1: Nightly 10:00 PM MYT auto-close (22:00 - 05:59 MYT)
  if (nowMyt.hour >= 22 || nowMyt.hour < 6) {
    return {
      isOpen: false,
      reason: "night_cutoff",
      nowMyt,
      uploadedToday: false,
      hasPaymentDetails,
    };
  }

  // Rule 2: Must have payment enabled & details configured
  if (!hasPaymentDetails) {
    return {
      isOpen: false,
      reason: "disabled",
      nowMyt,
      uploadedToday,
      hasPaymentDetails: false,
    };
  }

  // Rule 3: Must be freshly uploaded/saved today in MYT
  if (!uploadedToday) {
    return {
      isOpen: false,
      reason: "awaiting_daily_account",
      nowMyt,
      uploadedToday: false,
      hasPaymentDetails,
    };
  }

  return {
    isOpen: true,
    reason: "open",
    nowMyt,
    uploadedToday: true,
    hasPaymentDetails: true,
  };
}

/**
 * Returns a sanitized copy of StoreSettings for public storefront consumption.
 * If the daily bank account is expired (after 10:00 PM MYT or from a previous day),
 * bank account numbers and QR images are stripped out so they never leak to the browser.
 */
export function sanitizePublicPaymentSettings(
  settings: StoreSettings | null,
  now: Date = new Date()
): StoreSettings | null {
  if (!settings) return null;

  const status = evaluateStorePaymentStatus(settings, now);
  if (!status.isOpen) {
    return {
      ...settings,
      paymentEnabled: false,
      bankName: null,
      bankAccountNumber: null,
      bankAccountHolder: null,
      duitnowQrImageUrl: null,
      paymentInstructions: null,
    };
  }

  return settings;
}
