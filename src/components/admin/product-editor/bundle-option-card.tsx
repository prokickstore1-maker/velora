"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DraftVersionItem } from "./types";

interface BundleOptionCardProps {
  includeFullSet: boolean;
  setIncludeFullSet: (include: boolean) => void;
  fullSetOption: DraftVersionItem;
  setFullSetOption: React.Dispatch<React.SetStateAction<DraftVersionItem>>;
}

export function BundleOptionCard({
  includeFullSet,
  setIncludeFullSet,
  fullSetOption,
  setFullSetOption,
}: BundleOptionCardProps) {
  return (
    <div className="p-4 rounded-xl border border-pink/30 bg-blush-soft space-y-3">
      <div className="flex items-center justify-between">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={includeFullSet}
            onChange={(e) => setIncludeFullSet(e.target.checked)}
            className="w-4 h-4 rounded text-pink cursor-pointer"
          />
          <span className="text-xs font-bold text-plum uppercase">
            Include Full Set / Bundle Option
          </span>
        </label>
        <span className="text-[10px] font-semibold text-pink uppercase tracking-wider">
          Linked Inventory
        </span>
      </div>

      {includeFullSet && (
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 pt-2 items-end">
          <div className="sm:col-span-5 space-y-1">
            <Label className="text-[11px] font-bold uppercase text-plum">Bundle Name</Label>
            <Input
              value={fullSetOption.versionName}
              onChange={(e) => setFullSetOption((prev) => ({ ...prev, versionName: e.target.value }))}
              className="h-10 text-xs font-semibold bg-white"
            />
          </div>

          <div className="sm:col-span-3 space-y-1">
            <Label className="text-[11px] font-bold uppercase text-plum">SKU</Label>
            <Input
              value={fullSetOption.sku}
              onChange={(e) => setFullSetOption((prev) => ({ ...prev, sku: e.target.value }))}
              className="h-10 font-mono text-xs bg-white"
            />
          </div>

          <div className="sm:col-span-4 space-y-1">
            <Label className="text-[11px] font-bold uppercase text-plum">Bundle Price (RM)</Label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-xs font-bold text-plum-muted">RM</span>
              <Input
                type="number"
                step="0.01"
                value={fullSetOption.priceRm}
                onChange={(e) => setFullSetOption((prev) => ({ ...prev, priceRm: e.target.value }))}
                className="h-10 pl-10 text-xs font-bold bg-white"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
