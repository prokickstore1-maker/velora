"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { Product, ProductVersion } from "@/db/schema";
import {
  upsertProductAction,
  upsertVersionAction,
  deleteProductAction,
  deleteVersionAction,
} from "@/app/actions/admin-products";
import { getBrandAssetPresignedUrlAction } from "@/app/actions/admin-settings";
import { compressImage } from "@/lib/image-compress";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import {
  Plus,
  Edit,
  Trash2,
  ChevronDown,
  ChevronRight,
  Package,
  Layers,
  Loader2,
  Upload,
  Copy,
  Sparkles,
  Link2,
} from "lucide-react";
import { PRODUCT_CATEGORIES } from "@/lib/constants";
import { formatPreOrderDeadline } from "@/lib/date";

interface ProductWithVersions extends Product {
  versions: ProductVersion[];
}

interface ProductsManagerProps {
  initialProducts: ProductWithVersions[];
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

export function ProductsManager({ initialProducts }: ProductsManagerProps) {
  const [productsList, setProductsList] = useState(initialProducts);
  const [expandedProductId, setExpandedProductId] = useState<number | null>(null);

  // Dialog States
  const [isProductDialogOpen, setIsProductDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Partial<Product> | null>(null);

  // Guided Version Generator States
  const [versionCount, setVersionCount] = useState<number>(1);
  const [draftVersions, setDraftVersions] = useState<DraftVersionItem[]>([
    { versionName: "Standard", sku: "", priceRm: "85.00", stock: 10 },
  ]);
  const [includeFullSet, setIncludeFullSet] = useState<boolean>(false);
  const [fullSetOption, setFullSetOption] = useState<DraftVersionItem>({
    versionName: "Full 2-Album Set",
    sku: "",
    priceRm: "170.00",
    stock: 5,
    isBundle: true,
    bundleMode: "linked",
  });

  // Standalone Version Modal (for quick single version edit from accordion)
  const [isVersionDialogOpen, setIsVersionDialogOpen] = useState(false);
  const [editingVersion, setEditingVersion] = useState<{
    productId: number;
    version?: Partial<ProductVersion>;
  } | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const primaryImageInputRef = useRef<HTMLInputElement>(null);

  // Helper to generate SKU prefix from product name/slug
  const buildSkuPrefix = (nameOrSlug?: string) => {
    const clean = (nameOrSlug || "MV")
      .toUpperCase()
      .replace(/[^A-Z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
    const parts = clean.split("-").filter(Boolean);
    return (
      parts
        .slice(0, 3)
        .map((p) => p.slice(0, 3))
        .join("-") || "MV-ITEM"
    );
  };

  // Adjust version count dynamically while keeping existing typed rows
  const handleVersionCountChange = (newCountRaw: number, currentCategory?: string) => {
    const count = Math.max(1, Math.min(20, newCountRaw || 1));
    setVersionCount(count);

    const cat = currentCategory || editingProduct?.category || "Album";
    const prefix = buildSkuPrefix(editingProduct?.slug || editingProduct?.name);

    setDraftVersions((prev) => {
      const next: DraftVersionItem[] = [];
      const basePrice = prev[0]?.priceRm || "85.00";
      const baseStock = prev[0]?.stock ?? 10;

      for (let i = 0; i < count; i++) {
        if (prev[i]) {
          // If changing from 1 ("Standard") to >=2, rename first version to "Ver. A"
          const shouldRenameFirst =
            count > 1 && i === 0 && prev[0].versionName === "Standard";
          next.push({
            ...prev[i],
            versionName: shouldRenameFirst ? "Ver. A" : prev[i].versionName,
          });
        } else {
          const letter = DEFAULT_VERSION_LETTERS[i] || `${i + 1}`;
          next.push({
            versionName: count === 1 ? "Standard" : `Ver. ${letter}`,
            sku: `${prefix}-V${letter}`,
            priceRm: basePrice,
            stock: baseStock,
          });
        }
      }
      return next;
    });

    if (count < 2) {
      setIncludeFullSet(false);
    } else {
      // Update default Full Set label & summed price
      const itemLabel = cat === "Album" ? "Album" : "Version";
      setFullSetOption((prev) => ({
        ...prev,
        versionName: `Full ${count}-${itemLabel} Set`,
        sku: `${prefix}-SET`,
      }));
    }
  };

  // Toggle Full Set option and calculate default bundle price & stock
  const handleToggleFullSet = (checked: boolean) => {
    setIncludeFullSet(checked);
    if (checked) {
      const cat = editingProduct?.category || "Album";
      const itemLabel = cat === "Album" ? "Album" : "Version";
      const prefix = buildSkuPrefix(editingProduct?.slug || editingProduct?.name);
      const sumPrice = draftVersions.reduce(
        (acc, v) => acc + (parseFloat(v.priceRm) || 0),
        0
      );
      const minStock =
        draftVersions.length > 0
          ? Math.min(...draftVersions.map((v) => v.stock))
          : 5;

      setFullSetOption({
        versionName: `Full ${versionCount}-${itemLabel} Set`,
        sku: `${prefix}-SET`,
        priceRm: sumPrice > 0 ? sumPrice.toFixed(2) : "170.00",
        stock: minStock,
        isBundle: true,
        bundleMode: "linked",
      });
    }
  };

  const handleCopyFirstPriceToAll = () => {
    if (draftVersions.length < 2) return;
    const firstPrice = draftVersions[0].priceRm;
    const firstStock = draftVersions[0].stock;
    setDraftVersions((prev) =>
      prev.map((v) => ({
        ...v,
        priceRm: firstPrice,
        stock: firstStock,
      }))
    );
    toast.success(`Applied RM ${firstPrice} & ${firstStock} stock to all ${versionCount} versions.`);
  };

  // Upload Primary Product Photo (Device -> Canvas WebP -> S3 or DataURL)
  const handlePrimaryPhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingImage(true);
    try {
      const compressed = await compressImage(file, {
        maxWidth: 1000,
        maxHeight: 1000,
        quality: 0.85,
        mimeType: "image/webp",
      });

      const presigned = await getBrandAssetPresignedUrlAction(
        compressed.file.name,
        "image/webp"
      );

      if (presigned.success && presigned.uploadUrl && presigned.publicUrl) {
        const uploadRes = await fetch(presigned.uploadUrl, {
          method: "PUT",
          headers: { "Content-Type": "image/webp" },
          body: compressed.blob,
        });
        if (!uploadRes.ok) throw new Error("Upload failed");
        setEditingProduct((prev) => ({ ...prev, primaryImageUrl: presigned.publicUrl }));
        toast.success("Product photo uploaded!");
      } else {
        // Task 6: Block Base64 data URLs in production
        if (process.env.NODE_ENV === "production") {
          toast.error("Direct S3 upload is required in production mode. Base64 uploads are disabled.");
          return;
        }
        const dataUrl = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(String(reader.result));
          reader.onerror = reject;
          reader.readAsDataURL(compressed.blob);
        });
        setEditingProduct((prev) => ({ ...prev, primaryImageUrl: dataUrl }));
        toast.success("Product photo loaded (Local Preview)!");
      }
    } catch {
      toast.error("Failed to process image.");
    } finally {
      setIsUploadingImage(false);
      if (primaryImageInputRef.current) primaryImageInputRef.current.value = "";
    }
  };

  // --- Handlers: Product ---
  const handleOpenNewProduct = () => {
    setEditingProduct({
      name: "",
      slug: "",
      groupArtist: "",
      category: "Album",
      description: "",
      primaryImageUrl: "",
      isPreOrder: false,
      preOrderDeadline: "",
      preOrderQuotaMode: "finite",
      isNewArrival: true,
      isBestSeller: false,
      isPublished: true,
    });
    setVersionCount(2);
    setDraftVersions([
      { versionName: "Ver. A", sku: "MV-VA", priceRm: "90.00", stock: 10, isBundle: false, bundleMode: "standalone" },
      { versionName: "Ver. B", sku: "MV-VB", priceRm: "90.00", stock: 10, isBundle: false, bundleMode: "standalone" },
    ]);
    setIncludeFullSet(true);
    setFullSetOption({
      versionName: "Full 2-Album Set",
      sku: "MV-SET",
      priceRm: "175.00",
      stock: 10,
      isBundle: true,
      bundleMode: "linked",
    });
    setIsProductDialogOpen(true);
  };

  const handleOpenEditProduct = (p: ProductWithVersions) => {
    setEditingProduct(p);

    // Check if the last version is an explicit Full Set / Bundle
    const existing = p.versions || [];
    const lastVer = existing[existing.length - 1];
    const isBundleSet =
      existing.length >= 2 &&
      lastVer &&
      (Boolean(lastVer.isBundle) || /set|bundle|all|both/i.test(lastVer.versionName));

    if (isBundleSet) {
      const individualVers = existing.slice(0, -1);
      setVersionCount(individualVers.length);
      setDraftVersions(
        individualVers.map((v) => ({
          id: v.id,
          versionName: v.versionName,
          sku: v.sku,
          priceRm: v.priceRm,
          stock: v.stock,
          imageUrl: v.imageUrl || undefined,
          isBundle: false,
          bundleMode: "standalone",
        }))
      );
      setIncludeFullSet(true);
      setFullSetOption({
        id: lastVer.id,
        versionName: lastVer.versionName,
        sku: lastVer.sku,
        priceRm: lastVer.priceRm,
        stock: lastVer.stock,
        imageUrl: lastVer.imageUrl || undefined,
        isBundle: true,
        bundleMode: (lastVer.bundleMode as "standalone" | "linked") || "linked",
      });
    } else if (existing.length > 0) {
      setVersionCount(existing.length);
      setDraftVersions(
        existing.map((v) => ({
          id: v.id,
          versionName: v.versionName,
          sku: v.sku,
          priceRm: v.priceRm,
          stock: v.stock,
          imageUrl: v.imageUrl || undefined,
          isBundle: false,
          bundleMode: "standalone",
        }))
      );
      setIncludeFullSet(false);
    } else {
      setVersionCount(1);
      setDraftVersions([
        { versionName: "Standard", sku: `${buildSkuPrefix(p.slug)}-STD`, priceRm: "85.00", stock: 10, isBundle: false, bundleMode: "standalone" },
      ]);
      setIncludeFullSet(false);
    }

    setIsProductDialogOpen(true);
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct?.name || !editingProduct.slug || !editingProduct.primaryImageUrl) {
      toast.error("Please fill in Product Name and Primary Photo.");
      return;
    }

    const prefix = buildSkuPrefix(editingProduct.slug || editingProduct.name);

    const minIndividualStock =
      draftVersions.length > 0
        ? Math.min(...draftVersions.map((v) => Number(v.stock) || 0))
        : 0;

    // Build final versions array (individual versions + optional Full Set)
    const compiledVersions: DraftVersionItem[] = draftVersions.map((v, idx) => ({
      id: v.id,
      versionName: v.versionName.trim() || (versionCount === 1 ? "Standard" : `Ver. ${idx + 1}`),
      sku: v.sku.trim() || `${prefix}-V${idx + 1}`,
      priceRm: v.priceRm.trim() || "0.00",
      stock: Number(v.stock) || 0,
      imageUrl: v.imageUrl,
      isBundle: false,
      bundleMode: "standalone",
    }));

    if (versionCount >= 2 && includeFullSet) {
      const isLinked = fullSetOption.bundleMode === "linked";
      compiledVersions.push({
        id: fullSetOption.id,
        versionName: fullSetOption.versionName.trim() || `Full ${versionCount}-Version Set`,
        sku: fullSetOption.sku.trim() || `${prefix}-SET`,
        priceRm: fullSetOption.priceRm.trim() || "0.00",
        stock: isLinked ? minIndividualStock : (Number(fullSetOption.stock) || 0),
        imageUrl: fullSetOption.imageUrl,
        isBundle: true,
        bundleMode: fullSetOption.bundleMode || "linked",
      });
    }

    setIsSubmitting(true);
    try {
      const res = await upsertProductAction({
        id: editingProduct.id,
        name: editingProduct.name,
        slug: editingProduct.slug,
        groupArtist: editingProduct.groupArtist || undefined,
        category: editingProduct.category || "Album",
        description: editingProduct.description || undefined,
        primaryImageUrl: editingProduct.primaryImageUrl,
        isPreOrder: Boolean(editingProduct.isPreOrder),
        preOrderDeadline: editingProduct.isPreOrder ? editingProduct.preOrderDeadline || null : null,
        preOrderQuotaMode: (editingProduct.preOrderQuotaMode as "finite" | "open") || "finite",
        isNewArrival: Boolean(editingProduct.isNewArrival),
        isBestSeller: Boolean(editingProduct.isBestSeller),
        isPublished: editingProduct.isPublished !== false,
        versions: compiledVersions.map((v) => ({
          id: v.id,
          versionName: v.versionName,
          sku: v.sku,
          priceRm: v.priceRm,
          stock: v.stock,
          imageUrl: v.imageUrl || "",
          isBundle: v.isBundle ?? false,
          bundleMode: v.bundleMode ?? "standalone",
          isActive: true,
        })),
      });

      if (!res.success) {
        toast.error(res.error || "Failed to save product.");
        setIsSubmitting(false);
        return;
      }

      toast.success(
        editingProduct.id
          ? `Product & ${compiledVersions.length} version(s) updated!`
          : `New product created with ${compiledVersions.length} version(s)!`
      );
      setIsProductDialogOpen(false);
      window.location.reload();
    } catch {
      toast.error("An error occurred while saving product.");
      setIsSubmitting(false);
    }
  };

