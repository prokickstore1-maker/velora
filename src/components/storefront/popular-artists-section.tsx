import Image from "next/image";
import Link from "next/link";
import type { Product, ProductVersion } from "@/db/schema";
import { Sparkles, ArrowRight } from "lucide-react";

interface ProductWithVersions extends Product {
  versions: ProductVersion[];
}

interface PopularArtistsSectionProps {
  products: ProductWithVersions[];
}

interface ArtistCardData {
  name: string;
  count: number;
  imageUrl: string;
}

const FEATURED_ARTIST_TARGETS = [
  { label: "BTS", keywords: ["bts", "bangtan", "jungkook", "jung kook", "jimin", "taehyung", "v -", "jin ", "suga", "agust d", "j-hope", "jhope", "rm "] },
  { label: "SEVENTEEN", keywords: ["seventeen", "svt", "bss", "jeonghan", "mingyu", "wonwoo", "hoshi"] },
  { label: "Stray Kids", keywords: ["stray kids", "skz"] },
  { label: "NCT", keywords: ["nct", "nct 127", "nct dream", "nct wish", "wayv", "taeyong", "jaehyun", "mark", "doyoung"] },
  { label: "ENHYPEN", keywords: ["enhypen"] },
  { label: "TWICE", keywords: ["twice", "nayeon", "jihyo", "misamo", "tzuyu"] },
  { label: "aespa", keywords: ["aespa"] },
  { label: "TXT", keywords: ["txt", "tomorrow x together", "yeonjun"] },
  { label: "NewJeans", keywords: ["newjeans", "new jeans"] },
  { label: "LE SSERAFIM", keywords: ["le sserafim", "lesserafim"] },
  { label: "BLACKPINK", keywords: ["blackpink", "jennie", "lisa", "rose", "rosé", "jisoo"] },
  { label: "IVE", keywords: ["ive"] },
  { label: "ATEEZ", keywords: ["ateez"] },
  { label: "RIIZE", keywords: ["riize"] },
  { label: "(G)I-DLE", keywords: ["(g)i-dle", "gidle", "i-dle", "yuqi"] },
  { label: "ZEROBASEONE", keywords: ["zerobaseone", "zb1"] },
];

export function matchesArtistTarget(
  product: Pick<Product, "name" | "groupArtist">,
  artistLabel: string
): boolean {
  const target = FEATURED_ARTIST_TARGETS.find(
    (a) => a.label.toLowerCase() === artistLabel.toLowerCase()
  );
  const groupLower = (product.groupArtist || "").toLowerCase().trim();
  const nameLower = product.name.toLowerCase();

  if (target) {
    return target.keywords.some((kw) => {
      if (kw === "ive") {
        return (
          groupLower === "ive" ||
          nameLower.startsWith("ive ") ||
          nameLower.includes(" ive ") ||
          nameLower.includes("[ive]")
        );
      }
      return groupLower.includes(kw) || nameLower.includes(kw);
    });
  }

  const query = artistLabel.toLowerCase().trim();
  return groupLower.includes(query) || nameLower.includes(query);
}

export function PopularArtistsSection({ products }: PopularArtistsSectionProps) {
  if (!products || products.length === 0) return null;

  const artistCards: ArtistCardData[] = FEATURED_ARTIST_TARGETS.map((target) => {
    const matched = products.filter((p) => matchesArtistTarget(p, target.label));
    const withImage = matched.find((p) => p.primaryImageUrl && !p.primaryImageUrl.startsWith("data:")) || matched[0];
    return {
      name: target.label,
      count: matched.length,
      imageUrl: withImage?.primaryImageUrl || "",
    };
  })
    .filter((a) => a.count > 0 && a.imageUrl)
    .sort((a, b) => b.count - a.count)
    .slice(0, 12);

  if (artistCards.length === 0) return null;

  return (
    <section className="py-8 sm:py-11 bg-ivory/70 border-b border-border/60">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-end justify-between gap-2 mb-4 sm:mb-6">
          <div>
            <span className="inline-flex items-center gap-1 text-[10px] font-bold tracking-widest text-plum-muted uppercase mb-0.5">
              <Sparkles className="w-3 h-3 text-pink" />
              <span>Artists</span>
            </span>
            <h2 className="mv-heading-italic text-xl sm:text-2xl text-plum">
              SHOP BY ARTIST
            </h2>
          </div>

          <Link
            href="/shop"
            className="text-xs font-bold text-plum hover:text-pink inline-flex items-center gap-1 transition-colors"
          >
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Mobile Horizontal Snap Carousel / Desktop 6-Column Grid */}
        <div className="flex sm:grid sm:grid-cols-4 md:grid-cols-6 gap-3 sm:gap-4 overflow-x-auto sm:overflow-visible mv-snap-carousel pb-2 sm:pb-0 -mx-4 px-4 sm:mx-0 sm:px-0">
          {artistCards.map((artist) => (
            <Link
              key={artist.name}
              href={`/shop?artist=${encodeURIComponent(artist.name)}`}
              className="mv-snap-item shrink-0 w-[112px] sm:w-auto group bg-white rounded-2xl border border-border/80 p-2.5 shadow-2xs hover:shadow-md hover:border-pink/50 hover:-translate-y-0.5 transition-all flex flex-col items-center text-center"
            >
              <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-full overflow-hidden bg-neutral-100 border-2 border-blush group-hover:border-pink transition-colors mb-2">
                <Image
                  src={artist.imageUrl}
                  alt={artist.name}
                  fill
                  sizes="80px"
                  className="object-cover transition-transform duration-300 group-hover:scale-110"
                />
              </div>
              <span className="font-heading font-bold text-xs sm:text-sm text-plum group-hover:text-pink transition-colors truncate w-full">
                {artist.name}
              </span>
              <span className="text-[10px] text-plum-muted font-medium">
                {artist.count} {artist.count === 1 ? "item" : "items"}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
