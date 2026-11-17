"use client";

import Link from "next/link";
import type { Order, OrderItem, StoreSettings } from "@/db/schema";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Card,
  CardHeader,
  CardTitle,
  CardAction,
  CardContent,
} from "@/components/ui/card";
import { CheckCircle2, MessageCircle, Package, ArrowRight, Clock, Copy } from "lucide-react";
import { toast } from "sonner";

interface ConfirmationViewProps {
  order: Order & { items: OrderItem[] };
  settings: StoreSettings | null;
}

export function ConfirmationView({ order, settings }: ConfirmationViewProps) {
  const adminWa = settings?.adminWhatsappNumber?.replace(/\D/g, "") || "60123456789";

  const itemsListText = order.items
    .map((i) => `• ${i.productNameSnapshot} (${i.versionNameSnapshot}) x${i.quantity}`)
    .join("\n");

  const isReceiptSubmitted = Boolean(order.paymentReceiptUrl);
  const statusLabel = isReceiptSubmitted ? "Payment Slip Uploaded" : "Pending Payment Slip";

  const waMessage = `Hello Myvelora Store! I would like to confirm my order.

Order Code: ${order.orderCode}
Name: ${order.customerName}
Delivery to: ${order.city}, ${order.state}

Items:
${itemsListText}

Total Amount: RM ${parseFloat(order.totalRm).toFixed(2)}
Status: ${statusLabel}

Please verify my order. Thank you!`;

  const waUrl = `https://wa.me/${adminWa}?text=${encodeURIComponent(waMessage)}`;

  const copyOrderCode = () => {
    navigator.clipboard.writeText(order.orderCode);
    toast.success("Order code copied");
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Success Banner */}
      <Card className="bg-white border border-border ring-0 shadow-xs text-center">
        <CardContent className="py-6 space-y-4">
          <div className="w-14 h-14 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center mx-auto text-emerald-600">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <span className="text-xs font-bold tracking-widest text-pink uppercase block">
            Step 05 of 05 · Order Placed
          </span>

          <h1 className="mv-heading-italic text-2xl sm:text-4xl text-plum">
            ORDER CONFIRMATION
          </h1>

          <p className="text-xs sm:text-sm text-plum-muted max-w-md mx-auto leading-relaxed">
            Thank you for your order. Please save your Order Code and tap the button below to confirm with our team on WhatsApp.
          </p>

          {/* Order Code Callout with Copy Button */}
          <div className="inline-flex items-center gap-2.5 bg-blush-soft border border-blush px-4 py-2 rounded-xl">
            <span className="text-xs text-plum font-semibold">Order Code:</span>
            <span className="font-mono font-extrabold text-sm sm:text-base text-plum">{order.orderCode}</span>
            <Button
              type="button"
              variant="ghost"
              size="icon-xs"
              onClick={copyOrderCode}
              className="hover:text-pink text-plum"
              title="Copy code"
            >
              <Copy className="w-3.5 h-3.5" />
            </Button>
          </div>

          {/* WhatsApp Confirmation CTA Button */}
          <div className="pt-2 max-w-md mx-auto space-y-2">
            <Button
              asChild
              size="lg"
              className="w-full bg-[#25D366] hover:bg-[#1EBE5D] text-white font-bold text-sm sm:text-base h-12 rounded-xl shadow-md flex items-center justify-center gap-2"
            >
              <a href={waUrl} target="_blank" rel="noopener noreferrer">
                <MessageCircle className="w-5 h-5 fill-current shrink-0" />
                <span>Confirm via WhatsApp</span>
              </a>
            </Button>
            <p className="text-[11px] text-plum-muted">
              Opens WhatsApp with your pre-filled order summary.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Order Summary & Delivery Details */}
      <Card className="bg-white border border-border ring-0 shadow-xs">
        <CardHeader className="border-b border-border items-center">
          <CardTitle className="font-heading font-extrabold italic text-lg sm:text-xl text-plum uppercase">
            Order Details
          </CardTitle>
          <CardAction className="self-center">
            <Badge variant="outline" className="bg-ivory text-plum border-border text-xs font-semibold px-2.5 py-1">
              <Clock className="w-3.5 h-3.5 text-pink mr-1 shrink-0" />
              <span>{order.status === "payment_submitted" ? "Verifying Payment" : "Pending Payment"}</span>
            </Badge>
          </CardAction>
        </CardHeader>

        <CardContent className="space-y-5">
          {/* Items List */}
          <div className="space-y-3">
            {order.items.map((item) => (
              <div key={item.id} className="flex justify-between items-start gap-3 py-2 border-b border-border/40 last:border-none text-xs sm:text-sm">
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-plum leading-snug">{item.productNameSnapshot}</p>
                  <p className="text-pink font-medium text-xs mt-0.5">
                    {item.versionNameSnapshot} <span className="text-plum-muted ml-1">× {item.quantity}</span>
                  </p>
                </div>
                <span className="font-heading font-bold text-plum whitespace-nowrap shrink-0">
                  RM {parseFloat(item.lineTotalRm).toFixed(2)}
                </span>
              </div>
            ))}
          </div>

          <Separator />

          {/* Totals */}
          <div className="space-y-2 text-xs">
            <div className="flex justify-between items-center gap-2 text-plum-muted">
              <span>Subtotal</span>
              <span className="font-semibold text-plum whitespace-nowrap">RM {parseFloat(order.subtotalRm).toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center gap-2 text-plum-muted">
              <span>Shipping</span>
              <span className="font-semibold text-plum whitespace-nowrap">
                {parseFloat(order.shippingFeeRm) === 0 ? "Free Shipping" : `RM ${parseFloat(order.shippingFeeRm).toFixed(2)}`}
              </span>
            </div>
            <Separator />
            <div className="pt-1 flex justify-between items-center gap-2 text-base font-bold text-plum">
              <span className="font-heading uppercase text-sm">Total</span>
              <span className="font-heading font-extrabold text-xl whitespace-nowrap">
                RM {parseFloat(order.totalRm).toFixed(2)}
              </span>
            </div>
          </div>

          <Separator />

          {/* Delivery Address Snapshot */}
          <div>
            <h3 className="font-heading font-bold text-xs uppercase tracking-wider text-plum mb-2">
              Shipping Address
            </h3>
            <p className="text-xs text-plum font-medium">{order.customerName}</p>
            <p className="text-xs text-plum-muted">{order.addressLine1}</p>
            {order.addressLine2 && <p className="text-xs text-plum-muted">{order.addressLine2}</p>}
            <p className="text-xs text-plum-muted">
              {order.postcode} {order.city}, {order.state}
            </p>
            <p className="text-xs text-plum-muted mt-1 font-mono">+{order.customerWhatsapp}</p>
          </div>

          <Separator />

          {/* Action Links */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <Button asChild variant="outline" className="w-full sm:w-auto border-plum text-plum hover:bg-blush/30">
              <Link href="/track-order">
                <Package className="w-4 h-4 mr-2" />
                Track This Order
              </Link>
            </Button>

            <Button asChild className="w-full sm:w-auto bg-plum hover:bg-plum-hover text-white">
              <Link href="/shop" className="flex items-center justify-center gap-1.5">
                <span>Continue Shopping</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
