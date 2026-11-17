import { notFound } from "next/navigation";
import { getProductBySlug, getPublicStoreSettings, getPublicReviews } from "@/lib/queries";
import { Navbar } from "@/components/storefront/navbar";
import { Footer } from "@/components/storefront/footer";
import { ProductDetailClient } from "@/components/storefront/product-detail-client";
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

  const [product, settings, reviews] = await Promise.all([
    getProductBySlug(slug),
    getPublicStoreSettings(),
    getPublicReviews(),
  ]);

  if (!product) {
    notFound();
  }

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
        <ProductDetailClient product={product} />
      </main>

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
