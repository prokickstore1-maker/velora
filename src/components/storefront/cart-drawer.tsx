"use client";

import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/context/cart-context";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { ShoppingBag, Plus, Minus, Trash2, ArrowRight } from "lucide-react";

interface CartDrawerProps {
  freeShippingThreshold?: number | null;
  shippingEnabled?: boolean;
}

export function CartDrawer({
  freeShippingThreshold,
  shippingEnabled,
}: CartDrawerProps) {
  const {
    items,
    isCartOpen,
    setIsCartOpen,
    removeItem,
    updateQuantity,
    totalCount,
    subtotalRm,
    subtotalFormatted,
  } = useCart();

  const progressPercent =
    freeShippingThreshold && shippingEnabled && freeShippingThreshold > 0
      ? Math.min(100, Math.round((subtotalRm / freeShippingThreshold) * 100))
      : 0;

  const amountNeeded =
    freeShippingThreshold && shippingEnabled
      ? Math.max(0, freeShippingThreshold - subtotalRm)
      : 0;

  return (
    <Sheet open={isCartOpen} onOpenChange={setIsCartOpen}>
      <SheetContent className="w-full sm:max-w-md flex flex-col p-0 bg-white">
        <SheetHeader className="px-4 sm:px-6 py-4 pr-12 border-b border-border text-left">
          <SheetTitle className="font-heading font-extrabold italic uppercase tracking-tight text-plum flex items-center gap-2 text-base sm:text-lg">
            <ShoppingBag className="w-5 h-5 text-pink shrink-0" />
            <span>Your Cart ({totalCount})</span>
          </SheetTitle>
        </SheetHeader>

        {/* Free Shipping Progress bar if active */}
        {shippingEnabled && freeShippingThreshold && freeShippingThreshold > 0 && (
          <div className="bg-blush-soft px-4 sm:px-6 py-3 border-b border-blush/60">
            {amountNeeded > 0 ? (
              <p className="text-xs text-plum font-medium leading-normal">
                Add <span className="font-bold text-pink whitespace-nowrap">RM {amountNeeded.toFixed(2)}</span> more to enjoy Free Shipping!
              </p>
            ) : (
              <p className="text-xs font-semibold text-emerald-700 flex items-center gap-1.5">
                🎉 Congratulations! You qualify for Free Shipping.
              </p>
            )}
            <div className="w-full bg-blush h-2 rounded-full mt-2 overflow-hidden">
              <div
                className="bg-pink h-full transition-all duration-300 rounded-full"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        )}

        {/* Cart Item List */}
        <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 space-y-3">
          {items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center py-12 text-plum-muted space-y-3">
              <div className="w-16 h-16 rounded-full bg-blush flex items-center justify-center text-plum">
                <ShoppingBag className="w-8 h-8 opacity-60" />
              </div>
              <p className="font-heading font-bold text-plum text-lg uppercase italic">Your cart is empty</p>
              <p className="text-sm max-w-xs text-plum-muted">
                Explore our collection and add your favorite K-Pop albums and photocards.
              </p>
              <Button
                variant="outline"
                className="mt-4 border-plum text-plum hover:bg-blush/30"
                onClick={() => setIsCartOpen(false)}
                asChild
              >
                <Link href="/shop">Start Shopping</Link>
              </Button>
            </div>
          ) : (
            items.map((item) => (
              <div
                key={item.versionId}
                className="flex items-start gap-3 p-3 rounded-xl border border-border bg-ivory/40 hover:bg-ivory/80 transition-colors"
              >
                {/* Photo 4:5 aspect ratio with fixed height so it never stretches */}
                <div className="relative w-[72px] h-[90px] sm:w-20 sm:h-[100px] rounded-lg overflow-hidden bg-white border border-border shrink-0">
                  <Image
                    src={item.imageUrl}
                    alt={item.productName}
                    fill
                    sizes="80px"
                    className="object-cover"
                  />
                </div>

                {/* Info */}
                <div className="flex-1 flex flex-col justify-between min-w-0">
                  <div>
                    <h4 className="font-heading font-semibold text-xs sm:text-sm text-plum line-clamp-2 leading-snug">
                      {item.productName}
                    </h4>
                    <span className="inline-block max-w-full truncate text-[11px] font-medium text-pink bg-blush/60 px-2 py-0.5 rounded mt-1">
                      {item.versionName}
                    </span>
                    <p className="font-heading font-bold text-sm text-plum whitespace-nowrap mt-1">
                      RM {parseFloat(item.priceRm).toFixed(2)}
                    </p>
                  </div>

                  {/* Quantity Stepper & Remove button */}
                  <div className="flex items-center justify-between gap-2 mt-2.5">
                    <div className="inline-flex items-center border border-border rounded-lg bg-white h-8 overflow-hidden shrink-0">
                      <button
                        type="button"
                        aria-label="Decrease quantity"
                        onClick={() => updateQuantity(item.versionId, item.quantity - 1)}
                        className="w-8 h-full flex items-center justify-center text-plum hover:bg-blush/40 transition-colors"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="min-w-[30px] px-1 text-center text-xs font-semibold text-plum select-none border-x border-border/50">
                        {item.quantity}
                      </span>
                      <button
                        type="button"
                        aria-label="Increase quantity"
                        onClick={() => updateQuantity(item.versionId, item.quantity + 1)}
                        disabled={item.quantity >= item.maxStock}
                        className="w-8 h-full flex items-center justify-center text-plum hover:bg-blush/40 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <button
                      type="button"
                      aria-label="Remove item"
                      onClick={() => removeItem(item.versionId)}
                      className="w-8 h-8 flex items-center justify-center text-plum-muted hover:text-destructive hover:bg-red-50 transition-colors rounded-lg shrink-0"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer with Checkout CTA */}
        {items.length > 0 && (
          <SheetFooter className="p-4 sm:p-6 pb-safe border-t border-border bg-white flex flex-col gap-2.5">
            <div className="flex items-center justify-between text-base font-medium">
              <span className="text-plum-muted text-sm sm:text-base">Subtotal</span>
              <span className="font-heading font-extrabold text-lg sm:text-xl text-plum whitespace-nowrap">
                {subtotalFormatted}
              </span>
            </div>

            <p className="text-[11px] text-plum-muted leading-relaxed">
              Shipping calculated at checkout.
            </p>

            <Button
              asChild
              size="lg"
              className="w-full bg-plum hover:bg-plum-hover text-white font-semibold text-sm h-12 rounded-xl shadow-sm mt-1"
              onClick={() => setIsCartOpen(false)}
            >
              <Link href="/checkout" className="flex items-center justify-center gap-2">
                Proceed to Checkout
                <ArrowRight className="w-4 h-4" />
              </Link>
            </Button>
          </SheetFooter>
        )}
      </SheetContent>
    </Sheet>
  );
}
