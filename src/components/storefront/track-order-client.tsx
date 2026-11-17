"use client";

import { useState } from "react";
import Link from "next/link";
import type { Order, OrderItem } from "@/db/schema";
import { trackOrderAction } from "@/app/actions/track-order";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  Search,
  Truck,
  Copy,
  Loader2,
} from "lucide-react";

export function TrackOrderClient() {
  const [orderCode, setOrderCode] = useState("");
  const [last4Phone, setLast4Phone] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [orderResult, setOrderResult] = useState<(Order & { items: OrderItem[] }) | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!orderCode.trim() || !last4Phone.trim()) {
      toast.error("Please enter both your Order Code and the last 4 digits of your phone number.");
      return;
    }

    if (last4Phone.trim().length !== 4) {
      toast.error("Please enter exactly 4 digits for your phone verification.");
      return;
    }

    setIsSearching(true);
    setOrderResult(null);

    try {
      const res = await trackOrderAction(orderCode.trim(), last4Phone.trim());
      if (!res.success || !res.order) {
        toast.error(res.error || "Order not found. Please verify your details.");
        setIsSearching(false);
        return;
      }

      setOrderResult(res.order as Order & { items: OrderItem[] });
      toast.success("Order status retrieved!");
    } catch (err) {
      console.error("Order tracking error:", err);
      toast.error("Failed to lookup order. Please try again.");
    } finally {
      setIsSearching(false);
    }
  };

  const copyTracking = (num: string) => {
    navigator.clipboard.writeText(num);
    toast.success("Tracking number copied to clipboard!");
  };

  const getStatusBadge = (status: Order["status"]) => {
    switch (status) {
      case "pending_payment":
        return <Badge className="bg-amber-100 text-amber-800 border-none">Pending Payment</Badge>;
      case "payment_submitted":
        return <Badge className="bg-blue-100 text-blue-800 border-none">Verifying Payment</Badge>;
      case "verified":
        return <Badge className="bg-indigo-100 text-indigo-800 border-none">Payment Verified</Badge>;
      case "packing":
        return <Badge className="bg-purple-100 text-purple-800 border-none">Packing Order</Badge>;
      case "shipped":
        return <Badge className="bg-emerald-100 text-emerald-800 border-none">Shipped & In Transit</Badge>;
      case "completed":
        return <Badge className="bg-emerald-600 text-white border-none">Completed</Badge>;
      case "cancelled":
        return <Badge className="bg-rose-100 text-rose-800 border-none">Cancelled</Badge>;
      default:
        return <Badge className="bg-zinc-100 text-zinc-800 border-none">{status}</Badge>;
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center space-y-2">
        <span className="text-xs font-bold tracking-widest text-pink uppercase block">
          Order Status
        </span>
        <h1 className="mv-heading-italic text-3xl sm:text-4xl text-plum">
          TRACK YOUR SHIPMENT
        </h1>
        <p className="text-sm text-plum-muted">
          Check real-time fulfillment status, packing updates, and tracking numbers.
        </p>
      </div>

      {/* Lookup Form */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-border shadow-xs">
        <form onSubmit={handleSearch} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="orderCode" className="text-xs font-bold text-plum uppercase">
              Order Code *
            </Label>
            <Input
              id="orderCode"
              type="text"
              required
              placeholder="e.g. MV-20261115-8492"
              value={orderCode}
              onChange={(e) => setOrderCode(e.target.value)}
              className="h-12 text-base rounded-xl bg-background border-border font-mono uppercase"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="last4" className="text-xs font-bold text-plum uppercase">
              Last 4 Digits of WhatsApp Phone *
            </Label>
            <Input
              id="last4"
              type="text"
              inputMode="numeric"
              maxLength={4}
              required
              placeholder="e.g. 6789"
              value={last4Phone}
              onChange={(e) => setLast4Phone(e.target.value)}
              className="h-12 text-base rounded-xl bg-background border-border font-mono"
            />
            <p className="text-[11px] text-plum-muted">
              Verification security to protect your privacy and address details.
            </p>
          </div>

          <div className="pt-2">
            <Button
              type="submit"
              size="lg"
              disabled={isSearching}
              className="w-full bg-plum hover:bg-plum-hover text-white font-semibold text-base h-12 rounded-xl flex items-center justify-center gap-2"
            >
              {isSearching ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Searching Order...
                </>
              ) : (
                <>
                  <Search className="w-4 h-4" />
                  Track Order
                </>
              )}
            </Button>
          </div>
        </form>
      </div>

      {/* Result Card */}
      {orderResult && (
        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-border shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-border gap-2">
            <div>
              <span className="text-[11px] text-plum-muted uppercase font-bold block">
                Order Result
              </span>
              <span className="font-mono font-bold text-lg text-plum">
                {orderResult.orderCode}
              </span>
            </div>
            <div>{getStatusBadge(orderResult.status)}</div>
          </div>

          {/* Shipping / Courier Info if shipped */}
          {orderResult.status === "shipped" && orderResult.trackingNumber && (
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 space-y-2">
              <div className="flex items-center gap-2 font-bold text-xs uppercase tracking-wider text-emerald-800">
                <Truck className="w-4 h-4" />
                In Transit with {orderResult.courierName || "Courier"}
              </div>
              <div className="flex items-center justify-between pt-1">
                <span className="font-mono font-bold text-base">
                  {orderResult.trackingNumber}
                </span>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => copyTracking(orderResult.trackingNumber!)}
                  className="h-8 text-xs font-semibold bg-white"
                >
                  <Copy className="w-3.5 h-3.5 mr-1" />
                  Copy
                </Button>
              </div>
            </div>
          )}

          {/* Payment Link if pending */}
          {orderResult.status === "pending_payment" && (
            <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="text-xs">
                <p className="font-bold">Payment Not Yet Completed</p>
                <p className="text-amber-700 mt-0.5">Please transfer RM {orderResult.totalRm} and upload your payment slip.</p>
              </div>
              <Button asChild size="sm" className="bg-amber-800 hover:bg-amber-900 text-white shrink-0">
                <Link href={`/orders/${orderResult.orderCode}/payment`}>
                  Complete Payment Now
                </Link>
              </Button>
            </div>
          )}

          {/* Items Summary */}
          <div className="space-y-3">
            <h3 className="font-heading font-bold text-xs uppercase tracking-wider text-plum">
              Order Items ({orderResult.items.length})
            </h3>
            <div className="divide-y divide-border/60">
              {orderResult.items.map((item) => (
                <div key={item.id} className="py-2.5 flex justify-between text-xs sm:text-sm">
                  <div>
                    <span className="font-semibold text-plum">{item.productNameSnapshot}</span>
                    <span className="text-pink ml-2 font-medium">({item.versionNameSnapshot})</span>
                    <span className="text-plum-muted ml-2">x{item.quantity}</span>
                  </div>
                  <span className="font-heading font-bold text-plum">
                    RM {parseFloat(item.lineTotalRm).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Delivery Address & Contact */}
          <div className="pt-4 border-t border-border grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <span className="font-bold uppercase tracking-wider text-[10px] text-plum-muted block mb-1">
                Recipient Details
              </span>
              <p className="font-semibold text-plum">{orderResult.customerName}</p>
              <p className="text-plum-muted font-mono">+{orderResult.customerWhatsapp}</p>
            </div>

            <div>
              <span className="font-bold uppercase tracking-wider text-[10px] text-plum-muted block mb-1">
                Destination Address
              </span>
              <p className="text-plum-muted">
                {orderResult.addressLine1}, {orderResult.postcode} {orderResult.city}, {orderResult.state}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
