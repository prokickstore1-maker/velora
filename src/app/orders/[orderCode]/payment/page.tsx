import { notFound } from "next/navigation";
import { getOrderByCode, getPublicStoreSettings } from "@/lib/queries";
import { Navbar } from "@/components/storefront/navbar";
import { Footer } from "@/components/storefront/footer";
import { PaymentClient } from "@/components/storefront/payment-client";

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

  const [order, settings] = await Promise.all([
    getOrderByCode(orderCode),
    getPublicStoreSettings(),
  ]);

  if (!order) {
    notFound();
  }

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
