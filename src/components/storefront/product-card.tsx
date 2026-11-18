"use client";

import Image from "next/image";
import Link from "next/link";
import type { Product, ProductVersion, StoreSettings } from "@/db/schema";
import { Button } from "@/components/ui/button";
import { useCart } from "@/context/cart-context";
import { ShoppingBag, Layers } from "lucide-react";
import { calculateEffectivePrice } from "@/lib/promo";
import { isDeadlinePassed } from "@/lib/date";

interface ProductWithVersions extends Product {
  versions: ProductVersion[];
}

interface ProductCardProps {
  product: ProductWithVersions;
  settings?: StoreSettings | null;
  priority?: boolean;
}

export function ProductCard({ product, settings, priority = false }: ProductCardProps) {
  const { addItem } = useCart();

  const isPreOrder = Boolean(product.isPreOrder);
  const deadlinePassed = Boolean(isPreOrder && isDeadlinePassed(product.preOrderDeadline));
  const isOpenPreOrder =
    isPreOrder && !deadlinePassed && product.preOrderQuotaMode === "open";

  // Prevent stock inflation from linked bundles: count physical non-bundle versions
  const nonBundleVersions = product.versions.filter((v) => !v.isBundle);
  const physicalVersions = nonBundleVersions.length > 0 ? nonBundleVersions : product.versions;
  const totalPhysicalStock = physicalVersions.reduce((sum, v) => sum + v.stock, 0);

  // Open pre-orders are never sold out even if initial stock is 0
  const isSoldOut = !isOpenPreOrder && totalPhysicalStock <= 0;
  const isPurchaseBlocked = deadlinePassed || isSoldOut;
  const hasMultipleVersions = product.versions.length > 1;

  // Pick first available version with stock, or fallback to first version
  const defaultVersion =
    product.versions.find((v) => v.stock > 0) || product.versions[0];

  // Calculate promo & discount prices
  const promoVersions = product.versions.map((v) => {
    const promo = calculateEffectivePrice(v.priceRm, product.category, settings, v.discountPercent);
    return { ...v, promo };
  });

  const hasDiscount = promoVersions.some((v) => v.promo.hasDiscount);
  const defaultPromo = defaultVersion
    ? calculateEffectivePrice(
        defaultVersion.priceRm,
        product.category,
        settings,
        defaultVersion.discountPercent
      )
    : null;

  const discountedPrices = promoVersions.map((v) => v.promo.discountedPrice).filter((p) => p > 0);
  const originalPrices = promoVersions.map((v) => v.promo.originalPrice).filter((p) => p > 0);

  const minDiscounted = discountedPrices.length > 0 ? Math.min(...discountedPrices) : 0;
  const maxDiscounted = discountedPrices.length > 0 ? Math.max(...discountedPrices) : 0;
  const minOriginal = originalPrices.length > 0 ? Math.min(...originalPrices) : 0;

  const priceDisplay =
    minDiscounted > 0 && maxDiscounted > minDiscounted
      ? `RM ${minDiscounted.toFixed(2)} - RM ${maxDiscounted.toFixed(2)}`
      : `RM ${minDiscounted.toFixed(2)}`;

  let statusText = "In Stock";
  let statusColor = "text-emerald-600";
  if (deadlinePassed) {
    statusText = "Pre-Order Closed";
    statusColor = "text-[#9b1c48]";
  } else if (isSoldOut) {
    statusText = "Out of Stock";
    statusColor = "text-[#9b1c48]";
  } else if (isPreOrder) {
    statusText = "Pre Order";
    statusColor = "text-emerald-600";
  }

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!defaultVersion || isPurchaseBlocked) return;

    const unitPrice = defaultPromo?.discountedPrice ?? parseFloat(defaultVersion.priceRm);

    addItem({
      productId: product.id,
      productSlug: product.slug,
      productName: product.name,
      versionId: defaultVersion.id,
      versionName: defaultVersion.versionName,
      priceRm: unitPrice.toFixed(2),
      imageUrl: defaultVersion.imageUrl || product.primaryImageUrl,
      maxStock: isOpenPreOrder ? 99 : defaultVersion.stock,
      sku: defaultVersion.sku,
    });
  };

  return (
    <div className="group bg-white rounded-xl border border-border/80 p-2 sm:p-3 shadow-xs hover:shadow-md transition-all flex flex-col justify-between overflow-hidden relative">
      {/* Square Image Box matching reference */}
      <Link
        href={`/products/${product.slug}`}
        className="relative aspect-square w-full rounded-lg bg-neutral-100 overflow-hidden block select-none mb-2"
      >
        {hasDiscount && defaultPromo && defaultPromo.hasDiscount && (
          <span className="absolute top-2 left-2 z-10 bg-pink text-white text-[10px] font-black px-2 py-0.5 rounded-md shadow-xs uppercase tracking-wider animate-pulse">
            {defaultPromo.badgeText}
          </span>
        )}
        <Image
          src={product.primaryImageUrl}
          alt={product.name}
          fill
          unoptimized={product.primaryImageUrl.startsWith("data:")}
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          priority={priority}
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
      </Link>

      {/* Info: Title (1-line), Price, and Stock Status */}
      <div className="space-y-1 min-w-0">
        <Link href={`/products/${product.slug}`} className="block group-hover:text-plum-hover transition-colors">
          <h3 className="font-heading font-medium text-xs sm:text-sm text-plum truncate leading-snug">
            {product.name}
          </h3>
        </Link>

        <div className="flex items-center justify-between gap-1 pt-0.5 min-w-0">
          <div className="min-w-0 flex-1">
            <div className="flex items-baseline gap-1.5 flex-wrap">
              <span className="font-heading font-bold text-[11px] sm:text-xs text-plum block leading-tight truncate">
                {priceDisplay}
              </span>
              {hasDiscount && minOriginal > minDiscounted && (
                <span className="text-[10px] font-normal line-through text-plum-muted">
                  RM {minOriginal.toFixed(2)}
                </span>
              )}
            </div>
            <span className={`text-[10px] sm:text-xs font-medium block mt-0.5 truncate ${statusColor}`}>
              {statusText}
            </span>
          </div>

          {!isPurchaseBlocked && defaultVersion && (
            hasMultipleVersions ? (
              <Button
                asChild
                size="sm"
                className="h-7 w-7 sm:h-8 sm:w-auto sm:px-2.5 bg-plum text-white hover:bg-plum-hover rounded-lg text-xs font-semibold shrink-0 p-0 cursor-pointer"
              >
                <Link
                  href={`/products/${product.slug}`}
                  aria-label={`Select version for ${product.name}`}
                >
                  <Layers className="w-3.5 h-3.5 sm:mr-1" />
                  <span className="hidden sm:inline">Select</span>
                </Link>
              </Button>
            ) : (
              <Button
                type="button"
                size="sm"
                onClick={handleQuickAdd}
                aria-label={`Add ${product.name} to cart`}
                className="h-7 w-7 sm:h-8 sm:w-auto sm:px-2.5 bg-plum text-white hover:bg-plum-hover rounded-lg text-xs font-semibold shrink-0 p-0 cursor-pointer"
              >
                <ShoppingBag className="w-3.5 h-3.5 sm:mr-1" />
                <span className="hidden sm:inline">Add</span>
              </Button>
            )
          )}
        </div>
      </div>
    </div>
  );
}
