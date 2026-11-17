/**
 * Myvelora Store — Promo & Flash Sale Discount Engine
 * Calculates effective retail prices based on Store Settings campaign or per-version override.
 * Always outputs integer RM (FLOOR) in accordance with Myvelora Pricing Rules.
 */

import type { StoreSettings } from "@/db/schema";

export interface EffectivePriceResult {
  hasDiscount: boolean;
  originalPrice: number;
  discountedPrice: number;
  discountPercent: number;
  badgeText: string;
}

export function calculateEffectivePrice(
  priceRm: string | number,
  productCategory: string = "Album",
  settings?: StoreSettings | null,
  versionDiscountPercent?: number | null
): EffectivePriceResult {
  const original = Math.floor(typeof priceRm === "number" ? priceRm : parseFloat(priceRm) || 0);
  if (original <= 0) {
    return {
      hasDiscount: false,
      originalPrice: 0,
      discountedPrice: 0,
      discountPercent: 0,
      badgeText: "",
    };
  }

  let activeDiscountPercent = 0;

  // 1. Check version-specific override first
  if (typeof versionDiscountPercent === "number" && versionDiscountPercent > 0) {
    activeDiscountPercent = Math.min(99, Math.max(1, versionDiscountPercent));
  } else if (settings?.promoDiscountEnabled && (settings.promoDiscountPercent || 0) > 0) {
    // 2. Check storewide campaign settings
    const scope = (settings.promoDiscountScope || "all").toLowerCase().trim();
    const categoryLower = productCategory.toLowerCase().trim();

    if (scope === "all" || scope === categoryLower) {
      activeDiscountPercent = Math.min(99, Math.max(1, settings.promoDiscountPercent || 0));
    }
  }

  if (activeDiscountPercent > 0) {
    const discounted = Math.floor(original * (1 - activeDiscountPercent / 100));
    const badgeLabel = settings?.promoDiscountBadge?.trim() || "SALE";

    return {
      hasDiscount: true,
      originalPrice: original,
      discountedPrice: discounted,
      discountPercent: activeDiscountPercent,
      badgeText: `${badgeLabel} -${activeDiscountPercent}%`,
    };
  }

  return {
    hasDiscount: false,
    originalPrice: original,
    discountedPrice: original,
    discountPercent: 0,
    badgeText: "",
  };
}
