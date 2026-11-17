"use client";

import { useState, useMemo } from "react";
import { Product, ProductVersion } from "@/db/schema";
import { ProductCard } from "./product-card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, X } from "lucide-react";

interface ProductWithVersions extends Product {
  versions: ProductVersion[];
}

interface CatalogViewProps {
  initialProducts: ProductWithVersions[];
  categories: string[];
  initialCategory?: string;
}

export function CatalogView({
  initialProducts,
  categories,
  initialCategory = "All",
}: CatalogViewProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [onlyInStock, setOnlyInStock] = useState<boolean>(false);
  const [sortBy, setSortBy] = useState<string>("default");

  const filteredProducts = useMemo(() => {
    return initialProducts.filter((product) => {
      // Category filter
      if (selectedCategory === "Pre-Order") {
        if (!product.isPreOrder) return false;
      } else if (selectedCategory === "New Arrivals") {
        if (!product.isNewArrival) return false;
      } else if (selectedCategory === "Best Sellers") {
        if (!product.isBestSeller) return false;
      } else if (selectedCategory !== "All") {
        const prodCat = product.category.toLowerCase();
        const selCat = selectedCategory.toLowerCase();
        const isMatch =
          prodCat === selCat ||
          (selCat === "merch" && prodCat === "merchandise") ||
          (selCat === "merchandise" && prodCat === "merch");
        if (!isMatch) return false;
      }

      // In stock filter
      if (onlyInStock) {
        const hasStock = product.versions.some((v) => v.stock > 0);
        if (!hasStock) return false;
      }

      // Search query filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesName = product.name.toLowerCase().includes(query);
        const matchesArtist = product.groupArtist?.toLowerCase().includes(query) || false;
        const matchesCategory = product.category.toLowerCase().includes(query);
        const matchesVersion = product.versions.some((v) => v.versionName.toLowerCase().includes(query));
        if (!matchesName && !matchesArtist && !matchesCategory && !matchesVersion) {
          return false;
        }
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === "price-low") {
        const minA = Math.min(...a.versions.map((v) => parseFloat(v.priceRm) || 0));
        const minB = Math.min(...b.versions.map((v) => parseFloat(v.priceRm) || 0));
        return minA - minB;
      }
      if (sortBy === "price-high") {
        const minA = Math.min(...a.versions.map((v) => parseFloat(v.priceRm) || 0));
        const minB = Math.min(...b.versions.map((v) => parseFloat(v.priceRm) || 0));
        return minB - minA;
      }
      return 0;
    });
  }, [initialProducts, selectedCategory, searchQuery, onlyInStock, sortBy]);

  const allCategoryPills = useMemo(() => {
    const list = [
      "All",
      "Pre-Order",
      "New Arrivals",
      "Best Sellers",
      ...categories.filter((c) => c !== "All"),
    ];
    if (initialCategory && !list.includes(initialCategory)) {
      list.push(initialCategory);
    }
    return list;
  }, [categories, initialCategory]);

  return (
    <div className="space-y-8">
      {/* Search & Filter Toolbar */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white p-4 sm:p-5 rounded-2xl border border-border shadow-xs">
        {/* Search bar */}
        <div className="relative w-full md:max-w-md">
          <Search className="w-4 h-4 text-plum-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
          <Input
            type="text"
            placeholder="Search album, photocard, or artist..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 h-12 bg-background border-border text-base sm:text-sm rounded-xl focus-visible:ring-plum"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-plum-muted hover:text-plum"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Sort & In-Stock Switch */}
        <div className="w-full md:w-auto flex flex-wrap items-center justify-between md:justify-end gap-2.5 text-xs">
          <label className="flex items-center gap-2 cursor-pointer text-plum font-medium select-none shrink-0 py-1">
            <input
              type="checkbox"
              checked={onlyInStock}
              onChange={(e) => setOnlyInStock(e.target.checked)}
              className="w-4 h-4 rounded text-plum border-border focus:ring-plum"
            />
            <span>In Stock Only</span>
          </label>

          <div className="w-36 sm:w-48 shrink-0">
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="h-11 rounded-xl text-xs font-medium">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="default">Default Order</SelectItem>
                <SelectItem value="price-low">Price: Low to High</SelectItem>
                <SelectItem value="price-high">Price: High to Low</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Category Pills (Horizontal Swipe Snap on Mobile) */}
      <div className="mv-snap-carousel gap-2 pb-2">
        {allCategoryPills.map((cat) => {
          const isActive = selectedCategory === cat;
          return (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`mv-snap-item mv-touch-target px-4 py-2 rounded-xl text-xs font-semibold tracking-wider uppercase transition-colors ${
                isActive
                  ? "bg-plum text-white shadow-xs"
                  : "bg-white text-plum hover:bg-blush/40 border border-border"
              }`}
            >
              {cat}
            </button>
          );
        })}
      </div>

      {/* Product Grid */}
      {filteredProducts.length === 0 ? (
        <div className="py-20 text-center bg-white rounded-2xl border border-border space-y-3">
          <p className="font-heading font-bold text-lg text-plum uppercase italic">No products matched</p>
          <p className="text-sm text-plum-muted max-w-sm mx-auto">
            Try resetting your search query or switching categories.
          </p>
          <Button
            variant="outline"
            onClick={() => {
              setSearchQuery("");
              setSelectedCategory("All");
              setOnlyInStock(false);
            }}
            className="mt-2"
          >
            Clear Filters
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
