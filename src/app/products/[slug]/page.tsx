import { notFound } from "next/navigation";
import {
  getProductBySlug,
  getPublicStoreSettings,
  getPublicReviews,
  getRecommendedProducts,
} from "@/lib/queries";
import { Navbar } from "@/components/storefront/navbar";
import { Footer } from "@/components/storefront/footer";
import { ProductDetailClient } from "@/components/storefront/product-detail-client";
import { RecommendedProductsSection } from "@/components/storefront/recommended-products-section";
import { RecentlyViewedSection } from "@/components/storefront/recently-viewed-section";
import { CustomerReviewsSection } from "@/components/storefront/customer-reviews-section";

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: ProductPageProps) {
  // Next.js 16 requirement: await params
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    return {
      title: "Product Not Found | Myvelora Store",
    };
  }

  return {
    title: `${product.name} | Myvelora Store`,
    description: product.description?.slice(0, 160) || `Buy ${product.name} ready stock in Malaysia.`,
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  // Next.js 16 requirement: await params
  const { slug } = await params;

  const product = await getProductBySlug(slug);

  if (!product) {
    notFound();
  }

  const [settings, reviews, recommended] = await Promise.all([
    getPublicStoreSettings(),
    getPublicReviews(),
    getRecommendedProducts({
      id: product.id,
      groupArtist: product.groupArtist,
      category: product.category,
    }),
  ]);

  const freeShippingThreshold = settings?.freeShippingMinRm
    ? parseFloat(settings.freeShippingMinRm)
    : null;

  return (
    <div className="min-h-dvh flex flex-col bg-background text-foreground pb-20 sm:pb-0">
      <Navbar
        brandLogoUrl={settings?.brandLogoUrl}
        freeShippingThreshold={freeShippingThreshold}
        shippingEnabled={settings?.shippingEnabled}
      />

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-6 md:py-10">
        <ProductDetailClient product={product} settings={settings} />
      </main>

      {/* Recommended Products based on what the user is currently viewing (Artist / Category) */}
      <RecommendedProductsSection
        products={recommended}
        settings={settings}
        currentArtist={product.groupArtist}
        currentCategory={product.category}
      />

      {/* Recently Viewed Products from user's browsing history */}
      <RecentlyViewedSection currentProduct={product} />

      {/* Customer Reviews & Social Proof */}
      <CustomerReviewsSection reviews={reviews} />

      <Footer
        brandLogoUrl={settings?.brandLogoUrl}
        faqEnabled={settings?.faqEnabled}
        returnPolicyEnabled={settings?.returnPolicyEnabled}
        adminWhatsappNumber={settings?.adminWhatsappNumber}
        instagramUrl={settings?.instagramUrl}
      />
    </div>
  );
}
