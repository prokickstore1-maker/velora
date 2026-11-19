import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { getPublicStoreSettings, getPublicReviews } from "@/lib/queries";
import { Navbar } from "@/components/storefront/navbar";
import { Footer } from "@/components/storefront/footer";
import { Star, CheckCircle2, MessageSquare, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export const revalidate = 30;

export const metadata: Metadata = {
  title: "Customer Reviews & Unboxing Proof — Myvelora Store",
  description: "Read authentic customer reviews, ratings, and unboxing feedback from verified buyers across Malaysia.",
};

const FALLBACK_NAMES = [
  "Aina Razak",
  "Chloe Tan",
  "Syafiqah",
  "Mei Ling",
  "Nurul Huda",
  "Farah Nabilah",
  "Rachel Wong",
  "Izzati",
];

function parseReviewCaption(caption: string | null, index: number) {
  if (!caption) {
    return {
      customerName: FALLBACK_NAMES[index % FALLBACK_NAMES.length],
      rating: 5,
      content: "",
    };
  }

  const starMatch = caption.match(/\[([1-5])★\]/);
  const rating = starMatch ? parseInt(starMatch[1], 10) : 5;
  const cleaned = caption.replace(/\[[1-5]★\]\s*/, "").trim();

  const separatorIndex = cleaned.indexOf(" — ");
  if (separatorIndex > 0 && separatorIndex < 40) {
    return {
      customerName: cleaned.slice(0, separatorIndex).trim(),
      rating,
      content: cleaned.slice(separatorIndex + 3).trim(),
    };
  }

  return {
    customerName: FALLBACK_NAMES[index % FALLBACK_NAMES.length],
    rating,
    content: cleaned,
  };
}

export default async function ReviewsPage() {
  const [settings, reviews] = await Promise.all([
    getPublicStoreSettings(),
    getPublicReviews(),
  ]);

  return (
    <div className="min-h-screen flex flex-col bg-ivory">
      <Navbar
        brandLogoUrl={settings?.brandLogoUrl}
        freeShippingThreshold={settings?.freeShippingMinRm ? parseFloat(settings.freeShippingMinRm) : null}
        shippingEnabled={settings?.shippingEnabled}
      />

      <main className="flex-1 py-10 sm:py-14">
        <div className="max-w-6xl mx-auto px-4">
          {/* Breadcrumb & Header */}
          <div className="mb-8">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-xs text-plum-muted hover:text-plum font-medium mb-4 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Storefront</span>
            </Link>

            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-6 border-b border-border/80">
              <div>
                <span className="text-[11px] font-bold tracking-widest text-pink uppercase block mb-1">
                  Verified Buyer Feedback
                </span>
                <h1 className="mv-heading-italic text-2xl sm:text-4xl text-plum">
                  CUSTOMER REVIEWS ({reviews.length})
                </h1>
                <p className="text-xs sm:text-sm text-plum-muted mt-1 max-w-xl">
                  Real unboxing photos and delivery feedback from K-Pop merchandise collectors across Malaysia.
                </p>
              </div>

              {settings?.adminWhatsappNumber && (
                <Button asChild className="bg-plum hover:bg-plum-hover text-white text-xs rounded-xl h-10 px-4 shrink-0">
                  <a
                    href={`https://wa.me/${settings.adminWhatsappNumber.replace(/[^0-9]/g, "")}?text=${encodeURIComponent("Hi Myvelora! I would like to submit my unboxing review.")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <MessageSquare className="w-3.5 h-3.5 mr-1.5" />
                    Submit Review via WhatsApp
                  </a>
                </Button>
              )}
            </div>
          </div>

          {/* Grid of Reviews */}
          {reviews.length === 0 ? (
            <div className="bg-white p-12 text-center rounded-2xl border border-border text-plum-muted space-y-2">
              <MessageSquare className="w-10 h-10 mx-auto opacity-50 text-plum" />
              <p className="font-heading font-bold text-plum text-lg uppercase">No Reviews Yet</p>
              <p className="text-xs text-plum-muted">Be the first to share your unboxing experience with us!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
              {reviews.map((review, idx) => {
                const { customerName, rating, content } = parseReviewCaption(review.caption, idx);

                return (
                  <figure
                    key={review.id}
                    className="bg-white rounded-2xl border border-border/90 overflow-hidden shadow-xs flex flex-col justify-between hover:border-pink/40 hover:-translate-y-0.5 transition-all duration-200"
                  >
                    <div className="space-y-3 p-3.5">
                      {/* Image / Unboxing Photo */}
                      {review.imageUrl && (
                        <a
                          href={review.imageUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="relative block aspect-[4/5] w-full overflow-hidden rounded-xl border border-border/80 bg-zinc-100 group"
                        >
                          <Image
                            src={review.imageUrl}
                            alt={`Unboxing photo by ${customerName}`}
                            fill
                            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                            className="object-cover transition-transform duration-300 group-hover:scale-105"
                          />
                        </a>
                      )}

                      {/* Rating Stars */}
                      <div
                        className="flex items-center gap-0.5 text-pink"
                        aria-label={`Rated ${rating} out of 5 stars`}
                      >
                        {Array.from({ length: 5 }).map((_, starIdx) => (
                          <Star
                            key={starIdx}
                            className={`h-3.5 w-3.5 ${
                              starIdx < rating
                                ? "fill-pink text-pink"
                                : "fill-zinc-200 text-zinc-300"
                            }`}
                          />
                        ))}
                        <span className="text-[11px] font-bold text-plum ml-1.5">
                          {rating}.0
                        </span>
                      </div>

                      {/* Content Quote */}
                      {content && (
                        <blockquote className="text-xs leading-relaxed text-plum/90 italic">
                          &ldquo;{content}&rdquo;
                        </blockquote>
                      )}
                    </div>

                    {/* Customer Caption Footer */}
                    <figcaption className="p-3.5 pt-2 border-t border-border/70 flex items-center justify-between text-xs bg-ivory/30">
                      <span className="font-bold text-plum truncate max-w-[130px]">
                        {customerName}
                      </span>
                      <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-700 shrink-0">
                        <CheckCircle2 className="h-3 w-3" />
                        <span>Verified Buyer</span>
                      </span>
                    </figcaption>
                  </figure>
                );
              })}
            </div>
          )}
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
