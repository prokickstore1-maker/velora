import Link from "next/link";
import { getPublicStoreSettings, getPublicProducts, getPublicReviews } from "@/lib/queries";
import { Navbar } from "@/components/storefront/navbar";
import { Footer } from "@/components/storefront/footer";
import { ProductCard } from "@/components/storefront/product-card";
import { HeroBannerCarousel, type HeroSlide } from "@/components/storefront/hero-banner-carousel";
import { CategoryBannersSection } from "@/components/storefront/category-banners-section";
import { PopularArtistsSection } from "@/components/storefront/popular-artists-section";
import { RecentlyViewedSection } from "@/components/storefront/recently-viewed-section";
import { CustomerReviewsSection } from "@/components/storefront/customer-reviews-section";
import { FaqSection } from "@/components/storefront/faq-section";
import { Button } from "@/components/ui/button";
import { ArrowRight, MessageCircle } from "lucide-react";

export const revalidate = 30;

export default async function HomePage() {
  const [settings, products, reviews] = await Promise.all([
    getPublicStoreSettings(),
    getPublicProducts(),
    getPublicReviews(),
  ]);

  const preOrderItems = products.filter((p) => p.isPreOrder).slice(0, 4);
  const newArrivals = products.filter((p) => p.isNewArrival).slice(0, 4);
  const bestSellersFiltered = products.filter((p) => p.isBestSeller);
  const bestSellers = (
    bestSellersFiltered.length > 0
      ? bestSellersFiltered
      : products.filter((p) => !p.isPreOrder)
  ).slice(0, 4);

  const bannerProduct = newArrivals[0] || products[0] || null;

  const bannerImageUrl =
    settings?.heroBannerImageUrl ||
    bannerProduct?.primaryImageUrl ||
    "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1400&q=80";
  const bannerBadge = settings?.heroBannerBadge ?? "New Drop";
  const bannerTitle =
    settings?.heroBannerTitle ||
    (bannerProduct ? bannerProduct.name : "Explore Latest Releases");
  const bannerHref =
    settings?.heroBannerLink ||
    (bannerProduct ? `/products/${bannerProduct.slug}` : "/shop");

  // Build Hero Carousel slides (Slide 1 = Admin Hero Banner, followed by New Arrivals)
  const slides: HeroSlide[] = [
    {
      id: "hero-primary",
      imageUrl: bannerImageUrl,
      badge: bannerBadge,
      title: bannerTitle,
      subtitle: bannerProduct?.groupArtist ? `${bannerProduct.groupArtist} • ${bannerProduct.category}` : "Browse albums by version, lightsticks, and photocard sets",
      href: bannerHref,
    },
    ...newArrivals
      .filter((p) => p.primaryImageUrl && p.primaryImageUrl !== bannerImageUrl)
      .slice(0, 3)
      .map((p) => ({
        id: String(p.id),
        imageUrl: p.primaryImageUrl!,
        badge: p.category,
        title: p.name,
        subtitle: p.groupArtist || undefined,
        href: `/products/${p.slug}`,
      })),
  ];

  const freeShippingThreshold = settings?.freeShippingMinRm
    ? parseFloat(settings.freeShippingMinRm)
    : null;

  const cleanWa = settings?.adminWhatsappNumber
    ? settings.adminWhatsappNumber.replace(/[^0-9]/g, "")
    : "";
  const whatsappHref = cleanWa ? `https://wa.me/${cleanWa}` : null;

  return (
    <div className="min-h-dvh flex flex-col bg-background text-foreground">
      {/* Navbar with brand assets & cart */}
      <Navbar
        brandLogoUrl={settings?.brandLogoUrl}
        freeShippingThreshold={freeShippingThreshold}
        shippingEnabled={settings?.shippingEnabled}
      />

      {/* Full-Width Hero Banner Slider */}
      <HeroBannerCarousel slides={slides} />

      {/* "SHOP NOW" Visual Category Collage Banners */}
      <CategoryBannersSection products={products} />

      {/* "SHOP BY ARTIST" Mobile Snap Carousel & Desktop Grid */}
      <PopularArtistsSection products={products} />

      {/* 1. PRE ORDER Section */}
      {preOrderItems.length > 0 && (
        <section id="pre-order" className="py-8 sm:py-12 bg-white border-b border-border/60">
          <div className="max-w-6xl mx-auto px-4">
            <h2 className="font-sans font-normal text-lg sm:text-xl tracking-wide text-plum uppercase text-center mb-5 sm:mb-6">
              PRE ORDER
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5">
              {preOrderItems.map((product, idx) => (
                <ProductCard key={product.id} product={product} settings={settings} priority={idx < 2} />
              ))}
            </div>
            <div className="text-center mt-6">
              <Button asChild variant="outline" className="border-plum text-plum hover:bg-blush/30">
                <Link href="/shop?category=pre-order" className="flex items-center gap-1.5">
                  <span>View All Pre-Order</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </Button>
            </div>
          </div>
        </section>
      )}

      {/* 2. NEW ARRIVAL Section */}
      {newArrivals.length > 0 && (
        <section id="new-arrivals" className="py-8 sm:py-12 bg-background border-b border-border/60">
          <div className="max-w-6xl mx-auto px-4">
            <h2 className="font-sans font-normal text-lg sm:text-xl tracking-wide text-plum uppercase text-center mb-5 sm:mb-6">
              NEW ARRIVAL
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5">
              {newArrivals.map((product) => (
                <ProductCard key={product.id} product={product} settings={settings} />
              ))}
            </div>
            <div className="text-center mt-6">
              <Button asChild variant="outline" className="border-plum text-plum hover:bg-blush/30">
                <Link href="/shop?category=new" className="flex items-center gap-1.5">
                  <span>View All New Arrivals</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </Button>
            </div>
          </div>
        </section>
      )}

      {/* 3. BEST SELLER Section */}
      {bestSellers.length > 0 && (
        <section id="best-seller" className="py-8 sm:py-12 bg-white border-b border-border/60">
          <div className="max-w-6xl mx-auto px-4">
            <h2 className="font-sans font-normal text-lg sm:text-xl tracking-wide text-plum uppercase text-center mb-5 sm:mb-6">
              BEST SELLER
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5">
              {bestSellers.map((product) => (
                <ProductCard key={product.id} product={product} settings={settings} />
              ))}
            </div>
            <div className="text-center mt-6">
              <Button asChild variant="outline" className="border-plum text-plum hover:bg-blush/30">
                <Link href="/shop?category=best-seller" className="flex items-center gap-1.5">
                  <span>View All Best Sellers</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </Button>
            </div>
          </div>
        </section>
      )}

      {/* Recently Viewed History for Returning Shoppers */}
      <RecentlyViewedSection />

      {/* Customer Reviews Section */}
      <CustomerReviewsSection reviews={reviews} />

      {/* FAQ Section (Conditional based on storeSettings) */}
      <FaqSection
        faqEnabled={settings?.faqEnabled}
        faqItems={settings?.faqItems}
      />

      {/* Footer */}
      <Footer
        brandLogoUrl={settings?.brandLogoUrl}
        faqEnabled={settings?.faqEnabled}
        returnPolicyEnabled={settings?.returnPolicyEnabled}
        adminWhatsappNumber={settings?.adminWhatsappNumber}
        instagramUrl={settings?.instagramUrl}
      />

      {/* Floating WhatsApp Chat Button */}
      {whatsappHref && (
        <a
          href={whatsappHref}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Chat on WhatsApp"
          className="fixed bottom-5 right-5 z-30 w-13 h-13 rounded-full bg-[#25D366] hover:bg-[#20bd5a] text-white shadow-lg flex items-center justify-center transition-transform hover:scale-105"
        >
          <MessageCircle className="w-6 h-6 fill-current" />
        </a>
      )}
    </div>
  );
}
