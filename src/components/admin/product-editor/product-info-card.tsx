"use client";

import { Package } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { PRODUCT_CATEGORIES } from "@/lib/constants";

interface ProductInfoCardProps {
  category: string;
  setCategory: (cat: string) => void;
  name: string;
  setName: (name: string) => void;
  groupArtist: string;
  setGroupArtist: (artist: string) => void;
  slug: string;
  setSlug: (slug: string) => void;
  description: string;
  setDescription: (desc: string) => void;
  onGenerateSlug: () => void;
}

export function ProductInfoCard({
  category,
  setCategory,
  name,
  setName,
  groupArtist,
  setGroupArtist,
  slug,
  setSlug,
  description,
  setDescription,
  onGenerateSlug,
}: ProductInfoCardProps) {
  return (
    <div className="bg-white p-6 rounded-2xl border border-border shadow-xs space-y-5">
      <div className="flex items-center gap-2 pb-2 border-b border-border">
        <Package className="w-4 h-4 text-pink" />
        <h2 className="text-sm font-bold uppercase text-plum">1. Category &amp; General Information</h2>
      </div>

      {/* Category selection */}
      <div className="space-y-2">
        <Label className="text-xs font-bold uppercase text-plum">Product Category *</Label>
        <div className="flex flex-wrap gap-2">
          {PRODUCT_CATEGORIES.map((cat) => {
            const isSelected = category === cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setCategory(cat)}
                className={`text-xs font-semibold px-4 py-2 rounded-xl border transition-all cursor-pointer ${
                  isSelected
                    ? "bg-plum text-white border-plum shadow-xs"
                    : "bg-white text-plum border-border hover:bg-blush/30"
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>
      </div>

      {/* Product Name & Group */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label className="text-xs font-bold uppercase text-plum">Product Title *</Label>
          <Input
            required
            placeholder="e.g. 2nd EP 'Get Up'"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="h-11 rounded-xl text-xs font-semibold"
          />
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs font-bold uppercase text-plum">K-Pop Group / Artist *</Label>
          <Input
            required
            placeholder="e.g. NewJeans, aespa, IVE"
            value={groupArtist}
            onChange={(e) => setGroupArtist(e.target.value)}
            className="h-11 rounded-xl text-xs font-semibold"
          />
        </div>
      </div>

      {/* URL Slug */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <Label className="text-xs font-bold uppercase text-plum">URL Slug *</Label>
          <button
            type="button"
            onClick={onGenerateSlug}
            className="text-[11px] font-semibold text-pink hover:underline cursor-pointer"
          >
            Generate from Title &amp; Artist
          </button>
        </div>
        <Input
          required
          placeholder="e.g. newjeans-2nd-ep-get-up"
          value={slug}
          onChange={(e) => setSlug(e.target.value)}
          className="h-11 rounded-xl font-mono text-xs"
        />
        <p className="text-[11px] text-plum-muted">
          URL path: <code>/products/{slug || "slug-here"}</code>
        </p>
      </div>

      {/* Description */}
      <div className="space-y-1.5">
        <Label className="text-xs font-bold uppercase text-plum">Description &amp; Package Details</Label>
        <Textarea
          placeholder="Official sealed album packaging includes photobook, CD-R, lyric book, photocards, and sticker pack..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="min-h-24 text-xs resize-y rounded-xl"
        />
      </div>
    </div>
  );
}
