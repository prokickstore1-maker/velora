"use client";

import { useState, useMemo, useRef } from "react";
import { Product, ProductVersion, StoreSettings } from "@/db/schema";
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
import { Search, X, ChevronLeft, ChevronRight } from "lucide-react";

interface ProductWithVersions extends Product {
  versions: ProductVersion[];
}

interface CatalogViewProps {
  initialProducts: ProductWithVersions[];
  categories: string[];
  initialCategory?: string;
  settings?: StoreSettings | null;
}

const ITEMS_PER_PAGE = 20;

function getPaginationRange(currentPage: number, totalPages: number): (number | "...")[] {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  if (currentPage <= 4) {
    return [1, 2, 3, 4, 5, "...", totalPages];
  }

  if (currentPage >= totalPages - 3) {
    return [1, "...", totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
  }

  return [1, "...", currentPage - 1, currentPage, currentPage + 1, "...", totalPages];
}

function matchesProductCategory(product: ProductWithVersions, selectedCategory: string): boolean {
  if (selectedCategory === "All") return true;
  if (selectedCategory === "Pre-Order") return Boolean(product.isPreOrder);
  if (selectedCategory === "New Arrivals") return Boolean(product.isNewArrival);
  if (selectedCategory === "Best Sellers") return Boolean(product.isBestSeller);

  const prodCat = product.category.toLowerCase();
  const selCat = selectedCategory.toLowerCase();

  if (
    prodCat === selCat ||
    (selCat === "merch" && prodCat === "merchandise") ||
    (selCat === "merchandise" && prodCat === "merch")
  ) {
    return true;
  }

  // Smart cross-matching for sub-types within Album/Lightstick catalog
  const textCorpus = `${product.name} ${product.versions.map((v) => v.versionName).join(" ")}`.toLowerCase();

  if (selCat === "photobook" && (textCorpus.includes("photobook") || textCorpus.includes("photo book"))) {
    return true;
  }
  if (
    (selCat === "merch" || selCat === "merchandise") &&
    (textCorpus.includes("keyring") ||
      textCorpus.includes("keychain") ||
      textCorpus.includes("cradle") ||
      textCorpus.includes("pouch") ||
      textCorpus.includes("package") ||
      textCorpus.includes("kit"))
  ) {
    return true;
  }
  if (
    selCat === "fashion" &&
    (textCorpus.includes("bag") ||
      textCorpus.includes("tote") ||
      textCorpus.includes("hoodie") ||
      textCorpus.includes("shirt") ||
      textCorpus.includes("cap"))
  ) {
    return true;
  }
  if (
    selCat === "stationery" &&
    (textCorpus.includes("note") ||
      textCorpus.includes("diary") ||
      textCorpus.includes("calendar") ||
      textCorpus.includes("binder") ||
      textCorpus.includes("sticker"))
  ) {
    return true;
  }

  return false;
}

export function CatalogView({
  initialProducts,
  categories,
  initialCategory = "All",
  settings,
}: CatalogViewProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [onlyInStock, setOnlyInStock] = useState<boolean>(false);
  const [sortBy, setSortBy] = useState<string>("default");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const catalogTopRef = useRef<HTMLDivElement>(null);

  const filteredProducts = useMemo(() => {
    return initialProducts.filter((product) => {
      // Category filter
      if (!matchesProductCategory(product, selectedCategory)) {
        return false;
      }

      // In stock filter
      if (onlyInStock) {
        const hasStock = product.versions.some((v) => v.stock > 0);
        if (!hasStock) return false;
      }

      // Search query filter (Smart Multi-term Tokenization & Normalized Fuzzy Matching)
      if (searchQuery.trim()) {
        const rawCorpus = `${product.name} ${product.groupArtist || ""} ${product.category} ${product.description || ""} ${product.versions.map((v) => v.versionName).join(" ")}`.toLowerCase();
        // Normalized corpus without punctuation/spaces for flexible matching (e.g. "gidle" matches "(g)i-dle", "lightstick" matches "light stick")
        const cleanCorpus = rawCorpus.replace(/[^a-z0-9]/g, "");

        const terms = searchQuery.trim().toLowerCase().split(/\s+/).filter(Boolean);

        // Every keyword entered must match in the product corpus (Multi-Keyword AND search)
        const allTermsMatch = terms.every((term) => {
          if (rawCorpus.includes(term)) return true;
          const cleanTerm = term.replace(/[^a-z0-9]/g, "");
          if (cleanTerm && cleanCorpus.includes(cleanTerm)) return true;
          return false;
        });

        if (!allTermsMatch) {
          return false;
        }
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === "price-low") {
        const pricesA = a.versions.map((v) => parseFloat(v.priceRm) || 0);
        const pricesB = b.versions.map((v) => parseFloat(v.priceRm) || 0);
        const minA = pricesA.length > 0 ? Math.min(...pricesA) : 0;
        const minB = pricesB.length > 0 ? Math.min(...pricesB) : 0;
        return minA - minB;
      }
      if (sortBy === "price-high") {
        const pricesA = a.versions.map((v) => parseFloat(v.priceRm) || 0);
        const pricesB = b.versions.map((v) => parseFloat(v.priceRm) || 0);
        const maxA = pricesA.length > 0 ? Math.max(...pricesA) : 0;
        const maxB = pricesB.length > 0 ? Math.max(...pricesB) : 0;
        return maxB - maxA;
      }
      if (sortBy === "name-asc") {
        return a.name.localeCompare(b.name);
      }
      if (sortBy === "name-desc") {
        return b.name.localeCompare(a.name);
      }
      return 0;
    });
  }, [initialProducts, selectedCategory, searchQuery, onlyInStock, sortBy]);

  const totalProducts = filteredProducts.length;
  const totalPages = Math.max(1, Math.ceil(totalProducts / ITEMS_PER_PAGE));
  const safeCurrentPage = Math.min(currentPage, totalPages);

  const paginatedProducts = useMemo(() => {
    const startIndex = (safeCurrentPage - 1) * ITEMS_PER_PAGE;
    return filteredProducts.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredProducts, safeCurrentPage]);

  const startItemIndex = totalProducts === 0 ? 0 : (safeCurrentPage - 1) * ITEMS_PER_PAGE + 1;
  const endItemIndex = Math.min(safeCurrentPage * ITEMS_PER_PAGE, totalProducts);

  const paginationRange = useMemo(() => {
    return getPaginationRange(safeCurrentPage, totalPages);
  }, [safeCurrentPage, totalPages]);

  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages || page === safeCurrentPage) return;
    setCurrentPage(page);
    catalogTopRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const allCategoryPills = useMemo(() => {
    const candidates = [
      "All",
      "Pre-Order",
      "New Arrivals",
      "Best Sellers",
      ...categories.filter((c) => c !== "All"),
    ];
    if (initialCategory && !candidates.includes(initialCategory)) {
      candidates.push(initialCategory);
    }
    // Only display pills that actually have matching products (or 'All' / active initialCategory)
    return candidates.filter(
      (cat) =>
        cat === "All" ||
        cat === initialCategory ||
        initialProducts.some((p) => matchesProductCategory(p, cat))
    );
  }, [categories, initialCategory, initialProducts]);

  return (
    <div ref={catalogTopRef} className="space-y-6 scroll-mt-24">
      {/* Search & Filter Toolbar */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white p-4 sm:p-5 rounded-2xl border border-border shadow-xs">
        {/* Search bar */}
        <div className="relative w-full md:max-w-md">
          <Search className="w-4 h-4 text-plum-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
          <Input
            type="text"
            placeholder="Search album, photocard, or artist..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            autoComplete="off"
            autoCorrect="off"
            spellCheck={false}
            className="pl-10 h-12 bg-background border-border text-base sm:text-sm rounded-xl focus-visible:ring-plum"
          />
          {searchQuery && (
            <button
              onClick={() => {
                setSearchQuery("");
                setCurrentPage(1);
              }}
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
              onChange={(e) => {
                setOnlyInStock(e.target.checked);
                setCurrentPage(1);
              }}
              className="w-4 h-4 rounded text-plum border-border focus:ring-plum"
            />
            <span>In Stock Only</span>
          </label>

          <div className="w-36 sm:w-48 shrink-0">
            <Select
              value={sortBy}
              onValueChange={(val) => {
                setSortBy(val);
                setCurrentPage(1);
              }}
            >
              <SelectTrigger className="h-11 rounded-xl text-xs font-medium">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="default">Default Order</SelectItem>
                <SelectItem value="price-low">Price: Low to High</SelectItem>
                <SelectItem value="price-high">Price: High to Low</SelectItem>
                <SelectItem value="name-asc">Alphabetical: A to Z</SelectItem>
                <SelectItem value="name-desc">Alphabetical: Z to A</SelectItem>
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
              onClick={() => {
                setSelectedCategory(cat);
                setCurrentPage(1);
              }}
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

      {/* Result Counter Header */}
      <div className="flex items-center justify-between text-xs text-plum-muted px-1">
        <span>
          Showing <strong className="text-plum font-semibold">{totalProducts === 0 ? 0 : startItemIndex}–{endItemIndex}</strong> of{" "}
          <strong className="text-plum font-semibold">{totalProducts}</strong> products
          {totalPages > 1 && (
            <span className="ml-1.5 opacity-80">(Page {safeCurrentPage} of {totalPages})</span>
          )}
        </span>
        {selectedCategory !== "All" && (
          <span className="text-[11px] uppercase tracking-wider bg-blush/50 text-plum font-bold px-2 py-0.5 rounded-md">
            {selectedCategory}
          </span>
        )}
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
              setCurrentPage(1);
            }}
            className="mt-2"
          >
            Clear Filters
          </Button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
            {paginatedProducts.map((product) => (
              <ProductCard key={product.id} product={product} settings={settings} />
            ))}
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 pb-4 border-t border-border">
              {/* Counter */}
              <p className="text-xs sm:text-sm text-plum-muted font-medium order-2 sm:order-1 text-center sm:text-left">
                Page <span className="font-bold text-plum">{safeCurrentPage}</span> of{" "}
                <span className="font-bold text-plum">{totalPages}</span>
              </p>

              {/* Navigation Buttons */}
              <div className="flex items-center gap-1.5 order-1 sm:order-2 flex-wrap justify-center">
                {/* Prev Button */}
                <button
                  type="button"
                  onClick={() => handlePageChange(safeCurrentPage - 1)}
                  disabled={safeCurrentPage <= 1}
                  aria-label="Previous page"
                  className="mv-touch-target min-h-[44px] min-w-[44px] px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1 transition-colors border border-border bg-white text-plum hover:bg-blush/40 disabled:opacity-35 disabled:cursor-not-allowed disabled:hover:bg-white"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span className="hidden sm:inline">Prev</span>
                </button>

                {/* Page Number Pills */}
                <div className="flex items-center gap-1">
                  {paginationRange.map((item, idx) => {
                    if (item === "...") {
                      return (
                        <span
                          key={`ellipsis-${idx}`}
                          className="min-w-[32px] text-center text-xs font-semibold text-plum-muted select-none"
                        >
                          …
                        </span>
                      );
                    }

                    const isActive = item === safeCurrentPage;
                    return (
                      <button
                        key={`page-${item}`}
                        type="button"
                        onClick={() => handlePageChange(item)}
                        aria-current={isActive ? "page" : undefined}
                        className={`mv-touch-target min-h-[44px] min-w-[44px] px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                          isActive
                            ? "bg-plum text-white shadow-xs"
                            : "bg-white text-plum border border-border hover:bg-blush/40"
                        }`}
                      >
                        {item}
                      </button>
                    );
                  })}
                </div>

                {/* Next Button */}
                <button
                  type="button"
                  onClick={() => handlePageChange(safeCurrentPage + 1)}
                  disabled={safeCurrentPage >= totalPages}
                  aria-label="Next page"
                  className="mv-touch-target min-h-[44px] min-w-[44px] px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1 transition-colors border border-border bg-white text-plum hover:bg-blush/40 disabled:opacity-35 disabled:cursor-not-allowed disabled:hover:bg-white"
                >
                  <span className="hidden sm:inline">Next</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
