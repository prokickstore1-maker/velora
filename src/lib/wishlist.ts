"use client";

import { useSyncExternalStore, useCallback, useMemo } from "react";

const WISHLIST_STORAGE_KEY = "myvelora_wishlist_ids_v1";
const WISHLIST_EVENT = "myvelora:wishlist-updated";

const emptySubscribe = () => () => {};

function getWishlistSnapshot(): string {
  if (typeof window === "undefined") return "[]";
  try {
    return localStorage.getItem(WISHLIST_STORAGE_KEY) || "[]";
  } catch {
    return "[]";
  }
}

function subscribeWishlist(callback: () => void) {
  if (typeof window === "undefined") return () => {};
  window.addEventListener("storage", callback);
  window.addEventListener(WISHLIST_EVENT, callback);
  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener(WISHLIST_EVENT, callback);
  };
}

export function parseWishlistIds(raw: string): number[] {
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((id): id is number => typeof id === "number" && Number.isFinite(id));
  } catch {
    return [];
  }
}

export function toggleWishlistId(productId: number): boolean {
  if (typeof window === "undefined") return false;
  try {
    const current = parseWishlistIds(getWishlistSnapshot());
    const exists = current.includes(productId);
    const next = exists
      ? current.filter((id) => id !== productId)
      : [productId, ...current];

    localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(next));
    // Backward compatibility with individual product page key
    if (!exists) {
      localStorage.setItem(`mv_like_${productId}`, "1");
    } else {
      localStorage.removeItem(`mv_like_${productId}`);
    }
    window.dispatchEvent(new Event(WISHLIST_EVENT));
    return !exists;
  } catch {
    return false;
  }
}

export function clearWishlistIds(): void {
  if (typeof window === "undefined") return;
  try {
    const current = parseWishlistIds(getWishlistSnapshot());
    for (const id of current) {
      localStorage.removeItem(`mv_like_${id}`);
    }
    localStorage.removeItem(WISHLIST_STORAGE_KEY);
    window.dispatchEvent(new Event(WISHLIST_EVENT));
  } catch {
    // ignore
  }
}

export function useWishlist() {
  const isClient = useSyncExternalStore(emptySubscribe, () => true, () => false);
  const raw = useSyncExternalStore(subscribeWishlist, getWishlistSnapshot, () => "[]");

  const ids = useMemo(() => (isClient ? parseWishlistIds(raw) : []), [isClient, raw]);

  const isWishlisted = useCallback(
    (productId: number) => {
      if (!isClient) return false;
      if (ids.includes(productId)) return true;
      try {
        return localStorage.getItem(`mv_like_${productId}`) === "1";
      } catch {
        return false;
      }
    },
    [isClient, ids]
  );

  const toggle = useCallback((productId: number) => {
    return toggleWishlistId(productId);
  }, []);

  return {
    ids,
    count: ids.length,
    isWishlisted,
    toggle,
    clear: clearWishlistIds,
  };
}
