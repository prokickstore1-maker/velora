"use client";

import { Tag, Sparkles, Percent } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { PRODUCT_CATEGORIES } from "@/lib/constants";

interface PromoTabProps {
  promoDiscountEnabled: boolean;
  setPromoDiscountEnabled: (val: boolean) => void;
  promoDiscountPercent: number;
  setPromoDiscountPercent: (val: number) => void;
  promoDiscountScope: string;
  setPromoDiscountScope: (val: string) => void;
  promoDiscountBadge: string;
  setPromoDiscountBadge: (val: string) => void;
}

const PRESET_PERCENTAGES = [5, 10, 15, 20, 25, 30, 50];

export function PromoTab({
  promoDiscountEnabled,
  setPromoDiscountEnabled,
  promoDiscountPercent,
  setPromoDiscountPercent,
  promoDiscountScope,
  setPromoDiscountScope,
  promoDiscountBadge,
  setPromoDiscountBadge,
}: PromoTabProps) {
  // Live sample calculation for RM 302
  const sampleOriginal = 302;
  const sampleDiscounted = promoDiscountEnabled && promoDiscountPercent > 0
    ? Math.floor(sampleOriginal * (1 - promoDiscountPercent / 100))
    : sampleOriginal;

  return (
    <div className="bg-white p-6 sm:p-8 rounded-2xl border border-border shadow-xs space-y-6">
      {/* Title & Master Switch */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-5 border-b border-border gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Tag className="w-5 h-5 text-pink" />
            <h2 className="mv-heading-italic text-lg text-plum uppercase">
              Promo &amp; Flash Sale Campaign
            </h2>
          </div>
          <p className="text-xs text-plum-muted mt-1">
            Apply automated instant promo discounts and strikethrough prices across your entire catalog in one click.
          </p>
        </div>

        <div className="flex items-center gap-3 bg-ivory p-2.5 px-4 rounded-xl border border-border">
          <Label htmlFor="promo-switch" className="text-xs font-bold text-plum cursor-pointer">
            {promoDiscountEnabled ? "Campaign Active" : "Campaign Disabled"}
          </Label>
          <input
            id="promo-switch"
            type="checkbox"
            checked={promoDiscountEnabled}
            onChange={(e) => setPromoDiscountEnabled(e.target.checked)}
            className="w-5 h-5 accent-pink cursor-pointer rounded"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
        {/* Left Column: Promo Controls */}
        <div className="space-y-5">
          {/* Discount Percentage */}
          <div className="space-y-2">
            <Label className="text-xs font-bold uppercase text-plum flex items-center gap-1.5">
              <Percent className="w-3.5 h-3.5 text-pink" />
              Discount Percentage (%)
            </Label>
            <div className="flex items-center gap-2">
              <div className="relative w-32">
                <Input
                  type="number"
                  min="0"
                  max="99"
                  disabled={!promoDiscountEnabled}
                  value={promoDiscountPercent}
                  onChange={(e) => setPromoDiscountPercent(parseInt(e.target.value, 10) || 0)}
                  className="h-10 text-sm font-bold text-plum pr-8"
                />
                <span className="absolute right-3 top-2.5 text-xs font-bold text-plum-muted">%</span>
              </div>
              <div className="flex flex-wrap gap-1">
                {PRESET_PERCENTAGES.map((pct) => (
                  <button
                    key={pct}
                    type="button"
                    disabled={!promoDiscountEnabled}
                    onClick={() => setPromoDiscountPercent(pct)}
                    className={`text-[11px] font-bold px-2.5 py-1.5 rounded-lg border transition-colors cursor-pointer ${
                      promoDiscountPercent === pct && promoDiscountEnabled
                        ? "bg-plum text-white border-plum"
                        : "bg-ivory text-plum border-border hover:bg-blush/30"
                    }`}
                  >
                    {pct}%
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Target Scope */}
          <div className="space-y-2">
            <Label className="text-xs font-bold uppercase text-plum">Target Products (Scope)</Label>
            <div className="flex flex-wrap gap-1.5">
              <button
                type="button"
                disabled={!promoDiscountEnabled}
                onClick={() => setPromoDiscountScope("all")}
                className={`text-xs font-semibold px-3.5 py-2 rounded-xl border transition-colors cursor-pointer ${
                  promoDiscountScope === "all"
                    ? "bg-plum text-white border-plum shadow-xs"
                    : "bg-white text-plum border-border hover:bg-blush/30"
                }`}
              >
                All Products (Storewide)
              </button>
              {PRODUCT_CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  disabled={!promoDiscountEnabled}
                  onClick={() => setPromoDiscountScope(cat)}
                  className={`text-xs font-semibold px-3 py-2 rounded-xl border transition-colors cursor-pointer ${
                    promoDiscountScope === cat
                      ? "bg-plum text-white border-plum shadow-xs"
                      : "bg-white text-plum border-border hover:bg-blush/30"
                  }`}
                >
                  {cat} Only
                </button>
              ))}
            </div>
          </div>

          {/* Badge Label */}
          <div className="space-y-1.5">
            <Label className="text-xs font-bold uppercase text-plum">Promo Badge Label</Label>
            <Input
              disabled={!promoDiscountEnabled}
              placeholder="e.g. SALE, FLASH DROP, PAYDAY DEAL"
              value={promoDiscountBadge}
              onChange={(e) => setPromoDiscountBadge(e.target.value)}
              className="h-10 text-xs font-semibold"
            />
          </div>
        </div>

        {/* Right Column: Live Simulation Card */}
        <div className="p-5 rounded-2xl bg-ivory border border-border space-y-4">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-pink">
            <Sparkles className="w-4 h-4" />
            Live Customer Preview
          </div>

          <div className="bg-white p-4 rounded-xl border border-border shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-plum-muted uppercase">Sample: ENHYPEN Light Stick</span>
              {promoDiscountEnabled && promoDiscountPercent > 0 ? (
                <span className="bg-pink text-white text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider animate-pulse">
                  {promoDiscountBadge || "SALE"} -{promoDiscountPercent}%
                </span>
              ) : (
                <span className="text-[10px] font-semibold text-plum-muted bg-ivory px-2 py-0.5 rounded">Regular Price</span>
              )}
            </div>

            <div className="flex items-baseline gap-2.5">
              <span className="text-xl font-black text-plum">
                RM {sampleDiscounted.toFixed(2)}
              </span>
              {promoDiscountEnabled && promoDiscountPercent > 0 && (
                <span className="text-sm font-semibold line-through text-plum-muted">
                  RM {sampleOriginal.toFixed(2)}
                </span>
              )}
            </div>

            <p className="text-[11px] text-plum-muted border-t border-border/50 pt-2 leading-relaxed">
              {promoDiscountEnabled && promoDiscountPercent > 0
                ? `Customers see the original RM ${sampleOriginal} strikethrough and pay the discounted RM ${sampleDiscounted} at checkout.`
                : "Campaign is currently disabled. Customers see regular catalog prices."}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
