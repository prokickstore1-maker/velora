import { notFound } from "next/navigation";
import { getOrCreateStoreSettings } from "@/db";
import { MOCK_STORE_SETTINGS } from "@/db/mock-data";
import { getOrderByCode } from "@/lib/queries";
import { Navbar } from "@/components/storefront/navbar";
import { Footer } from "@/components/storefront/footer";
import { PaymentClient } from "@/components/storefront/payment-client";
import { sanitizePublicPaymentSettings } from "@/lib/store-hours";
import { syncTelegramUpdatesIfNeeded } from "@/lib/telegram-bot";

export const dynamic = "force-dynamic";

interface PaymentPageProps {
  params: Promise<{ orderCode: string }>;
}

export const metadata = {
  title: "Complete Payment | Myvelora Store",
  description: "Complete payment for your K-Pop merchandise order.",
};

export default async function PaymentPage({ params }: PaymentPageProps) {
  // Next.js 16 requirement: await params
  const { orderCode } = await params;

  const [order, initialSettings] = await Promise.all([
    getOrderByCode(orderCode),
    getOrCreateStoreSettings().catch(() => null),
  ]);

  if (!order) {
    notFound();
  }

  await syncTelegramUpdatesIfNeeded(initialSettings || MOCK_STORE_SETTINGS);
  const rawSettings = (await getOrCreateStoreSettings().catch(() => null)) || MOCK_STORE_SETTINGS;
  const settings = sanitizePublicPaymentSettings(rawSettings);

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
        <PaymentClient order={order} settings={settings} />
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