  const handleDeleteProduct = async (id: number) => {
    if (!confirm("Are you sure you want to delete this product and all its versions?")) return;
    const res = await deleteProductAction(id);
    if (res.success) {
      toast.success("Product deleted.");
      setProductsList((prev) => prev.filter((p) => p.id !== id));
    } else {
      toast.error(res.error || "Failed to delete.");
    }
  };

  // --- Handlers: Individual Version Edit (from Accordion) ---
  const handleOpenNewVersion = (productId: number) => {
    setEditingVersion({
      productId,
      version: {
        versionName: "",
        sku: "",
        priceRm: "85.00",
        stock: 10,
        imageUrl: "",
        isActive: true,
      },
    });
    setIsVersionDialogOpen(true);
  };

  const handleOpenEditVersion = (productId: number, v: ProductVersion) => {
    setEditingVersion({ productId, version: v });
    setIsVersionDialogOpen(true);
  };

  const handleSaveVersion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingVersion?.version?.versionName || !editingVersion.version.sku || !editingVersion.version.priceRm) {
      toast.error("Please fill in version name, SKU, and price.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await upsertVersionAction({
        id: editingVersion.version.id,
        productId: editingVersion.productId,
        versionName: editingVersion.version.versionName,
        sku: editingVersion.version.sku,
        priceRm: editingVersion.version.priceRm,
        stock: Number(editingVersion.version.stock) || 0,
        imageUrl: editingVersion.version.imageUrl || undefined,
        isBundle: Boolean(editingVersion.version.isBundle),
        bundleMode: (editingVersion.version.bundleMode as "standalone" | "linked") || "standalone",
        isActive: editingVersion.version.isActive !== false,
      });

      if (!res.success) {
        toast.error(res.error || "Failed to save version.");
        setIsSubmitting(false);
        return;
      }

      toast.success("Version saved!");
      setIsVersionDialogOpen(false);
      window.location.reload();
    } catch {
      toast.error("An error occurred while saving version.");
      setIsSubmitting(false);
    }
  };

  const handleDeleteVersion = async (id: number) => {
    if (!confirm("Delete this version?")) return;
    const res = await deleteVersionAction(id);
    if (res.success) {
      toast.success("Version deleted.");
      window.location.reload();
    } else {
      toast.error(res.error || "Failed to delete.");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-border gap-4">
        <div>
          <span className="text-xs font-bold tracking-widest text-plum-muted uppercase block">
            Inventory & Variants
          </span>
          <h1 className="mv-heading-italic text-2xl sm:text-3xl text-plum">
            PRODUCTS & VERSIONS ({productsList.length})
          </h1>
        </div>

        <Button
          onClick={handleOpenNewProduct}
          className="bg-plum hover:bg-plum-hover text-white text-xs font-semibold h-11 px-5 rounded-xl shadow-xs"
        >
          <Plus className="w-4 h-4 mr-1.5" />
          Add New Product
        </Button>
      </div>

      {/* Product List */}
      <div className="space-y-4">
        {productsList.length === 0 ? (
          <div className="bg-white p-12 text-center rounded-2xl border border-border text-plum-muted space-y-3">
            <Package className="w-10 h-10 mx-auto opacity-50 text-plum" />
            <p className="font-heading font-bold text-plum text-lg uppercase">No Products Listed Yet</p>
            <p className="text-xs text-plum-muted max-w-sm mx-auto">
              Add your first K-Pop merchandise item with guided version setup.
            </p>
          </div>
        ) : (
          productsList.map((product) => {
            const isExpanded = expandedProductId === product.id;
            const totalStock = product.versions.reduce((s, v) => s + v.stock, 0);

            return (
              <div
                key={product.id}
                className="bg-white rounded-2xl border border-border shadow-xs overflow-hidden transition-all"
              >
                {/* Product Master Row */}
                <div className="p-3.5 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-3 sm:gap-4">
                  <div className="flex items-start gap-2.5 sm:gap-3.5 min-w-0 flex-1">
                    <button
                      type="button"
                      onClick={() => setExpandedProductId(isExpanded ? null : product.id)}
                      className="p-1 -ml-1 mt-0.5 rounded-lg text-plum hover:bg-blush/40 transition-colors shrink-0"
                      title={isExpanded ? "Collapse versions" : "Expand versions"}
                    >
                      {isExpanded ? <ChevronDown className="w-4 h-4 sm:w-5 sm:h-5" /> : <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />}
                    </button>

                    <div className="relative w-12 h-12 sm:w-14 sm:h-14 rounded-lg overflow-hidden bg-ivory border border-border shrink-0 mt-0.5">
                      <Image
                        src={product.primaryImageUrl}
                        alt={product.name}
                        fill
                        unoptimized={product.primaryImageUrl.startsWith("data:")}
                        sizes="56px"
                        className="object-cover"
                      />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {product.groupArtist && (
                          <span className="text-[10px] font-bold text-plum uppercase tracking-wider bg-blush/50 px-1.5 py-0.5 rounded">
                            {product.groupArtist}
                          </span>
                        )}
                        <span className="text-[10px] bg-ivory px-1.5 py-0.5 rounded border border-border text-plum-muted">
                          {product.category}
                        </span>
                        {product.isPreOrder && (
                          <span className="text-[10px] bg-emerald-600 text-white px-1.5 py-0.5 rounded font-semibold">
                            Pre-Order
                          </span>
                        )}
                        {product.isNewArrival && (
                          <span className="text-[10px] bg-plum text-white px-1.5 py-0.5 rounded font-semibold">
                            New Arrival
                          </span>
                        )}
                        {product.isBestSeller && (
                          <span className="text-[10px] bg-pink text-white px-1.5 py-0.5 rounded font-semibold">
                            Best Seller
                          </span>
                        )}
                        {!product.isPublished && (
                          <span className="text-[10px] bg-muted text-plum-muted px-1.5 py-0.5 rounded">
                            Draft
                          </span>
                        )}
                      </div>

                      <h3 className="font-heading font-semibold text-xs sm:text-base text-plum truncate mt-1">
                        {product.name}
                      </h3>
                      <p className="text-[11px] sm:text-xs text-plum-muted font-mono break-all line-clamp-2 mt-0.5">
                        /{product.slug} · {product.versions.length} Version(s) · {totalStock} Total Stock
                      </p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 pt-2.5 md:pt-0 border-t md:border-t-0 border-border/40 w-full md:w-auto justify-start sm:justify-end">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleOpenEditProduct(product)}
                      className="flex-1 sm:flex-initial h-8 px-2.5 sm:px-3 text-xs font-semibold text-plum border-plum/30 hover:bg-blush/30"
                    >
                      <Edit className="w-3.5 h-3.5 mr-1 shrink-0" />
                      <span>Edit Product</span>
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleOpenNewVersion(product.id)}
                      className="h-8 px-2.5 sm:px-3 text-xs font-semibold border-border text-plum hover:bg-blush/20 shrink-0"
                    >
                      <Plus className="w-3.5 h-3.5 mr-1 shrink-0" />
                      <span>+ Version</span>
                    </Button>
                    <button
                      type="button"
                      onClick={() => handleDeleteProduct(product.id)}
                      className="p-1.5 text-plum-muted hover:text-destructive rounded-lg transition-colors shrink-0 ml-auto sm:ml-0"
                      title="Delete Product"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Sub-Versions Accordion Panel */}
                {isExpanded && (
                  <div className="bg-ivory/50 p-4 sm:p-5 border-t border-border space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold uppercase tracking-wider text-plum flex items-center gap-1.5">
                        <Layers className="w-4 h-4 text-plum" />
                        Configured Versions ({product.versions.length})
                      </span>
                    </div>

                    {product.versions.length === 0 ? (
                      <p className="text-xs text-plum-muted py-2">
                        No versions configured yet. Click Edit Product & Versions to generate versions.
                      </p>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                        {product.versions.map((ver) => (
                          <div
                            key={ver.id}
                            className="bg-white p-3.5 rounded-xl border border-border shadow-xs flex flex-col justify-between"
                          >
                            <div>
                              <div className="flex items-center justify-between">
                                <span className="font-heading font-bold text-xs text-plum uppercase">
                                  {ver.versionName}
                                </span>
                                <span
                                  className={`font-mono text-[11px] font-bold px-1.5 py-0.5 rounded ${
                                    ver.stock === 0
                                      ? "bg-rose-100 text-rose-800"
                                      : "bg-emerald-50 text-emerald-700"
                                  }`}
                                >
                                  {ver.stock} in stock
                                </span>
                              </div>

                              <p className="text-[11px] font-mono text-plum-muted mt-1">SKU: {ver.sku}</p>
                              <p className="font-heading font-bold text-sm text-plum mt-1">
                                RM {parseFloat(ver.priceRm).toFixed(2)}
                              </p>
                            </div>

                            <div className="mt-3 pt-2 border-t border-border/60 flex items-center justify-end gap-1">
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleOpenEditVersion(product.id, ver)}
                                className="h-7 text-xs font-semibold"
                              >
                                Edit
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleDeleteVersion(ver.id)}
                                className="h-7 text-xs font-semibold text-destructive hover:bg-destructive/10"
                              >
                                Delete
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Modal Dialog: Step-by-Step Guided Product + Versions Builder */}
      <Dialog open={isProductDialogOpen} onOpenChange={setIsProductDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[92vh] overflow-y-auto bg-white">
          <DialogHeader>
            <DialogTitle className="mv-heading-italic text-xl text-plum">
              {editingProduct?.id ? "Edit Product & Versions" : "New K-Pop Product"}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSaveProduct} className="space-y-5 pt-2">
            {/* STEP 1: Pilih Kategori */}
            <div className="p-3.5 rounded-xl bg-ivory/70 border border-border space-y-2">
              <Label className="text-xs font-bold uppercase text-plum block">
                Step 1 · Select Product Category *
              </Label>
              <div className="flex flex-wrap gap-1.5">
                {PRODUCT_CATEGORIES.map((cat) => {
                  const isSelected = (editingProduct?.category || "Album") === cat;
                  return (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => {
                        setEditingProduct((prev) => ({ ...prev, category: cat }));
                        // If switching to Lightstick / Single item and creating new, default to 1 version
                        if (!editingProduct?.id && (cat === "Lightstick" || cat === "Photobook")) {
                          handleVersionCountChange(1, cat);
                        } else if (!editingProduct?.id && cat === "Album" && versionCount === 1) {
                          handleVersionCountChange(2, cat);
                        }
                      }}
                      className={`text-xs font-semibold px-3 py-1.5 rounded-lg border transition-all ${
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

            {/* STEP 2: Nama Produk, Artis & Foto */}
            <div className="space-y-3">
              <Label className="text-xs font-bold uppercase text-plum block">
                Step 2 · Product Info & Photo *
              </Label>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2 space-y-1">
                  <span className="text-[11px] font-semibold text-plum-muted">Product Name *</span>
                  <Input
                    required
                    placeholder="e.g. aespa - The 1st Album 'Armageddon'"
                    value={editingProduct?.name || ""}
                    onChange={(e) => {
                      const name = e.target.value;
                      const autoSlug = name
                        .toLowerCase()
                        .replace(/[^a-z0-9]+/g, "-")
                        .replace(/(^-|-$)/g, "");
                      setEditingProduct((prev) => ({
                        ...prev,
                        name,
                        slug: prev?.id ? prev.slug : autoSlug,
                      }));
                    }}
                    className="h-10 rounded-xl text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <span className="text-[11px] font-semibold text-plum-muted">Group / Artist</span>
                  <Input
                    placeholder="e.g. aespa, NewJeans"
                    value={editingProduct?.groupArtist || ""}
                    onChange={(e) =>
                      setEditingProduct((prev) => ({ ...prev, groupArtist: e.target.value }))
                    }
                    className="h-10 rounded-xl text-xs"
                  />
                </div>
              </div>

              {/* Photo Upload + URL */}
              <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center bg-ivory/40 p-3 rounded-xl border border-border">
                {editingProduct?.primaryImageUrl ? (
                  <div className="relative w-16 h-16 rounded-lg overflow-hidden border border-border bg-white shrink-0">
                    <Image
                      src={editingProduct.primaryImageUrl}
                      alt="Preview"
                      fill
                      unoptimized={editingProduct.primaryImageUrl.startsWith("data:")}
                      sizes="64px"
                      className="object-cover"
                    />
                  </div>
                ) : (
                  <div className="w-16 h-16 rounded-lg border border-dashed border-border bg-white flex items-center justify-center text-[10px] text-plum-muted shrink-0">
                    1:1 Photo
                  </div>
                )}

                <div className="flex-1 w-full space-y-1.5">
                  <div className="flex items-center gap-2">
                    <input
                      ref={primaryImageInputRef}
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      onChange={handlePrimaryPhotoUpload}
                      className="hidden"
                    />
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      disabled={isUploadingImage}
                      onClick={() => primaryImageInputRef.current?.click()}
                      className="h-8 text-xs font-semibold border-plum text-plum hover:bg-blush/30"
                    >
                      {isUploadingImage ? (
                        <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                      ) : (
                        <Upload className="w-3.5 h-3.5 mr-1.5" />
                      )}
                      Upload Photo from Device
                    </Button>
                    <span className="text-[11px] text-plum-muted">or paste URL below</span>
                  </div>

                  <Input
                    required
                    placeholder="https://... or uploaded photo"
                    value={editingProduct?.primaryImageUrl || ""}
                    onChange={(e) =>
                      setEditingProduct((prev) => ({ ...prev, primaryImageUrl: e.target.value }))
                    }
                    className="h-9 rounded-lg font-mono text-[11px] bg-white"
                  />
                </div>
              </div>
            </div>

            {/* STEP 3: Berapa Versi & Opsi Beli Semua (Full Set) */}
            <div className="p-4 rounded-xl bg-ivory/70 border border-border space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <Label className="text-xs font-bold uppercase text-plum block">
                    Step 3 · How Many Versions Available? *
                  </Label>
                  <p className="text-[11px] text-plum-muted">
                    Choose 1 for single item, or 2+ if the {editingProduct?.category || "product"} has multiple versions (Ver. A, Ver. B, Member, etc.).
                  </p>
                </div>

                {/* Quick Number Selector */}
                <div className="flex items-center gap-1.5 shrink-0">
                  {[1, 2, 3, 4, 5, 6].map((num) => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => handleVersionCountChange(num)}
                      className={`w-8 h-8 rounded-lg font-heading font-bold text-xs border transition-all ${
                        versionCount === num
                          ? "bg-plum text-white border-plum shadow-xs"
                          : "bg-white text-plum border-border hover:bg-blush/40"
                      }`}
                    >
                      {num}
                    </button>
                  ))}
                  <Input
                    type="number"
                    min={1}
                    max={20}
                    value={versionCount}
                    onChange={(e) => handleVersionCountChange(parseInt(e.target.value, 10) || 1)}
                    className="w-14 h-8 rounded-lg text-center font-mono text-xs bg-white px-1"
                    title="Custom number of versions"
                  />
                </div>
              </div>

              {/* Copy Price Helper when >= 2 versions */}
              {versionCount >= 2 && (
                <div className="flex items-center justify-between bg-white/80 px-3 py-2 rounded-lg border border-border/60">
                  <span className="text-[11px] text-plum-muted">
                    Enter each version name below (e.g. <strong>Ver. A</strong>, <strong>Ver. B</strong>):
                  </span>
                  <button
                    type="button"
                    onClick={handleCopyFirstPriceToAll}
                    className="inline-flex items-center gap-1 text-[11px] font-semibold text-plum hover:text-pink transition-colors"
                  >
                    <Copy className="w-3 h-3" />
                    <span>Apply Version #1 Price & Stock to All</span>
                  </button>
                </div>
              )}

              {/* Generated Version Rows */}
              <div className="space-y-2">
                {draftVersions.map((ver, idx) => (
                  <div
                    key={idx}
                    className="grid grid-cols-12 gap-2 items-center bg-white p-2.5 rounded-xl border border-border"
                  >
                    <div className="col-span-5 sm:col-span-6">
                      <span className="text-[10px] font-semibold text-plum-muted uppercase block mb-0.5">
                        {versionCount === 1 ? "Option Label" : `Version #${idx + 1} Name *`}
                      </span>
                      <Input
                        required
                        placeholder={versionCount === 1 ? "Standard" : `Ver. ${DEFAULT_VERSION_LETTERS[idx] || idx + 1}`}
                        value={ver.versionName}
                        onChange={(e) => {
                          const val = e.target.value;
                          setDraftVersions((prev) =>
                            prev.map((item, i) => (i === idx ? { ...item, versionName: val } : item))
                          );
                        }}
                        className="h-9 rounded-lg text-xs font-medium"
                      />
                    </div>

                    <div className="col-span-4 sm:col-span-3">
                      <span className="text-[10px] font-semibold text-plum-muted uppercase block mb-0.5">
                        Price (RM) *
                      </span>
                      <Input
                        required
                        placeholder="90.00"
                        value={ver.priceRm}
                        onChange={(e) => {
                          const val = e.target.value;
                          setDraftVersions((prev) =>
                            prev.map((item, i) => (i === idx ? { ...item, priceRm: val } : item))
                          );
                        }}
                        className="h-9 rounded-lg font-mono text-xs"
                      />
                    </div>

                    <div className="col-span-3">
                      <span className="text-[10px] font-semibold text-plum-muted uppercase block mb-0.5">
                        Stock *
                      </span>
                      <Input
                        required
                        type="number"
                        min={0}
                        placeholder="10"
                        value={ver.stock}
                        onChange={(e) => {
                          const val = parseInt(e.target.value, 10) || 0;
                          setDraftVersions((prev) =>
                            prev.map((item, i) => (i === idx ? { ...item, stock: val } : item))
                          );
                        }}
                        className="h-9 rounded-lg font-mono text-xs"
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* OPSI BELI KEDUANYA / SEMUA VERSI (Full Set Option) */}
              {versionCount >= 2 && (
                <div className="pt-2 border-t border-border/70 space-y-2.5">
                  <label className="flex items-start gap-2.5 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={includeFullSet}
                      onChange={(e) => handleToggleFullSet(e.target.checked)}
                      className="w-4 h-4 mt-0.5 rounded text-plum"
                    />
                    <div>
                      <span className="text-xs font-bold text-plum flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-pink" />
                        Add &ldquo;Buy All {versionCount} Versions (Full Set)&rdquo; Option?
                      </span>
                      <span className="text-[11px] text-plum-muted block">
                        Allows customers to buy all {versionCount} versions together (e.g. Ver. A + Ver. B Set) with custom bundle price.
                      </span>
                    </div>
                  </label>

                  {includeFullSet && (
                    <div className="space-y-3 bg-blush/30 p-3.5 rounded-xl border border-plum/30">
                      {/* Bundle Stock Mode Toggle */}
                      <div className="space-y-1.5">
                        <span className="text-[10px] font-bold text-plum uppercase block">
                          Bundle Stock Mode *
                        </span>
                        <div className="grid grid-cols-2 gap-2">
                          <button
                            type="button"
                            onClick={() =>
                              setFullSetOption((prev) => ({
                                ...prev,
                                bundleMode: "linked",
                                stock: draftVersions.length > 0
                                  ? Math.min(...draftVersions.map((v) => v.stock))
                                  : 0,
                              }))
                            }
                            className={`p-2 rounded-lg border text-left text-xs transition-all ${
                              fullSetOption.bundleMode === "linked"
                                ? "bg-plum text-white border-plum shadow-xs font-semibold"
                                : "bg-white text-plum border-border hover:bg-blush/20"
                            }`}
                          >
                            <div className="flex items-center gap-1.5">
                              <Link2 className="w-3.5 h-3.5" />
                              <span>Linked / Shared Stock</span>
                            </div>
                            <span
                              className={`text-[10px] block mt-0.5 leading-tight ${
                                fullSetOption.bundleMode === "linked"
                                  ? "text-blush"
                                  : "text-plum-muted"
                              }`}
                            >
                              Auto-deducts 1 stock from each individual version.
                            </span>
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              setFullSetOption((prev) => ({
                                ...prev,
                                bundleMode: "standalone",
                              }))
                            }
                            className={`p-2 rounded-lg border text-left text-xs transition-all ${
                              fullSetOption.bundleMode === "standalone"
                                ? "bg-plum text-white border-plum shadow-xs font-semibold"
                                : "bg-white text-plum border-border hover:bg-blush/20"
                            }`}
                          >
                            <div className="flex items-center gap-1.5">
                              <Package className="w-3.5 h-3.5" />
                              <span>Standalone Stock</span>
                            </div>
                            <span
                              className={`text-[10px] block mt-0.5 leading-tight ${
                                fullSetOption.bundleMode === "standalone"
                                  ? "text-blush"
                                  : "text-plum-muted"
                              }`}
                            >
                              Dedicated warehouse allocation for sets only.
                            </span>
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-12 gap-2 items-center">
                        <div className="col-span-5 sm:col-span-6">
                          <span className="text-[10px] font-bold text-plum uppercase block mb-0.5">
                            Full Set Option Name *
                          </span>
                          <Input
                            required
                            placeholder={`Full ${versionCount}-Album Set`}
                            value={fullSetOption.versionName}
                            onChange={(e) =>
                              setFullSetOption((prev) => ({ ...prev, versionName: e.target.value }))
                            }
                            className="h-9 rounded-lg text-xs font-semibold bg-white"
                          />
                        </div>

                        <div className="col-span-4 sm:col-span-3">
                          <span className="text-[10px] font-bold text-plum uppercase block mb-0.5">
                            Set Price (RM) *
                          </span>
                          <Input
                            required
                            placeholder="180.00"
                            value={fullSetOption.priceRm}
                            onChange={(e) =>
                              setFullSetOption((prev) => ({ ...prev, priceRm: e.target.value }))
                            }
                            className="h-9 rounded-lg font-mono text-xs bg-white"
                          />
                        </div>

                        <div className="col-span-3">
                          <span className="text-[10px] font-bold text-plum uppercase block mb-0.5">
                            {fullSetOption.bundleMode === "linked" ? "Set Stock (Auto)" : "Set Stock *"}
                          </span>
                          <Input
                            required
                            type="number"
                            min={0}
                            disabled={fullSetOption.bundleMode === "linked"}
                            value={
                              fullSetOption.bundleMode === "linked"
                                ? draftVersions.length > 0
                                  ? Math.min(...draftVersions.map((v) => v.stock))
                                  : 0
                                : fullSetOption.stock
                            }
                            onChange={(e) =>
                              setFullSetOption((prev) => ({
                                ...prev,
                                stock: parseInt(e.target.value, 10) || 0,
                              }))
                            }
                            className={`h-9 rounded-lg font-mono text-xs ${
                              fullSetOption.bundleMode === "linked"
                                ? "bg-muted/50 cursor-not-allowed opacity-80"
                                : "bg-white"
                            }`}
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* STEP 4: Detail Inclusions & Penanda Seksi Beranda */}
            <div className="space-y-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-bold uppercase text-plum">
                  Step 4 · Product Details / Inclusions (DETAIL :)
                </Label>
                <Textarea
                  placeholder={`1. OUTBOX : 160 x 220mm / 1EA\n2. PHOTOBOOK : 88P\n3. CD-R : 1EA\n4. PHOTOCARD : RANDOM 1EA OUT OF 6`}
                  value={editingProduct?.description || ""}
                  onChange={(e) =>
                    setEditingProduct((prev) => ({ ...prev, description: e.target.value }))
                  }
                  className="min-h-24 rounded-xl resize-none text-xs"
                />
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-plum bg-ivory/60 p-2.5 rounded-xl border border-border">
                  <input
                    type="checkbox"
                    checked={Boolean(editingProduct?.isPreOrder)}
                    onChange={(e) =>
                      setEditingProduct((prev) => ({ ...prev, isPreOrder: e.target.checked }))
                    }
                    className="w-4 h-4 rounded text-plum"
                  />
                  <span>Pre-Order</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-plum bg-ivory/60 p-2.5 rounded-xl border border-border">
                  <input
                    type="checkbox"
                    checked={Boolean(editingProduct?.isNewArrival)}
                    onChange={(e) =>
                      setEditingProduct((prev) => ({ ...prev, isNewArrival: e.target.checked }))
                    }
                    className="w-4 h-4 rounded text-plum"
                  />
                  <span>New Arrival</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-plum bg-ivory/60 p-2.5 rounded-xl border border-border">
                  <input
                    type="checkbox"
                    checked={Boolean(editingProduct?.isBestSeller)}
                    onChange={(e) =>
                      setEditingProduct((prev) => ({ ...prev, isBestSeller: e.target.checked }))
                    }
                    className="w-4 h-4 rounded text-plum"
                  />
                  <span>Best Seller</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-plum bg-ivory/60 p-2.5 rounded-xl border border-border">
                  <input
                    type="checkbox"
                    checked={editingProduct?.isPublished !== false}
                    onChange={(e) =>
                      setEditingProduct((prev) => ({ ...prev, isPublished: e.target.checked }))
                    }
                    className="w-4 h-4 rounded text-plum"
                  />
                  <span>Published</span>
                </label>
              </div>

              {editingProduct?.isPreOrder && (
                <div className="space-y-3 pt-2 p-3 bg-ivory/80 rounded-xl border border-border">
                  <div className="space-y-1">
                    <Label className="text-xs font-bold uppercase text-plum block">
                      Pre-Order Deadline (Available until) *
                    </Label>
                    <Input
                      type="datetime-local"
                      value={editingProduct?.preOrderDeadline || ""}
                      onChange={(e) =>
                        setEditingProduct((prev) => ({ ...prev, preOrderDeadline: e.target.value }))
                      }
                      className="h-10 rounded-xl text-xs bg-white"
                    />
                    {editingProduct?.preOrderDeadline && (
                      <span className="text-[11px] text-plum-muted block">
                        Storefront format: {formatPreOrderDeadline(editingProduct.preOrderDeadline)}
                      </span>
                    )}
                  </div>

                  {/* Pre-Order Quota Mode (Task 8) */}
                  <div className="space-y-1 pt-1 border-t border-border/60">
                    <Label className="text-[11px] font-bold uppercase text-plum block">
                      Pre-Order Quota Mode *
                    </Label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          setEditingProduct((prev) => ({ ...prev, preOrderQuotaMode: "finite" }))
                        }
                        className={`p-2 rounded-lg border text-left text-xs transition-all ${
                          (editingProduct?.preOrderQuotaMode || "finite") === "finite"
                            ? "bg-plum text-white border-plum shadow-xs font-semibold"
                            : "bg-white text-plum border-border hover:bg-blush/20"
                        }`}
                      >
                        <span>Finite Quota</span>
                        <span
                          className={`text-[10px] block mt-0.5 leading-tight ${
                            (editingProduct?.preOrderQuotaMode || "finite") === "finite"
                              ? "text-blush"
                              : "text-plum-muted"
                          }`}
                        >
                          Follows version stock numbers.
                        </span>
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          setEditingProduct((prev) => ({ ...prev, preOrderQuotaMode: "open" }))
                        }
                        className={`p-2 rounded-lg border text-left text-xs transition-all ${
                          editingProduct?.preOrderQuotaMode === "open"
                            ? "bg-plum text-white border-plum shadow-xs font-semibold"
                            : "bg-white text-plum border-border hover:bg-blush/20"
                        }`}
                      >
                        <span>Open PO (Unlimited)</span>
                        <span
                          className={`text-[10px] block mt-0.5 leading-tight ${
                            editingProduct?.preOrderQuotaMode === "open"
                              ? "text-blush"
                              : "text-plum-muted"
                          }`}
                        >
                          Accepts orders until deadline closes.
                        </span>
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <DialogFooter className="pt-3 border-t border-border">
              <Button type="button" variant="outline" onClick={() => setIsProductDialogOpen(false)}>
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="bg-plum hover:bg-plum-hover text-white font-semibold"
              >
                {isSubmitting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  `Save Product (${
                    versionCount >= 2 && includeFullSet ? versionCount + 1 : versionCount
                  } Version${versionCount >= 2 || includeFullSet ? "s" : ""})`
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Modal Dialog: Quick Individual Version Edit */}
      <Dialog open={isVersionDialogOpen} onOpenChange={setIsVersionDialogOpen}>
        <DialogContent className="max-w-md bg-white">
          <DialogHeader>
            <DialogTitle className="mv-heading-italic text-lg text-plum">
              {editingVersion?.version?.id ? "Edit Version" : "New Version Option"}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSaveVersion} className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <Label className="text-xs font-bold uppercase text-plum">Version Name *</Label>
              <Input
                required
                placeholder="e.g. Ver. A, Photobook, Group Ver."
                value={editingVersion?.version?.versionName || ""}
                onChange={(e) =>
                  setEditingVersion((prev) => ({
                    ...prev!,
                    version: { ...prev?.version, versionName: e.target.value },
                  }))
                }
                className="h-11 rounded-xl"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-bold uppercase text-plum">SKU Code *</Label>
              <Input
                required
                placeholder="e.g. NJ-GU-V-A"
                value={editingVersion?.version?.sku || ""}
                onChange={(e) =>
                  setEditingVersion((prev) => ({
                    ...prev!,
                    version: { ...prev?.version, sku: e.target.value },
                  }))
                }
                className="h-11 rounded-xl font-mono text-xs uppercase"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-bold uppercase text-plum">Price (RM) *</Label>
                <Input
                  required
                  placeholder="85.00"
                  value={editingVersion?.version?.priceRm || ""}
                  onChange={(e) =>
                    setEditingVersion((prev) => ({
                      ...prev!,
                      version: { ...prev?.version, priceRm: e.target.value },
                    }))
                  }
                  className="h-11 rounded-xl font-mono text-sm"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-bold uppercase text-plum">Physical Stock *</Label>
                <Input
                  required
                  type="number"
                  min={0}
                  placeholder="10"
                  value={editingVersion?.version?.stock ?? 10}
                  onChange={(e) =>
                    setEditingVersion((prev) => ({
                      ...prev!,
                      version: { ...prev?.version, stock: parseInt(e.target.value, 10) || 0 },
                    }))
                  }
                  className="h-11 rounded-xl font-mono text-sm"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-bold uppercase text-plum">Version Image URL (Optional)</Label>
              <Input
                placeholder="Leave blank to use main product photo"
                value={editingVersion?.version?.imageUrl || ""}
                onChange={(e) =>
                  setEditingVersion((prev) => ({
                    ...prev!,
                    version: { ...prev?.version, imageUrl: e.target.value },
                  }))
                }
                className="h-11 rounded-xl font-mono text-xs"
              />
            </div>

            <DialogFooter className="pt-3">
              <Button type="button" variant="outline" onClick={() => setIsVersionDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting} className="bg-plum hover:bg-plum-hover text-white">
                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save Version"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
