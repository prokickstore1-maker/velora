"use client";

import { Layers, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DraftVersionItem } from "./types";

interface VersionBuilderCardProps {
  draftVersions: DraftVersionItem[];
  versionCount: number;
  onVersionCountChange: (count: number) => void;
  onUpdateDraftVersion: (idx: number, field: keyof DraftVersionItem, val: string | number) => void;
  onAddCustomVersion: () => void;
  onRemoveDraftVersion: (idx: number) => void;
}

export function VersionBuilderCard({
  draftVersions,
  versionCount,
  onVersionCountChange,
  onUpdateDraftVersion,
  onAddCustomVersion,
  onRemoveDraftVersion,
}: VersionBuilderCardProps) {
  return (
    <div className="bg-white p-6 rounded-2xl border border-border shadow-xs space-y-5">
      <div className="flex items-center justify-between pb-2 border-b border-border">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-pink" />
          <h2 className="text-sm font-bold uppercase text-plum">2. Versions &amp; Physical Inventory</h2>
        </div>
        <span className="text-xs font-bold text-plum bg-blush/40 px-2.5 py-1 rounded-full">
          {draftVersions.length} {draftVersions.length === 1 ? "Version" : "Versions"}
        </span>
      </div>

      {/* Quick Count Preset */}
      <div className="p-3.5 rounded-xl bg-ivory border border-border flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <span className="text-xs font-bold text-plum block">Number of Individual Versions:</span>
          <span className="text-[11px] text-plum-muted">Choose quick preset or add versions individually.</span>
        </div>
        <div className="flex items-center gap-1.5">
          {[1, 2, 3, 4, 5, 6].map((num) => (
            <button
              key={num}
              type="button"
              onClick={() => onVersionCountChange(num)}
              className={`w-9 h-9 rounded-xl font-bold text-xs transition-all cursor-pointer ${
                versionCount === num
                  ? "bg-plum text-white shadow-xs"
                  : "bg-white text-plum border border-border hover:bg-blush/30"
              }`}
            >
              {num}
            </button>
          ))}
        </div>
      </div>

      {/* Version List */}
      <div className="space-y-3">
        {draftVersions.map((ver, idx) => (
          <div
            key={idx}
            className="p-4 rounded-xl border border-border bg-white shadow-2xs space-y-3 hover:border-plum/40 transition-colors"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold uppercase text-plum flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-full bg-plum text-white text-[10px] flex items-center justify-center font-bold">
                  {idx + 1}
                </span>
                Version #{idx + 1}
              </span>
              {draftVersions.length > 1 && (
                <button
                  type="button"
                  onClick={() => onRemoveDraftVersion(idx)}
                  className="text-plum-muted hover:text-destructive p-1 rounded transition-colors cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
              <div className="sm:col-span-4 space-y-1">
                <Label className="text-[11px] font-bold uppercase text-plum">Version Name *</Label>
                <Input
                  required
                  placeholder="e.g. Minji Ver. / Ver. A"
                  value={ver.versionName}
                  onChange={(e) => onUpdateDraftVersion(idx, "versionName", e.target.value)}
                  className="h-10 text-xs font-semibold"
                />
              </div>

              <div className="sm:col-span-3 space-y-1">
                <Label className="text-[11px] font-bold uppercase text-plum">SKU Code *</Label>
                <Input
                  required
                  placeholder="MV-NJ-MJ"
                  value={ver.sku}
                  onChange={(e) => onUpdateDraftVersion(idx, "sku", e.target.value)}
                  className="h-10 font-mono text-xs"
                />
              </div>

              <div className="sm:col-span-3 space-y-1">
                <Label className="text-[11px] font-bold uppercase text-plum">Price (RM) *</Label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-xs font-bold text-plum-muted">RM</span>
                  <Input
                    required
                    type="number"
                    step="0.01"
                    placeholder="89.00"
                    value={ver.priceRm}
                    onChange={(e) => onUpdateDraftVersion(idx, "priceRm", e.target.value)}
                    className="h-10 pl-10 text-xs font-bold"
                  />
                </div>
              </div>

              <div className="sm:col-span-2 space-y-1">
                <Label className="text-[11px] font-bold uppercase text-plum">Stock *</Label>
                <Input
                  required
                  type="number"
                  min="0"
                  placeholder="10"
                  value={ver.stock}
                  onChange={(e) => onUpdateDraftVersion(idx, "stock", parseInt(e.target.value, 10) || 0)}
                  className="h-10 text-xs font-bold text-center"
                />
              </div>
            </div>
          </div>
        ))}

        <Button
          type="button"
          variant="outline"
          onClick={onAddCustomVersion}
          className="w-full h-10 text-xs font-semibold border-dashed border-plum/40 text-plum hover:bg-blush/20 cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5 mr-1" />
          Add Another Version Option
        </Button>
      </div>
    </div>
  );
}
