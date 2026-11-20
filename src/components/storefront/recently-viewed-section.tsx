"use client";

import { useEffect, useSyncExternalStore } from "react";
import Image from "next/image";
import Link from "next/link";
import { History, X } from "lucide-react";
import type { Product, ProductVersion } from "@/db/schema";

export interface RecentlyViewedItem {
  id: number;
  slug: string;
  name: string;
  groupArtist: string | null;
  category: string;
  primaryImageUrl: string;
  minPriceRm: string;
}

interface ProductWithVersions extends Product {
  versions: ProductVersion[];
}

interface RecentlyViewedSectionProps {
  currentProduct?: ProductWithVersions;
}

const STORAGE_KEY = "myvelora_recently_viewed_v1";
const MAX_ITEMS = 8;

const emptySubscribe = () => () => {};

function getSnapshot(): string {
  try {
    return localStorage.getItem(STORAGE_KEY) || "[]";
  } catch {
    return "[]";
  }
}

function subscribe(callback: () => void) {
  window.addEventListener("storage", callback);
  window.addEventListener("myvelora:recently-viewed-updated", callback);
  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener("myvelora:recently-viewed-updated", callback);
  };
}

export function RecentlyViewedSection({ currentProduct }: RecentlyViewedSectionProps) {
  const isClient = useSyncExternalStore(emptySubscribe, () => true, () => false);
  const rawHistory = useSyncExternalStore(subscribe, getSnapshot, () => "[]");

  // Save current product to recently viewed list on mount
  useEffect(() => {
    if (!currentProduct) return;

    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      let history: RecentlyViewedItem[] = raw ? JSON.parse(raw) : [];
      if (!Array.isArray(history)) history = [];

      const prices = currentProduct.versions.map((v) => parseFloat(v.priceRm)).filter((p) => p > 0);
      const minPrice = prices.length > 0 ? Math.min(...prices).toFixed(2) : "0.00";

      const currentItem: RecentlyViewedItem = {
        id: currentProduct.id,
        slug: currentProduct.slug,
        name: currentProduct.name,
        groupArtist: currentProduct.groupArtist,
        category: currentProduct.category,
        primaryImageUrl: currentProduct.primaryImageUrl || "",
        minPriceRm: minPrice,
      };

      const otherItems = history.filter((item) => item.slug !== currentProduct.slug);
      const updatedHistory = [currentItem, ...otherItems].slice(0, MAX_ITEMS);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedHistory));
      window.dispatchEvent(new Event("myvelora:recently-viewed-updated"));
    } catch {
      // ignore
    }
  }, [currentProduct]);

  if (!isClient) {
    return null;
  }

  let allHistory: RecentlyViewedItem[] = [];
  try {
    const parsed = JSON.parse(rawHistory);
    allHistory = Array.isArray(parsed) ? parsed : [];
  } catch {
    allHistory = [];
  }

  // Filter out the currently viewed product from display
  const items = allHistory.filter((item) => item.slug !== currentProduct?.slug).slice(0, MAX_ITEMS);

  if (items.length === 0) {
    return null;
  }

  const handleClearHistory = () => {
    try {
      localStorage.removeItem(STORAGE_KEY);
      window.dispatchEvent(new Event("myvelora:recently-viewed-updated"));
    } catch {
      // ignore
    }
  };

  return (
    <section className="py-10 sm:py-14 bg-ivory/50 border-t border-border/80">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between gap-4">
          <div>
            <span className="inline-flex items-center gap-1.5 text-[10px] font-bold tracking-widest text-plum-muted uppercase mb-1">
              <History className="w-3 h-3 text-plum" />
              <span>Browsing History</span>
            </span>
            <h2 className="mv-heading-italic text-xl sm:text-2xl text-plum">
              RECENTLY VIEWED
            </h2>
          </div>

          <button
            type="button"
            onClick={handleClearHistory}
            className="min-h-10 px-3 text-xs text-plum-muted hover:text-plum flex items-center gap-1 transition-colors rounded-xl hover:bg-blush/30 cursor-pointer"
            title="Clear recently viewed history"
          >
            <X className="w-3.5 h-3.5" />
            <span>Clear</span>
          </button>
        </div>

        {/* Recently Viewed Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
          {items.map((item) => (
            <div
              key={item.id}
              className="group bg-white rounded-2xl border border-border/80 overflow-hidden shadow-xs hover:border-pink/40 transition-all duration-200 flex flex-col justify-between"
            >
              <div>
                {/* 4:5 Ratio Image */}
                <Link
                  href={`/products/${item.slug}`}
                  className="relative aspect-[4/5] w-full bg-zinc-100 overflow-hidden block"
                >
                  {item.primaryImageUrl ? (
                    <Image
                      src={item.primaryImageUrl}
                      alt={item.name}
                      fill
                      sizes="(max-width: 640px) 50vw, 25vw"
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-plum-muted text-xs">
                      No Image
                    </div>
                  )}

                  {/* Category Pill */}
                  <div className="absolute top-2 left-2 bg-white/90 backdrop-blur-xs text-plum text-[10px] font-bold uppercase px-2 py-0.5 rounded-full shadow-2xs">
                    {item.category}
                  </div>
                </Link>

                {/* Info */}
                <div className="p-3 space-y-1">
                  {item.groupArtist && (
                    <p className="text-[10px] font-bold tracking-wider text-plum-muted uppercase truncate">
                      {item.groupArtist}
                    </p>
                  )}
                  <Link href={`/products/${item.slug}`} className="block">
                    <h3 className="text-xs font-semibold text-plum line-clamp-2 leading-snug group-hover:text-plum-hover transition-colors">
                      {item.name}
                    </h3>
                  </Link>
                </div>
              </div>

              {/* Price Footer */}
              <div className="p-3 pt-0 flex items-center justify-between border-t border-border/40 mt-1">
                <span className="text-[10px] text-plum-muted">Price</span>
                <span className="text-xs sm:text-sm font-bold text-plum font-mono">
                  RM {item.minPriceRm}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
