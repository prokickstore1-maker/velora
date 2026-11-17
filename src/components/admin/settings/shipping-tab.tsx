"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface ShippingTabProps {
  shippingEnabled: boolean;
  setShippingEnabled: (val: boolean) => void;
  flatShippingFeeRm: string;
  setFlatShippingFeeRm: (val: string) => void;
  freeShippingMinRm: string;
  setFreeShippingMinRm: (val: string) => void;
}

export function ShippingTab({
  shippingEnabled,
  setShippingEnabled,
  flatShippingFeeRm,
  setFlatShippingFeeRm,
  freeShippingMinRm,
  setFreeShippingMinRm,
}: ShippingTabProps) {
  return (
    <div className="bg-white p-6 rounded-2xl border border-border shadow-xs space-y-5">
      <h3 className="font-heading font-extrabold italic text-lg text-plum uppercase pb-2 border-b border-border">
        Shipping &amp; Delivery Configuration
      </h3>

      <label className="flex items-center gap-3 cursor-pointer text-sm font-semibold text-plum">
        <input
          type="checkbox"
          checked={shippingEnabled}
          onChange={(e) => setShippingEnabled(e.target.checked)}
          className="w-5 h-5 rounded text-plum cursor-pointer"
        />
        <span>Enable Shipping Rate Calculation at Checkout</span>
      </label>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
        <div className="space-y-1.5">
          <Label className="text-xs font-bold uppercase text-plum">Flat Rate Shipping Fee (RM)</Label>
          <Input
            type="text"
            placeholder="8.00"
            value={flatShippingFeeRm}
            onChange={(e) => setFlatShippingFeeRm(e.target.value)}
            className="h-11 rounded-xl font-mono text-sm"
          />
          <p className="text-[11px] text-plum-muted">Applies to all deliveries across Malaysia.</p>
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs font-bold uppercase text-plum">Free Shipping Minimum Threshold (RM)</Label>
          <Input
            type="text"
            placeholder="150.00"
            value={freeShippingMinRm}
            onChange={(e) => setFreeShippingMinRm(e.target.value)}
            className="h-11 rounded-xl font-mono text-sm"
          />
          <p className="text-[11px] text-plum-muted">Orders at or above this amount automatically receive RM 0.00 shipping.</p>
        </div>
      </div>
    </div>
  );
}
