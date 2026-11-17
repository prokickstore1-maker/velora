import { notFound } from "next/navigation";
import { getPublicStoreSettings } from "@/lib/queries";
import { Navbar } from "@/components/storefront/navbar";
import { Footer } from "@/components/storefront/footer";

export const metadata = {
  title: "Store Policy | Myvelora Store",
  description: "Official store policies, shipping guidelines, and return terms.",
};

export default async function PoliciesPage() {
  const settings = await getPublicStoreSettings();

  if (!settings?.returnPolicyEnabled || !settings.returnPolicyText) {
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

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-12 md:py-16">
        <div className="bg-white p-6 sm:p-10 rounded-2xl border border-border shadow-xs space-y-6">
          <div className="pb-4 border-b border-border">
            <span className="text-xs font-bold tracking-widest text-pink uppercase block">
              Official Guidelines
            </span>
            <h1 className="mv-heading-italic text-3xl sm:text-4xl text-plum mt-1">
              STORE POLICY
            </h1>
          </div>

          <div className="text-sm text-plum-muted whitespace-pre-line leading-relaxed font-sans">
            {settings.returnPolicyText}
          </div>
        </div>
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
