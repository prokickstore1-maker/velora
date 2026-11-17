"use client";

import { useRef } from "react";
import Image from "next/image";
import type { CustomerReview } from "@/db/schema";
import { Star, CheckCircle2, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CustomerReviewsSectionProps {
  reviews: CustomerReview[];
}

const FALLBACK_NAMES = [
  "Aina R.",
  "Chloe T.",
  "Syafiqah M.",
  "Mei Ling",
  "Nadia H.",
  "Hannah K.",
];

function parseReviewCaption(caption: string | null, index: number) {
  if (!caption) {
    return {
      customerName: FALLBACK_NAMES[index % FALLBACK_NAMES.length],
      content: "",
    };
  }

  const separatorIndex = caption.indexOf(" — ");
  if (separatorIndex > 0 && separatorIndex < 30) {
    return {
      customerName: caption.slice(0, separatorIndex).trim(),
      content: caption.slice(separatorIndex + 3).trim(),
    };
  }

  return {
    customerName: FALLBACK_NAMES[index % FALLBACK_NAMES.length],
    content: caption,
  };
}

export function CustomerReviewsSection({ reviews }: CustomerReviewsSectionProps) {
  const trackRef = useRef<HTMLDivElement>(null);

  if (!reviews || reviews.length === 0) {
    return null;
  }

  function scrollByCards(dir: -1 | 1) {
    const el = trackRef.current;
    if (!el) return;
    el.scrollBy({ left: dir * 260, behavior: "smooth" });
  }

  return (
    <section id="reviews" className="py-12 sm:py-16 bg-white border-b border-border/80 overflow-hidden">
      <div className="max-w-6xl mx-auto px-4">
        <div className="mb-4 flex items-end justify-between gap-2">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-plum-muted mb-0.5">
              Buyer Feedback
            </p>
            <h2 className="mv-heading-italic text-xl sm:text-2xl text-plum">
              CUSTOMER REVIEWS
            </h2>
          </div>

          <div className="flex items-center gap-1.5">
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={() => scrollByCards(-1)}
              aria-label="Scroll reviews left"
              className="h-8 w-8 rounded-full border-border text-plum hover:bg-blush/40"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={() => scrollByCards(1)}
              aria-label="Scroll reviews right"
              className="h-8 w-8 rounded-full border-border text-plum hover:bg-blush/40"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div
          ref={trackRef}
          className="flex gap-3 overflow-x-auto mv-snap-carousel pb-2 -mx-4 px-4 sm:mx-0 sm:px-0"
        >
          {reviews.map((review, idx) => {
            const { customerName, content } = parseReviewCaption(review.caption, idx);

            return (
              <figure
                key={review.id}
                className="mv-snap-item shrink-0 w-[210px] sm:w-[235px] flex flex-col justify-between overflow-hidden p-3 rounded-2xl border border-border bg-white shadow-xs transition-all duration-200 hover:-translate-y-0.5 hover:border-pink/50"
              >
                <div className="space-y-2.5">
                  {review.imageUrl && (
                    <a
                      href={review.imageUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="relative block aspect-square w-full overflow-hidden rounded-xl border border-border bg-ivory/60 group"
                      style={{ position: "relative" }}
                    >
                      <Image
                        src={review.imageUrl}
                        alt={`Review from ${customerName}`}
                        fill
                        sizes="235px"
                        className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                      />
                    </a>
                  )}

                  <div
                    className="flex items-center gap-0.5 text-pink"
                    aria-label="Rated 5 out of 5 stars"
                  >
                    {Array.from({ length: 5 }).map((_, starIdx) => (
                      <Star
                        key={starIdx}
                        className="h-3 w-3 fill-pink text-pink"
                      />
                    ))}
                  </div>

                  {content && (
                    <blockquote className="line-clamp-3 text-[11px] leading-relaxed text-plum/90">
                      &ldquo;{content}&rdquo;
                    </blockquote>
                  )}
                </div>

                <figcaption className="mt-2.5 flex items-center justify-between border-t border-border/70 pt-2 text-[11px]">
                  <span className="font-bold text-plum truncate max-w-[115px]">
                    {customerName}
                  </span>
                  <span className="inline-flex items-center gap-0.5 text-[10px] font-semibold text-emerald-700 shrink-0">
                    <CheckCircle2 className="h-3 w-3" />
                    <span>Verified</span>
                  </span>
                </figcaption>
              </figure>
            );
          })}
        </div>
      </div>
    </section>
  );
}
