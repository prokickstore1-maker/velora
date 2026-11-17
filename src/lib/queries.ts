import { unstable_cache } from "next/cache";
import { db, hasDatabaseUrl, getOrCreateStoreSettings } from "@/db";
import { products, productVersions, customerReviews, orders } from "@/db/schema";
import { eq, desc, and } from "drizzle-orm";
import { MOCK_PRODUCTS, MOCK_REVIEWS, MOCK_STORE_SETTINGS } from "@/db/mock-data";

/**
 * Public Store Settings query (Cached with tag 'settings')
 * Graceful fallback to MOCK_STORE_SETTINGS if database is offline or unmigrated
 */
export const getPublicStoreSettings = unstable_cache(
  async () => {
    if (!hasDatabaseUrl) {
      return MOCK_STORE_SETTINGS;
    }

    try {
      const settings = await getOrCreateStoreSettings();
      return settings || MOCK_STORE_SETTINGS;
    } catch {
      return MOCK_STORE_SETTINGS;
    }
  },
  ["public_store_settings"],
  { tags: ["settings"], revalidate: 3600 }
);

/**
 * Public Published Products with Active Versions (Cached with tag 'products')
 * Graceful fallback to MOCK_PRODUCTS if database is offline or empty
 */
export const getPublicProducts = unstable_cache(
  async () => {
    if (!hasDatabaseUrl) {
      return MOCK_PRODUCTS as unknown as Array<typeof products.$inferSelect & { versions: Array<typeof productVersions.$inferSelect> }>;
    }

    try {
      const allProducts = await db.query.products.findMany({
        where: eq(products.isPublished, true),
        orderBy: [desc(products.isNewArrival), desc(products.sortOrder), desc(products.createdAt)],
        with: {
          versions: {
            where: eq(productVersions.isActive, true),
            orderBy: [productVersions.sortOrder, productVersions.id],
          },
        },
      });

      if (allProducts && allProducts.length > 0) {
        return allProducts;
      }
      return MOCK_PRODUCTS as unknown as typeof allProducts;
    } catch {
      return MOCK_PRODUCTS as unknown as Array<typeof products.$inferSelect & { versions: Array<typeof productVersions.$inferSelect> }>;
    }
  },
  ["public_products_list"],
  { tags: ["products"], revalidate: 3600 }
);

/**
 * Public Single Product by Slug (Cached with tag 'products')
 * Graceful fallback to MOCK_PRODUCTS if database is offline or empty
 */
export const getProductBySlug = unstable_cache(
  async (slug: string) => {
    if (!hasDatabaseUrl) {
      const mockItem = MOCK_PRODUCTS.find((p) => p.slug === slug);
      return (mockItem as unknown as typeof products.$inferSelect & { versions: Array<typeof productVersions.$inferSelect> }) || null;
    }

    try {
      const product = await db.query.products.findFirst({
        where: and(eq(products.slug, slug), eq(products.isPublished, true)),
        with: {
          versions: {
            where: eq(productVersions.isActive, true),
            orderBy: [productVersions.sortOrder, productVersions.id],
          },
        },
      });

      if (product) return product;

      const mockItem = MOCK_PRODUCTS.find((p) => p.slug === slug);
      return (mockItem as unknown as typeof product) || null;
    } catch {
      const mockItem = MOCK_PRODUCTS.find((p) => p.slug === slug);
      return (mockItem as unknown as typeof products.$inferSelect & { versions: Array<typeof productVersions.$inferSelect> }) || null;
    }
  },
  ["public_product_by_slug"],
  { tags: ["products"], revalidate: 3600 }
);

/**
 * Public Customer Reviews (Cached with tag 'reviews')
 */
export const getPublicReviews = unstable_cache(
  async () => {
    if (!hasDatabaseUrl) {
      return MOCK_REVIEWS;
    }

    try {
      const dbReviews = await db.query.customerReviews.findMany({
        where: eq(customerReviews.isPublished, true),
        orderBy: [customerReviews.sortOrder, desc(customerReviews.createdAt)],
      });

      if (dbReviews && dbReviews.length > 0) {
        return dbReviews;
      }
      return MOCK_REVIEWS;
    } catch {
      return MOCK_REVIEWS;
    }
  },
  ["public_reviews_list"],
  { tags: ["reviews"], revalidate: 3600 }
);

