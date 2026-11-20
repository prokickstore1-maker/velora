"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import type { Product, ProductVersion, StoreSettings } from "@/db/schema";
import { useCart } from "@/context/cart-context";
import { useWishlist } from "@/lib/wishlist";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ShoppingBag, Plus, Minus, ArrowLeft, Heart } from "lucide-react";
import { formatPreOrderDeadline, isDeadlinePassed } from "@/lib/date";
import { calculateEffectivePrice } from "@/lib/promo";

interface ProductWithVersions extends Product {
  versions: ProductVersion[];
}

interface ProductDetailClientProps {
  product: ProductWithVersions;
  settings?: StoreSettings | null;
}

export function ProductDetailClient({ product, settings }: ProductDetailClientProps) {
  const { addItem } = useCart();

  const deadlinePassed = Boolean(
    product.isPreOrder && isDeadlinePassed(product.preOrderDeadline)
  );
  const isOpenPreOrder = Boolean(
    product.isPreOrder && product.preOrderQuotaMode === "open" && !deadlinePassed
  );

  // Task 1: Resolve dynamic stock for Linked Bundles (Full Set)
  const getVersionStock = (ver?: ProductVersion) => {
    if (!ver) return 0;
    if (ver.isBundle && ver.bundleMode === "linked") {
      let linkedIds: number[] = [];
      if (ver.linkedVersionIds) {
        try {
          linkedIds = JSON.parse(ver.linkedVersionIds);
        } catch {
          linkedIds = [];
        }
      }

      const targetVers =
        linkedIds.length > 0
          ? product.versions.filter((v) => linkedIds.includes(v.id))
          : product.versions.filter((v) => !v.isBundle && v.id !== ver.id);

      if (targetVers.length > 0) {
        return Math.min(...targetVers.map((v) => v.stock));
      }
    }
    return ver.stock;
  };

  const defaultVersion =
    product.versions.find((v) => getVersionStock(v) > 0) || product.versions[0];

  const [selectedVersion, setSelectedVersion] = useState<ProductVersion | undefined>(
    defaultVersion
  );
  const [quantity, setQuantity] = useState(1);

  // Task 5: Reactive Wishlist state persisted in localStorage
  const { isWishlisted, toggle: toggleWishlist } = useWishlist();
  const liked = isWishlisted(product.id);

  const handleToggleLike = () => {
    toggleWishlist(product.id);
  };

  const activeImage = selectedVersion?.imageUrl || product.primaryImageUrl;
  const effectiveStock = getVersionStock(selectedVersion);
  const isSelectedSoldOut = !isOpenPreOrder && (!selectedVersion || effectiveStock <= 0);
  const isPurchaseBlocked = deadlinePassed || isSelectedSoldOut;
  const maxStock = isOpenPreOrder ? 99 : effectiveStock;
  const hasMultipleVersions = product.versions.length > 1;

  const handleVersionChange = (version: ProductVersion) => {
    setSelectedVersion(version);
    setQuantity(1);
  };

  const activePromo = selectedVersion
    ? calculateEffectivePrice(
        selectedVersion.priceRm,
        product.category,
        settings,
        selectedVersion.discountPercent
      )
    : { hasDiscount: false, originalPrice: 0, discountedPrice: 0, discountPercent: 0, badgeText: "" };

  const handleAddToCart = () => {
    if (!selectedVersion || isPurchaseBlocked) return;

    const unitPrice = activePromo.hasDiscount
      ? activePromo.discountedPrice.toFixed(2)
      : selectedVersion.priceRm;

    addItem(
      {
        productId: product.id,
        productSlug: product.slug,
        productName: product.name,
        versionId: selectedVersion.id,
        versionName: selectedVersion.versionName,
        priceRm: unitPrice,
        imageUrl: activeImage,
        maxStock: maxStock,
        sku: selectedVersion.sku,
      },
      quantity
    );
  };

  return (
    <div className="pb-20 sm:pb-8">
      {/* Breadcrumb / Back Link */}
      <div className="mb-4 sm:mb-5">
        <Button asChild variant="ghost" size="sm" className="-ml-2 text-plum-muted hover:text-plum text-xs">
          <Link href="/shop">
            <ArrowLeft className="w-3.5 h-3.5 mr-1" />
            Back to Catalog
          </Link>
        </Button>
      </div>

      {/* Main 2-Column Product Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-12 items-start">
        {/* Left Column: Photo-First Square Frame */}
        <div className="lg:col-span-6 w-full">
          <div className="relative aspect-square w-full rounded-2xl bg-white border border-border shadow-xs overflow-hidden mv-corner-frame">
            <Image
              src={activeImage}
              alt={product.name}
              fill
              unoptimized={activeImage.startsWith("data:")}
              sizes="(max-width: 1024px) 100vw, 50vw"
              priority
              className="object-cover"
            />
          </div>
        </div>

        {/* Right Column: Smart Hybrid Product Info & Version Selector */}
        <div className="lg:col-span-6 space-y-4 sm:space-y-5 min-w-0">
          {/* 1. Badges & Title */}
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
              {product.groupArtist && (
                <Badge
                  variant="secondary"
                  className="bg-blush/60 text-plum font-bold uppercase tracking-wider text-[10px]"
                >
                  {product.groupArtist}
                </Badge>
              )}
              <Badge variant="outline" className="text-[10px] text-plum-muted border-border">
                {product.category}
              </Badge>
              {selectedVersion && (
                <span className="font-mono text-[10px] sm:text-[11px] text-plum-muted">
                  SKU: {selectedVersion.sku}
                </span>
              )}
            </div>

            <h1 className="mv-heading-italic text-xl sm:text-2xl md:text-3xl text-plum leading-tight break-words">
              {product.name}
            </h1>

            {/* 2. Pre-Order Deadline (if applicable) */}
            {product.isPreOrder && product.preOrderDeadline && (
              <p className="text-xs sm:text-sm text-plum-muted font-sans">
                Available until: {formatPreOrderDeadline(product.preOrderDeadline)}
              </p>
            )}

            {/* 3. Like/Save Button & Stock Status Row */}
            <div className="flex flex-wrap items-center gap-3 sm:gap-5 pt-1">
              <button
                type="button"
                onClick={handleToggleLike}
                aria-label={liked ? "Saved in favorites" : "Save to favorites"}
                className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-medium text-plum hover:text-pink transition-colors shrink-0"
              >
                <Heart
                  className={`w-4 h-4 transition-colors ${
                    liked ? "fill-[#e11d48] text-[#e11d48]" : "text-plum-muted"
                  }`}
                />
                <span>{liked ? "Saved" : "Save"}</span>
              </button>

              {deadlinePassed ? (
                <span className="text-xs sm:text-sm font-semibold text-[#9b1c48]">
                  Pre-Order Closed
                </span>
              ) : isSelectedSoldOut ? (
                <span className="text-xs sm:text-sm font-semibold text-[#9b1c48]">
                  Out of Stock
                </span>
              ) : isOpenPreOrder ? (
                <span className="text-xs sm:text-sm font-semibold text-emerald-600">
                  Pre-Order
                </span>
              ) : product.isPreOrder ? (
                <span className="text-xs sm:text-sm font-semibold text-emerald-600">
                  {effectiveStock > 0 && effectiveStock <= 3
                    ? `Pre-Order (Only ${effectiveStock} slots left)`
                    : "Pre-Order"}
                </span>
              ) : (
                <span className="text-xs sm:text-sm font-semibold text-emerald-600">
                  In Stock ({effectiveStock} available)
                </span>
              )}
            </div>
          </div>

          {/* 4. Clean Price Display with Promo Support */}
          <div className="space-y-0.5 pt-1">
            <span className="text-[10px] sm:text-xs font-semibold text-plum-muted uppercase tracking-wider block">
              PRICE
            </span>
            <div className="flex items-baseline gap-3 flex-wrap">
              <p className="font-heading font-extrabold text-2xl sm:text-3xl text-plum whitespace-nowrap">
                RM {selectedVersion ? (activePromo.hasDiscount ? activePromo.discountedPrice.toFixed(2) : parseFloat(selectedVersion.priceRm).toFixed(2)) : "0.00"}
              </p>
              {activePromo.hasDiscount && (
                <span className="text-base sm:text-lg font-semibold line-through text-plum-muted">
                  RM {activePromo.originalPrice.toFixed(2)}
                </span>
              )}
              {activePromo.hasDiscount && (
                <span className="bg-pink text-white text-[11px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider shadow-2xs">
                  {activePromo.badgeText}
                </span>
              )}
            </div>
          </div>

          {/* 5. Smart Version Selector (Only shown when product has > 1 version) */}
          {hasMultipleVersions && (
            <div className="space-y-2 pt-1">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-bold text-plum uppercase tracking-wider">
                  Select Version
                </span>
                <Badge variant="secondary" className="text-[10px] sm:text-[11px] font-medium bg-blush/50 text-plum">
                  {product.versions.length} versions
                </Badge>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-2.5">
                {product.versions.map((ver) => {
                  const isSelected = selectedVersion?.id === ver.id;
                  const verStock = getVersionStock(ver);
                  const isOut = !isOpenPreOrder && verStock <= 0;

                  return (
                    <button
                      key={ver.id}
                      type="button"
                      onClick={() => handleVersionChange(ver)}
                      className={`mv-touch-target p-2 sm:p-3 rounded-xl border text-left transition-all relative flex flex-col justify-between gap-1 overflow-hidden ${
                        isSelected
                          ? "border-plum bg-plum text-white shadow-xs"
                          : isOut
                          ? "border-border/70 bg-muted/35 text-plum-muted hover:border-plum/40"
                          : "border-border bg-white text-plum hover:border-plum/50 hover:bg-blush/20"
                      }`}
                    >
                      <span className="font-heading font-bold text-xs line-clamp-1 uppercase tracking-tight">
                        {ver.versionName}
                      </span>
                      <div className="flex items-center justify-between gap-1 min-w-0">
                        <span
                          className={`text-[11px] font-semibold whitespace-nowrap truncate ${
                            isSelected ? "text-white/90" : "text-plum-muted"
                          }`}
                        >
                          RM {parseFloat(ver.priceRm).toFixed(2)}
                        </span>
                        {isOut && (
                          <span
                            className={`text-[9px] font-bold uppercase shrink-0 ${
                              isSelected ? "text-blush" : "text-[#9b1c48]"
                            }`}
                          >
                            Sold Out
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* 6. Quantity Stepper & Out-of-Stock Notice */}
          <div className="space-y-2 pt-1">
            <span className="text-[11px] sm:text-xs font-semibold text-plum-muted uppercase tracking-wider block">
              QUANTITY
            </span>

            {isPurchaseBlocked ? (
              <div className="space-y-2.5">
                <div className="inline-flex items-center border border-border/70 rounded-xl bg-muted/30 p-1 opacity-60 select-none">
                  <span className="w-8 h-8 flex items-center justify-center text-plum-muted">
                    <Minus className="w-4 h-4" />
                  </span>
                  <span className="w-10 text-center font-heading font-bold text-sm text-plum">
                    0
                  </span>
                  <span className="w-8 h-8 flex items-center justify-center text-plum-muted">
                    <Plus className="w-4 h-4" />
                  </span>
                </div>
                <p className="text-xs sm:text-sm font-medium text-[#9b1c48]">
                  {deadlinePassed
                    ? "Pre-order period has ended."
                    : "Sorry, insufficient stock available."}
                </p>
              </div>
            ) : (
              <div className="inline-flex items-center border border-border rounded-xl bg-white p-1">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  disabled={quantity <= 1}
                  className="text-plum hover:bg-blush/40 rounded-lg"
                >
                  <Minus className="w-4 h-4" />
                </Button>
                <span className="w-10 text-center font-heading font-bold text-sm text-plum select-none">
                  {quantity}
                </span>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => setQuantity((q) => Math.min(maxStock, q + 1))}
                  disabled={quantity >= maxStock}
                  className="text-plum hover:bg-blush/40 rounded-lg"
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            )}
          </div>

          {/* 7. Desktop Add to Cart Button */}
          <div className="hidden sm:block pt-1">
            <Button
              type="button"
              size="lg"
              disabled={isPurchaseBlocked}
              onClick={handleAddToCart}
              className="w-full bg-plum hover:bg-plum-hover text-white font-semibold text-base h-12 rounded-xl shadow-sm flex items-center justify-center gap-2"
            >
              <ShoppingBag className="w-5 h-5" />
              <span>
                {deadlinePassed
                  ? "Pre-Order Closed"
                  : isSelectedSoldOut
                  ? "Out of Stock"
                  : product.isPreOrder
                  ? `Pre-Order Now — RM ${(
                      (activePromo.hasDiscount
                        ? activePromo.discountedPrice
                        : parseFloat(selectedVersion?.priceRm || "0")) * quantity
                    ).toFixed(2)}`
                  : `Add to Cart — RM ${(
                      (activePromo.hasDiscount
                        ? activePromo.discountedPrice
                        : parseFloat(selectedVersion?.priceRm || "0")) * quantity
                    ).toFixed(2)}`}
              </span>
            </Button>
          </div>

          {/* 8. Clean DETAIL : Inclusions List */}
          {product.description && (
            <div className="pt-3 space-y-3">
              <Separator />
              <div className="pt-2 space-y-2.5">
                <h2 className="font-sans font-semibold text-xs sm:text-sm uppercase tracking-wider text-plum-muted">
                  DETAIL :
                </h2>
                <div className="text-xs sm:text-sm text-plum whitespace-pre-line leading-loose font-sans">
                  {product.description}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Mobile-First Sticky Bottom Action Bar (in Thumb-Zone) */}
      <div className="sm:hidden fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur-md border-t border-border px-3 sm:px-4 py-2.5 sm:py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] shadow-[0_-4px_16px_rgba(71,2,59,0.06)]">
        <div className="flex items-center justify-between gap-2.5 sm:gap-4">
          <div className="min-w-0 flex-1">
            <span className="text-[10px] sm:text-[11px] font-semibold text-plum-muted uppercase tracking-wide block leading-tight truncate">
              {selectedVersion?.versionName || "Selected"}
            </span>
            <span className="font-heading font-extrabold text-base sm:text-lg text-plum whitespace-nowrap block leading-tight mt-0.5">
              RM{" "}
              {selectedVersion
                ? (
                    (activePromo.hasDiscount
                      ? activePromo.discountedPrice
                      : parseFloat(selectedVersion.priceRm)) *
                    (isPurchaseBlocked ? 1 : quantity)
                  ).toFixed(2)
                : "0.00"}
            </span>
          </div>

          <Button
            type="button"
            disabled={isPurchaseBlocked}
            onClick={handleAddToCart}
            className="h-10 sm:h-11 px-3.5 sm:px-6 bg-plum hover:bg-plum-hover text-white font-semibold text-xs sm:text-sm rounded-xl shadow-xs shrink-0 flex items-center justify-center gap-1.5 sm:gap-2"
          >
            <ShoppingBag className="w-4 h-4 shrink-0" />
            <span>
              {deadlinePassed
                ? "Closed"
                : isSelectedSoldOut
                ? "Out of Stock"
                : product.isPreOrder
                ? "Pre-Order Now"
                : "Add to Cart"}
            </span>
          </Button>
        </div>
      </div>
    </div>
  );
}
