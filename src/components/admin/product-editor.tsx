"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Product, ProductVersion } from "@/db/schema";
import { upsertProductAction } from "@/app/actions/admin-products";
import { uploadImageServerAction } from "@/app/actions/upload";
import { compressImage } from "@/lib/image-compress";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import {
  ArrowLeft,
  Save,
  Loader2,
  Upload,
  Plus,
  Trash2,
  Package,
  Layers,
  Sparkles,
  Calendar,
  CheckCircle2,
} from "lucide-react";
import { PRODUCT_CATEGORIES } from "@/lib/constants";

interface ProductWithVersions extends Product {
  versions: ProductVersion[];
}

interface DraftVersionItem {
  id?: number;
  versionName: string;
  sku: string;
  priceRm: string;
  stock: number;
  imageUrl?: string;
  isBundle?: boolean;
  bundleMode?: "standalone" | "linked";
  linkedVersionIds?: string;
}

const DEFAULT_VERSION_LETTERS = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L"];

interface ProductEditorProps {
  product?: ProductWithVersions | null;
}

export function ProductEditor({ product }: ProductEditorProps) {
  const router = useRouter();
  const isEditing = Boolean(product?.id);

  // Form states
  const [name, setName] = useState(product?.name || "");
  const [slug, setSlug] = useState(product?.slug || "");
  const [groupArtist, setGroupArtist] = useState(product?.groupArtist || "");
  const [category, setCategory] = useState(product?.category || "Album");
  const [description, setDescription] = useState(product?.description || "");
  const [primaryImageUrl, setPrimaryImageUrl] = useState(product?.primaryImageUrl || "");
  const [isPreOrder, setIsPreOrder] = useState(Boolean(product?.isPreOrder));
  const [preOrderDeadline, setPreOrderDeadline] = useState(product?.preOrderDeadline || "");
  const [preOrderQuotaMode, setPreOrderQuotaMode] = useState<"finite" | "open">(
    (product?.preOrderQuotaMode as "finite" | "open") || "finite"
  );
  const [isNewArrival, setIsNewArrival] = useState(product ? Boolean(product.isNewArrival) : true);
  const [isBestSeller, setIsBestSeller] = useState(Boolean(product?.isBestSeller));
  const [isPublished, setIsPublished] = useState(product ? Boolean(product.isPublished) : true);

  // Version Builder state
  const existingVersions = product?.versions || [];
  const lastVer = existingVersions[existingVersions.length - 1];
  const isLastBundle =
    existingVersions.length >= 2 &&
    lastVer &&
    (Boolean(lastVer.isBundle) || /set|bundle|all|both/i.test(lastVer.versionName));

  const initialDraftVersions: DraftVersionItem[] = isEditing
    ? (isLastBundle ? existingVersions.slice(0, -1) : existingVersions).map((v) => ({
        id: v.id,
        versionName: v.versionName,
        sku: v.sku,
        priceRm: v.priceRm,
        stock: v.stock,
        imageUrl: v.imageUrl || undefined,
        isBundle: false,
        bundleMode: "standalone",
      }))
    : [
        { versionName: "Ver. A", sku: "MV-VA", priceRm: "90.00", stock: 10, isBundle: false, bundleMode: "standalone" },
        { versionName: "Ver. B", sku: "MV-VB", priceRm: "90.00", stock: 10, isBundle: false, bundleMode: "standalone" },
      ];

  const [draftVersions, setDraftVersions] = useState<DraftVersionItem[]>(initialDraftVersions);
  const [versionCount, setVersionCount] = useState(initialDraftVersions.length || 2);

  // Bundle / Full Set state
  const [includeFullSet, setIncludeFullSet] = useState(
    isEditing
      ? isLastBundle
      : true
  );

  const [fullSetOption, setFullSetOption] = useState<DraftVersionItem>(
    isEditing && isLastBundle && lastVer
      ? {
          id: lastVer.id,
          versionName: lastVer.versionName,
          sku: lastVer.sku,
          priceRm: lastVer.priceRm,
          stock: lastVer.stock,
          imageUrl: lastVer.imageUrl || undefined,
          isBundle: true,
          bundleMode: (lastVer.bundleMode as "standalone" | "linked") || "linked",
          linkedVersionIds: lastVer.linkedVersionIds || undefined,
        }
      : {
          versionName: "Full 2-Album Set",
          sku: "MV-SET",
          priceRm: "175.00",
          stock: 10,
          isBundle: true,
          bundleMode: "linked",
        }
  );

  // Image Upload states
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const primaryImageInputRef = useRef<HTMLInputElement>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Auto generate slug
  const handleGenerateSlug = () => {
    const raw = `${groupArtist} ${name}`.trim();
    if (!raw) return;
    const clean = raw
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
    setSlug(clean);
    toast.info(`Slug generated: ${clean}`);
  };

  // Adjust version count
  const handleVersionCountChange = (count: number, catName = category) => {
    setVersionCount(count);
    const baseSku = slug ? slug.toUpperCase().slice(0, 10).replace(/-/g, "") : "MV";

    const newVers: DraftVersionItem[] = [];
    for (let i = 0; i < count; i++) {
      const letter = DEFAULT_VERSION_LETTERS[i] || `${i + 1}`;
      const existing = draftVersions[i];
      if (existing) {
        newVers.push(existing);
      } else {
        const defaultName = count === 1 ? (catName === "Lightstick" ? "Official Lightstick" : "Standard") : `Ver. ${letter}`;
        newVers.push({
          versionName: defaultName,
          sku: `${baseSku}-V${letter}`,
          priceRm: draftVersions[0]?.priceRm || "90.00",
          stock: 10,
          isBundle: false,
          bundleMode: "standalone",
        });
      }
    }
    setDraftVersions(newVers);

    // Update Full Set name
    if (count >= 2) {
      setFullSetOption((prev) => ({
        ...prev,
        versionName: `Full ${count}-${catName === "Lightstick" ? "Item" : "Album"} Set`,
        sku: `${baseSku}-SET`,
      }));
    }
  };

  const handleUpdateDraftVersion = (idx: number, field: keyof DraftVersionItem, val: string | number) => {
    setDraftVersions((prev) => {
      const copy = [...prev];
      copy[idx] = { ...copy[idx], [field]: val };
      return copy;
    });
  };

  const handleAddCustomVersion = () => {
    const nextIdx = draftVersions.length;
    const letter = DEFAULT_VERSION_LETTERS[nextIdx] || `${nextIdx + 1}`;
    const baseSku = slug ? slug.toUpperCase().slice(0, 10).replace(/-/g, "") : "MV";
    setDraftVersions((prev) => [
      ...prev,
      {
        versionName: `Ver. ${letter}`,
        sku: `${baseSku}-V${letter}`,
        priceRm: prev[0]?.priceRm || "90.00",
        stock: 10,
        isBundle: false,
        bundleMode: "standalone",
      },
    ]);
    setVersionCount((prev) => prev + 1);
  };

  const handleRemoveDraftVersion = (idx: number) => {
    if (draftVersions.length <= 1) {
      toast.error("Product must have at least 1 version.");
      return;
    }
    setDraftVersions((prev) => prev.filter((_, i) => i !== idx));
    setVersionCount((prev) => prev - 1);
  };

  // Upload Photo to S3
  const handlePrimaryImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingImage(true);
    try {
      const compressed = await compressImage(file, {
        maxWidth: 1200,
        maxHeight: 1200,
        quality: 0.85,
        mimeType: "image/webp",
      });

      const formData = new FormData();
      formData.append("file", compressed.file);
      formData.append("folder", "products");

      const serverRes = await uploadImageServerAction(formData);
      if (serverRes.success && serverRes.publicUrl) {
        setPrimaryImageUrl(serverRes.publicUrl);
        toast.success("Product image uploaded to S3!");
      } else {
        toast.error(serverRes.error || "Failed to upload image.");
      }
    } catch {
      toast.error("Failed to process image.");
    } finally {
      setIsUploadingImage(false);
      if (primaryImageInputRef.current) primaryImageInputRef.current.value = "";
    }
  };

  // Save Product
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error("Product name is required.");
      return;
    }

    let finalSlug = slug.trim();
    if (!finalSlug) {
      finalSlug = `${groupArtist} ${name}`
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
      setSlug(finalSlug);
    }

    if (!finalSlug) {
      toast.error("Product slug is required.");
      return;
    }

    if (!primaryImageUrl.trim()) {
      toast.error("Primary product photo is required.");
      return;
    }

    if (draftVersions.length === 0) {
      toast.error("Please add at least 1 version.");
      return;
    }

    setIsSaving(true);

    try {
      const allFinalVersions: DraftVersionItem[] = [...draftVersions];
      if (includeFullSet && fullSetOption.versionName.trim() && draftVersions.length >= 2) {
        allFinalVersions.push(fullSetOption);
      }

      const res = await upsertProductAction({
        id: product?.id,
        name: name.trim(),
        slug: finalSlug,
        groupArtist: groupArtist.trim() || undefined,
        category,
        description: description.trim() || undefined,
        primaryImageUrl: primaryImageUrl.trim(),
        isPreOrder,
        preOrderDeadline: isPreOrder ? preOrderDeadline.trim() || null : null,
        preOrderQuotaMode: (preOrderQuotaMode as "finite" | "open") || "finite",
        isNewArrival,
        isBestSeller,
        isPublished,
        versions: allFinalVersions.map((v) => ({
          id: v.id,
          versionName: v.versionName.trim(),
          sku: v.sku.trim(),
          priceRm: v.priceRm.trim(),
          stock: Number(v.stock) || 0,
          imageUrl: v.imageUrl?.trim() || undefined,
          isBundle: Boolean(v.isBundle),
          bundleMode: v.bundleMode || "standalone",
          linkedVersionIds: v.linkedVersionIds || null,
        })),
      });

      if (!res.success) {
        toast.error(res.error || "Failed to save product.");
        setIsSaving(false);
        return;
      }

      toast.success(isEditing ? "Product updated successfully!" : "Product created successfully!");
      router.push("/admin/products");
      router.refresh();
    } catch {
      toast.error("An unexpected error occurred while saving.");
      setIsSaving(false);
    }
  };

  // Quick calculations for summary
  const totalStock = draftVersions.reduce((acc, curr) => acc + (Number(curr.stock) || 0), 0);
  const prices = draftVersions.map((v) => parseFloat(v.priceRm) || 0).filter((p) => p > 0);
  const minPrice = prices.length ? Math.min(...prices) : 0;
  const maxPrice = includeFullSet && fullSetOption.priceRm
    ? Math.max(...prices, parseFloat(fullSetOption.priceRm) || 0)
    : (prices.length ? Math.max(...prices) : 0);

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-6xl mx-auto pb-16">
      {/* Top Bar: Navigation & Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
        <div className="space-y-1">
          <Link
            href="/admin/products"
            className="inline-flex items-center text-xs font-semibold text-plum hover:text-pink transition-colors gap-1.5"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Products Catalog
          </Link>
          <h1 className="mv-heading-italic text-2xl sm:text-3xl text-plum">
            {isEditing ? `EDIT: ${name || "PRODUCT"}` : "CREATE NEW K-POP PRODUCT"}
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push("/admin/products")}
            className="h-11 px-4 text-xs font-semibold border-border text-plum hover:bg-blush/30"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isSaving}
            className="bg-plum hover:bg-plum-hover text-white text-xs font-semibold h-11 px-6 rounded-xl shadow-xs"
          >
            {isSaving ? <Loader2 className="w-4 h-4 animate-spin mr-1.5" /> : <Save className="w-4 h-4 mr-1.5" />}
            {isEditing ? "Update Product" : "Save Product"}
          </Button>
        </div>
      </div>

      {/* Main Grid: Left Column (Fields) & Right Column (Photo & Visibility) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT COLUMN (8 COLS) */}
        <div className="lg:col-span-8 space-y-6">
          {/* CARD 1: Category & Basic Details */}
          <div className="bg-white p-6 rounded-2xl border border-border shadow-xs space-y-5">
            <div className="flex items-center gap-2 pb-2 border-b border-border">
              <Package className="w-4 h-4 text-pink" />
              <h2 className="text-sm font-bold uppercase text-plum">1. Category & General Information</h2>
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
                      onClick={() => {
                        setCategory(cat);
                        if (!isEditing && (cat === "Lightstick" || cat === "Photobook")) {
                          handleVersionCountChange(1, cat);
                        } else if (!isEditing && cat === "Album" && versionCount === 1) {
                          handleVersionCountChange(2, cat);
                        }
                      }}
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
                  onClick={handleGenerateSlug}
                  className="text-[11px] font-semibold text-pink hover:underline"
                >
                  Generate from Title & Artist
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
              <Label className="text-xs font-bold uppercase text-plum">Description & Package Details</Label>
              <Textarea
                placeholder="Official sealed album packaging includes photobook, CD-R, lyric book, photocards, and sticker pack..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="min-h-24 text-xs resize-y rounded-xl"
              />
            </div>
          </div>

          {/* CARD 2: Multi-Version & Inventory Builder */}
          <div className="bg-white p-6 rounded-2xl border border-border shadow-xs space-y-5">
            <div className="flex items-center justify-between pb-2 border-b border-border">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-pink" />
                <h2 className="text-sm font-bold uppercase text-plum">2. Versions & Physical Inventory</h2>
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
                    onClick={() => handleVersionCountChange(num)}
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
                      <span className="w-5 h-5 rounded-full bg-plum text-white text-[10px] flex items-center justify-center">
                        {idx + 1}
                      </span>
                      Version #{idx + 1}
                    </span>
                    {draftVersions.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveDraftVersion(idx)}
                        className="text-plum-muted hover:text-destructive p-1 rounded transition-colors"
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
                        onChange={(e) => handleUpdateDraftVersion(idx, "versionName", e.target.value)}
                        className="h-10 text-xs font-semibold"
                      />
                    </div>

                    <div className="sm:col-span-3 space-y-1">
                      <Label className="text-[11px] font-bold uppercase text-plum">SKU Code *</Label>
                      <Input
                        required
                        placeholder="MV-NJ-MJ"
                        value={ver.sku}
                        onChange={(e) => handleUpdateDraftVersion(idx, "sku", e.target.value)}
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
                          onChange={(e) => handleUpdateDraftVersion(idx, "priceRm", e.target.value)}
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
                        onChange={(e) => handleUpdateDraftVersion(idx, "stock", parseInt(e.target.value, 10) || 0)}
                        className="h-10 text-xs font-bold text-center"
                      />
                    </div>
                  </div>
                </div>
              ))}

              <Button
                type="button"
                variant="outline"
                onClick={handleAddCustomVersion}
                className="w-full h-10 text-xs font-semibold border-dashed border-plum/40 text-plum hover:bg-blush/20"
              >
                <Plus className="w-3.5 h-3.5 mr-1" />
                Add Another Version Option
              </Button>
            </div>

            {/* FULL SET / BUNDLE OPTION */}
            {draftVersions.length >= 2 && (
              <div className="p-4 rounded-xl border border-pink/30 bg-blush-soft space-y-3">
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={includeFullSet}
                      onChange={(e) => setIncludeFullSet(e.target.checked)}
                      className="w-4 h-4 rounded text-pink"
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
            )}
          </div>

          {/* CARD 3: Pre-Order Configuration */}
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
        </div>

        {/* RIGHT COLUMN (4 COLS): Photo, Visibility, Summary */}
        <div className="lg:col-span-4 space-y-6">
          {/* Main Photo Card */}
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
              ref={primaryImageInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handlePrimaryImageUpload}
              className="hidden"
            />
            <Button
              type="button"
              variant="outline"
              disabled={isUploadingImage}
              onClick={() => primaryImageInputRef.current?.click()}
              className="w-full h-11 text-xs font-semibold border-plum text-plum hover:bg-blush/30 rounded-xl"
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

          {/* Visibility & Badges Card */}
          <div className="bg-white p-5 rounded-2xl border border-border shadow-xs space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-border">
              <Sparkles className="w-4 h-4 text-pink" />
              <h2 className="text-sm font-bold uppercase text-plum">Visibility & Badges</h2>
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

          {/* Summary & Sticky Save */}
          <div className="bg-plum text-white p-5 rounded-2xl shadow-sm space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-white/20">
              <CheckCircle2 className="w-4 h-4 text-blush" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-blush">Product Summary</h3>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-white/70">Total Versions:</span>
                <span className="font-bold">{draftVersions.length + (includeFullSet ? 1 : 0)} items</span>
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
        </div>
      </div>
    </form>
  );
}
