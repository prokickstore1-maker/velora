import Image from "next/image";
import Link from "next/link";
import type { Product, ProductVersion } from "@/db/schema";

interface ProductWithVersions extends Product {
  versions: ProductVersion[];
}

interface CategoryBannersSectionProps {
  products: ProductWithVersions[];
}

interface CategoryBannerConfig {
  key: string;
  label: string;
  href: string;
  bannerImage?: string;
  fallbackImages: string[];
}

const CATEGORY_CONFIGS: CategoryBannerConfig[] = [
  {
    key: "Album",
    label: "ALBUM",
    href: "/shop?category=Album",
    bannerImage: "/banners/album-banner.jpg",
    fallbackImages: [
      "/banners/album-banner.jpg",
      "https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?auto=format&fit=crop&w=600&q=80",
      "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=600&q=80",
      "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=600&q=80",
      "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=600&q=80",
      "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?auto=format&fit=crop&w=600&q=80",
      "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?auto=format&fit=crop&w=600&q=80",
    ],
  },
  {
    key: "Merch",
    label: "MERCHANDISE",
    href: "/shop?category=Merch",
    bannerImage: "/banners/merch-banner.jpg",
    fallbackImages: [
      "/banners/merch-banner.jpg",
      "https://images.unsplash.com/photo-1513885535751-8b9238bd345a?auto=format&fit=crop&w=600&q=80",
      "https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&w=600&q=80",
      "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=600&q=80",
      "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=600&q=80",
      "https://images.unsplash.com/photo-1576566588028-4147f3842f27?auto=format&fit=crop&w=600&q=80",
      "https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=600&q=80",
    ],
  },
  {
    key: "Lightstick",
    label: "LIGHTSTICK",
    href: "/shop?category=Lightstick",
    bannerImage: "/banners/lightstick-banner.jpg",
    fallbackImages: [
      "/banners/lightstick-banner.jpg",
      "https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&w=600&q=80",
      "https://images.unsplash.com/photo-1459749411175-04bf5292ceea?auto=format&fit=crop&w=600&q=80",
      "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=600&q=80",
      "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?auto=format&fit=crop&w=600&q=80",
      "https://images.unsplash.com/photo-1429962714451-bb934ecdc4ec?auto=format&fit=crop&w=600&q=80",
      "https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?auto=format&fit=crop&w=600&q=80",
    ],
  },
  {
    key: "Photobook",
    label: "PHOTOBOOK",
    href: "/shop?category=Photobook",
    bannerImage: "/banners/photobook-banner.jpg",
    fallbackImages: [
      "/banners/photobook-banner.jpg",
      "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80",
      "https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=600&q=80",
      "https://images.unsplash.com/photo-1506880018603-83d5b814b5a6?auto=format&fit=crop&w=600&q=80",
      "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=600&q=80",
      "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?auto=format&fit=crop&w=600&q=80",
      "https://images.unsplash.com/photo-1519791883288-dc8bd696e667?auto=format&fit=crop&w=600&q=80",
    ],
  },
  {
    key: "Fashion",
    label: "FASHION",
    href: "/shop?category=Fashion",
    bannerImage: "/banners/fashion-banner.jpg",
    fallbackImages: [
      "/banners/fashion-banner.jpg",
      "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=600&q=80",
      "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=600&q=80",
      "https://images.unsplash.com/photo-1509967419530-da38b4704bc6?auto=format&fit=crop&w=600&q=80",
      "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&w=600&q=80",
      "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?auto=format&fit=crop&w=600&q=80",
      "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=600&q=80",
    ],
  },
  {
    key: "Stationery",
    label: "STATIONERY",
    href: "/shop?category=Stationery",
    bannerImage: "/banners/stationery-banner.jpg",
    fallbackImages: [
      "/banners/stationery-banner.jpg",
      "https://images.unsplash.com/photo-1586075010923-2dd4570fb338?auto=format&fit=crop&w=600&q=80",
      "https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?auto=format&fit=crop&w=600&q=80",
      "https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?auto=format&fit=crop&w=600&q=80",
      "https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?auto=format&fit=crop&w=600&q=80",
      "https://images.unsplash.com/photo-1517842645767-c639042777db?auto=format&fit=crop&w=600&q=80",
      "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=600&q=80",
    ],
  },
];

