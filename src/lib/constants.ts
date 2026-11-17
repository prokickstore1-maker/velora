// src/lib/constants.ts
// Single Source of Truth for Store Categories, Modes, and Business Constants

export const PRODUCT_CATEGORIES = [
  "Album",
  "Merch",
  "Lightstick",
  "Photobook",
  "Fashion",
  "Stationery",
  "Photocard",
] as const;

export type ProductCategory = (typeof PRODUCT_CATEGORIES)[number];

export const CATEGORY_METADATA: Record<
  ProductCategory,
  { label: string; description: string; bannerImage: string }
> = {
  Album: {
    label: "Album",
    description: "Official K-Pop Albums, EP & Mini Albums",
    bannerImage: "/banners/album-banner.jpg",
  },
  Merch: {
    label: "Merchandise",
    description: "Concert Goods, Season's Greetings & Official Merchandise",
    bannerImage: "/banners/merch-banner.jpg",
  },
  Lightstick: {
    label: "Lightstick",
    description: "Official Fanlights & Concert Lightsticks",
    bannerImage: "/banners/lightstick-banner.jpg",
  },
  Photobook: {
    label: "Photobook",
    description: "Collector Photobooks, Magazines & Pictorials",
    bannerImage: "/banners/photobook-banner.jpg",
  },
  Fashion: {
    label: "Fashion",
    description: "K-Pop Tour Apparel, Hoodies, Tees & Bags",
    bannerImage: "/banners/fashion-banner.jpg",
  },
  Stationery: {
    label: "Stationery",
    description: "Planners, Calendars, Stickers, Washi Tape & Notes",
    bannerImage: "/banners/stationery-banner.jpg",
  },
  Photocard: {
    label: "Photocard",
    description: "Official Lucky Draws, POBs & Member Photocards",
    bannerImage:
      "https://images.unsplash.com/photo-1534447677768-be436bb09401?w=1200&q=80",
  },
};

// Bundle Modes
export const BUNDLE_MODES = ["standalone", "linked"] as const;
export type BundleMode = (typeof BUNDLE_MODES)[number];

// Pre-Order Quota Modes
export const PRE_ORDER_QUOTA_MODES = ["finite", "open"] as const;
export type PreOrderQuotaMode = (typeof PRE_ORDER_QUOTA_MODES)[number];
