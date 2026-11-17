import { getPublicStoreSettings } from "@/lib/queries";
import { Navbar } from "@/components/storefront/navbar";
import { Footer } from "@/components/storefront/footer";
import { CheckoutForm } from "@/components/storefront/checkout-form";

export const metadata = {
  title: "Checkout | Myvelora Store",
  description: "Enter your shipping details to complete your K-Pop merchandise order.",
};

export default async function CheckoutPage() {
  const settings = await getPublicStoreSettings();

  const freeShippingThreshold = settings?.freeShippingMinRm
    ? parseFloat(settings.freeShippingMinRm)
    : null;

  const flatShippingFeeRm = settings?.flatShippingFeeRm
    ? parseFloat(settings.flatShippingFeeRm)
    : 0;

  return (
    <div className="min-h-dvh flex flex-col bg-background text-foreground">
      <Navbar
        brandLogoUrl={settings?.brandLogoUrl}
        freeShippingThreshold={freeShippingThreshold}
        shippingEnabled={settings?.shippingEnabled}
      />

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-8 md:py-12">
        <CheckoutForm
          shippingEnabled={Boolean(settings?.shippingEnabled)}
          flatShippingFeeRm={flatShippingFeeRm}
          freeShippingThreshold={freeShippingThreshold}
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
