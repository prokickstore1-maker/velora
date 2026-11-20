"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { BrandLogo } from "@/components/common/brand-logo";
import { useCart } from "@/context/cart-context";
import { useWishlist } from "@/lib/wishlist";
import { CartDrawer } from "./cart-drawer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ShoppingBag, Menu, User, Search, Heart, Sparkles, ArrowRight } from "lucide-react";
import { PRODUCT_CATEGORIES, CATEGORY_METADATA } from "@/lib/constants";

interface NavbarProps {
  brandLogoUrl?: string | null;
  freeShippingThreshold?: number | null;
  shippingEnabled?: boolean;
}

const POPULAR_SEARCH_ARTISTS = [
  "BTS",
  "SEVENTEEN",
  "Stray Kids",
  "NCT",
  "ENHYPEN",
  "TWICE",
  "aespa",
  "NewJeans",
  "TXT",
  "LE SSERAFIM",
  "BLACKPINK",
  "IVE",
];

export function Navbar({
  brandLogoUrl,
  freeShippingThreshold,
  shippingEnabled,
}: NavbarProps) {
  const router = useRouter();
  const { totalCount, setIsCartOpen } = useCart();
  const { count: wishlistCount } = useWishlist();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [quickQuery, setQuickQuery] = useState("");

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
    { label: "My Wishlist", href: "/wishlist" },
    { label: "Track Order", href: "/track-order" },
  ];

  const handleQuickSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = quickQuery.trim();
    setSearchOpen(false);
    if (trimmed) {
      router.push(`/shop?q=${encodeURIComponent(trimmed)}`);
    } else {
      router.push("/shop");
    }
  };

  return (
    <>
      <header className="sticky top-0 z-40 bg-plum text-white border-b border-plum-hover">
        <div className="max-w-6xl mx-auto px-3 sm:px-4 h-16 grid grid-cols-[1fr_auto_1fr] items-center">
          {/* Left: Mobile Hamburger Menu / Desktop Nav */}
          <div className="justify-self-start flex items-center gap-1">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              aria-label="Open navigation menu"
              className="md:hidden -ml-1 w-10 h-10 flex items-center justify-center rounded-xl text-white hover:bg-plum-hover transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pink"
            >
              <Menu className="w-5 h-5" />
            </button>

            <button
              type="button"
              onClick={() => setSearchOpen(true)}
              aria-label="Search products"
              className="md:hidden w-10 h-10 flex items-center justify-center rounded-xl text-white hover:bg-plum-hover transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pink"
            >
              <Search className="w-5 h-5" />
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

          {/* Right: Search (Desktop), Wishlist, Track Order, & Cart Icons */}
          <div className="justify-self-end flex items-center gap-0.5 sm:gap-1 -mr-1 sm:-mr-2">
            <button
              type="button"
              onClick={() => setSearchOpen(true)}
              aria-label="Search products"
              title="Search Catalog"
              className="hidden md:flex w-10 h-10 sm:w-11 sm:h-11 items-center justify-center rounded-xl text-white hover:bg-plum-hover transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pink cursor-pointer"
            >
              <Search className="w-5 h-5" />
            </button>

            <Link
              href="/wishlist"
              aria-label="View wishlist"
              title="My Wishlist"
              className="relative w-10 h-10 sm:w-11 sm:h-11 flex items-center justify-center rounded-xl text-white hover:bg-plum-hover transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pink"
            >
              <Heart className="w-5 h-5" />
              {wishlistCount > 0 && (
                <span
                  suppressHydrationWarning
                  className="absolute top-1 right-1 min-w-[16px] h-[16px] px-1 rounded-full bg-pink text-white text-[9px] font-bold leading-none flex items-center justify-center ring-2 ring-plum"
                >
                  {wishlistCount}
                </span>
              )}
            </Link>

            <Link
              href="/track-order"
              aria-label="Track your order"
              title="Track Order"
              className="hidden sm:flex w-10 h-10 sm:w-11 sm:h-11 items-center justify-center rounded-xl text-white hover:bg-plum-hover transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pink"
            >
              <User className="w-5 h-5 sm:w-[21px] sm:h-[21px]" />
            </Link>

            <button
              type="button"
              onClick={() => setIsCartOpen(true)}
              aria-label="Open shopping cart"
              className="relative w-10 h-10 sm:w-11 sm:h-11 flex items-center justify-center rounded-xl text-white hover:bg-plum-hover transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pink cursor-pointer"
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
          <SheetContent side="left" className="bg-plum text-white border-plum-hover p-5 sm:p-6 flex flex-col justify-between overflow-y-auto w-[85vw] max-w-xs">
            <div className="space-y-5">
              <SheetHeader className="text-left pb-4 border-b border-plum-hover">
                <SheetTitle>
                  <BrandLogo logoUrl={brandLogoUrl} size="sm" />
                </SheetTitle>
              </SheetHeader>

              {/* Quick Mobile Search Trigger */}
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  setSearchOpen(true);
                }}
                className="w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl bg-plum-hover/80 border border-white/15 text-white/80 text-xs font-medium hover:text-white transition-colors"
              >
                <Search className="w-4 h-4 text-pink shrink-0" />
                <span>Search album, lightstick, or artist...</span>
              </button>

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

              {/* Popular Artists Quick Tap */}
              <div className="space-y-2 pt-1">
                <span className="text-[11px] font-bold tracking-widest uppercase text-blush/80 block">
                  Popular Artists
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {POPULAR_SEARCH_ARTISTS.slice(0, 8).map((artist) => (
                    <Link
                      key={artist}
                      href={`/shop?artist=${encodeURIComponent(artist)}`}
                      onClick={() => setMobileMenuOpen(false)}
                      className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-pink text-white text-[11px] font-semibold transition-colors"
                    >
                      {artist}
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
                    className="text-sm font-medium text-white/85 hover:text-white transition-colors py-2 border-b border-plum-hover/30 flex items-center justify-between"
                  >
                    <span>{link.label}</span>
                    {link.href === "/wishlist" && wishlistCount > 0 && (
                      <span className="px-1.5 py-0.5 rounded-full bg-pink text-white text-[10px] font-bold">
                        {wishlistCount}
                      </span>
                    )}
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

      {/* Quick Search Modal (Mobile & Desktop Friendly) */}
      <Dialog open={searchOpen} onOpenChange={setSearchOpen}>
        <DialogContent className="max-w-lg bg-white p-5 sm:p-6 rounded-2xl top-[15%] translate-y-0">
          <DialogHeader>
            <DialogTitle className="mv-heading-italic text-lg text-plum flex items-center gap-2">
              <Search className="w-4 h-4 text-pink" />
              <span>SEARCH CATALOG</span>
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleQuickSearchSubmit} className="space-y-4 pt-1">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-plum-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
                <Input
                  type="search"
                  autoFocus
                  placeholder="Search album, lightstick, or artist..."
                  value={quickQuery}
                  onChange={(e) => setQuickQuery(e.target.value)}
                  className="pl-10 h-12 rounded-xl text-base sm:text-sm border-border focus-visible:ring-plum"
                />
              </div>
              <Button
                type="submit"
                className="h-12 px-5 rounded-xl bg-plum hover:bg-plum-hover text-white text-xs font-semibold shrink-0"
              >
                Search
              </Button>
            </div>

            {/* Popular Artists */}
            <div className="space-y-2">
              <span className="inline-flex items-center gap-1 text-[10px] font-bold tracking-widest text-plum-muted uppercase">
                <Sparkles className="w-3 h-3 text-pink" />
                <span>Shop by Artist</span>
              </span>
              <div className="flex flex-wrap gap-1.5">
                {POPULAR_SEARCH_ARTISTS.map((artist) => (
                  <Link
                    key={artist}
                    href={`/shop?artist=${encodeURIComponent(artist)}`}
                    onClick={() => setSearchOpen(false)}
                    className="min-h-9 px-3 py-1.5 rounded-xl bg-ivory hover:bg-plum hover:text-white text-plum border border-border/80 text-xs font-semibold transition-colors inline-flex items-center"
                  >
                    {artist}
                  </Link>
                ))}
              </div>
            </div>

            {/* Quick Categories */}
            <div className="pt-2 border-t border-border/70 flex items-center justify-between">
              <div className="flex flex-wrap gap-1.5">
                {["Album", "Lightstick", "Photobook", "Pre-Order"].map((cat) => (
                  <Link
                    key={cat}
                    href={`/shop?category=${encodeURIComponent(cat)}`}
                    onClick={() => setSearchOpen(false)}
                    className="min-h-8 text-[11px] font-semibold text-plum hover:bg-blush/50 px-2.5 py-1 rounded-lg bg-blush/30 inline-flex items-center transition-colors"
                  >
                    {cat}
                  </Link>
                ))}
              </div>
              <Link
                href="/shop"
                onClick={() => setSearchOpen(false)}
                className="text-xs font-bold text-plum hover:text-plum-hover inline-flex items-center gap-1 shrink-0 ml-2"
              >
                <span>All Products</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Cart Drawer Component */}
      <CartDrawer
        freeShippingThreshold={freeShippingThreshold}
        shippingEnabled={shippingEnabled}
      />
    </>
  );
}
