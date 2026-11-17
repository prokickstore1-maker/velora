import { getPublicStoreSettings, getPublicProducts } from "@/lib/queries";
import { Navbar } from "@/components/storefront/navbar";
import { Footer } from "@/components/storefront/footer";
import { CatalogView } from "@/components/storefront/catalog-view";
import { PRODUCT_CATEGORIES } from "@/lib/constants";

interface ShopPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export const metadata = {
  title: "Shop All K-Pop Merch | Myvelora Store",
  description: "Browse ready stock K-Pop albums, photocards, and official merchandise.",
};

export default async function ShopPage({ searchParams }: ShopPageProps) {
  // Next.js 16 requirement: await searchParams
  const resolvedSearchParams = await searchParams;
  const rawCategory =
    typeof resolvedSearchParams.category === "string"
      ? resolvedSearchParams.category.trim()
      : undefined;

  const [settings, products] = await Promise.all([
    getPublicStoreSettings(),
    getPublicProducts(),
  ]);

  const freeShippingThreshold = settings?.freeShippingMinRm
    ? parseFloat(settings.freeShippingMinRm)
    : null;

  // Extract categories from single source of truth + any active products
  const categorySet = new Set<string>(PRODUCT_CATEGORIES);
  products.forEach((p) => {
    if (p.category) categorySet.add(p.category);
  });
  const categories = Array.from(categorySet);

  let initialCategory = "All";
  if (rawCategory) {
    const lower = rawCategory.toLowerCase();
    if (lower === "pre-order" || lower === "pre order" || lower === "preorder") {
      initialCategory = "Pre-Order";
    } else if (lower === "new" || lower === "new arrivals" || lower === "new arrival") {
      initialCategory = "New Arrivals";
    } else if (lower === "best-seller" || lower === "best seller" || lower === "best sellers") {
      initialCategory = "Best Sellers";
    } else {
      const matched = categories.find(
        (c) =>
          c.toLowerCase() === lower ||
          (lower === "merch" && c.toLowerCase() === "merchandise") ||
          (lower === "merchandise" && c.toLowerCase() === "merch")
      );
      if (matched) {
        initialCategory = matched;
      } else {
        // Capitalize first letter so user-clicked category displays cleanly in filter pills
        initialCategory = rawCategory.charAt(0).toUpperCase() + rawCategory.slice(1);
      }
    }
  }

  return (
    <div className="min-h-dvh flex flex-col bg-background text-foreground">
      <Navbar
        brandLogoUrl={settings?.brandLogoUrl}
        freeShippingThreshold={freeShippingThreshold}
        shippingEnabled={settings?.shippingEnabled}
      />

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-8 md:py-12">
        {/* Page Title */}
        <div className="mb-8 space-y-2">
          <span className="text-xs font-bold tracking-widest text-plum-muted uppercase">
            Curated Catalog
          </span>
          <h1 className="mv-heading-italic text-3xl sm:text-5xl text-plum">
            EXPLORE MERCHANDISE
          </h1>
          <p className="text-sm text-plum-muted max-w-lg">
            Select any product to view versions and real-time availability.
          </p>
        </div>

        {/* Interactive Catalog View */}
        <CatalogView
          initialProducts={products}
          categories={categories}
          initialCategory={initialCategory}
        />
      </main>

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
