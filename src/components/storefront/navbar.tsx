"use client";

import { useState } from "react";
import Link from "next/link";
import { BrandLogo } from "@/components/common/brand-logo";
import { useCart } from "@/context/cart-context";
import { CartDrawer } from "./cart-drawer";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { ShoppingBag, Menu, User } from "lucide-react";
import { PRODUCT_CATEGORIES, CATEGORY_METADATA } from "@/lib/constants";

interface NavbarProps {
  brandLogoUrl?: string | null;
  freeShippingThreshold?: number | null;
  shippingEnabled?: boolean;
}

export function Navbar({
  brandLogoUrl,
  freeShippingThreshold,
  shippingEnabled,
}: NavbarProps) {
  const { totalCount, setIsCartOpen } = useCart();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const mainLinks = [
    { label: "Shop All", href: "/shop" },
    { label: "Pre Order", href: "/#pre-order" },
    { label: "New Arrival", href: "/#new-arrivals" },
    { label: "Best Seller", href: "/#best-seller" },
  ];

  const categoryLinks = PRODUCT_CATEGORIES.filter((c) => c !== "Photocard").map((cat) => ({
    label: CATEGORY_METADATA[cat]?.label || cat,
    href: `/shop?category=${cat}`,
  }));

  const supportLinks = [
    { label: "How to Order", href: "/how-to-order" },
    { label: "Reviews", href: "/reviews" },
    { label: "Track Order", href: "/track-order" },
  ];

  return (
    <>
      <header className="sticky top-0 z-40 bg-plum text-white border-b border-plum-hover">
        <div className="max-w-6xl mx-auto px-3 sm:px-4 h-16 grid grid-cols-[auto_1fr_auto] md:grid-cols-3 items-center">
          {/* Left: Mobile Hamburger Menu / Desktop Nav */}
          <div className="justify-self-start flex items-center">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              aria-label="Open navigation menu"
              className="md:hidden -ml-1 w-10 h-10 flex items-center justify-center rounded-xl text-white hover:bg-plum-hover transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pink"
            >
              <Menu className="w-5 h-5" />
            </button>

            <nav className="hidden md:flex items-center gap-5 text-sm font-medium">
              {mainLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-white/85 hover:text-white transition-colors relative py-1 whitespace-nowrap hover:after:w-full after:w-0 after:h-0.5 after:bg-pink after:absolute after:bottom-0 after:left-0 after:transition-all"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>

          {/* Center: Brand Logo */}
          <div className="justify-self-center flex items-center justify-center">
            <BrandLogo logoUrl={brandLogoUrl} size="md" />
          </div>

          {/* Right: Track Order (User) & Cart Icons */}
          <div className="justify-self-end flex items-center gap-0.5 sm:gap-1.5 -mr-1 sm:-mr-2">
            <Link
              href="/track-order"
              aria-label="Track your order"
              title="Track Order"
              className="w-10 h-10 sm:w-11 sm:h-11 flex items-center justify-center rounded-xl text-white hover:bg-plum-hover transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pink"
            >
              <User className="w-5 h-5 sm:w-[21px] sm:h-[21px]" />
            </Link>

            <button
              type="button"
              onClick={() => setIsCartOpen(true)}
              aria-label="Open shopping cart"
              className="relative w-10 h-10 sm:w-11 sm:h-11 flex items-center justify-center rounded-xl text-white hover:bg-plum-hover transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pink"
            >
              <ShoppingBag className="w-5 h-5 sm:w-[22px] sm:h-[22px]" />
              {totalCount > 0 && (
                <span
                  suppressHydrationWarning
                  className="absolute top-0.5 right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-pink text-white text-[10px] font-bold leading-none flex items-center justify-center ring-2 ring-plum"
                >
                  {totalCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Left Mobile Navigation Drawer */}
        <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
          <SheetContent side="left" className="bg-plum text-white border-plum-hover p-5 sm:p-6 flex flex-col justify-between overflow-y-auto">
            <div className="space-y-5">
              <SheetHeader className="text-left pb-4 border-b border-plum-hover">
                <SheetTitle>
                  <BrandLogo logoUrl={brandLogoUrl} size="sm" />
                </SheetTitle>
              </SheetHeader>

              {/* Primary Sections */}
              <div className="flex flex-col">
                {mainLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className="mv-heading-italic text-base text-white hover:text-pink transition-colors py-2.5 border-b border-plum-hover/40"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>

              {/* Shop by Category */}
              <div className="space-y-2.5 pt-1">
                <span className="text-[11px] font-bold tracking-widest uppercase text-blush/80 block">
                  Categories
                </span>
                <div className="grid grid-cols-2 gap-2">
                  {categoryLinks.map((cat) => (
                    <Link
                      key={cat.href}
                      href={cat.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className="px-3 py-2 rounded-xl bg-plum-hover/60 hover:bg-pink text-white text-xs font-semibold uppercase tracking-wide transition-colors text-center border border-white/10"
                    >
                      {cat.label}
                    </Link>
                  ))}
                </div>
              </div>

              {/* Customer Support Links */}
              <div className="flex flex-col pt-1 border-t border-plum-hover/50">
                {supportLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-sm font-medium text-white/85 hover:text-white transition-colors py-2 border-b border-plum-hover/30"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>

            <div className="pb-safe pt-5">
              <Button
                type="button"
                className="w-full bg-pink hover:bg-pink/90 text-white font-semibold h-12 rounded-xl text-sm"
                onClick={() => {
                  setMobileMenuOpen(false);
                  setIsCartOpen(true);
                }}
              >
                <ShoppingBag className="w-4 h-4 mr-2" />
                <span suppressHydrationWarning>View Cart ({totalCount})</span>
              </Button>
            </div>
          </SheetContent>
        </Sheet>
      </header>

      {/* Cart Drawer Component */}
      <CartDrawer
        freeShippingThreshold={freeShippingThreshold}
        shippingEnabled={shippingEnabled}
      />
    </>
  );
}
