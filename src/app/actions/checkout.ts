"use server";

import { z } from "zod";
import { db, hasDatabaseUrl, getOrCreateStoreSettings } from "@/db";
import { orders, orderItems, productVersions, products } from "@/db/schema";
import { and, eq, inArray } from "drizzle-orm";
import { updateTag } from "next/cache";
import { calculateEffectivePrice } from "@/lib/promo";
import { evaluateStorePaymentStatus } from "@/lib/store-hours";

const checkoutSchema = z.object({
  customerName: z.string().trim().min(2, "Name must be at least 2 characters"),
  customerWhatsapp: z
    .string()
    .trim()
    .min(8, "Please enter a valid WhatsApp phone number")
    .transform((val) => val.replace(/\D/g, "")),
  customerEmail: z.string().email("Invalid email address").optional().or(z.literal("")),
  addressLine1: z.string().trim().min(5, "Address Line 1 is required"),
  addressLine2: z.string().trim().optional(),
  postcode: z.string().trim().min(5, "Postcode must be 5 digits").max(5, "Postcode must be 5 digits"),
  city: z.string().trim().min(2, "City is required"),
  state: z.string().trim().min(2, "State is required"),
  notes: z.string().trim().optional(),
  items: z
    .array(
      z.object({
        productVersionId: z.number().int().positive(),
        quantity: z.number().int().positive().max(50),
      })
    )
    .min(1, "Your cart is empty"),
});

export type CheckoutFormState = {
  success: boolean;
  orderCode?: string;
  error?: string;
};

