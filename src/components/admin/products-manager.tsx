"use client";

import { useState, useMemo } from "react";
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
  ChevronLeft,
  Package,
  Layers,
  Loader2,
  Search,
  X,
} from "lucide-react";

interface ProductWithVersions extends Product {
  versions: ProductVersion[];
}

interface ProductsManagerProps {
  initialProducts: ProductWithVersions[];
}

const ADMIN_ITEMS_PER_PAGE = 20;

export function ProductsManager({ initialProducts }: ProductsManagerProps) {
  const [productsList, setProductsList] = useState(initialProducts);
  const [expandedProductId, setExpandedProductId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterMode, setFilterMode] = useState<string>("All");
  const [currentPage, setCurrentPage] = useState<number>(1);

  // Standalone Version Modal (for quick single version edit from accordion)
  const [isVersionDialogOpen, setIsVersionDialogOpen] = useState(false);
  const [editingVersion, setEditingVersion] = useState<{
    productId: number;
    version?: Partial<ProductVersion>;
  } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const filteredProducts = useMemo(() => {
    return productsList.filter((product) => {
      if (filterMode === "Pre-Order" && !product.isPreOrder) return false;
      if (filterMode === "Draft" && product.isPublished) return false;
      if (
        filterMode !== "All" &&
        filterMode !== "Pre-Order" &&
        filterMode !== "Draft" &&
        product.category.toLowerCase() !== filterMode.toLowerCase()
      ) {
        return false;
      }

      if (searchQuery.trim()) {
        const rawCorpus = `${product.name} ${product.groupArtist || ""} ${product.category} ${product.slug} ${product.versions.map((v) => `${v.versionName} ${v.sku}`).join(" ")}`.toLowerCase();
        const cleanCorpus = rawCorpus.replace(/[^a-z0-9]/g, "");
        const terms = searchQuery.trim().toLowerCase().split(/\s+/).filter(Boolean);
        const allMatch = terms.every((term) => {
          if (rawCorpus.includes(term)) return true;
          const cleanTerm = term.replace(/[^a-z0-9]/g, "");
          return Boolean(cleanTerm && cleanCorpus.includes(cleanTerm));
        });
        if (!allMatch) return false;
      }

      return true;
    });
  }, [productsList, filterMode, searchQuery]);

  const totalFiltered = filteredProducts.length;
  const totalPages = Math.max(1, Math.ceil(totalFiltered / ADMIN_ITEMS_PER_PAGE));
  const safeCurrentPage = Math.min(currentPage, totalPages);

  const paginatedProducts = useMemo(() => {
    const start = (safeCurrentPage - 1) * ADMIN_ITEMS_PER_PAGE;
    return filteredProducts.slice(start, start + ADMIN_ITEMS_PER_PAGE);
  }, [filteredProducts, safeCurrentPage]);

  const filterPills = ["All", "Album", "Lightstick", "Pre-Order", "Draft"];

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

      {/* Search & Category Filter Bar */}
      <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between bg-white p-4 rounded-2xl border border-border shadow-xs">
        <div className="relative flex-1 md:max-w-md">
          <Search className="w-4 h-4 text-plum-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
          <Input
            type="text"
            placeholder="Search by product name, artist, SKU, or version..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            autoComplete="off"
            autoCorrect="off"
            spellCheck={false}
            className="pl-10 h-10 bg-background border-border text-xs sm:text-sm rounded-xl"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => {
                setSearchQuery("");
                setCurrentPage(1);
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-plum-muted hover:text-plum"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-1.5 flex-wrap">
          {filterPills.map((pill) => {
            const isActive = filterMode === pill;
            return (
              <button
                key={pill}
                type="button"
                onClick={() => {
                  setFilterMode(pill);
                  setCurrentPage(1);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
                  isActive
                    ? "bg-plum text-white shadow-xs"
                    : "bg-ivory text-plum hover:bg-blush/40 border border-border"
                }`}
              >
                {pill}
              </button>
            );
          })}
        </div>
      </div>

      {/* Counter Summary */}
      <div className="flex items-center justify-between text-xs text-plum-muted px-1">
        <span>
          Showing{" "}
          <strong className="text-plum">
            {totalFiltered === 0 ? 0 : (safeCurrentPage - 1) * ADMIN_ITEMS_PER_PAGE + 1}–
            {Math.min(safeCurrentPage * ADMIN_ITEMS_PER_PAGE, totalFiltered)}
          </strong>{" "}
          of <strong className="text-plum">{totalFiltered}</strong> matching products
        </span>
        {totalPages > 1 && (
          <span>
            Page {safeCurrentPage} of {totalPages}
          </span>
        )}
      </div>

      {/* Product List */}
      <div className="space-y-4">
        {filteredProducts.length === 0 ? (
          <div className="bg-white p-12 text-center rounded-2xl border border-border text-plum-muted space-y-3">
            <Package className="w-10 h-10 mx-auto opacity-50 text-plum" />
            <p className="font-heading font-bold text-plum text-lg uppercase">No Products Matched</p>
            <p className="text-xs text-plum-muted max-w-sm mx-auto">
              Try adjusting your search query or switching category filters.
            </p>
          </div>
        ) : (
          paginatedProducts.map((product) => {
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

      {/* Admin Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-border">
          <p className="text-xs text-plum-muted font-medium">
            Page <strong className="text-plum">{safeCurrentPage}</strong> of{" "}
            <strong className="text-plum">{totalPages}</strong>
          </p>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={safeCurrentPage <= 1}
              onClick={() => {
                setCurrentPage((p) => Math.max(1, p - 1));
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              className="h-9 px-3 rounded-xl text-xs font-semibold text-plum border-border"
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              Prev
            </Button>

            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={safeCurrentPage >= totalPages}
              onClick={() => {
                setCurrentPage((p) => Math.min(totalPages, p + 1));
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              className="h-9 px-3 rounded-xl text-xs font-semibold text-plum border-border"
            >
              Next
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </div>
      )}

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
