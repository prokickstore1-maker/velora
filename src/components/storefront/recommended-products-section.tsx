"use client";

import Link from "next/link";
import type { Product, ProductVersion, StoreSettings } from "@/db/schema";
import { ProductCard } from "@/components/storefront/product-card";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles } from "lucide-react";

interface ProductWithVersions extends Product {
  versions: ProductVersion[];
}

interface RecommendedProductsSectionProps {
  products: ProductWithVersions[];
  settings?: StoreSettings | null;
  currentArtist?: string | null;
  currentCategory?: string;
}

export function RecommendedProductsSection({
  products,
  settings,
  currentArtist,
  currentCategory,
}: RecommendedProductsSectionProps) {
  if (!products || products.length === 0) {
    return null;
  }

  return (
    <section className="py-10 sm:py-14 bg-white border-t border-border/80">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="mb-6 flex flex-col sm:flex-row sm:items-end justify-between gap-3">
          <div>
            <span className="inline-flex items-center gap-1.5 text-[10px] font-bold tracking-widest text-plum-muted uppercase mb-1">
              <Sparkles className="w-3 h-3 text-pink" />
              <span>You May Also Like</span>
            </span>
            <h2 className="mv-heading-italic text-xl sm:text-2xl text-plum">
              RECOMMENDED FOR YOU
            </h2>
            <p className="text-xs text-plum-muted mt-0.5">
              {currentArtist
                ? `More from ${currentArtist} and ${currentCategory || "related"} items`
                : `Related ${currentCategory || "K-Pop"} releases`}
            </p>
          </div>

          {currentCategory && (
            <Button
              asChild
              variant="outline"
              size="sm"
              className="border-plum/30 text-plum hover:bg-blush/30 text-xs rounded-xl self-start sm:self-auto h-9"
            >
              <Link
                href={`/shop?category=${encodeURIComponent(currentCategory)}`}
                className="inline-flex items-center gap-1.5"
              >
                <span>View All {currentCategory}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </Button>
          )}
        </div>

        {/* Product Cards Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-5">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} settings={settings} />
          ))}
        </div>
      </div>
    </section>
  );
}
