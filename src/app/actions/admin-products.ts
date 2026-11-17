"use server";

import { z } from "zod";
import { db, hasDatabaseUrl } from "@/db";
import { products, productVersions } from "@/db/schema";
import { MOCK_PRODUCTS } from "@/db/mock-data";
import { eq } from "drizzle-orm";
import { updateTag } from "next/cache";

const imageUrlValidator = z
  .string()
  .trim()
  .refine(
    (val) => val.startsWith("http://") || val.startsWith("https://") || val.startsWith("data:image/") || val.startsWith("/"),
    "Valid image URL or uploaded photo required"
  );

const productVersionInputSchema = z.object({
  id: z.number().optional(),
  versionName: z.string().trim().min(1, "Version name required"),
  sku: z.string().trim().min(1, "SKU required"),
  priceRm: z.string().trim().min(1, "Price RM required"),
  stock: z.number().int().min(0, "Stock cannot be negative"),
  imageUrl: z.string().trim().optional().or(z.literal("")),
  isBundle: z.boolean().optional().default(false),
  bundleMode: z.enum(["standalone", "linked"]).optional().default("standalone"),
  linkedVersionIds: z.string().trim().optional().nullable(),
  discountPercent: z.number().int().min(0).max(99).optional().default(0),
  isActive: z.boolean().optional().default(true),
});

const productSchema = z.object({
  id: z.number().optional(),
  name: z.string().trim().min(2, "Product name required"),
  slug: z.string().trim().min(2, "Product slug required"),
  groupArtist: z.string().trim().optional(),
  category: z.string().trim().min(2).default("Album"),
  description: z.string().trim().optional(),
  primaryImageUrl: imageUrlValidator,
  isPreOrder: z.boolean().optional().default(false),
  preOrderDeadline: z.string().trim().optional().nullable(),
  preOrderQuotaMode: z.enum(["finite", "open"]).optional().default("finite"),
  isNewArrival: z.boolean().optional().default(false),
  isBestSeller: z.boolean().optional().default(false),
  isPublished: z.boolean().optional().default(true),
  versions: z.array(productVersionInputSchema).optional(),
});

const versionSchema = z.object({
  id: z.number().optional(),
  productId: z.number().int().positive(),
  versionName: z.string().trim().min(1, "Version name required"),
  sku: z.string().trim().min(2, "SKU required"),
  priceRm: z.string().trim().min(1, "Price RM required"),
  stock: z.number().int().min(0, "Stock cannot be negative"),
  imageUrl: z.string().trim().optional().or(z.literal("")),
  isBundle: z.boolean().optional().default(false),
  bundleMode: z.enum(["standalone", "linked"]).optional().default("standalone"),
  linkedVersionIds: z.string().trim().optional().nullable(),
  discountPercent: z.number().int().min(0).max(99).optional().default(0),
  isActive: z.boolean().optional().default(true),
});

