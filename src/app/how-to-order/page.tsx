import Link from "next/link";
import { getPublicStoreSettings } from "@/lib/queries";
import { Navbar } from "@/components/storefront/navbar";
import { Footer } from "@/components/storefront/footer";
import { Button } from "@/components/ui/button";
import {
  Compass,
  ShoppingBag,
  ClipboardList,
  CreditCard,
  MessageCircle,
  PackageCheck,
  ShieldCheck,
  ArrowRight,
  Sparkles,
  Search,
} from "lucide-react";

export const metadata = {
  title: "How to Order | Myvelora Store",
  description:
    "Learn the simple 5-step process to order K-Pop merchandise, complete payment via DuitNow QR / Bank Transfer, and track your order.",
};

export default async function HowToOrderPage() {
  const settings = await getPublicStoreSettings();

  const freeShippingThreshold = settings?.freeShippingMinRm
    ? parseFloat(settings.freeShippingMinRm)
    : null;

  const steps = [
    {
      num: "01",
      badge: "Browse & Select",
      title: "EXPLORE & PICK YOUR VERSION",
      desc: "Browse our curated collection of official K-Pop albums, lightsticks, photobooks, and merchandise. Click any product to view real-time availability.",
      tips: [
        "Pick individual versions (Ver. A, Ver. B, Member Ver.) or select the 'Full Set' option.",
        "Check stock badges: 'In Stock' ready to ship or 'Pre Order' for upcoming drops.",
        "Read the detailed inclusions list to see what photocards, posters, and booklets are inside.",
      ],
      icon: Compass,
    },
    {
      num: "02",
      badge: "Shopping Bag",
      title: "ADD TO BAG & REVIEW",
      desc: "Choose your quantity and add items to your shopping bag. Open your bag anytime using the top-right bag icon to inspect your order.",
      tips: [
        "Check progress towards the Free Shipping threshold (if active).",
        "Adjust quantities with the +/- stepper or remove items as needed.",
        "Verify your total in Malaysian Ringgit (MYR / RM) before proceeding.",
      ],
      icon: ShoppingBag,
    },
    {
      num: "03",
      badge: "Fast Checkout",
      title: "FILL DELIVERY DETAILS",
      desc: "Proceed through our streamlined 5-step checkout. No lengthy account creation or password required—fast and guest-friendly.",
      tips: [
        "Provide your recipient name and valid WhatsApp phone number (+60).",
        "Enter your full shipping address, city, postcode, and select your State / Negeri.",
        "Add any optional packaging notes or instructions for our logistics team.",
      ],
      icon: ClipboardList,
    },
    {
      num: "04",
      badge: "Payment",
      title: "DUITNOW QR / BANK TRANSFER",
      desc: "Submit your order to generate your unique Order Code (e.g. MV-20261116-8492). Transfer the exact total to our official store bank account.",
      tips: [
        "Pay via DuitNow QR or manual Online Banking transfer.",
        "Take a clear screenshot or PDF receipt of your successful transaction.",
        "Upload your payment slip directly on the order confirmation screen.",
      ],
      icon: CreditCard,
    },
    {
      num: "05",
      badge: "Instant Confirmation",
      title: "WHATSAPP & LIVE TRACKING",
      desc: "Our team verifies your payment and starts packing. You can chat with us directly via WhatsApp with one click.",
      tips: [
        "Click the green 'Confirm via WhatsApp' button to notify our admin team instantly.",
        "Check real-time packing and courier tracking updates anytime on the Track Order page.",
        "Receive courier tracking numbers as soon as your parcel is handed to the shipping partner.",
      ],
      icon: MessageCircle,
    },
  ];

  const faqs = [
    {
      q: "What is the difference between Ready Stock and Pre-Order (PO)?",
      a: "Ready Stock items are physically stored in our local warehouse and dispatched within 24 to 48 business hours after payment verification. Pre-Order (PO) items are advance bookings for upcoming releases or restocks, dispatched promptly once the overseas shipment arrives at our warehouse (be sure to check the 'Available until' deadline on each Pre-Order item).",
    },
    {
      q: "Can I combine Ready Stock and Pre-Order items in one single order?",
      a: "Yes, you can check out together. However, your entire parcel will be dispatched only after all Pre-Order items have arrived. If you prefer to receive your Ready Stock items immediately, we strongly recommend placing separate orders.",
    },
    {
      q: "Do I need to register an account before ordering?",
      a: "No registration or password is required. You can order as a guest. All you need is a valid WhatsApp phone number so we can send your order status, receipt confirmation, and courier tracking code.",
    },
    {
      q: "What payment methods are supported?",
      a: "We accept DuitNow QR (scan & pay via any Malaysian banking app or e-wallet) and direct Instant Bank Transfer. Once paid, simply upload your transfer receipt on the order confirmation page.",
    },
    {
      q: "What are the shipping fees and delivery estimates?",
      a: "We provide flat-rate shipping across Malaysia, with Free Shipping for qualifying orders. Once dispatched, standard courier delivery typically takes 1-3 business days within Peninsular Malaysia and 3-5 business days to Sabah & Sarawak.",
    },
    {
      q: "How are albums and delicate collectibles packaged?",
      a: "Every album, lightstick, and merchandise item is cushioned with multi-layer shockproof bubble wrap and shipped inside heavy-duty corrugated cartons with corner protection to prevent dented outboxes during courier transit.",
    },
  ];

  return (
    <div className="min-h-dvh flex flex-col bg-background text-foreground">
      <Navbar
        brandLogoUrl={settings?.brandLogoUrl}
        freeShippingThreshold={freeShippingThreshold}
        shippingEnabled={settings?.shippingEnabled}
      />

      <main className="flex-1 w-full">
        {/* Hero Header */}
        <section className="bg-plum text-white py-14 sm:py-20 px-4 relative overflow-hidden border-b border-plum-hover">
          <div className="max-w-4xl mx-auto text-center relative z-10 space-y-3">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-pink/20 text-pink border border-pink/30 text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Simple &amp; Transparent Guide</span>
            </div>
            <h1 className="mv-heading-italic text-3xl sm:text-5xl md:text-6xl text-white leading-tight">
              HOW TO ORDER
            </h1>
            <p className="text-sm sm:text-base text-white/80 max-w-xl mx-auto font-sans leading-relaxed">
              Order your favorite K-Pop merchandise online in 5 easy steps. Pay securely via DuitNow QR or Bank Transfer, and track your package directly to your doorstep.
            </p>
          </div>
        </section>

        {/* 5 Core Steps (Editorial Step Cards) */}
        <section className="py-12 sm:py-16 max-w-5xl mx-auto px-4">
          <div className="space-y-6 sm:space-y-8">
            {steps.map((step, idx) => {
              const Icon = step.icon;
              return (
                <div
                  key={step.num}
                  className="bg-white rounded-2xl border border-border/80 shadow-xs p-6 sm:p-8 transition-all hover:border-plum/40 hover:shadow-md relative overflow-hidden"
                >
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
                    {/* Left: Step Number & Icon */}
                    <div className="md:col-span-3 flex md:flex-col items-center md:items-start justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <span className="mv-heading-italic text-4xl sm:text-5xl text-pink leading-none">
                          {step.num}
                        </span>
                        <span className="text-[10px] font-bold uppercase tracking-widest text-plum-muted block">
                          Step {idx + 1} of 5
                        </span>
                      </div>

                      <div className="w-12 h-12 rounded-xl bg-blush/50 text-plum flex items-center justify-center border border-plum/10">
                        <Icon className="w-6 h-6 text-plum" />
                      </div>
                    </div>

                    {/* Right: Step Title, Description & Actionable Tips */}
                    <div className="md:col-span-9 space-y-3.5">
                      <div>
                        <span className="inline-block px-2.5 py-0.5 rounded-md bg-ivory text-plum-muted border border-border text-[11px] font-bold uppercase tracking-wider mb-1.5">
                          {step.badge}
                        </span>
                        <h2 className="mv-heading-italic text-xl sm:text-2xl text-plum">
                          {step.title}
                        </h2>
                      </div>

                      <p className="text-xs sm:text-sm text-plum-muted leading-relaxed">
                        {step.desc}
                      </p>

                      <div className="bg-ivory/70 rounded-xl p-3.5 sm:p-4 border border-border/60 space-y-2">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-plum block">
                          Helpful Tips:
                        </span>
                        <ul className="space-y-1.5 text-xs text-plum/85">
                          {step.tips.map((tip, tIdx) => (
                            <li key={tIdx} className="flex items-start gap-2">
                              <span className="text-pink font-bold mt-0.5">•</span>
                              <span className="leading-relaxed">{tip}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Packaging & Safety Assurances */}
        <section className="bg-ivory/60 border-y border-border/80 py-12 sm:py-16">
          <div className="max-w-5xl mx-auto px-4">
            <div className="text-center max-w-xl mx-auto mb-10 space-y-2">
              <span className="text-xs font-bold tracking-widest text-plum-muted uppercase">
                Care &amp; Quality
              </span>
              <h2 className="mv-heading-italic text-2xl sm:text-3xl text-plum">
                PACKAGED WITH LOVE &amp; CARE
              </h2>
              <p className="text-xs sm:text-sm text-plum-muted leading-relaxed">
                We understand how precious K-Pop merchandise is to collectors. Here is our packaging standard:
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-white p-5 rounded-2xl border border-border shadow-xs text-center space-y-2.5">
                <div className="w-12 h-12 mx-auto rounded-xl bg-blush/60 text-plum flex items-center justify-center">
                  <ShieldCheck className="w-6 h-6 text-plum" />
                </div>
                <h3 className="font-heading font-bold text-sm text-plum uppercase">
                  100% Factory Sealed
                </h3>
                <p className="text-xs text-plum-muted leading-relaxed">
                  All official albums and goods arrive brand new, factory sealed with original stickers and official inclusions.
                </p>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-border shadow-xs text-center space-y-2.5">
                <div className="w-12 h-12 mx-auto rounded-xl bg-blush/60 text-plum flex items-center justify-center">
                  <PackageCheck className="w-6 h-6 text-plum" />
                </div>
                <h3 className="font-heading font-bold text-sm text-plum uppercase">
                  Multi-Layer Bubble Wrap
                </h3>
                <p className="text-xs text-plum-muted leading-relaxed">
                  Generous shockproof bubble wrap and sturdy box packaging to protect delicate outboxes and album corners.
                </p>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-border shadow-xs text-center space-y-2.5">
                <div className="w-12 h-12 mx-auto rounded-xl bg-blush/60 text-plum flex items-center justify-center">
                  <MessageCircle className="w-6 h-6 text-plum" />
                </div>
                <h3 className="font-heading font-bold text-sm text-plum uppercase">
                  Direct WhatsApp Support
                </h3>
                <p className="text-xs text-plum-muted leading-relaxed">
                  Have questions about your order or need extra assistance? Message our admin team directly anytime.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Ordering FAQ */}
        <section className="py-12 sm:py-16 max-w-4xl mx-auto px-4">
          <div className="text-center max-w-lg mx-auto mb-10 space-y-2">
            <span className="text-xs font-bold tracking-widest text-plum-muted uppercase">
              Got Questions?
            </span>
            <h2 className="mv-heading-italic text-2xl sm:text-3xl text-plum">
              ORDERING FAQS
            </h2>
          </div>

          <div className="space-y-3.5">
            {faqs.map((faq, idx) => (
              <div
                key={idx}
                className="bg-white p-5 rounded-xl border border-border shadow-xs space-y-2"
              >
                <h3 className="font-heading font-bold text-sm sm:text-base text-plum">
                  {faq.q}
                </h3>
                <p className="text-xs sm:text-sm text-plum-muted leading-relaxed">
                  {faq.a}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Bottom Call to Action */}
        <section className="bg-plum text-white py-12 px-4 text-center">
          <div className="max-w-2xl mx-auto space-y-4">
            <h2 className="mv-heading-italic text-2xl sm:text-4xl text-white">
              READY TO EXPLORE THE STORE?
            </h2>
            <p className="text-xs sm:text-sm text-white/80 max-w-md mx-auto leading-relaxed">
              Discover official albums, photocards, and concert goods ready to ship right now.
            </p>
            <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
              <Button
                asChild
                size="lg"
                className="bg-pink hover:bg-pink-hover text-white font-bold h-12 px-7 rounded-xl shadow-sm"
              >
                <Link href="/shop" className="flex items-center gap-2">
                  <span>Start Shopping</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </Button>

              <Button
                asChild
                variant="outline"
                size="lg"
                className="border-white/30 text-white bg-white/10 hover:bg-white/20 h-12 px-7 rounded-xl"
              >
                <Link href="/track-order" className="flex items-center gap-2">
                  <Search className="w-4 h-4" />
                  <span>Track Existing Order</span>
                </Link>
              </Button>
            </div>
          </div>
        </section>
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