export function CategoryBannersSection({ products }: CategoryBannersSectionProps) {
  return (
    <section className="py-8 sm:py-12 bg-background border-b border-border/60">
      <div className="max-w-6xl mx-auto px-4">
        <h2 className="font-sans font-normal text-lg sm:text-xl tracking-wide text-plum uppercase mb-4 sm:mb-6">
          SHOP NOW
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
          {CATEGORY_CONFIGS.map((cat) => {
            const catProducts = products.filter((p) => {
              const pCat = p.category.toLowerCase();
              const targetKey = cat.key.toLowerCase();
              const targetLabel = cat.label.toLowerCase();
              if (
                pCat === targetKey ||
                pCat === targetLabel ||
                (targetKey === "merch" && pCat === "merchandise")
              ) {
                return true;
              }
              const textCorpus = `${p.name} ${p.versions.map((v) => v.versionName).join(" ")}`.toLowerCase();
              if (targetKey === "photobook" && (textCorpus.includes("photobook") || textCorpus.includes("photo book"))) {
                return true;
              }
              if (
                targetKey === "merch" &&
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
                targetKey === "fashion" &&
                (textCorpus.includes("bag") ||
                  textCorpus.includes("tote") ||
                  textCorpus.includes("hoodie") ||
                  textCorpus.includes("shirt") ||
                  textCorpus.includes("cap"))
              ) {
                return true;
              }
              if (
                targetKey === "stationery" &&
                (textCorpus.includes("note") ||
                  textCorpus.includes("diary") ||
                  textCorpus.includes("calendar") ||
                  textCorpus.includes("binder") ||
                  textCorpus.includes("sticker"))
              ) {
                return true;
              }
              return false;
            });

            // Gather up to 6 tile images from actual category products + fallbacks
            const productImages: string[] = [];
            for (const p of catProducts) {
              if (p.primaryImageUrl) productImages.push(p.primaryImageUrl);
              for (const v of p.versions) {
                if (v.imageUrl && !productImages.includes(v.imageUrl)) {
                  productImages.push(v.imageUrl);
                }
              }
            }

            const tiles = [...productImages, ...cat.fallbackImages].slice(0, 6);

            return (
              <Link
                key={cat.key}
                href={cat.href}
                className="group block p-2 sm:p-2.5 rounded-2xl bg-white border border-border shadow-xs hover:shadow-md hover:border-plum/30 transition-all"
              >
                <div className="relative w-full aspect-[16/9] rounded-xl overflow-hidden bg-ivory">
                  {cat.bannerImage ? (
                    /* Single Dedicated Category Banner (High-Res) */
                    <div className="relative w-full h-full overflow-hidden bg-ivory">
                      <Image
                        src={cat.bannerImage}
                        alt={cat.label}
                        fill
                        sizes="(max-width: 640px) 100vw, 550px"
                        className="object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                    </div>
                  ) : (
                    /* 6-Tile Collage Grid matching reference for other categories */
                    <div className="grid grid-cols-3 grid-rows-2 gap-1.5 w-full h-full">
                      {tiles.map((imgUrl, idx) => (
                        <div key={idx} className="relative w-full h-full overflow-hidden bg-ivory">
                          <Image
                            src={imgUrl}
                            alt={`${cat.label} item ${idx + 1}`}
                            fill
                            sizes="(max-width: 640px) 33vw, 180px"
                            className="object-cover transition-transform duration-500 group-hover:scale-105"
                          />
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Subtle wash so centered label pops cleanly */}
                  <div className="absolute inset-0 bg-plum/10 group-hover:bg-plum/20 transition-colors" />

                  {/* Centered White Category Label Pill */}
                  <div className="absolute inset-0 flex items-center justify-center p-3 sm:p-4">
                    <div className="bg-white/95 backdrop-blur-xs px-4 sm:px-8 py-1.5 sm:py-2.5 rounded-lg shadow-sm border border-border/50 transition-transform duration-300 group-hover:scale-[1.03]">
                      <span className="font-heading font-extrabold text-sm sm:text-2xl tracking-wider text-plum uppercase block leading-none">
                        {cat.label}
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