export async function upsertProductAction(rawData: z.input<typeof productSchema>) {
  const parsed = productSchema.safeParse(rawData);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message };
  }

  const { id, versions: incomingVersions, ...data } = parsed.data;

  // Task 6: Block raw base64 data URLs in production to preserve database performance
  if (
    process.env.NODE_ENV === "production" &&
    data.primaryImageUrl?.startsWith("data:image/")
  ) {
    return {
      success: false,
      error: "Base64 images are not permitted in production. Please upload via S3 storage.",
    };
  }

  try {
    if (!hasDatabaseUrl) {
      let targetProductId = id;
      if (id) {
        const idx = MOCK_PRODUCTS.findIndex((p) => p.id === id);
        if (idx !== -1) {
          MOCK_PRODUCTS[idx] = {
            ...MOCK_PRODUCTS[idx],
            name: data.name,
            slug: data.slug,
            groupArtist: data.groupArtist || "",
            category: data.category,
            description: data.description || "",
            primaryImageUrl: data.primaryImageUrl,
            isPreOrder: data.isPreOrder,
            preOrderDeadline: data.isPreOrder ? data.preOrderDeadline || null : null,
            preOrderQuotaMode: data.preOrderQuotaMode,
            isNewArrival: data.isNewArrival,
            isBestSeller: data.isBestSeller,
            isPublished: data.isPublished,
          };
        }
      } else {
        const nextId = Math.max(0, ...MOCK_PRODUCTS.map((p) => p.id)) + 1;
        targetProductId = nextId;
        MOCK_PRODUCTS.unshift({
          id: nextId,
          name: data.name,
          slug: data.slug,
          groupArtist: data.groupArtist || "",
          category: data.category,
          description: data.description || "",
          primaryImageUrl: data.primaryImageUrl,
          isPreOrder: data.isPreOrder,
          preOrderDeadline: data.isPreOrder ? data.preOrderDeadline || null : null,
          preOrderQuotaMode: data.preOrderQuotaMode,
          isNewArrival: data.isNewArrival,
          isBestSeller: data.isBestSeller,
          isPublished: data.isPublished,
          sortOrder: nextId,
          versions: [],
        });
      }

      if (incomingVersions && incomingVersions.length > 0 && targetProductId) {
        const prod = MOCK_PRODUCTS.find((p) => p.id === targetProductId);
        if (prod) {
          const allVersionIds = MOCK_PRODUCTS.flatMap((p) => p.versions.map((v) => v.id));
          let nextVId = Math.max(1000, ...allVersionIds) + 1;
          prod.versions = incomingVersions.map((v, idx) => ({
            id: v.id || nextVId++,
            versionName: v.versionName,
            sku: v.sku,
            priceRm: v.priceRm,
            stock: v.stock,
            imageUrl: v.imageUrl || undefined,
            isBundle: v.isBundle ?? false,
            bundleMode: v.bundleMode ?? "standalone",
            linkedVersionIds: v.linkedVersionIds || undefined,
            isActive: v.isActive !== false,
            sortOrder: idx + 1,
          }));
        }
      }

      updateTag("products");
      return { success: true };
    }

    const dbPayload = {
      ...data,
      preOrderDeadline: data.isPreOrder ? data.preOrderDeadline || null : null,
    };

    // Task 2: Non-Destructive Version Upsert inside db.transaction
    await db.transaction(async (tx) => {
      let savedProductId = id;
      if (id) {
        await tx
          .update(products)
          .set({ ...dbPayload, updatedAt: new Date() })
          .where(eq(products.id, id));
      } else {
        const [inserted] = await tx
          .insert(products)
          .values(dbPayload)
          .returning({ id: products.id });
        savedProductId = inserted?.id;
      }

      if (!savedProductId) {
        throw new Error("Failed to resolve product ID for version synchronization.");
      }

      if (incomingVersions && incomingVersions.length > 0) {
        // 1. Fetch existing versions for this product
        const existingVersions = await tx
          .select()
          .from(productVersions)
          .where(eq(productVersions.productId, savedProductId));

        const existingMap = new Map(existingVersions.map((v) => [v.id, v]));

        // 2. Upsert each incoming version
        for (let idx = 0; idx < incomingVersions.length; idx++) {
          const v = incomingVersions[idx];
          if (v.id && existingMap.has(v.id)) {
            // Existing version -> non-destructive UPDATE
            await tx
              .update(productVersions)
              .set({
                versionName: v.versionName,
                sku: v.sku,
                priceRm: v.priceRm,
                stock: v.stock,
                imageUrl: v.imageUrl || null,
                isBundle: v.isBundle ?? false,
                bundleMode: v.bundleMode ?? "standalone",
                linkedVersionIds: v.linkedVersionIds || null,
                discountPercent: v.discountPercent ?? 0,
                isActive: v.isActive !== false,
                sortOrder: idx + 1,
                updatedAt: new Date(),
              })
              .where(eq(productVersions.id, v.id));
            existingMap.delete(v.id);
          } else {
            // New version -> INSERT
            await tx.insert(productVersions).values({
              productId: savedProductId,
              versionName: v.versionName,
              sku: v.sku,
              priceRm: v.priceRm,
              stock: v.stock,
              imageUrl: v.imageUrl || null,
              isBundle: v.isBundle ?? false,
              bundleMode: v.bundleMode ?? "standalone",
              linkedVersionIds: v.linkedVersionIds || null,
              discountPercent: v.discountPercent ?? 0,
              isActive: v.isActive !== false,
              sortOrder: idx + 1,
            });
          }
        }

        // 3. For any remaining existing versions removed by the admin, soft-deactivate them
        // This prevents breaking existing cart items and historical order references
        for (const [staleId] of existingMap) {
          await tx
            .update(productVersions)
            .set({
              isActive: false,
              updatedAt: new Date(),
            })
            .where(eq(productVersions.id, staleId));
        }
      }
    });

    updateTag("products");
    return { success: true };
  } catch (err: unknown) {
    console.error("Upsert product error:", err);
    const message = err instanceof Error ? err.message : "Failed to save product.";
    return { success: false, error: message };
  }
}

