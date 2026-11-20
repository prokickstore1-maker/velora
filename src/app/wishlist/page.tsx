import type { Metadata } from "next";
import { getPublicStoreSettings, getPublicProducts } from "@/lib/queries";
import { Navbar } from "@/components/storefront/navbar";
import { Footer } from "@/components/storefront/footer";
import { WishlistClient } from "@/components/storefront/wishlist-client";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "My Wishlist | Myvelora Store",
  description: "Saved K-Pop albums, lightsticks, photobooks, and merchandise.",
};

export default async function WishlistPage() {
  const [settings, products] = await Promise.all([
    getPublicStoreSettings(),
    getPublicProducts(),
  ]);

  const freeShippingThreshold = settings?.freeShippingMinRm
    ? parseFloat(settings.freeShippingMinRm)
    : null;

  return (
    <div className="min-h-dvh flex flex-col bg-background text-foreground">
      <Navbar
        brandLogoUrl={settings?.brandLogoUrl}
        freeShippingThreshold={freeShippingThreshold}
        shippingEnabled={settings?.shippingEnabled}
      />

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-8 md:py-12">
        <WishlistClient allProducts={products} settings={settings} />
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
