import { getOrCreateStoreSettings } from "@/db";
import { MOCK_STORE_SETTINGS } from "@/db/mock-data";
import { Navbar } from "@/components/storefront/navbar";
import { Footer } from "@/components/storefront/footer";
import { CheckoutForm } from "@/components/storefront/checkout-form";
import { sanitizePublicPaymentSettings } from "@/lib/store-hours";
import { syncTelegramUpdatesIfNeeded } from "@/lib/telegram-bot";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Checkout | Myvelora Store",
  description: "Enter your shipping details to complete your K-Pop merchandise order.",
};

export default async function CheckoutPage() {
  let rawSettings = (await getOrCreateStoreSettings().catch(() => null)) || MOCK_STORE_SETTINGS;
  await syncTelegramUpdatesIfNeeded(rawSettings);
  rawSettings = (await getOrCreateStoreSettings().catch(() => null)) || MOCK_STORE_SETTINGS;
  const settings = sanitizePublicPaymentSettings(rawSettings);

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
          settings={rawSettings}
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