/**
 * Get Order by unique orderCode
 */
export async function getOrderByCode(orderCode: string) {
  if (!hasDatabaseUrl) {
    if (orderCode.startsWith("MV-")) {
      return {
        id: 999,
        orderCode,
        customerName: "Sample Customer",
        customerWhatsapp: "60123456789",
        customerEmail: "customer@example.com",
        addressLine1: "No. 12, Jalan Sultan Ismail",
        addressLine2: "Bukit Bintang",
        postcode: "50250",
        city: "Kuala Lumpur",
        state: "W.P. Kuala Lumpur",
        notes: "Please pack with extra bubble wrap.",
        subtotalRm: "115.00",
        shippingFeeRm: "8.00",
        totalRm: "123.00",
        status: "pending_payment" as const,
        paymentReceiptUrl: null,
        paymentReference: null,
        paymentSubmittedAt: null,
        verifiedAt: null,
        courierName: null,
        trackingNumber: null,
        shippedAt: null,
        stockRestoredAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        items: [
          {
            id: 901,
            orderId: 999,
            productId: 1,
            productVersionId: 101,
            productNameSnapshot: "NewJeans - 2nd EP 'Get Up' (Bunny Beach Bag Ver.)",
            versionNameSnapshot: "NewJeans (Group Ver.)",
            unitPriceRm: "115.00",
            quantity: 1,
            lineTotalRm: "115.00",
          },
        ],
      };
    }
    return null;
  }

  try {
    const order = await db.query.orders.findFirst({
      where: eq(orders.orderCode, orderCode),
      with: {
        items: true,
      },
    });

    if (order) return order;

    // In local dev without DB: generate a mock preview order if orderCode starts with MV-
    if (orderCode.startsWith("MV-")) {
      return {
        id: 999,
        orderCode,
        customerName: "Sample Customer",
        customerWhatsapp: "60123456789",
        customerEmail: "customer@example.com",
        addressLine1: "No. 12, Jalan Sultan Ismail",
        addressLine2: "Bukit Bintang",
        postcode: "50250",
        city: "Kuala Lumpur",
        state: "W.P. Kuala Lumpur",
        notes: "Please pack with extra bubble wrap.",
        subtotalRm: "115.00",
        shippingFeeRm: "8.00",
        totalRm: "123.00",
        status: "pending_payment" as const,
        paymentReceiptUrl: null,
        paymentReference: null,
        paymentSubmittedAt: null,
        verifiedAt: null,
        courierName: null,
        trackingNumber: null,
        shippedAt: null,
        stockRestoredAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        items: [
          {
            id: 901,
            orderId: 999,
            productId: 1,
            productVersionId: 101,
            productNameSnapshot: "NewJeans - 2nd EP 'Get Up' (Bunny Beach Bag Ver.)",
            versionNameSnapshot: "NewJeans (Group Ver.)",
            unitPriceRm: "115.00",
            quantity: 1,
            lineTotalRm: "115.00",
          },
        ],
      };
    }

    return null;
  } catch (error) {
    console.error(`Error fetching order ${orderCode}:`, error);
    return null;
  }
}

/**
 * Track Order by orderCode and last 4 digits of WhatsApp phone number
 */
export async function trackOrderByCodeAndPhone(orderCode: string, last4Phone: string) {
  try {
    const cleanCode = orderCode.trim();
    const cleanLast4 = last4Phone.trim();

    if (!cleanCode || cleanLast4.length !== 4) {
      return { success: false, error: "Please enter a valid Order Code and the last 4 digits of your phone number." };
    }

    const order = await getOrderByCode(cleanCode);

    if (!order) {
      return { success: false, error: "Order not found. Please double check your order code." };
    }

    const sanitizedDbPhone = order.customerWhatsapp.replace(/\D/g, "");
    if (!sanitizedDbPhone.endsWith(cleanLast4)) {
      return { success: false, error: "Phone number verification failed. Please check the last 4 digits." };
    }

    return { success: true, order };
  } catch (error) {
    console.error("Error tracking order:", error);
    return { success: false, error: "An unexpected error occurred while searching for your order." };
  }
}
