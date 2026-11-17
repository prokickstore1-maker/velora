"use client";

import { Upload, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface BrandLogoTabProps {
  brandLogoUrl: string;
  setBrandLogoUrl: (val: string) => void;
  isUploadingLogo: boolean;
  logoFileInputRef: React.RefObject<HTMLInputElement | null>;
  onLogoUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export function BrandLogoTab({
  brandLogoUrl,
  setBrandLogoUrl,
  isUploadingLogo,
  logoFileInputRef,
  onLogoUpload,
}: BrandLogoTabProps) {
  return (
    <div className="bg-white p-6 rounded-2xl border border-border shadow-xs space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-border">
        <h3 className="font-heading font-extrabold italic text-lg text-plum uppercase">
          Brand Monogram &amp; Logo Asset
        </h3>
        <div className="flex items-center gap-2">
          <input
            ref={logoFileInputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp,image/svg+xml"
            onChange={onLogoUpload}
            className="hidden"
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={isUploadingLogo}
            onClick={() => logoFileInputRef.current?.click()}
            className="text-xs border-plum text-plum hover:bg-blush/30 w-fit cursor-pointer"
          >
            {isUploadingLogo ? (
              <>
                <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                <span>Uploading...</span>
              </>
            ) : (
              <>
                <Upload className="w-3.5 h-3.5 mr-1.5" />
                <span>Upload Logo from Device</span>
              </>
            )}
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setBrandLogoUrl("/brand/myvelora-logo.png")}
            className="text-xs border-border text-plum hover:bg-blush/30 w-fit cursor-pointer"
          >
            Use Official mv Logo
          </Button>
        </div>
      </div>

      <div className="p-6 rounded-2xl bg-plum flex items-center justify-center border border-plum-hover">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={brandLogoUrl?.trim() ? brandLogoUrl.trim() : "/brand/myvelora-logo.png"}
          alt="Myvelora Logo Preview"
          className="h-14 w-auto object-contain"
        />
      </div>

      <div className="space-y-2">
        <Label className="text-xs font-bold uppercase text-plum">Master Logo Path / URL (Transparent PNG or SVG)</Label>
        <Input
          type="text"
          placeholder="/brand/myvelora-logo.png"
          value={brandLogoUrl}
          onChange={(e) => setBrandLogoUrl(e.target.value)}
          className="h-11 rounded-xl font-mono text-xs"
        />
        <p className="text-[11px] text-plum-muted">
          Default: <code>/brand/myvelora-logo.png</code> (extracted from official Myvelora monogram asset).
        </p>
      </div>
    </div>
  );
}
