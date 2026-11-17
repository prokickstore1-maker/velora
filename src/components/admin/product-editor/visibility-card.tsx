"use client";

import { Sparkles } from "lucide-react";
import { Switch } from "@/components/ui/switch";

interface VisibilityCardProps {
  isPublished: boolean;
  setIsPublished: (val: boolean) => void;
  isNewArrival: boolean;
  setIsNewArrival: (val: boolean) => void;
  isBestSeller: boolean;
  setIsBestSeller: (val: boolean) => void;
}

export function VisibilityCard({
  isPublished,
  setIsPublished,
  isNewArrival,
  setIsNewArrival,
  isBestSeller,
  setIsBestSeller,
}: VisibilityCardProps) {
  return (
    <div className="bg-white p-5 rounded-2xl border border-border shadow-xs space-y-4">
      <div className="flex items-center gap-2 pb-2 border-b border-border">
        <Sparkles className="w-4 h-4 text-pink" />
        <h2 className="text-sm font-bold uppercase text-plum">Visibility &amp; Badges</h2>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-plum block">Published</span>
            <span className="text-[10px] text-plum-muted">Visible to storefront customers</span>
          </div>
          <Switch checked={isPublished} onCheckedChange={setIsPublished} />
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-border">
          <div>
            <span className="text-xs font-bold text-plum block">New Arrival Badge</span>
            <span className="text-[10px] text-plum-muted">Featured in New Arrival section</span>
          </div>
          <Switch checked={isNewArrival} onCheckedChange={setIsNewArrival} />
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-border">
          <div>
            <span className="text-xs font-bold text-plum block">Best Seller Badge</span>
            <span className="text-[10px] text-plum-muted">Featured in Best Seller section</span>
          </div>
          <Switch checked={isBestSeller} onCheckedChange={setIsBestSeller} />
        </div>
      </div>
    </div>
  );
}
