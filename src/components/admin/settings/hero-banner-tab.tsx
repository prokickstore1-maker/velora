"use client";

import { Upload, Loader2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface HeroBannerTabProps {
  heroBannerImageUrl: string;
  setHeroBannerImageUrl: (url: string) => void;
  heroBannerBadge: string;
  setHeroBannerBadge: (badge: string) => void;
  heroBannerTitle: string;
  setHeroBannerTitle: (title: string) => void;
  heroBannerLink: string;
  setHeroBannerLink: (link: string) => void;
  isUploadingBanner: boolean;
  bannerFileInputRef: React.RefObject<HTMLInputElement | null>;
  onBannerFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onResetAuto: () => void;
}

export function HeroBannerTab({
  heroBannerImageUrl,
  setHeroBannerImageUrl,
  heroBannerBadge,
  setHeroBannerBadge,
  heroBannerTitle,
  setHeroBannerTitle,
  heroBannerLink,
  setHeroBannerLink,
  isUploadingBanner,
  bannerFileInputRef,
  onBannerFileChange,
  onResetAuto,
}: HeroBannerTabProps) {
  return (
    <div className="bg-white p-6 rounded-2xl border border-border shadow-xs space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-border">
        <div>
          <h3 className="font-heading font-extrabold italic text-lg text-plum uppercase">
            Homepage Hero Banner
          </h3>
          <p className="text-xs text-plum-muted">
            Configure the main 16:9 visual banner displayed on the storefront homepage.
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onResetAuto}
          className="text-xs border-border text-plum hover:bg-blush/30 w-fit cursor-pointer"
        >
          Use Auto New Arrival
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Live Banner Preview */}
        <div className="lg:col-span-6 space-y-2">
          <Label className="text-xs font-bold uppercase text-plum">Live Banner Preview (16:9)</Label>
          <div className="relative w-full aspect-[16/9] overflow-hidden rounded-2xl border border-border bg-plum shadow-sm">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={
                heroBannerImageUrl ||
                "https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?auto=format&fit=crop&w=1200&q=80"
              }
              alt="Hero banner preview"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-plum/90 via-plum/30 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 p-4 sm:p-5 flex items-end justify-between gap-4">
              <div className="space-y-1.5 min-w-0">
                {heroBannerBadge && (
                  <span className="inline-block bg-pink text-white text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-md">
                    {heroBannerBadge}
                  </span>
                )}
                <h4 className="font-heading font-extrabold italic uppercase text-white text-base sm:text-xl leading-tight line-clamp-2">
                  {heroBannerTitle || "Automatic: Latest New Arrival Title"}
                </h4>
              </div>
              <span className="shrink-0 w-9 h-9 rounded-full bg-white/95 text-plum flex items-center justify-center">
                <ArrowRight className="w-4 h-4" />
              </span>
            </div>
          </div>
        </div>

        {/* Banner Fields */}
        <div className="lg:col-span-6 space-y-4">
          <div className="space-y-2">
            <Label className="text-xs font-bold uppercase text-plum">Banner Image (16:9 Recommended)</Label>
            <div className="flex flex-col sm:flex-row gap-2">
              <Input
                type="text"
                placeholder="https://... or upload an image"
                value={heroBannerImageUrl}
                onChange={(e) => setHeroBannerImageUrl(e.target.value)}
                className="h-11 rounded-xl font-mono text-xs flex-1"
              />
              <input
                ref={bannerFileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={onBannerFileChange}
                className="hidden"
              />
              <Button
                type="button"
                variant="outline"
                disabled={isUploadingBanner}
                onClick={() => bannerFileInputRef.current?.click()}
                className="h-11 px-4 rounded-xl border-plum text-plum hover:bg-blush/30 text-xs font-semibold shrink-0 cursor-pointer"
              >
                {isUploadingBanner ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-1.5" />
                ) : (
                  <Upload className="w-4 h-4 mr-1.5" />
                )}
                Upload Image
              </Button>
            </div>
            <p className="text-[11px] text-plum-muted">
              Upload a banner photo from your device (auto-compressed to WebP) or paste a direct image URL. Leave blank to automatically use the latest New Arrival photo.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-bold uppercase text-plum">Badge Label</Label>
              <Input
                type="text"
                placeholder="e.g. New Drop"
                value={heroBannerBadge}
                onChange={(e) => setHeroBannerBadge(e.target.value)}
                className="h-11 rounded-xl text-xs"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-bold uppercase text-plum">Target Link URL</Label>
              <Input
                type="text"
                placeholder="/shop or /products/..."
                value={heroBannerLink}
                onChange={(e) => setHeroBannerLink(e.target.value)}
                className="h-11 rounded-xl font-mono text-xs"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-bold uppercase text-plum">Banner Headline / Title</Label>
            <Input
              type="text"
              placeholder="e.g. NewJeans 2nd EP 'Get Up' Drop"
              value={heroBannerTitle}
              onChange={(e) => setHeroBannerTitle(e.target.value)}
              className="h-11 rounded-xl text-xs"
            />
            <p className="text-[11px] text-plum-muted">
              Leave blank to automatically show the title of your newest arrival product.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
