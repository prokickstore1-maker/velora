"use server";

import { z } from "zod";
import { db, hasDatabaseUrl, getOrCreateStoreSettings } from "@/db";
import { orders } from "@/db/schema";
import { eq } from "drizzle-orm";
import { sendAdminNotification } from "@/lib/notifications";
import { createPresignedUploadUrl } from "@/lib/s3";

const receiptSchema = z.object({
  orderCode: z.string().trim().min(5),
  receiptUrl: z.string().url("Invalid receipt URL"),
  referenceNote: z.string().trim().optional(),
});

export async function getReceiptPresignedUrlAction(orderCode: string, filename: string) {
  try {
    const extension = filename.split(".").pop()?.toLowerCase();
    const contentType = extension === "png" ? "image/png" : extension === "jpg" || extension === "jpeg" ? "image/jpeg" : "image/webp";

    const { uploadUrl, fileKey, publicUrl } = await createPresignedUploadUrl({
      folder: "receipts",
      filename: `${orderCode}-${filename}`,
      contentType,
    });

    return { success: true, uploadUrl, fileKey, publicUrl };
  } catch (err) {
    console.error("Presigned URL generation error:", err);
    return { success: false, error: "Failed to generate upload link. Please try again." };
  }
}

export async function submitPaymentReceiptAction(rawData: z.infer<typeof receiptSchema>) {
  const parsed = receiptSchema.safeParse(rawData);
  if (!parsed.success) {
    return { success: false, error: "Invalid payment receipt details." };
  }

  const { orderCode, receiptUrl, referenceNote } = parsed.data;

  if (!hasDatabaseUrl) {
    return { success: true };
  }

  try {
    const existing = await db.query.orders.findFirst({
      where: eq(orders.orderCode, orderCode),
      with: { items: true },
    });

    if (!existing) {
      return { success: false, error: "Order not found." };
    }

    const [updatedOrder] = await db
      .update(orders)
      .set({
        paymentReceiptUrl: receiptUrl,
        paymentReference: referenceNote || null,
        paymentSubmittedAt: new Date(),
        status: "payment_submitted",
        updatedAt: new Date(),
      })
      .where(eq(orders.orderCode, orderCode))
      .returning();

    // Trigger Admin notification
    const settings = await getOrCreateStoreSettings();
    sendAdminNotification(settings, {
      orderCode: updatedOrder.orderCode,
      customerName: updatedOrder.customerName,
      customerWhatsapp: updatedOrder.customerWhatsapp,
      totalRm: updatedOrder.totalRm,
      itemCount: existing.items.reduce((s, i) => s + i.quantity, 0),
      itemsSummary: existing.items.map((i) => `${i.productNameSnapshot} x${i.quantity}`).join(", "),
      state: updatedOrder.state,
      event: "payment_submitted",
      receiptUrl,
    });

    return { success: true };
  } catch (err) {
    console.error("Failed to submit payment receipt:", err);
    return { success: false, error: "Failed to save payment receipt. Please try again." };
  }
}
