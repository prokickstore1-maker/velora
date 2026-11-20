"use client";

import Link from "next/link";
import type { Product, ProductVersion, StoreSettings } from "@/db/schema";
import { useWishlist } from "@/lib/wishlist";
import { ProductCard } from "@/components/storefront/product-card";
import { Button } from "@/components/ui/button";
import { Heart, ArrowLeft, Trash2, ShoppingBag } from "lucide-react";

interface ProductWithVersions extends Product {
  versions: ProductVersion[];
}

interface WishlistClientProps {
  allProducts: ProductWithVersions[];
  settings?: StoreSettings | null;
}

export function WishlistClient({ allProducts, settings }: WishlistClientProps) {
  const { ids, isWishlisted, clear } = useWishlist();

  const savedProducts = allProducts.filter((p) => ids.includes(p.id) || isWishlisted(p.id));

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-5 border-b border-border/80">
        <div>
          <Link
            href="/shop"
            className="inline-flex items-center gap-1.5 text-xs text-plum-muted hover:text-plum font-medium mb-3 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Continue Shopping</span>
          </Link>
          <span className="text-[11px] font-bold tracking-widest text-plum-muted uppercase block mb-1">
            Saved Items
          </span>
          <h1 className="mv-heading-italic text-2xl sm:text-4xl text-plum">
            MY WISHLIST ({savedProducts.length})
          </h1>
          <p className="text-xs sm:text-sm text-plum-muted mt-1">
            Saved albums, lightsticks, and merchandise.
          </p>
        </div>

        {savedProducts.length > 0 && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={clear}
            className="border-border text-plum-muted hover:text-destructive hover:border-destructive/40 rounded-xl text-xs h-10 self-start sm:self-auto"
          >
            <Trash2 className="w-3.5 h-3.5 mr-1.5" />
            <span>Clear Wishlist</span>
          </Button>
        )}
      </div>

      {savedProducts.length === 0 ? (
        <div className="bg-white p-10 sm:p-16 text-center rounded-2xl border border-border space-y-4">
          <div className="w-14 h-14 rounded-full bg-blush/40 text-pink flex items-center justify-center mx-auto">
            <Heart className="w-7 h-7" />
          </div>
          <div className="space-y-1.5 max-w-md mx-auto">
            <p className="font-heading font-bold text-lg text-plum uppercase italic">
              Your Wishlist is Empty
            </p>
            <p className="text-xs sm:text-sm text-plum-muted">
              Tap the heart icon on any album, lightstick, or photobook to save it here for later.
            </p>
          </div>
          <Button asChild className="bg-plum hover:bg-plum-hover text-white rounded-xl h-11 px-6 text-xs font-semibold">
            <Link href="/shop">
              <ShoppingBag className="w-4 h-4 mr-2" />
              <span>Explore All Products</span>
            </Link>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5">
          {savedProducts.map((product) => (
            <ProductCard key={product.id} product={product} settings={settings} />
          ))}
        </div>
      )}
    </div>
  );
}
