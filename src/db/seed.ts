import { db } from "./index";
import { products, productVersions, customerReviews, storeSettings } from "./schema";
import { MOCK_PRODUCTS, MOCK_REVIEWS, MOCK_STORE_SETTINGS } from "./mock-data";
import { eq } from "drizzle-orm";

async function main() {
  console.log("🌱 Starting Myvelora Store database seeding...");

  // 1. Seed or Update Store Settings
  console.log("⚙️  Seeding Store Settings...");
  await db
    .insert(storeSettings)
    .values({
      id: 1,
      brandLogoUrl: MOCK_STORE_SETTINGS.brandLogoUrl,
      shippingEnabled: MOCK_STORE_SETTINGS.shippingEnabled,
      flatShippingFeeRm: MOCK_STORE_SETTINGS.flatShippingFeeRm,
      freeShippingMinRm: MOCK_STORE_SETTINGS.freeShippingMinRm,
      paymentEnabled: MOCK_STORE_SETTINGS.paymentEnabled,
      bankName: MOCK_STORE_SETTINGS.bankName,
      bankAccountNumber: MOCK_STORE_SETTINGS.bankAccountNumber,
      bankAccountHolder: MOCK_STORE_SETTINGS.bankAccountHolder,
      duitnowQrImageUrl: MOCK_STORE_SETTINGS.duitnowQrImageUrl,
      paymentInstructions: MOCK_STORE_SETTINGS.paymentInstructions,
      adminWhatsappNumber: MOCK_STORE_SETTINGS.adminWhatsappNumber,
      botProvider: MOCK_STORE_SETTINGS.botProvider,
      botApiEndpointOrToken: MOCK_STORE_SETTINGS.botApiEndpointOrToken,
      botTargetChatId: MOCK_STORE_SETTINGS.botTargetChatId,
      faqEnabled: MOCK_STORE_SETTINGS.faqEnabled,
      faqItems: MOCK_STORE_SETTINGS.faqItems,
      returnPolicyEnabled: MOCK_STORE_SETTINGS.returnPolicyEnabled,
      returnPolicyText: MOCK_STORE_SETTINGS.returnPolicyText,
    })
    .onConflictDoUpdate({
      target: storeSettings.id,
      set: {
        shippingEnabled: MOCK_STORE_SETTINGS.shippingEnabled,
        flatShippingFeeRm: MOCK_STORE_SETTINGS.flatShippingFeeRm,
        freeShippingMinRm: MOCK_STORE_SETTINGS.freeShippingMinRm,
        paymentEnabled: MOCK_STORE_SETTINGS.paymentEnabled,
        bankName: MOCK_STORE_SETTINGS.bankName,
        bankAccountNumber: MOCK_STORE_SETTINGS.bankAccountNumber,
        bankAccountHolder: MOCK_STORE_SETTINGS.bankAccountHolder,
        duitnowQrImageUrl: MOCK_STORE_SETTINGS.duitnowQrImageUrl,
        paymentInstructions: MOCK_STORE_SETTINGS.paymentInstructions,
        adminWhatsappNumber: MOCK_STORE_SETTINGS.adminWhatsappNumber,
        faqEnabled: MOCK_STORE_SETTINGS.faqEnabled,
        faqItems: MOCK_STORE_SETTINGS.faqItems,
      },
    });

  // 2. Seed Customer Reviews
  console.log("💬 Seeding Customer Reviews...");
  for (const review of MOCK_REVIEWS) {
    await db.insert(customerReviews).values({
      imageUrl: review.imageUrl,
      caption: review.caption,
      isPublished: review.isPublished,
      sortOrder: review.sortOrder,
    });
  }

  // 3. Seed Products and Versions
  console.log("🛍️  Seeding K-Pop Merchandise Catalog...");
  for (const item of MOCK_PRODUCTS) {
    // Check if product already exists by slug
    const existing = await db.query.products.findFirst({
      where: eq(products.slug, item.slug),
    });

    let productId: number;

    if (existing) {
      productId = existing.id;
      console.log(`- Product "${item.name}" already exists, skipping insert.`);
    } else {
      const [inserted] = await db
        .insert(products)
        .values({
          slug: item.slug,
          name: item.name,
          groupArtist: item.groupArtist,
          category: item.category,
          description: item.description,
          primaryImageUrl: item.primaryImageUrl,
          isNewArrival: item.isNewArrival,
          isPublished: item.isPublished,
          sortOrder: item.sortOrder,
        })
        .returning();
      productId = inserted.id;
      console.log(`+ Inserted product: ${item.name}`);
    }

    // Insert Versions
    for (const ver of item.versions) {
      const existingVer = await db.query.productVersions.findFirst({
        where: eq(productVersions.sku, ver.sku),
      });

      if (!existingVer) {
        await db.insert(productVersions).values({
          productId,
          versionName: ver.versionName,
          sku: ver.sku,
          priceRm: ver.priceRm,
          stock: ver.stock,
          imageUrl: ver.imageUrl || null,
          isActive: ver.isActive,
          sortOrder: ver.sortOrder,
        });
        console.log(`  + Version: ${ver.versionName} (${ver.sku})`);
      }
    }
  }

  console.log("✅ Seeding completed successfully!");
  process.exit(0);
}

main().catch((e) => {
  console.error("❌ Seeding failed:", e);
  process.exit(1);
});
