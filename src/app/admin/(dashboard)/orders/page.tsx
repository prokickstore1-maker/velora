import { db } from "@/db";
import { orders } from "@/db/schema";
import { desc } from "drizzle-orm";
import { OrdersManager } from "@/components/admin/orders-manager";

interface OrdersPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export const metadata = {
  title: "Orders Verification & Fulfillment | Admin Dashboard",
};

export default async function AdminOrdersPage({ searchParams }: OrdersPageProps) {
  // Next.js 16 requirement: await searchParams
  const params = await searchParams;
  const initialCode = typeof params.code === "string" ? params.code : "";

  let allOrders: Array<typeof orders.$inferSelect & { items: Array<typeof import("@/db/schema").orderItems.$inferSelect> }> = [];

  try {
    allOrders = await db.query.orders.findMany({
      orderBy: [desc(orders.createdAt)],
      with: {
        items: true,
      },
    });
  } catch (error) {
    console.error("Error fetching orders:", error);
  }

  return <OrdersManager initialOrders={allOrders} initialSearchCode={initialCode} />;
}
