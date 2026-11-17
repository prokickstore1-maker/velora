"use client";

import Image from "next/image";
import Link from "next/link";
import type { Product, ProductVersion } from "@/db/schema";
import { Button } from "@/components/ui/button";
import { useCart } from "@/context/cart-context";
import { ShoppingBag } from "lucide-react";

interface ProductWithVersions extends Product {
  versions: ProductVersion[];
}

interface ProductCardProps {
  product: ProductWithVersions;
  priority?: boolean;
}

export function ProductCard({ product, priority = false }: ProductCardProps) {
  const { addItem } = useCart();

  const isPreOrder = Boolean((product as { isPreOrder?: boolean }).isPreOrder);
  const isOpenPreOrder =
    isPreOrder && (product as { preOrderQuotaMode?: string }).preOrderQuotaMode === "open";

  // Prevent stock inflation from linked bundles: count physical non-bundle versions
  const nonBundleVersions = product.versions.filter((v) => !v.isBundle);
  const physicalVersions = nonBundleVersions.length > 0 ? nonBundleVersions : product.versions;
  const totalPhysicalStock = physicalVersions.reduce((sum, v) => sum + v.stock, 0);

  // Open pre-orders are never sold out even if initial stock is 0
  const isSoldOut = !isOpenPreOrder && totalPhysicalStock <= 0;

  // Pick first available version with stock, or fallback to first version
  const defaultVersion =
    product.versions.find((v) => v.stock > 0) || product.versions[0];

  const prices = product.versions
    .map((v) => parseFloat(v.priceRm) || 0)
    .filter((p) => p > 0);
  const minPrice = prices.length > 0 ? Math.min(...prices) : 0;
  const maxPrice = prices.length > 0 ? Math.max(...prices) : 0;

  const priceDisplay =
    minPrice > 0 && maxPrice > minPrice
      ? `RM ${minPrice.toFixed(2)} - RM ${maxPrice.toFixed(2)}`
      : `RM ${minPrice.toFixed(2)}`;

  let statusText = "In Stock";
  let statusColor = "text-emerald-600";
  if (isSoldOut) {
    statusText = "Out of Stock";
    statusColor = "text-[#9b1c48]";
  } else if (isPreOrder) {
    statusText = "Pre Order";
    statusColor = "text-emerald-600";
  }

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!defaultVersion || isSoldOut) return;

    addItem({
      productId: product.id,
      productSlug: product.slug,
      productName: product.name,
      versionId: defaultVersion.id,
      versionName: defaultVersion.versionName,
      priceRm: defaultVersion.priceRm,
      imageUrl: defaultVersion.imageUrl || product.primaryImageUrl,
      maxStock: defaultVersion.stock,
      sku: defaultVersion.sku,
    });
  };

  return (
    <div className="group bg-white rounded-xl border border-border/80 p-2 sm:p-3 shadow-xs hover:shadow-md transition-all flex flex-col justify-between overflow-hidden">
      {/* Square Image Box matching reference */}
      <Link
        href={`/products/${product.slug}`}
        className="relative aspect-square w-full rounded-lg bg-neutral-100 overflow-hidden block select-none mb-2"
      >
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
            <span className="font-heading font-bold text-[11px] sm:text-xs text-plum block leading-tight truncate">
              {priceDisplay}
            </span>
            <span className={`text-[10px] sm:text-xs font-medium block mt-0.5 truncate ${statusColor}`}>
              {statusText}
            </span>
          </div>

          {!isSoldOut && defaultVersion && (
            <Button
              type="button"
              size="sm"
              onClick={handleQuickAdd}
              aria-label={`Add ${product.name} to cart`}
              className="h-7 w-7 sm:h-8 sm:w-auto sm:px-2.5 bg-plum text-white hover:bg-plum-hover rounded-lg text-xs font-semibold shrink-0 p-0"
            >
              <ShoppingBag className="w-3.5 h-3.5 sm:mr-1" />
              <span className="hidden sm:inline">Add</span>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
