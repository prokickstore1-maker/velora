import { notFound } from "next/navigation";
import { getOrderByCode, getPublicStoreSettings } from "@/lib/queries";
import { Navbar } from "@/components/storefront/navbar";
import { Footer } from "@/components/storefront/footer";
import { ConfirmationView } from "@/components/storefront/confirmation-view";

interface ConfirmationPageProps {
  params: Promise<{ orderCode: string }>;
}

export const metadata = {
  title: "Order Confirmation | Myvelora Store",
  description: "View your order summary and confirm via WhatsApp.",
};

export default async function ConfirmationPage({ params }: ConfirmationPageProps) {
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
        <ConfirmationView order={order} settings={settings} />
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
