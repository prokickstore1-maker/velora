"use client";

import { CheckCircle2, Loader2, Save } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SummaryCardProps {
  totalVersions: number;
  totalStock: number;
  minPrice: number;
  maxPrice: number;
  isSaving: boolean;
  isEditing: boolean;
}

export function SummaryCard({
  totalVersions,
  totalStock,
  minPrice,
  maxPrice,
  isSaving,
  isEditing,
}: SummaryCardProps) {
  return (
    <div className="bg-plum text-white p-5 rounded-2xl shadow-sm space-y-4">
      <div className="flex items-center gap-2 pb-2 border-b border-white/20">
        <CheckCircle2 className="w-4 h-4 text-blush" />
        <h3 className="text-xs font-bold uppercase tracking-wider text-blush">Product Summary</h3>
      </div>

      <div className="space-y-2 text-xs">
        <div className="flex justify-between">
          <span className="text-white/70">Total Versions:</span>
          <span className="font-bold">{totalVersions} items</span>
        </div>
        <div className="flex justify-between">
          <span className="text-white/70">Total Ready Stock:</span>
          <span className="font-bold">{totalStock} units</span>
        </div>
        <div className="flex justify-between">
          <span className="text-white/70">Price Range:</span>
          <span className="font-bold text-blush">
            RM {minPrice.toFixed(2)} {maxPrice > minPrice ? `– RM ${maxPrice.toFixed(2)}` : ""}
          </span>
        </div>
      </div>

      <Button
        type="submit"
        disabled={isSaving}
        className="w-full bg-pink hover:bg-pink-hover text-white text-xs font-bold h-11 rounded-xl shadow-xs cursor-pointer"
      >
        {isSaving ? <Loader2 className="w-4 h-4 animate-spin mr-1.5" /> : <Save className="w-4 h-4 mr-1.5" />}
        {isEditing ? "Update Product Now" : "Publish Product Now"}
      </Button>
    </div>
  );
}
