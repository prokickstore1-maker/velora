"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/context/cart-context";
import { placeOrderAction } from "@/app/actions/checkout";
import type { StoreSettings } from "@/db/schema";
import { evaluateStorePaymentStatus } from "@/lib/store-hours";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { ShoppingBag, ArrowLeft, ArrowRight, Loader2, Clock, MessageCircle } from "lucide-react";

const MALAYSIAN_STATES = [
  "Johor",
  "Kedah",
  "Kelantan",
  "Melaka",
  "Negeri Sembilan",
  "Pahang",
  "Perak",
  "Perlis",
  "Pulau Pinang",
  "Sabah",
  "Sarawak",
  "Selangor",
  "Terengganu",
  "W.P. Kuala Lumpur",
  "W.P. Labuan",
  "W.P. Putrajaya",
];

interface CheckoutFormProps {
  shippingEnabled: boolean;
  flatShippingFeeRm: number;
  freeShippingThreshold: number | null;
  settings?: StoreSettings | null;
}

export function CheckoutForm({
  shippingEnabled,
  flatShippingFeeRm,
  freeShippingThreshold,
  settings,
}: CheckoutFormProps) {
  const router = useRouter();
  const { items, subtotalRm, clearCart } = useCart();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [now, setNow] = useState<Date>(() => new Date());

  // Tick every 30s so checkout auto-closes live at 10:00 PM MYT without page reload
  useEffect(() => {
    const timer = setInterval(() => {
      setNow(new Date());
    }, 30000);
    return () => clearInterval(timer);
  }, []);

  const storeStatus = evaluateStorePaymentStatus(settings, now);

  // Form State
  const [customerName, setCustomerName] = useState("");
  const [customerWhatsapp, setCustomerWhatsapp] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [addressLine1, setAddressLine1] = useState("");
  const [addressLine2, setAddressLine2] = useState("");
  const [postcode, setPostcode] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("Selangor");
  const [notes, setNotes] = useState("");

  // Calculate dynamic shipping fee
  const qualifiesForFreeShipping =
    freeShippingThreshold !== null && shippingEnabled && subtotalRm >= freeShippingThreshold;

  const currentShippingFee = !shippingEnabled
    ? 0
    : qualifiesForFreeShipping
    ? 0
    : flatShippingFeeRm;

  const grandTotalRm = subtotalRm + currentShippingFee;

  if (items.length === 0) {
    return (
      <div className="py-20 text-center bg-white rounded-2xl border border-border p-8 max-w-lg mx-auto space-y-4">
        <div className="w-16 h-16 rounded-full bg-blush flex items-center justify-center mx-auto text-plum">
          <ShoppingBag className="w-8 h-8 opacity-60" />
        </div>
        <h2 className="mv-heading-italic text-2xl text-plum uppercase">Your cart is empty</h2>
        <p className="text-sm text-plum-muted">
          Please add items to your cart before proceeding to checkout.
        </p>
        <Button asChild className="bg-plum hover:bg-plum-hover text-white">
          <Link href="/shop">Browse Catalog</Link>
        </Button>
      </div>
    );
  }

  // If Store Checkout is Closed (After 10:00 PM MYT or awaiting daily 10:00 AM bank account upload)
  if (!storeStatus.isOpen) {
    const cleanWa = settings?.adminWhatsappNumber
      ? settings.adminWhatsappNumber.replace(/\D/g, "")
      : "";

    const itemLines = items
      .map(
        (item, idx) =>
          `${idx + 1}. ${item.productName} (${item.versionName}) x${item.quantity} — RM ${(
            parseFloat(item.priceRm) * item.quantity
          ).toFixed(2)}`
      )
      .join("\n");

    const waMessage = [
      "Hello Myvelora Store! 👋",
      "Website checkout is currently closed, so I would like to place my order directly via WhatsApp:",
      "",
      itemLines,
      "",
      `Subtotal: RM ${subtotalRm.toFixed(2)}`,
      shippingEnabled
        ? `Estimated Shipping: ${
            currentShippingFee === 0 ? "FREE" : `RM ${currentShippingFee.toFixed(2)}`
          }`
        : null,
      `Estimated Total: RM ${grandTotalRm.toFixed(2)}`,
      "",
      "Please share your active payment details so I can complete my order. Thank you!",
    ]
      .filter((line) => line !== null)
      .join("\n");

    const whatsappOrderHref = cleanWa
      ? `https://wa.me/${cleanWa}?text=${encodeURIComponent(waMessage)}`
      : null;

    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <Card className="bg-white border border-border ring-0 shadow-xs overflow-hidden">
          <div className="bg-plum text-white p-6 sm:p-8 text-center space-y-3">
            <div className="w-14 h-14 rounded-full bg-white/15 flex items-center justify-center mx-auto text-pink">
              <Clock className="w-7 h-7" />
            </div>
            <span className="inline-block text-[11px] font-bold tracking-widest uppercase bg-pink text-white px-3 py-1 rounded-full">
              Daily Website Checkout: 10:00 AM – 10:00 PM MYT
            </span>
            <h1 className="mv-heading-italic text-2xl sm:text-4xl text-white uppercase">
              STORE IS CLOSED NOW
            </h1>
            <p className="text-xs sm:text-sm text-white/85 max-w-md mx-auto leading-relaxed">
              Our website payment counter closes automatically at 10:00 PM MYT each night and reopens at 10:00 AM MYT once our daily bank account is updated.
            </p>
          </div>

          <CardContent className="p-6 sm:p-8 space-y-6">
            <div className="p-4 rounded-xl bg-blush-soft border border-blush text-center space-y-2">
              <p className="text-xs sm:text-sm font-semibold text-plum">
                Want to secure your items right now?
              </p>
              <p className="text-xs text-plum-muted leading-relaxed">
                You can still place your order directly via WhatsApp! Click the button below and your cart items will be automatically formatted for our admin.
              </p>
            </div>

            {/* Cart Items Preview */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-plum">
                Your Cart Summary ({items.reduce((sum, i) => sum + i.quantity, 0)} items)
              </h3>
              <div className="divide-y divide-border border border-border rounded-xl bg-ivory/40 px-4 py-2 max-h-64 overflow-y-auto">
                {items.map((item) => (
                  <div key={item.versionId} className="py-2.5 flex items-center justify-between gap-3 text-xs">
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-plum truncate">{item.productName}</p>
                      <p className="text-plum-muted text-[11px]">
                        {item.versionName} × {item.quantity}
                      </p>
                    </div>
                    <span className="font-heading font-bold text-plum shrink-0">
                      RM {(parseFloat(item.priceRm) * item.quantity).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between pt-2 text-sm font-bold text-plum">
                <span>Estimated Total</span>
                <span className="font-heading text-lg">RM {grandTotalRm.toFixed(2)}</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              {whatsappOrderHref ? (
                <Button
                  asChild
                  size="lg"
                  className="flex-1 h-12 rounded-xl bg-[#25D366] hover:bg-[#1fb855] text-white font-bold text-sm shadow-sm"
                >
                  <a href={whatsappOrderHref} target="_blank" rel="noopener noreferrer">
                    <MessageCircle className="w-5 h-5 mr-2 fill-current" />
                    Order Directly via WhatsApp
                  </a>
                </Button>
              ) : (
                <p className="text-xs text-center text-plum-muted w-full py-2">
                  Please check back at 10:00 AM MYT when website checkout reopens.
                </p>
              )}

              <Button
                asChild
                variant="outline"
                size="lg"
                className="h-12 rounded-xl border-border text-plum hover:bg-blush/30 text-xs font-semibold"
              >
                <Link href="/shop">
                  <ArrowLeft className="w-4 h-4 mr-1.5" />
                  Back to Catalog
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!customerName.trim() || !customerWhatsapp.trim() || !addressLine1.trim() || !postcode.trim() || !city.trim() || !state) {
      toast.error("Please fill in all required shipping address fields.");
      return;
    }

    if (postcode.trim().length !== 5) {
      toast.error("Malaysia postcode must be exactly 5 digits.");
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        customerName: customerName.trim(),
        customerWhatsapp: customerWhatsapp.trim(),
        customerEmail: customerEmail.trim() || undefined,
        addressLine1: addressLine1.trim(),
        addressLine2: addressLine2.trim() || undefined,
        postcode: postcode.trim(),
        city: city.trim(),
        state,
        notes: notes.trim() || undefined,
        items: items.map((i) => ({
          productVersionId: i.versionId,
          quantity: i.quantity,
        })),
      };

      const res = await placeOrderAction(payload);

      if (!res.success || !res.orderCode) {
        toast.error(res.error || "Failed to place order.");
        setIsSubmitting(false);
        return;
      }

      toast.success("Order created! Proceeding to payment step...");
      clearCart();
      router.push(`/orders/${res.orderCode}/payment`);
    } catch (err) {
      console.error("Checkout submission error:", err);
      toast.error("A network error occurred. Please try again.");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10 items-start">
      {/* Left Column: 5-Step Order Step 3 Form */}
      <Card className="lg:col-span-7 bg-white border border-border ring-0 shadow-xs">
        {/* Card Header responsive stack on mobile */}
        <div className="p-4 sm:p-6 border-b border-border flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          <div>
            <p className="text-xs font-bold tracking-widest text-pink uppercase">
              Step 03 of 05
            </p>
            <h2 className="mv-heading-italic text-lg sm:text-2xl text-plum">
              SHIPPING DETAILS
            </h2>
          </div>
          <div>
            <Button asChild variant="ghost" size="xs" className="text-plum-muted hover:text-plum -ml-2 sm:ml-0 h-8">
              <Link href="/shop">
                <ArrowLeft className="w-3.5 h-3.5 mr-1" />
                Back to Shop
              </Link>
            </Button>
          </div>
        </div>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Recipient Full Name */}
            <div className="space-y-1.5">
              <Label htmlFor="customerName" className="text-xs font-bold text-plum uppercase">
                Full Name *
              </Label>
              <Input
                id="customerName"
                type="text"
                required
                placeholder="Recipient full name"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="h-12 text-base rounded-xl bg-background border-border"
              />
            </div>

            {/* WhatsApp & Email (2 columns) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="customerWhatsapp" className="text-xs font-bold text-plum uppercase">
                  WhatsApp Phone Number *
                </Label>
                <Input
                  id="customerWhatsapp"
                  type="tel"
                  inputMode="tel"
                  required
                  placeholder="e.g. 0123456789"
                  value={customerWhatsapp}
                  onChange={(e) => setCustomerWhatsapp(e.target.value)}
                  className="h-12 text-base rounded-xl bg-background border-border"
                />
                <p className="text-[11px] text-plum-muted">
                  Used for order confirmation & tracking.
                </p>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="customerEmail" className="text-xs font-bold text-plum uppercase">
                  Email Address (Optional)
                </Label>
                <Input
                  id="customerEmail"
                  type="email"
                  placeholder="name@email.com"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  className="h-12 text-base rounded-xl bg-background border-border"
                />
              </div>
            </div>

            {/* Address Line 1 */}
            <div className="space-y-1.5">
              <Label htmlFor="addressLine1" className="text-xs font-bold text-plum uppercase">
                Street Address *
              </Label>
              <Input
                id="addressLine1"
                type="text"
                required
                placeholder="House/Unit No., Building, Street Name"
                value={addressLine1}
                onChange={(e) => setAddressLine1(e.target.value)}
                className="h-12 text-base rounded-xl bg-background border-border"
              />
            </div>

            {/* Address Line 2 */}
            <div className="space-y-1.5">
              <Label htmlFor="addressLine2" className="text-xs font-bold text-plum uppercase">
                Address Line 2 (Optional)
              </Label>
              <Input
                id="addressLine2"
                type="text"
                placeholder="Apartment, residential area, or landmark"
                value={addressLine2}
                onChange={(e) => setAddressLine2(e.target.value)}
                className="h-12 text-base rounded-xl bg-background border-border"
              />
            </div>

            {/* Postcode, City, State Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="postcode" className="text-xs font-bold text-plum uppercase">
                  Postcode *
                </Label>
                <Input
                  id="postcode"
                  type="text"
                  inputMode="numeric"
                  maxLength={5}
                  required
                  placeholder="50450"
                  value={postcode}
                  onChange={(e) => setPostcode(e.target.value)}
                  className="h-12 text-base rounded-xl bg-background border-border"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="city" className="text-xs font-bold text-plum uppercase">
                  City *
                </Label>
                <Input
                  id="city"
                  type="text"
                  required
                  placeholder="City"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="h-12 text-base rounded-xl bg-background border-border"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="state" className="text-xs font-bold text-plum uppercase">
                  State *
                </Label>
                <Select value={state} onValueChange={(val) => setState(val || "Selangor")}>
                  <SelectTrigger id="state" className="w-full h-12 text-base rounded-xl bg-background border-border">
                    <SelectValue placeholder="Select State" />
                  </SelectTrigger>
                  <SelectContent className="max-h-64">
                    {MALAYSIAN_STATES.map((st) => (
                      <SelectItem key={st} value={st}>
                        {st}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Order Notes */}
            <div className="space-y-1.5">
              <Label htmlFor="notes" className="text-xs font-bold text-plum uppercase">
                Order Notes (Optional)
              </Label>
              <Textarea
                id="notes"
                placeholder="Packing requests or delivery remarks..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="min-h-20 text-base rounded-xl bg-background border-border resize-none"
              />
            </div>

            <div className="pt-2">
              <Button
                type="submit"
                size="lg"
                disabled={isSubmitting}
                className="w-full bg-plum hover:bg-plum-hover text-white font-semibold text-sm sm:text-base h-12 rounded-xl shadow-sm flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Placing Order...</span>
                  </>
                ) : (
                  <>
                    <span>Continue to Payment</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Right Column: Order Summary */}
      <Card className="lg:col-span-5 bg-white border border-border ring-0 shadow-xs">
        <div className="p-4 sm:p-6 border-b border-border flex items-center justify-between gap-2">
          <h2 className="font-heading font-extrabold italic text-lg sm:text-xl text-plum uppercase">
            Order Summary
          </h2>
          <Badge variant="secondary" className="bg-blush/60 text-plum font-semibold text-xs shrink-0">
            {items.reduce((s, i) => s + i.quantity, 0)} items
          </Badge>
        </div>

        <CardContent className="space-y-4">
          {/* Item List */}
          <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
            {items.map((item) => (
              <div key={item.versionId} className="flex items-start gap-3 text-xs py-2.5 border-b border-border/40 last:border-none">
                <div className="relative w-12 h-[60px] rounded-md overflow-hidden bg-ivory border border-border shrink-0">
                  <Image src={item.imageUrl} alt={item.productName} fill sizes="48px" className="object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-plum line-clamp-2 leading-snug">{item.productName}</p>
                  <p className="text-pink font-medium text-[11px] truncate mt-0.5">{item.versionName}</p>
                  <p className="text-plum-muted mt-0.5">Qty: {item.quantity}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="font-heading font-bold text-plum whitespace-nowrap">
                    RM {(parseFloat(item.priceRm) * item.quantity).toFixed(2)}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <Separator />

          {/* Price Breakdown */}
          <div className="space-y-2.5 text-xs text-plum">
            <div className="flex items-center justify-between gap-2">
              <span className="text-plum-muted">Subtotal</span>
              <span className="font-semibold whitespace-nowrap">RM {subtotalRm.toFixed(2)}</span>
            </div>

            <div className="flex items-center justify-between gap-2">
              <span className="text-plum-muted">Shipping Fee</span>
              {qualifiesForFreeShipping ? (
                <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 uppercase text-[10px] font-bold">
                  Free Shipping
                </Badge>
              ) : shippingEnabled ? (
                <span className="font-semibold whitespace-nowrap">RM {currentShippingFee.toFixed(2)}</span>
              ) : (
                <span className="text-plum-muted">Not applicable</span>
              )}
            </div>

            <Separator />

            <div className="pt-1 flex items-center justify-between gap-2">
              <span className="font-heading font-bold text-sm text-plum uppercase">Total</span>
              <span className="font-heading font-extrabold text-xl sm:text-2xl text-plum whitespace-nowrap">
                RM {grandTotalRm.toFixed(2)}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
