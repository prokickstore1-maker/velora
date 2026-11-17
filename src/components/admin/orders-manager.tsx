"use client";

import { useState } from "react";
import Image from "next/image";
import { Order, OrderItem } from "@/db/schema";
import { updateOrderStatusAction } from "@/app/actions/admin-orders";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import {
  Search,
  MessageCircle,
  Eye,
  Truck,
  CheckCircle2,
  Loader2,
} from "lucide-react";

interface OrderWithItems extends Order {
  items: OrderItem[];
}

interface OrdersManagerProps {
  initialOrders: OrderWithItems[];
  initialSearchCode?: string;
}

export function OrdersManager({ initialOrders, initialSearchCode = "" }: OrdersManagerProps) {
  const [ordersList, setOrdersList] = useState(initialOrders);
  const [searchQuery, setSearchQuery] = useState(initialSearchCode);
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // Receipt Modal State
  const [viewingReceiptUrl, setViewingReceiptUrl] = useState<string | null>(null);

  // Shipping Modal State
  const [shippingDialogOrder, setShippingDialogOrder] = useState<OrderWithItems | null>(null);
  const [courierName, setCourierName] = useState("J&T Express");
  const [trackingNumber, setTrackingNumber] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Filtered orders
  const filteredOrders = ordersList.filter((order) => {
    if (statusFilter !== "all" && order.status !== statusFilter) {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchCode = order.orderCode.toLowerCase().includes(q);
      const matchName = order.customerName.toLowerCase().includes(q);
      const matchPhone = order.customerWhatsapp.includes(q);
      if (!matchCode && !matchName && !matchPhone) return false;
    }
    return true;
  });

  const handleUpdateStatus = async (
    order: OrderWithItems,
    newStatus: Order["status"]
  ) => {
    if (newStatus === "shipped") {
      setShippingDialogOrder(order);
      setCourierName(order.courierName || "J&T Express");
      setTrackingNumber(order.trackingNumber || "");
      return;
    }

    if (newStatus === "cancelled") {
      if (!confirm(`Cancel order ${order.orderCode}? This will automatically return items to available inventory.`)) {
        return;
      }
    }

    try {
      const res = await updateOrderStatusAction({
        orderId: order.id,
        status: newStatus,
      });

      if (!res.success) {
        toast.error(res.error || "Failed to update status.");
        return;
      }

      toast.success(`Order ${order.orderCode} status updated to ${newStatus}.`);
      setOrdersList((prev) =>
        prev.map((o) => (o.id === order.id ? { ...o, status: newStatus } : o))
      );
    } catch {
      toast.error("An error occurred while updating order status.");
    }
  };

  const handleConfirmShipped = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!shippingDialogOrder || !trackingNumber.trim()) {
      toast.error("Please enter a tracking number.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await updateOrderStatusAction({
        orderId: shippingDialogOrder.id,
        status: "shipped",
        courierName: courierName.trim(),
        trackingNumber: trackingNumber.trim(),
      });

      if (!res.success) {
        toast.error(res.error || "Failed to mark as shipped.");
        setIsSubmitting(false);
        return;
      }

      toast.success(`Order marked as Shipped with tracking ${trackingNumber.trim()}!`);
      setOrdersList((prev) =>
        prev.map((o) =>
          o.id === shippingDialogOrder.id
            ? {
                ...o,
                status: "shipped",
                courierName: courierName.trim(),
                trackingNumber: trackingNumber.trim(),
              }
            : o
        )
      );
      setShippingDialogOrder(null);
    } catch {
      toast.error("An error occurred while saving tracking details.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const openWhatsAppChat = (order: OrderWithItems) => {
    const cleanPhone = order.customerWhatsapp.replace(/\D/g, "");
    let text = `Hello ${order.customerName}! This is Myvelora Store regarding your order ${order.orderCode}.`;

    if (order.status === "shipped" && order.trackingNumber) {
      text = `Hello ${order.customerName}! Your Myvelora Store order ${order.orderCode} has been shipped via ${order.courierName || "Courier"}.\n\nTracking Number: ${order.trackingNumber}\n\nYou can track your parcel on our website: https://myvelora.com/track-order\n\nThank you!`;
    } else if (order.status === "verified" || order.status === "packing") {
      text = `Hello ${order.customerName}! Your payment for order ${order.orderCode} has been verified. We are currently packing your K-Pop merchandise with care!`;
    }

    window.open(`https://wa.me/${cleanPhone}?text=${encodeURIComponent(text)}`, "_blank");
  };

  const getStatusBadge = (status: Order["status"]) => {
    switch (status) {
      case "pending_payment":
        return <Badge className="bg-amber-100 text-amber-800 border-none">Pending Payment</Badge>;
      case "payment_submitted":
        return <Badge className="bg-blue-100 text-blue-800 border-none">Payment Slip Uploaded</Badge>;
      case "verified":
        return <Badge className="bg-indigo-100 text-indigo-800 border-none">Verified / Paid</Badge>;
      case "packing":
        return <Badge className="bg-purple-100 text-purple-800 border-none">Packing</Badge>;
      case "shipped":
        return <Badge className="bg-emerald-100 text-emerald-800 border-none">Shipped</Badge>;
      case "completed":
        return <Badge className="bg-emerald-600 text-white border-none">Completed</Badge>;
      case "cancelled":
        return <Badge className="bg-rose-100 text-rose-800 border-none">Cancelled</Badge>;
      default:
        return <Badge className="bg-zinc-100 text-zinc-800 border-none">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-border gap-4">
        <div>
          <span className="text-xs font-bold tracking-widest text-pink uppercase block">
            Fulfillment & Payments
          </span>
          <h1 className="mv-heading-italic text-2xl sm:text-3xl text-plum">
            ORDERS MANAGEMENT ({filteredOrders.length})
          </h1>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white p-4 sm:p-5 rounded-2xl border border-border shadow-xs">
        <div className="relative w-full md:max-w-md">
          <Search className="w-4 h-4 text-plum-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
          <Input
            type="text"
            placeholder="Search by Order Code, name, or phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 h-11 bg-background border-border text-sm rounded-xl"
          />
        </div>

        <div className="w-full md:w-auto flex items-center gap-3">
          <span className="text-xs font-bold uppercase text-plum">Filter Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-10 px-3 rounded-lg border border-border bg-background text-plum text-xs font-medium focus:outline-none focus:ring-1 focus:ring-plum"
          >
            <option value="all">All Orders</option>
            <option value="payment_submitted">Slip Uploaded (Action Required)</option>
            <option value="pending_payment">Pending Payment</option>
            <option value="verified">Verified</option>
            <option value="packing">Packing</option>
            <option value="shipped">Shipped</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Orders List / Cards */}
      <div className="space-y-4">
        {filteredOrders.length === 0 ? (
          <div className="bg-white p-12 text-center rounded-2xl border border-border text-plum-muted space-y-2">
            <p className="font-heading font-bold text-plum text-lg uppercase">No Orders Found</p>
            <p className="text-xs text-plum-muted">Try adjusting your status filter or search query.</p>
          </div>
        ) : (
          filteredOrders.map((order) => (
            <div
              key={order.id}
              className="bg-white p-5 rounded-2xl border border-border shadow-xs space-y-4"
            >
              {/* Order Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-border/80 gap-2">
                <div className="flex items-center gap-3 flex-wrap">
                  <span className="font-mono font-bold text-base text-plum">{order.orderCode}</span>
                  {getStatusBadge(order.status)}
                  <span className="text-xs text-plum-muted">
                    {new Date(order.createdAt).toLocaleDateString("en-GB", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="font-heading font-extrabold text-lg text-plum">
                    RM {parseFloat(order.totalRm).toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Order Details Grid */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-4 text-xs">
                {/* Customer & Address */}
                <div className="md:col-span-4 space-y-1">
                  <p className="font-bold text-plum uppercase tracking-wider text-[10px]">Customer Details</p>
                  <p className="font-semibold text-plum">{order.customerName}</p>
                  <p className="text-plum-muted font-mono">+{order.customerWhatsapp}</p>
                  <p className="text-plum-muted mt-1 leading-relaxed">
                    {order.addressLine1}
                    {order.addressLine2 ? `, ${order.addressLine2}` : ""}, {order.postcode} {order.city},{" "}
                    {order.state}
                  </p>
                  {order.notes && (
                    <p className="text-[11px] text-pink italic mt-1 bg-blush-soft p-1.5 rounded">
                      Note: &quot;{order.notes}&quot;
                    </p>
                  )}
                </div>

                {/* Items Breakdown */}
                <div className="md:col-span-5 space-y-1">
                  <p className="font-bold text-plum uppercase tracking-wider text-[10px]">
                    Items ({order.items.length})
                  </p>
                  <div className="divide-y divide-border/40 max-h-32 overflow-y-auto pr-1">
                    {order.items.map((item) => (
                      <div key={item.id} className="py-1.5 flex justify-between">
                        <div>
                          <span className="font-semibold text-plum">{item.productNameSnapshot}</span>
                          <span className="text-pink ml-1">({item.versionNameSnapshot})</span>
                          <span className="text-plum-muted ml-1">x{item.quantity}</span>
                        </div>
                        <span className="font-mono font-medium text-plum">
                          RM {parseFloat(item.lineTotalRm).toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Payment Slip / Tracking Snapshot */}
                <div className="md:col-span-3 space-y-2 bg-ivory p-3 rounded-xl border border-border">
                  <p className="font-bold text-plum uppercase tracking-wider text-[10px]">Payment Proof</p>
                  {order.paymentReceiptUrl ? (
                    <div className="space-y-2">
                      <button
                        type="button"
                        onClick={() => setViewingReceiptUrl(order.paymentReceiptUrl)}
                        className="w-full flex items-center justify-center gap-1.5 p-2 rounded-lg bg-white border border-border text-plum hover:bg-blush/40 text-xs font-semibold"
                      >
                        <Eye className="w-3.5 h-3.5 text-pink" />
                        View Slip Photo
                      </button>
                      {order.paymentReference && (
                        <p className="text-[10px] text-plum-muted truncate font-mono">
                          Ref: {order.paymentReference}
                        </p>
                      )}
                    </div>
                  ) : (
                    <p className="text-[11px] text-plum-muted italic">No payment slip uploaded yet.</p>
                  )}

                  {order.trackingNumber && (
                    <div className="pt-2 border-t border-border">
                      <p className="font-bold text-plum uppercase tracking-wider text-[10px]">Courier Tracking</p>
                      <p className="font-mono font-bold text-xs text-plum truncate">{order.trackingNumber}</p>
                      <p className="text-[10px] text-plum-muted">{order.courierName || "Courier"}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Order Actions Toolbar */}
              <div className="pt-3 border-t border-border/60 flex flex-wrap items-center justify-between gap-3">
                {/* Status Transitions */}
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[11px] font-bold uppercase text-plum-muted">Change Status:</span>

                  {order.status === "payment_submitted" && (
                    <Button
                      size="sm"
                      onClick={() => handleUpdateStatus(order, "verified")}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs h-8"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                      Verify Payment
                    </Button>
                  )}

                  {order.status === "verified" && (
                    <Button
                      size="sm"
                      onClick={() => handleUpdateStatus(order, "packing")}
                      className="bg-purple-600 hover:bg-purple-700 text-white text-xs h-8"
                    >
                      Start Packing
                    </Button>
                  )}

                  {(order.status === "packing" || order.status === "verified") && (
                    <Button
                      size="sm"
                      onClick={() => handleUpdateStatus(order, "shipped")}
                      className="bg-plum hover:bg-plum-hover text-white text-xs h-8"
                    >
                      <Truck className="w-3.5 h-3.5 mr-1" />
                      Mark as Shipped
                    </Button>
                  )}

                  {order.status === "shipped" && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleUpdateStatus(order, "completed")}
                      className="text-xs h-8 border-emerald-600 text-emerald-700 hover:bg-emerald-50"
                    >
                      Mark Completed
                    </Button>
                  )}

                  {order.status !== "cancelled" && order.status !== "completed" && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleUpdateStatus(order, "cancelled")}
                      className="text-xs h-8 text-destructive hover:bg-destructive/10"
                    >
                      Cancel Order
                    </Button>
                  )}
                </div>

                {/* Direct WhatsApp Contact Button */}
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => openWhatsAppChat(order)}
                  className="h-8 text-xs font-semibold border-[#25D366] text-[#128C7E] hover:bg-[#25D366]/10"
                >
                  <MessageCircle className="w-3.5 h-3.5 mr-1 text-[#25D366] fill-current" />
                  Chat on WhatsApp
                </Button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal: View Payment Receipt Screenshot */}
      <Dialog open={Boolean(viewingReceiptUrl)} onOpenChange={() => setViewingReceiptUrl(null)}>
        <DialogContent className="max-w-lg bg-white p-4">
          <DialogHeader>
            <DialogTitle className="mv-heading-italic text-lg text-plum">Payment Receipt Slip</DialogTitle>
          </DialogHeader>
          {viewingReceiptUrl && (
            <div className="relative aspect-[3/4] w-full rounded-xl overflow-hidden bg-zinc-100 border border-border mt-2">
              <Image src={viewingReceiptUrl} alt="Payment receipt screenshot" fill sizes="500px" className="object-contain" />
            </div>
          )}
          <DialogFooter className="pt-2">
            <Button variant="outline" onClick={() => setViewingReceiptUrl(null)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal: Mark as Shipped with Courier & Tracking */}
      <Dialog open={Boolean(shippingDialogOrder)} onOpenChange={() => setShippingDialogOrder(null)}>
        <DialogContent className="max-w-md bg-white">
          <DialogHeader>
            <DialogTitle className="mv-heading-italic text-lg text-plum">
              Ship Order {shippingDialogOrder?.orderCode}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleConfirmShipped} className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <Label className="text-xs font-bold uppercase text-plum">Courier Service Name *</Label>
              <Input
                required
                placeholder="e.g. J&T Express, Pos Laju, DHL, Ninja Van"
                value={courierName}
                onChange={(e) => setCourierName(e.target.value)}
                className="h-11 rounded-xl"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-bold uppercase text-plum">Tracking / Airway Bill (AWB) Number *</Label>
              <Input
                required
                placeholder="e.g. JT60029384918"
                value={trackingNumber}
                onChange={(e) => setTrackingNumber(e.target.value)}
                className="h-11 rounded-xl font-mono uppercase"
              />
            </div>

            <DialogFooter className="pt-3">
              <Button type="button" variant="outline" onClick={() => setShippingDialogOrder(null)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting} className="bg-plum hover:bg-plum-hover text-white">
                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save & Mark Shipped"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
