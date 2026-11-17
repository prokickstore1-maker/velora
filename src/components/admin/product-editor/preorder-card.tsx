"use client";

import { Calendar } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface PreOrderCardProps {
  isPreOrder: boolean;
  setIsPreOrder: (val: boolean) => void;
  preOrderDeadline: string;
  setPreOrderDeadline: (date: string) => void;
  preOrderQuotaMode: "finite" | "open";
  setPreOrderQuotaMode: (mode: "finite" | "open") => void;
}

export function PreOrderCard({
  isPreOrder,
  setIsPreOrder,
  preOrderDeadline,
  setPreOrderDeadline,
  preOrderQuotaMode,
  setPreOrderQuotaMode,
}: PreOrderCardProps) {
  return (
    <div className="bg-white p-6 rounded-2xl border border-border shadow-xs space-y-4">
      <div className="flex items-center justify-between pb-2 border-b border-border">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-pink" />
          <h2 className="text-sm font-bold uppercase text-plum">3. Pre-Order Configuration</h2>
        </div>
        <Switch checked={isPreOrder} onCheckedChange={setIsPreOrder} />
      </div>

      {isPreOrder ? (
        <div className="space-y-4 pt-1">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-bold uppercase text-plum">Pre-Order Closing Deadline</Label>
              <Input
                type="date"
                value={preOrderDeadline}
                onChange={(e) => setPreOrderDeadline(e.target.value)}
                className="h-11 rounded-xl text-xs font-semibold"
              />
              <p className="text-[11px] text-plum-muted">
                Customers see &quot;PO Closes on [Date]&quot; badge on storefront.
              </p>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-bold uppercase text-plum">Quota Mode</Label>
              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setPreOrderQuotaMode("finite")}
                  className={`p-2.5 rounded-xl border text-left text-xs transition-all cursor-pointer ${
                    preOrderQuotaMode === "finite"
                      ? "bg-plum text-white border-plum shadow-xs font-semibold"
                      : "bg-white text-plum border-border hover:bg-blush/30"
                  }`}
                >
                  <span className="block font-bold">Limited Quota</span>
                  <span className="text-[10px] opacity-80 block">Stops when stock hits 0</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPreOrderQuotaMode("open")}
                  className={`p-2.5 rounded-xl border text-left text-xs transition-all cursor-pointer ${
                    preOrderQuotaMode === "open"
                      ? "bg-plum text-white border-plum shadow-xs font-semibold"
                      : "bg-white text-plum border-border hover:bg-blush/30"
                  }`}
                >
                  <span className="block font-bold">Open PO</span>
                  <span className="text-[10px] opacity-80 block">Unlimited orders until deadline</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <p className="text-xs text-plum-muted">
          This item is currently sold as <strong>Ready Stock</strong>. Turn on the switch above if this drop is an advance Pre-Order.
        </p>
      )}
    </div>
  );
}
