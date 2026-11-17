"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Product, ProductVersion } from "@/db/schema";
import {
  upsertVersionAction,
  deleteProductAction,
  deleteVersionAction,
} from "@/app/actions/admin-products";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
} from "lucide-react";

interface ProductWithVersions extends Product {
  versions: ProductVersion[];
}

interface ProductsManagerProps {
  initialProducts: ProductWithVersions[];
}

export function ProductsManager({ initialProducts }: ProductsManagerProps) {
  const [productsList, setProductsList] = useState(initialProducts);
  const [expandedProductId, setExpandedProductId] = useState<number | null>(null);

  // Standalone Version Modal (for quick single version edit from accordion)
  const [isVersionDialogOpen, setIsVersionDialogOpen] = useState(false);
  const [editingVersion, setEditingVersion] = useState<{
    productId: number;
    version?: Partial<ProductVersion>;
  } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

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

        <Link
          href="/admin/products/new"
          className="inline-flex items-center justify-center bg-plum hover:bg-plum-hover text-white text-xs font-semibold h-11 px-5 rounded-xl shadow-xs transition-colors"
        >
          <Plus className="w-4 h-4 mr-1.5" />
          Add New Product
        </Link>
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
                    <Link
                      href={`/admin/products/${product.id}`}
                      className="inline-flex items-center justify-center flex-1 sm:flex-initial h-8 px-2.5 sm:px-3 text-xs font-semibold text-plum border border-plum/30 rounded-lg hover:bg-blush/30 transition-colors"
                    >
                      <Edit className="w-3.5 h-3.5 mr-1 shrink-0" />
                      <span>Edit Product</span>
                    </Link>
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
