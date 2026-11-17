import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";
import { MOCK_STORE_SETTINGS } from "./mock-data";

export const hasDatabaseUrl = Boolean(process.env.DATABASE_URL);

const connectionString = process.env.DATABASE_URL || "postgresql://postgres:postgres@localhost:5432/myvelorastore";

// For queries and server actions
const client = postgres(connectionString, {
  max: 10,
  idle_timeout: 20,
  connect_timeout: 10,
});

export const db = drizzle(client, { schema });

/**
 * Helper to ensure default Store Settings exist on DB bootstrap
 * Guardrail compliance: default all public unconfirmed claims to FALSE
 */
export async function getOrCreateStoreSettings(): Promise<schema.StoreSettings> {
  if (!hasDatabaseUrl) {
    return MOCK_STORE_SETTINGS as unknown as schema.StoreSettings;
  }

  const existing = await db.query.storeSettings.findFirst({
    where: (s, { eq }) => eq(s.id, 1),
  });

  if (existing) {
    return existing;
  }

  const [created] = await db
    .insert(schema.storeSettings)
    .values({
      id: 1,
      brandLogoUrl: null,
      heroBannerImageUrl: null,
      heroBannerBadge: null,
      heroBannerTitle: null,
      heroBannerLink: null,
      shippingEnabled: false,
      flatShippingFeeRm: "0.00",
      freeShippingMinRm: null,
      paymentEnabled: false,
      bankName: null,
      bankAccountNumber: null,
      bankAccountHolder: null,
      duitnowQrImageUrl: null,
      paymentInstructions: null,
      adminWhatsappNumber: null,
      instagramUrl: null,
      botProvider: "none",
      botApiEndpointOrToken: null,
      botTargetChatId: null,
      faqEnabled: false,
      faqItems: [],
      returnPolicyEnabled: false,
      returnPolicyText: null,
    })
    .onConflictDoNothing()
    .returning();

  if (created) {
    return created;
  }

  // Fallback if concurrent insert
  const fallback = await db.query.storeSettings.findFirst({
    where: (s, { eq }) => eq(s.id, 1),
  });

  return fallback!;
}