export async function upsertVersionAction(rawData: z.input<typeof versionSchema>) {
  const parsed = versionSchema.safeParse(rawData);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message };
  }

  const { id, imageUrl, ...data } = parsed.data;

  try {
    if (!hasDatabaseUrl) {
      const prod = MOCK_PRODUCTS.find((p) => p.id === data.productId);
      if (prod) {
        if (id) {
          const vIdx = prod.versions.findIndex((v) => v.id === id);
          if (vIdx !== -1) {
            prod.versions[vIdx] = {
              ...prod.versions[vIdx],
              versionName: data.versionName,
              sku: data.sku,
              priceRm: data.priceRm,
              stock: data.stock,
              imageUrl: imageUrl || undefined,
              isBundle: data.isBundle ?? false,
              bundleMode: data.bundleMode ?? "standalone",
              linkedVersionIds: data.linkedVersionIds || undefined,
              isActive: data.isActive,
            };
          }
        } else {
          const allVersionIds = MOCK_PRODUCTS.flatMap((p) => p.versions.map((v) => v.id));
          const nextVId = Math.max(1000, ...allVersionIds) + 1;
          prod.versions.push({
            id: nextVId,
            versionName: data.versionName,
            sku: data.sku,
            priceRm: data.priceRm,
            stock: data.stock,
            imageUrl: imageUrl || undefined,
            isBundle: data.isBundle ?? false,
            bundleMode: data.bundleMode ?? "standalone",
            linkedVersionIds: data.linkedVersionIds || undefined,
            isActive: data.isActive,
            sortOrder: prod.versions.length + 1,
          });
        }
      }
      updateTag("products");
      return { success: true };
    }

    if (id) {
      await db
        .update(productVersions)
        .set({
          ...data,
          imageUrl: imageUrl || null,
          updatedAt: new Date(),
        })
        .where(eq(productVersions.id, id));
    } else {
      await db.insert(productVersions).values({
        ...data,
        imageUrl: imageUrl || null,
      });
    }

    updateTag("products");
    return { success: true };
  } catch (err: unknown) {
    console.error("Upsert version error:", err);
    const message = err instanceof Error ? err.message : "Failed to save version.";
    return { success: false, error: message };
  }
}

export async function deleteProductAction(productId: number) {
  try {
    if (!hasDatabaseUrl) {
      const idx = MOCK_PRODUCTS.findIndex((p) => p.id === productId);
      if (idx !== -1) MOCK_PRODUCTS.splice(idx, 1);
      updateTag("products");
      return { success: true };
    }
    await db.delete(products).where(eq(products.id, productId));
    updateTag("products");
    return { success: true };
  } catch (err) {
    console.error("Delete product error:", err);
    return { success: false, error: "Failed to delete product." };
  }
}

export async function deleteVersionAction(versionId: number) {
  try {
    if (!hasDatabaseUrl) {
      for (const prod of MOCK_PRODUCTS) {
        const vIdx = prod.versions.findIndex((v) => v.id === versionId);
        if (vIdx !== -1) {
          prod.versions.splice(vIdx, 1);
          break;
        }
      }
      updateTag("products");
      return { success: true };
    }
    await db.delete(productVersions).where(eq(productVersions.id, versionId));
    updateTag("products");
    return { success: true };
  } catch (err) {
    console.error("Delete version error:", err);
    return { success: false, error: "Failed to delete version." };
  }
}
