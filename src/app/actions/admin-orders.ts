"use server";

import { z } from "zod";
import { db } from "@/db";
import { orders, productVersions } from "@/db/schema";
import { and, eq, inArray, sql } from "drizzle-orm";
import { updateTag } from "next/cache";

const updateStatusSchema = z.object({
  orderId: z.number().int().positive(),
  status: z.enum([
    "pending_payment",
    "payment_submitted",
    "verified",
    "packing",
    "shipped",
    "completed",
    "cancelled",
  ]),
  courierName: z.string().trim().optional(),
  trackingNumber: z.string().trim().optional(),
});

export async function updateOrderStatusAction(rawData: z.infer<typeof updateStatusSchema>) {
  const parsed = updateStatusSchema.safeParse(rawData);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message || "Invalid status update" };
  }

  const { orderId, status, courierName, trackingNumber } = parsed.data;

  try {
    const order = await db.query.orders.findFirst({
      where: eq(orders.id, orderId),
      with: { items: true },
    });

    if (!order) {
      return { success: false, error: "Order not found." };
    }

    // ACID Transaction for Status Change & Auto-Restock on Cancellation
    await db.transaction(async (tx) => {
      const updateData: Partial<typeof orders.$inferInsert> = {
        status,
        updatedAt: new Date(),
      };

      if (status === "verified" && !order.verifiedAt) {
        updateData.verifiedAt = new Date();
      }

      if (status === "shipped") {
        updateData.shippedAt = new Date();
        if (courierName) updateData.courierName = courierName;
        if (trackingNumber) updateData.trackingNumber = trackingNumber;
      }

      // If cancelling and stock has not been restored yet: restore stock atomically!
      if (status === "cancelled" && !order.stockRestoredAt) {
        for (const item of order.items) {
          if (item.productVersionId) {
            // Fetch version metadata to detect if this was a linked bundle
            const [version] = await tx
              .select({
                id: productVersions.id,
                isBundle: productVersions.isBundle,
                bundleMode: productVersions.bundleMode,
                linkedVersionIds: productVersions.linkedVersionIds,
                productId: productVersions.productId,
              })
              .from(productVersions)
              .where(eq(productVersions.id, item.productVersionId));

            if (version?.isBundle && version.bundleMode === "linked") {
              const compIds: number[] = version.linkedVersionIds
                ? JSON.parse(version.linkedVersionIds)
                : [];

              if (compIds.length > 0) {
                await tx
                  .update(productVersions)
                  .set({
                    stock: sql`${productVersions.stock} + ${item.quantity}`,
                  })
                  .where(inArray(productVersions.id, compIds));
              } else {
                // Restore to all non-bundle versions of this product
                await tx
                  .update(productVersions)
                  .set({
                    stock: sql`${productVersions.stock} + ${item.quantity}`,
                  })
                  .where(
                    and(
                      eq(productVersions.productId, version.productId),
                      eq(productVersions.isBundle, false)
                    )
                  );
              }
            }

            // Restore stock counter of the version itself
            await tx
              .update(productVersions)
              .set({
                stock: sql`${productVersions.stock} + ${item.quantity}`,
              })
              .where(eq(productVersions.id, item.productVersionId));
          }
        }
        updateData.stockRestoredAt = new Date();
      }

      await tx.update(orders).set(updateData).where(eq(orders.id, orderId));
    });

    updateTag("products");
    return { success: true };
  } catch (err: unknown) {
    console.error("Order status update failed:", err);
    const message = err instanceof Error ? err.message : "Failed to update order status.";
    return { success: false, error: message };
  }
}
