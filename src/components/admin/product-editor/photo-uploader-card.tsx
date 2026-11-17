"use client";

import { Upload, Package, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface PhotoUploaderCardProps {
  primaryImageUrl: string;
  setPrimaryImageUrl: (url: string) => void;
  isUploadingImage: boolean;
  onUploadClick: () => void;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export function PhotoUploaderCard({
  primaryImageUrl,
  setPrimaryImageUrl,
  isUploadingImage,
  onUploadClick,
  fileInputRef,
  onFileChange,
}: PhotoUploaderCardProps) {
  return (
    <div className="bg-white p-5 rounded-2xl border border-border shadow-xs space-y-4">
      <div className="flex items-center gap-2 pb-2 border-b border-border">
        <Upload className="w-4 h-4 text-pink" />
        <h2 className="text-sm font-bold uppercase text-plum">Master Photo (1:1)</h2>
      </div>

      {/* Live 1:1 Square Preview */}
      <div className="relative aspect-square w-full rounded-2xl border border-border overflow-hidden bg-ivory flex items-center justify-center shadow-2xs">
        {primaryImageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={primaryImageUrl} alt="Product preview" className="w-full h-full object-cover" />
        ) : (
          <div className="text-center p-4 space-y-1">
            <Package className="w-10 h-10 text-border mx-auto" />
            <span className="text-xs font-bold text-plum-muted block">No Photo Uploaded</span>
            <span className="text-[10px] text-plum-muted">1:1 Square Recommended</span>
          </div>
        )}
      </div>

      {/* Upload Button from Device */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={onFileChange}
        className="hidden"
      />
      <Button
        type="button"
        variant="outline"
        disabled={isUploadingImage}
        onClick={onUploadClick}
        className="w-full h-11 text-xs font-semibold border-plum text-plum hover:bg-blush/30 rounded-xl cursor-pointer"
      >
        {isUploadingImage ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin mr-1.5" />
            <span>Uploading to Storage...</span>
          </>
        ) : (
          <>
            <Upload className="w-4 h-4 mr-1.5" />
            <span>Upload Photo from Device</span>
          </>
        )}
      </Button>

      {/* Direct URL input fallback */}
      <div className="space-y-1">
        <Label className="text-[11px] font-bold uppercase text-plum">Or Direct Photo URL</Label>
        <Input
          placeholder="https://is3.cloudhost.id/velora/products/..."
          value={primaryImageUrl}
          onChange={(e) => setPrimaryImageUrl(e.target.value)}
          className="h-9 font-mono text-[11px]"
        />
      </div>
    </div>
  );
}
