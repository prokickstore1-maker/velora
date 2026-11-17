/**
 * Myvelora Store — Pricing Calculator Engine
 * Reference: _build_plan/pricing-rules.md
 * Rule: Harga akhir = FLOOR(Harga sumber * Kurs MYR * 0.80)
 * Fixed USD rate: 1 USD = RM 4.086165
 */

export interface PricingOptions {
  sourcePrice: number;
  sourceCurrency: "USD" | "MYR" | "SGD" | "KRW" | "JPY" | "IDR" | "THB" | "CNY" | "AUD" | "EUR" | "GBP" | string;
  customExchangeRate?: number; // Optional override for non-USD currencies
}

export const FIXED_USD_TO_MYR_RATE = 4.086165;

/**
 * Calculates final Myvelora RM integer price according to strict pricing rules:
 * 1. Convert to MYR (USD uses 4.086165 fixed rate)
 * 2. Apply 20% discount (multiply by 0.80)
 * 3. Floor to whole integer RM (no decimals, no ceil, no round)
 */
export function calculateMyveloraPrice({
  sourcePrice,
  sourceCurrency,
  customExchangeRate,
}: PricingOptions): number {
  if (sourcePrice <= 0) return 0;

  let exchangeRate = 1;
  const currencyUpper = sourceCurrency.toUpperCase().trim();

  if (currencyUpper === "MYR" || currencyUpper === "RM") {
    exchangeRate = 1;
  } else if (currencyUpper === "USD" || currencyUpper === "$") {
    exchangeRate = FIXED_USD_TO_MYR_RATE;
  } else if (customExchangeRate && customExchangeRate > 0) {
    exchangeRate = customExchangeRate;
  } else {
    throw new Error(
      `Exchange rate for currency '${sourceCurrency}' must be provided via customExchangeRate.`
    );
  }

  const priceInMyr = sourcePrice * exchangeRate;
  const discountedPrice = priceInMyr * 0.8;
  return Math.floor(discountedPrice);
}

/**
 * Formats product pricing output according to Myvelora standard:
 * Product Name: [Name]
 * Price: RM[Price]
 */
export function formatMyveloraPricingOutput(productName: string, finalPriceRm: number): string {
  return `Product Name: ${productName}\nPrice: RM${finalPriceRm}`;
}
