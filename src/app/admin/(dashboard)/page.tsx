import Link from "next/link";
import { db } from "@/db";
import { orders, products, productVersions } from "@/db/schema";
import { desc } from "drizzle-orm";
import { MOCK_PRODUCTS } from "@/db/mock-data";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ShoppingBag,
  Clock,
  Truck,
  Package,
  AlertTriangle,
  ArrowRight,
  Plus,
} from "lucide-react";

export const metadata = {
  title: "Admin Overview | Myvelora Store",
};

export default async function AdminDashboardPage() {
  let allOrders: Array<typeof orders.$inferSelect> = [];
  const lowStockVersions: Array<typeof productVersions.$inferSelect & { product?: typeof products.$inferSelect }> = [];
  let totalProductsCount = 0;

  try {
    allOrders = await db.query.orders.findMany({
      orderBy: [desc(orders.createdAt)],
      limit: 10,
    });

    const dbProducts = await db.query.products.findMany({
      with: { versions: true },
    });
    totalProductsCount = dbProducts.length;

    dbProducts.forEach((p) => {
      p.versions.forEach((v) => {
        if (v.stock <= 3 && v.isActive) {
          lowStockVersions.push({ ...v, product: p });
        }
      });
    });
  } catch {
    // If DB is offline, provide mock metrics
    totalProductsCount = MOCK_PRODUCTS.length;
    MOCK_PRODUCTS.forEach((p) => {
      p.versions.forEach((v) => {
        if (v.stock <= 3) {
          lowStockVersions.push(v as unknown as typeof productVersions.$inferSelect);
        }
      });
    });
  }

  const pendingPayments = allOrders.filter((o) => o.status === "pending_payment" || o.status === "payment_submitted");
  const toShipOrders = allOrders.filter((o) => o.status === "verified" || o.status === "packing");

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold tracking-widest text-pink uppercase block">
            Store Management
          </span>
          <h1 className="mv-heading-italic text-3xl sm:text-4xl text-plum">
            OVERVIEW
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <Button asChild className="bg-plum hover:bg-plum-hover text-white text-xs font-semibold h-10 px-4 rounded-xl">
            <Link href="/admin/products?new=1">
              <Plus className="w-4 h-4 mr-1.5" />
              New Product
            </Link>
          </Button>
        </div>
      </div>

      {/* KPI Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-border shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blush flex items-center justify-center text-plum shrink-0">
            <ShoppingBag className="w-6 h-6 text-pink" />
          </div>
          <div>
            <span className="text-[11px] text-plum-muted uppercase font-bold block">Total Orders</span>
            <span className="font-heading font-extrabold text-2xl text-plum">{allOrders.length}</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-border shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600 shrink-0">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] text-plum-muted uppercase font-bold block">Pending Verification</span>
            <span className="font-heading font-extrabold text-2xl text-plum">{pendingPayments.length}</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-border shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600 shrink-0">
            <Truck className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] text-plum-muted uppercase font-bold block">Packing & To Ship</span>
            <span className="font-heading font-extrabold text-2xl text-plum">{toShipOrders.length}</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-border shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-rose-50 flex items-center justify-center text-rose-600 shrink-0">
            <Package className="w-6 h-6 text-rose-600" />
          </div>
          <div>
            <span className="text-[11px] text-plum-muted uppercase font-bold block">Active Products ({totalProductsCount})</span>
            <span className="font-heading font-extrabold text-2xl text-plum">{lowStockVersions.length} Low</span>
          </div>
        </div>
      </div>

      {/* 2-Column: Recent Orders & Low Stock */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Recent Orders */}
        <div className="lg:col-span-8 bg-white p-6 rounded-2xl border border-border shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-border">
            <h2 className="font-heading font-extrabold italic text-lg text-plum uppercase">
              Recent Orders
            </h2>
            <Link
              href="/admin/orders"
              className="text-xs font-semibold text-pink hover:underline flex items-center gap-1"
            >
              View All <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {allOrders.length === 0 ? (
            <div className="py-12 text-center text-plum-muted text-xs">
              No orders have been placed yet. New orders will appear here automatically.
            </div>
          ) : (
            <div className="divide-y divide-border/60">
              {allOrders.map((order) => (
                <div
                  key={order.id}
                  className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-plum">{order.orderCode}</span>
                      <Badge className="text-[10px] font-semibold py-0 px-1.5 uppercase">
                        {order.status.replace("_", " ")}
                      </Badge>
                    </div>
                    <p className="text-plum-muted font-medium">
                      {order.customerName} · {order.city}, {order.state}
                    </p>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-3">
                    <span className="font-heading font-bold text-sm text-plum">
                      RM {parseFloat(order.totalRm).toFixed(2)}
                    </span>
                    <Button asChild size="sm" variant="outline" className="h-8 text-xs font-semibold">
                      <Link href={`/admin/orders?code=${order.orderCode}`}>Inspect</Link>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Low Stock Alerts */}
        <div className="lg:col-span-4 bg-white p-6 rounded-2xl border border-border shadow-xs space-y-4">
          <div className="pb-3 border-b border-border">
            <h2 className="font-heading font-extrabold italic text-lg text-plum uppercase flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-500" />
              Low Stock Alert
            </h2>
          </div>

          {lowStockVersions.length === 0 ? (
            <p className="py-8 text-center text-xs text-plum-muted">
              All inventory versions are sufficiently stocked.
            </p>
          ) : (
            <div className="space-y-3">
              {lowStockVersions.slice(0, 6).map((ver) => (
                <div
                  key={ver.id}
                  className="p-3 rounded-xl bg-ivory border border-border flex items-center justify-between text-xs"
                >
                  <div className="min-w-0 pr-2">
                    <p className="font-semibold text-plum truncate">{ver.versionName}</p>
                    <p className="text-[11px] text-plum-muted font-mono">{ver.sku}</p>
                  </div>
                  <span
                    className={`font-mono font-bold px-2 py-0.5 rounded text-[11px] shrink-0 ${
                      ver.stock === 0 ? "bg-rose-100 text-rose-800" : "bg-amber-100 text-amber-800"
                    }`}
                  >
                    {ver.stock === 0 ? "SOLD OUT" : `${ver.stock} left`}
                  </span>
                </div>
              ))}
            </div>
          )}

          <Button asChild variant="outline" className="w-full text-xs font-semibold border-plum text-plum">
            <Link href="/admin/products">Manage Inventory</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
