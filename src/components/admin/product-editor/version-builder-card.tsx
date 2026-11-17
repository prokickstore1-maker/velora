"use client";

import { useState } from "react";
import { Layers, Plus, Trash2, Upload, Loader2, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { compressImage } from "@/lib/image-compress";
import { uploadImageServerAction } from "@/app/actions/upload";
import { toast } from "sonner";
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
  const [uploadingIdx, setUploadingIdx] = useState<number | null>(null);

  const handleVersionPhotoUpload = async (idx: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingIdx(idx);
    try {
      const compressed = await compressImage(file, {
        maxWidth: 1000,
        maxHeight: 1000,
        quality: 0.85,
        mimeType: "image/webp",
      });

      const formData = new FormData();
      formData.append("file", compressed.file);
      formData.append("folder", "products");

      const res = await uploadImageServerAction(formData);
      if (res.success && res.publicUrl) {
        onUpdateDraftVersion(idx, "imageUrl", res.publicUrl);
        toast.success(`Photo for Version #${idx + 1} uploaded!`);
      } else {
        toast.error(res.error || "Failed to upload version photo.");
      }
    } catch {
      toast.error("Failed to process image.");
    } finally {
      setUploadingIdx(null);
    }
  };

  return (
    <div className="bg-white p-6 rounded-2xl border border-border shadow-xs space-y-5">
      <div className="flex items-center justify-between pb-2 border-b border-border">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-pink" />
          <h2 className="text-sm font-bold uppercase text-plum">2. Versions &amp; Multi-Photo Inventory</h2>
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

            {/* Version Photo Upload (Multi-Photo Support) */}
            <div className="pt-2 border-t border-border/40 flex flex-col sm:flex-row items-start sm:items-center gap-3">
              <div className="relative w-12 h-12 rounded-lg border border-border overflow-hidden bg-ivory shrink-0 flex items-center justify-center shadow-2xs">
                {ver.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={ver.imageUrl} alt={ver.versionName} className="w-full h-full object-cover" />
                ) : (
                  <ImageIcon className="w-5 h-5 text-border" />
                )}
              </div>

              <div className="flex-1 w-full space-y-1">
                <div className="flex items-center gap-2">
                  <label className="inline-flex items-center justify-center h-8 px-3 rounded-lg border border-plum/30 text-plum hover:bg-blush/30 text-xs font-semibold cursor-pointer">
                    {uploadingIdx === idx ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                        <span>Uploading Photo...</span>
                      </>
                    ) : (
                      <>
                        <Upload className="w-3.5 h-3.5 mr-1.5" />
                        <span>Upload Version Photo</span>
                      </>
                    )}
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      disabled={uploadingIdx === idx}
                      onChange={(e) => handleVersionPhotoUpload(idx, e)}
                      className="hidden"
                    />
                  </label>

                  {ver.imageUrl && (
                    <button
                      type="button"
                      onClick={() => onUpdateDraftVersion(idx, "imageUrl", "")}
                      className="text-xs text-destructive hover:underline cursor-pointer"
                    >
                      Remove
                    </button>
                  )}
                </div>
                <Input
                  placeholder="Or paste version photo URL..."
                  value={ver.imageUrl || ""}
                  onChange={(e) => onUpdateDraftVersion(idx, "imageUrl", e.target.value)}
                  className="h-7 text-[11px] font-mono bg-ivory/50"
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
