"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { upsertProductAction } from "@/app/actions/admin-products";
import { uploadImageServerAction } from "@/app/actions/upload";
import { compressImage } from "@/lib/image-compress";

import { ProductEditorProps, DraftVersionItem } from "./product-editor/types";
import { ProductInfoCard } from "./product-editor/product-info-card";
import { VersionBuilderCard } from "./product-editor/version-builder-card";
import { BundleOptionCard } from "./product-editor/bundle-option-card";
import { PreOrderCard } from "./product-editor/preorder-card";
import { PhotoUploaderCard } from "./product-editor/photo-uploader-card";
import { VisibilityCard } from "./product-editor/visibility-card";
import { SummaryCard } from "./product-editor/summary-card";

const DEFAULT_VERSION_LETTERS = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L"];

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
        discountPercent: v.discountPercent || 0,
        imageUrl: v.imageUrl || undefined,
        isBundle: false,
        bundleMode: "standalone",
      }))
    : [
        { versionName: "Ver. A", sku: "MV-VA", priceRm: "90.00", stock: 10, discountPercent: 0, isBundle: false, bundleMode: "standalone" },
        { versionName: "Ver. B", sku: "MV-VB", priceRm: "90.00", stock: 10, discountPercent: 0, isBundle: false, bundleMode: "standalone" },
      ];

  const [draftVersions, setDraftVersions] = useState<DraftVersionItem[]>(initialDraftVersions);
  const [versionCount, setVersionCount] = useState(initialDraftVersions.length || 2);

  // Bundle / Full Set state
  const [includeFullSet, setIncludeFullSet] = useState(isEditing ? isLastBundle : true);
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
          discountPercent: Number(v.discountPercent) || 0,
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
            className="h-11 px-4 text-xs font-semibold border-border text-plum hover:bg-blush/30 cursor-pointer"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isSaving}
            className="bg-plum hover:bg-plum-hover text-white text-xs font-semibold h-11 px-6 rounded-xl shadow-xs cursor-pointer"
          >
            {isSaving ? <Loader2 className="w-4 h-4 animate-spin mr-1.5" /> : <Save className="w-4 h-4 mr-1.5" />}
            {isEditing ? "Update Product" : "Save Product"}
          </Button>
        </div>
      </div>

      {/* Main Grid: Left Column (Fields) & Right Column (Photo & Visibility) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT COLUMN: 8 Columns */}
        <div className="lg:col-span-8 space-y-6">
          <ProductInfoCard
            category={category}
            setCategory={(cat) => {
              setCategory(cat);
              if (!isEditing && (cat === "Lightstick" || cat === "Photobook")) {
                handleVersionCountChange(1, cat);
              } else if (!isEditing && cat === "Album" && versionCount === 1) {
                handleVersionCountChange(2, cat);
              }
            }}
            name={name}
            setName={setName}
            groupArtist={groupArtist}
            setGroupArtist={setGroupArtist}
            slug={slug}
            setSlug={setSlug}
            description={description}
            setDescription={setDescription}
            onGenerateSlug={handleGenerateSlug}
          />

          <div className="space-y-4">
            <VersionBuilderCard
              draftVersions={draftVersions}
              versionCount={versionCount}
              onVersionCountChange={handleVersionCountChange}
              onUpdateDraftVersion={handleUpdateDraftVersion}
              onAddCustomVersion={handleAddCustomVersion}
              onRemoveDraftVersion={handleRemoveDraftVersion}
            />

            {draftVersions.length >= 2 && (
              <BundleOptionCard
                includeFullSet={includeFullSet}
                setIncludeFullSet={setIncludeFullSet}
                fullSetOption={fullSetOption}
                setFullSetOption={setFullSetOption}
              />
            )}
          </div>

          <PreOrderCard
            isPreOrder={isPreOrder}
            setIsPreOrder={setIsPreOrder}
            preOrderDeadline={preOrderDeadline}
            setPreOrderDeadline={setPreOrderDeadline}
            preOrderQuotaMode={preOrderQuotaMode}
            setPreOrderQuotaMode={setPreOrderQuotaMode}
          />
        </div>

        {/* RIGHT COLUMN: 4 Columns */}
        <div className="lg:col-span-4 space-y-6">
          <PhotoUploaderCard
            primaryImageUrl={primaryImageUrl}
            setPrimaryImageUrl={setPrimaryImageUrl}
            isUploadingImage={isUploadingImage}
            onUploadClick={() => primaryImageInputRef.current?.click()}
            fileInputRef={primaryImageInputRef}
            onFileChange={handlePrimaryImageUpload}
          />

          <VisibilityCard
            isPublished={isPublished}
            setIsPublished={setIsPublished}
            isNewArrival={isNewArrival}
            setIsNewArrival={setIsNewArrival}
            isBestSeller={isBestSeller}
            setIsBestSeller={setIsBestSeller}
          />

          <SummaryCard
            totalVersions={draftVersions.length + (includeFullSet ? 1 : 0)}
            totalStock={totalStock}
            minPrice={minPrice}
            maxPrice={maxPrice}
            isSaving={isSaving}
            isEditing={isEditing}
          />
        </div>
      </div>
    </form>
  );
}