export async function placeOrderAction(rawData: z.infer<typeof checkoutSchema>): Promise<CheckoutFormState> {
  const parsed = checkoutSchema.safeParse(rawData);
  if (!parsed.success) {
    const errorMsg = parsed.error.issues[0]?.message || "Invalid form input";
    return { success: false, error: errorMsg };
  }

  const {
    customerName,
    customerWhatsapp,
    customerEmail,
    addressLine1,
    addressLine2,
    postcode,
    city,
    state,
    notes,
    items: requestedItems,
  } = parsed.data;

  // Format WhatsApp number with Malaysia country code (60) if not present
  let formattedPhone = customerWhatsapp;
  if (formattedPhone.startsWith("0")) {
    formattedPhone = "60" + formattedPhone.slice(1);
  } else if (!formattedPhone.startsWith("60")) {
    formattedPhone = "60" + formattedPhone;
  }

  // If no DB configured (local frontend preview mode), return a simulated order code
  if (!hasDatabaseUrl) {
    const orderCode = `MV-${Date.now().toString(36).toUpperCase()}`;
    return { success: true, orderCode };
  }

  try {
    const settings = await getOrCreateStoreSettings();

    // Enforce Daily Store Operating Hours & Daily Bank Account Rotation (10:00 AM - 10:00 PM MYT)
    const storeStatus = evaluateStorePaymentStatus(settings);
    if (!storeStatus.isOpen) {
      return {
        success: false,
        error: "Store is closed now. Please place your order directly via WhatsApp.",
      };
    }

    // Fetch and calculate order within an ACID transaction with row-level locks
    const result = await db.transaction(async (tx) => {
      // 1. Identify all requested version IDs and discover any linked bundle component IDs
      const rawVersionIds = [...new Set(requestedItems.map((i) => i.productVersionId))];

      const initialVersions = await tx
        .select()
        .from(productVersions)
        .where(inArray(productVersions.id, rawVersionIds));

      if (initialVersions.length !== rawVersionIds.length) {
        throw new Error("One or more selected items are no longer available.");
      }

      // Collect all affected version IDs (both direct versions and bundle components)
      const allAffectedIds = new Set<number>(rawVersionIds);
      for (const ver of initialVersions) {
        if (ver.isBundle && ver.bundleMode === "linked") {
          const compIds: number[] = ver.linkedVersionIds ? JSON.parse(ver.linkedVersionIds) : [];
          if (compIds.length > 0) {
            compIds.forEach((id) => allAffectedIds.add(id));
          } else {
            // Find all active non-bundle versions of this product
            const siblingVersions = await tx
              .select({ id: productVersions.id })
              .from(productVersions)
              .where(
                and(
                  eq(productVersions.productId, ver.productId),
                  eq(productVersions.isActive, true),
                  eq(productVersions.isBundle, false)
                )
              );
            siblingVersions.forEach((s) => allAffectedIds.add(s.id));
          }
        }
      }

      // 2. Lock ALL affected rows in strictly sorted ascending order in a single query (Deadlock-Free Lock)
      const sortedIds = Array.from(allAffectedIds).sort((a, b) => a - b);
      const lockedVersions = await tx
        .select()
        .from(productVersions)
        .where(inArray(productVersions.id, sortedIds))
        .for("update");

      const versionMap = new Map(lockedVersions.map((v) => [v.id, v]));

      // 3. Pre-fetch parent products for all locked versions
      const productIds = [...new Set(lockedVersions.map((v) => v.productId))];
      const parentProducts = await tx
        .select({
          id: products.id,
          name: products.name,
          category: products.category,
          isPreOrder: products.isPreOrder,
          preOrderDeadline: products.preOrderDeadline,
          preOrderQuotaMode: products.preOrderQuotaMode,
        })
        .from(products)
        .where(inArray(products.id, productIds));

      const productMap = new Map(parentProducts.map((p) => [p.id, p]));

      // 4. Validate pre-order deadlines & calculate Total Physical Demand Map
      // physicalDemandMap: versionId -> total physical units required across the entire cart
      const physicalDemandMap = new Map<number, number>();
      let subtotal = 0;
      const orderItemsToInsert: Array<{
        productId: number;
        productVersionId: number;
        productNameSnapshot: string;
        versionNameSnapshot: string;
        unitPriceRm: string;
        quantity: number;
        lineTotalRm: string;
      }> = [];

      for (const req of requestedItems) {
        const ver = versionMap.get(req.productVersionId);
        if (!ver || !ver.isActive) {
          throw new Error(`One of the requested product versions is no longer available.`);
        }

        const parentProduct = productMap.get(ver.productId);

        // Pre-Order Deadline Verification (Server-Enforced)
        if (parentProduct?.isPreOrder && parentProduct.preOrderDeadline) {
          const deadlineTime = new Date(parentProduct.preOrderDeadline).getTime();
          if (!isNaN(deadlineTime) && deadlineTime < Date.now()) {
            throw new Error(`Pre-order period for "${parentProduct.name}" has officially closed.`);
          }
        }

        // Accumulate physical stock demand (Zero Overselling Guarantee)
        if (ver.isBundle && ver.bundleMode === "linked") {
          const compIds: number[] = ver.linkedVersionIds ? JSON.parse(ver.linkedVersionIds) : [];
          const targetIds =
            compIds.length > 0
              ? compIds
              : lockedVersions
                  .filter((v) => v.productId === ver.productId && !v.isBundle && v.isActive)
                  .map((v) => v.id);

          for (const cid of targetIds) {
            physicalDemandMap.set(cid, (physicalDemandMap.get(cid) || 0) + req.quantity);
          }
        } else {
          physicalDemandMap.set(ver.id, (physicalDemandMap.get(ver.id) || 0) + req.quantity);
        }

        const promo = calculateEffectivePrice(
          ver.priceRm,
          parentProduct?.category || "Album",
          settings,
          ver.discountPercent
        );
        const unitPrice = promo.hasDiscount ? promo.discountedPrice : (parseFloat(ver.priceRm) || 0);
        const lineTotal = unitPrice * req.quantity;
        subtotal += lineTotal;

        orderItemsToInsert.push({
          productId: ver.productId,
          productVersionId: ver.id,
          productNameSnapshot: parentProduct?.name || "K-Pop Merchandise",
          versionNameSnapshot: ver.versionName,
          unitPriceRm: unitPrice.toFixed(2),
          quantity: req.quantity,
          lineTotalRm: lineTotal.toFixed(2),
        });
      }

      // 5. Validate physical demand against locked stock
      for (const [verId, requiredQty] of physicalDemandMap.entries()) {
        const physicalVer = versionMap.get(verId);
        if (!physicalVer) continue;
        const parentProduct = productMap.get(physicalVer.productId);
        const isOpenPreOrder = parentProduct?.isPreOrder && parentProduct.preOrderQuotaMode === "open";

        if (!isOpenPreOrder && physicalVer.stock < requiredQty) {
          throw new Error(
            `Insufficient stock for "${physicalVer.versionName}". Only ${physicalVer.stock} available, but your order requires ${requiredQty}.`
          );
        }
      }

      // 6. Calculate dynamic shipping fee (Zero Client Trust)
      let shippingFee = 0;
      if (settings.shippingEnabled) {
        const flatFee = parseFloat(settings.flatShippingFeeRm) || 0;
        const freeThreshold = settings.freeShippingMinRm ? parseFloat(settings.freeShippingMinRm) : null;

        if (freeThreshold !== null && subtotal >= freeThreshold) {
          shippingFee = 0;
        } else {
          shippingFee = flatFee;
        }
      }

      const grandTotal = subtotal + shippingFee;

      // 7. Generate unique Order Code: MV-YYYYMMDD-XXXX
      const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, "");
      const randomSuffix = Math.floor(1000 + Math.random() * 9000);
      const orderCode = `MV-${dateStr}-${randomSuffix}`;

      // 8. Insert Order Record
      const [newOrder] = await tx
        .insert(orders)
        .values({
          orderCode,
          customerName,
          customerWhatsapp: formattedPhone,
          customerEmail: customerEmail || null,
          addressLine1,
          addressLine2: addressLine2 || null,
          postcode,
          city,
          state,
          notes: notes || null,
          subtotalRm: subtotal.toFixed(2),
          shippingFeeRm: shippingFee.toFixed(2),
          totalRm: grandTotal.toFixed(2),
          status: "pending_payment",
        })
        .returning();

      // 9. Insert Order Items Records
      for (const item of orderItemsToInsert) {
        await tx.insert(orderItems).values({
          orderId: newOrder.id,
          productId: item.productId,
          productVersionId: item.productVersionId,
          productNameSnapshot: item.productNameSnapshot,
          versionNameSnapshot: item.versionNameSnapshot,
          unitPriceRm: item.unitPriceRm,
          quantity: item.quantity,
          lineTotalRm: item.lineTotalRm,
        });
      }

      // 10. Stock Deduction Policy:
      // Per Myvelora Store business rules, stock is NOT deducted on initial checkout.
      // Stock deduction is strictly deferred until the Admin verifies payment in Admin Orders (/admin/orders).

      return {
        orderCode: newOrder.orderCode,
        totalRm: newOrder.totalRm,
        customerName: newOrder.customerName,
        customerWhatsapp: newOrder.customerWhatsapp,
        state: newOrder.state,
        itemsCount: orderItemsToInsert.reduce((s, i) => s + i.quantity, 0),
        itemsSummary: orderItemsToInsert
          .map((i) => `${i.productNameSnapshot} (${i.versionNameSnapshot}) x${i.quantity}`)
          .join(", "),
      };
    });

    // 8. Revalidate catalog cache
    updateTag("products");

    return { success: true, orderCode: result.orderCode };
  } catch (err: unknown) {
    console.error("Order creation transaction failed:", err);
    const message = err instanceof Error ? err.message : "Failed to place order. Please try again.";
    return { success: false, error: message };
  }
}
