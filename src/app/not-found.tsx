import Link from "next/link";
import { BrandLogo } from "@/components/common/brand-logo";
import { Button } from "@/components/ui/button";
import { ShoppingBag, Home, Search } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-dvh flex flex-col bg-ivory text-foreground">
      <header className="bg-plum text-white border-b border-plum-hover h-16 flex items-center justify-center px-4">
        <BrandLogo size="md" />
      </header>

      <main className="flex-1 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl border border-border p-7 sm:p-10 text-center shadow-xs space-y-5">
          <div className="inline-flex items-center justify-center px-3 py-1 rounded-full bg-blush/60 text-plum text-[11px] font-bold tracking-widest uppercase">
            Error 404
          </div>

          <div className="space-y-2">
            <h1 className="mv-heading-italic text-3xl sm:text-4xl text-plum">
              PAGE NOT FOUND
            </h1>
            <p className="text-xs sm:text-sm text-plum-muted leading-relaxed">
              The album, merchandise, or page you are looking for might have been moved or is no longer available.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-2.5 pt-2">
            <Button
              asChild
              className="flex-1 bg-plum hover:bg-plum-hover text-white h-11 rounded-xl text-xs font-semibold"
            >
              <Link href="/shop">
                <ShoppingBag className="w-4 h-4 mr-1.5" />
                <span>Explore Catalog</span>
              </Link>
            </Button>

            <Button
              asChild
              variant="outline"
              className="flex-1 border-border text-plum hover:bg-blush/30 h-11 rounded-xl text-xs font-semibold"
            >
              <Link href="/">
                <Home className="w-4 h-4 mr-1.5" />
                <span>Back to Home</span>
              </Link>
            </Button>
          </div>

          <div className="pt-3 border-t border-border/70">
            <Link
              href="/track-order"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-plum-muted hover:text-pink transition-colors"
            >
              <Search className="w-3.5 h-3.5" />
              <span>Looking for your parcel? Track Order</span>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
