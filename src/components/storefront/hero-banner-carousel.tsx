"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

export interface HeroSlide {
  id: string;
  imageUrl: string;
  badge?: string | null;
  title: string;
  subtitle?: string | null;
  href: string;
}

interface HeroBannerCarouselProps {
  slides: HeroSlide[];
}

export function HeroBannerCarousel({ slides }: HeroBannerCarouselProps) {
  const [current, setCurrent] = useState(0);
  const count = slides.length;

  const nextSlide = useCallback(() => {
    if (count <= 1) return;
    setCurrent((prev) => (prev + 1) % count);
  }, [count]);

  const prevSlide = useCallback(() => {
    if (count <= 1) return;
    setCurrent((prev) => (prev - 1 + count) % count);
  }, [count]);

  useEffect(() => {
    if (count <= 1) return;
    const timer = setInterval(nextSlide, 5500);
    return () => clearInterval(timer);
  }, [count, nextSlide]);

  if (count === 0) return null;

  const activeSlide = slides[current] || slides[0];

  return (
    <section className="relative w-full bg-plum overflow-hidden border-b border-border/60">
      <div className="max-w-6xl mx-auto md:px-4 md:py-5">
        <div className="relative w-full aspect-[16/10] sm:aspect-[21/9] md:rounded-2xl overflow-hidden bg-plum">
          <Link href={activeSlide.href} className="block w-full h-full relative group">
            <Image
              key={activeSlide.id}
              src={activeSlide.imageUrl}
              alt={activeSlide.title}
              fill
              priority
              unoptimized={activeSlide.imageUrl.startsWith("data:")}
              sizes="(max-width: 768px) 100vw, 1152px"
              className="object-cover transition-transform duration-700 group-hover:scale-[1.02]"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-plum/90 via-plum/30 to-transparent" />

            <div className="absolute inset-x-0 bottom-8 sm:bottom-10 px-5 sm:px-8 flex flex-col items-start gap-1.5 max-w-2xl">
              {activeSlide.badge && (
                <span className="inline-block bg-pink text-white text-[10px] sm:text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-md">
                  {activeSlide.badge}
                </span>
              )}
              <h2 className="mv-heading-italic text-white text-xl sm:text-3xl md:text-4xl leading-tight line-clamp-2 drop-shadow-xs">
                {activeSlide.title}
              </h2>
              {activeSlide.subtitle && (
                <p className="text-xs sm:text-sm text-white/80 line-clamp-1">
                  {activeSlide.subtitle}
                </p>
              )}
            </div>
          </Link>

          {/* Left / Right Navigation Arrows (Desktop/Tablet Only) */}
          {count > 1 && (
            <>
              <button
                type="button"
                onClick={prevSlide}
                aria-label="Previous banner slide"
                className="hidden sm:flex absolute left-3 top-1/2 -translate-y-1/2 z-20 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white/80 hover:bg-white text-plum items-center justify-center shadow-sm transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                type="button"
                onClick={nextSlide}
                aria-label="Next banner slide"
                className="hidden sm:flex absolute right-3 top-1/2 -translate-y-1/2 z-20 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white/80 hover:bg-white text-plum items-center justify-center shadow-sm transition-colors"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </>
          )}

          {/* Bottom Dots */}
          {count > 1 && (
            <div className="absolute bottom-3 inset-x-0 z-20 flex items-center justify-center gap-2">
              {slides.map((s, idx) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setCurrent(idx)}
                  aria-label={`Go to slide ${idx + 1}`}
                  className={`h-2 rounded-full transition-all ${
                    idx === current ? "w-5 bg-pink" : "w-2 bg-white/55 hover:bg-white/80"
                  }`}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
