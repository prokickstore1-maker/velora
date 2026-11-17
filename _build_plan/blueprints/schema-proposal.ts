/**
 * Myvelora Store — Drizzle ORM PostgreSQL Schema Proposal
 * Reference: _build_plan/prd.md
 * Currency: MYR (stored as integer sen or numeric(10,2); numeric/decimal in RM for clarity)
 */

import {
  pgTable,
  serial,
  text,
  integer,
  boolean,
  timestamp,
  numeric,
  jsonb,
  pgEnum,
  index,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// === Enums ===
export const orderStatusEnum = pgEnum("order_status", [
  "pending_payment",
  "payment_submitted",
  "verified",
  "packing",
  "shipped",
  "completed",
  "cancelled",
]);

export const botProviderEnum = pgEnum("bot_provider", [
  "none",
  "telegram",
  "whatsapp_api",
]);

// === 1. Products (Master Item) ===
export const products = pgTable(
  "products",
  {
    id: serial("id").primaryKey(),
    slug: text("slug").notNull(),
    name: text("name").notNull(),
    groupArtist: text("group_artist"),
    category: text("category").notNull().default("Album"),
    description: text("description"),
    primaryImageUrl: text("primary_image_url").notNull(),
    isPreOrder: boolean("is_pre_order").notNull().default(false),
    preOrderDeadline: text("pre_order_deadline"),
    preOrderQuotaMode: text("pre_order_quota_mode").notNull().default("finite"), // "finite" | "open"
    isNewArrival: boolean("is_new_arrival").notNull().default(false),
    isBestSeller: boolean("is_best_seller").notNull().default(false),
    isPublished: boolean("is_published").notNull().default(true),
    sortOrder: integer("sort_order").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("products_slug_idx").on(table.slug),
    index("products_published_new_idx").on(table.isPublished, table.isNewArrival),
  ]
);

// === 2. Product Versions (Ready Stock Variants with Individual Price RM & Stock) ===
export const productVersions = pgTable(
  "product_versions",
  {
    id: serial("id").primaryKey(),
    productId: integer("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    versionName: text("version_name").notNull(), // e.g., "Ver. A", "Ver. B", "Full Set"
    sku: text("sku").notNull(),
    priceRm: numeric("price_rm", { precision: 10, scale: 2 }).notNull(),
    stock: integer("stock").notNull().default(0),
    imageUrl: text("image_url"), // optional override for specific version photo
    isBundle: boolean("is_bundle").notNull().default(false),
    bundleMode: text("bundle_mode").notNull().default("standalone"), // "standalone" | "linked"
    linkedVersionIds: text("linked_version_ids"), // optional JSON array string e.g. "[101, 102]"
    isActive: boolean("is_active").notNull().default(true),
    sortOrder: integer("sort_order").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("product_versions_sku_idx").on(table.sku),
    index("product_versions_product_idx").on(table.productId, table.isActive),
  ]
);

// === 3. Orders (5-Step Customer Checkout & Verification) ===
export const orders = pgTable(
  "orders",
  {
    id: serial("id").primaryKey(),
    orderCode: text("order_code").notNull(), // e.g., "MV-20261115-8492"
    customerName: text("customer_name").notNull(),
    customerWhatsapp: text("customer_whatsapp").notNull(), // e.g., "60123456789"
    customerEmail: text("customer_email"),

    // Shipping Address (Malaysia)
    addressLine1: text("address_line1").notNull(),
    addressLine2: text("address_line2"),
    postcode: text("postcode").notNull(),
    city: text("city").notNull(),
    state: text("state").notNull(), // e.g., "Selangor", "W.P. Kuala Lumpur", "Sabah"
    notes: text("notes"),

    // Server-Calculated Amounts in MYR (RM)
    subtotalRm: numeric("subtotal_rm", { precision: 10, scale: 2 }).notNull(),
    shippingFeeRm: numeric("shipping_fee_rm", { precision: 10, scale: 2 }).notNull(),
    totalRm: numeric("total_rm", { precision: 10, scale: 2 }).notNull(),

    // Payment & Fulfillment
    status: orderStatusEnum("status").notNull().default("pending_payment"),
    paymentReceiptUrl: text("payment_receipt_url"),
    paymentReference: text("payment_reference"),
    paymentSubmittedAt: timestamp("payment_submitted_at", { withTimezone: true }),
    verifiedAt: timestamp("verified_at", { withTimezone: true }),
    courierName: text("courier_name"),
    trackingNumber: text("tracking_number"),
    shippedAt: timestamp("shipped_at", { withTimezone: true }),
    stockRestoredAt: timestamp("stock_restored_at", { withTimezone: true }),

    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("orders_code_idx").on(table.orderCode),
    index("orders_status_created_idx").on(table.status, table.createdAt),
  ]
);

// === 4. Order Items (Immutable Price & Version Snapshot) ===
export const orderItems = pgTable(
  "order_items",
  {
    id: serial("id").primaryKey(),
    orderId: integer("order_id")
      .notNull()
      .references(() => orders.id, { onDelete: "cascade" }),
    productId: integer("product_id").references(() => products.id, { onDelete: "set null" }),
    productVersionId: integer("product_version_id").references(() => productVersions.id, {
      onDelete: "set null",
    }),
    productNameSnapshot: text("product_name_snapshot").notNull(),
    versionNameSnapshot: text("version_name_snapshot").notNull(),
    unitPriceRm: numeric("unit_price_rm", { precision: 10, scale: 2 }).notNull(),
    quantity: integer("quantity").notNull(),
    lineTotalRm: numeric("line_total_rm", { precision: 10, scale: 2 }).notNull(),
  },
  (table) => [index("order_items_order_idx").on(table.orderId)]
);

// === 5. Customer Reviews (WhatsApp Screenshot Gallery) ===
export const customerReviews = pgTable("customer_reviews", {
  id: serial("id").primaryKey(),
  imageUrl: text("image_url").notNull(),
  caption: text("caption"), // Short English caption if needed
  isPublished: boolean("is_published").notNull().default(true),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

// === 6. Store Settings (Single-Row Dynamic Configuration for PDF Guardrails) ===
export type FaqItem = {
  id: string;
  question: string;
  answer: string;
};

export const storeSettings = pgTable("store_settings", {
  id: integer("id").primaryKey().default(1),

  // Brand Assets & Hero Banner
  brandLogoUrl: text("brand_logo_url"), // Official transparent SVG/PNG mv monogram
  heroBannerImageUrl: text("hero_banner_image_url"),
  heroBannerBadge: text("hero_banner_badge"),
  heroBannerTitle: text("hero_banner_title"),
  heroBannerLink: text("hero_banner_link"),

  // Shipping (Malaysia Flat Rate + Free Shipping Threshold)
  shippingEnabled: boolean("shipping_enabled").notNull().default(false),
  flatShippingFeeRm: numeric("flat_shipping_fee_rm", { precision: 10, scale: 2 })
    .notNull()
    .default("0.00"),
  freeShippingMinRm: numeric("free_shipping_min_rm", { precision: 10, scale: 2 }),

  // Payment Instructions (Shown ONLY when enabled & confirmed by Admin)
  paymentEnabled: boolean("payment_enabled").notNull().default(false),
  bankName: text("bank_name"),
  bankAccountNumber: text("bank_account_number"),
  bankAccountHolder: text("bank_account_holder"),
  duitnowQrImageUrl: text("duitnow_qr_image_url"),
  paymentInstructions: text("payment_instructions"),

  // WhatsApp, Instagram & Admin Bot Notifications
  adminWhatsappNumber: text("admin_whatsapp_number"), // e.g., "60123456789"
  instagramUrl: text("instagram_url"), // e.g., "https://instagram.com/myvelorastore" or "@myvelorastore"
  botProvider: botProviderEnum("bot_provider").notNull().default("none"),
  botApiEndpointOrToken: text("bot_api_endpoint_or_token"),
  botTargetChatId: text("bot_target_chat_id"),

  // Policies & FAQ (Hidden publicly until confirmed & enabled by Admin)
  faqEnabled: boolean("faq_enabled").notNull().default(false),
  faqItems: jsonb("faq_items").$type<FaqItem[]>().notNull().default([]),
  returnPolicyEnabled: boolean("return_policy_enabled").notNull().default(false),
  returnPolicyText: text("return_policy_text"),

  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

// === Relations ===
export const productsRelations = relations(products, ({ many }) => ({
  versions: many(productVersions),
}));

export const productVersionsRelations = relations(productVersions, ({ one }) => ({
  product: one(products, {
    fields: [productVersions.productId],
    references: [products.id],
  }),
}));

export const ordersRelations = relations(orders, ({ many }) => ({
  items: many(orderItems),
}));

export const orderItemsRelations = relations(orderItems, ({ one }) => ({
  order: one(orders, {
    fields: [orderItems.orderId],
    references: [orders.id],
  }),
  product: one(products, {
    fields: [orderItems.productId],
    references: [products.id],
  }),
  version: one(productVersions, {
    fields: [orderItems.productVersionId],
    references: [productVersions.id],
  }),
}));
