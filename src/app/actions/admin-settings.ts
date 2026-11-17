"use server";

import { z } from "zod";
import { db, hasDatabaseUrl } from "@/db";
import { storeSettings } from "@/db/schema";
import { MOCK_STORE_SETTINGS } from "@/db/mock-data";
import { createPresignedUploadUrl, AllowedMimeType } from "@/lib/s3";
import { updateTag } from "next/cache";

const faqItemSchema = z.object({
  id: z.string(),
  question: z.string().trim().min(2),
  answer: z.string().trim().min(2),
});

const settingsSchema = z.object({
  brandLogoUrl: z.string().trim().optional().or(z.literal("")).nullable(),
  heroBannerImageUrl: z.string().trim().optional().or(z.literal("")).nullable(),
  heroBannerBadge: z.string().trim().optional().or(z.literal("")).nullable(),
  heroBannerTitle: z.string().trim().optional().or(z.literal("")).nullable(),
  heroBannerLink: z.string().trim().optional().or(z.literal("")).nullable(),

  // Shipping
  shippingEnabled: z.boolean().default(false),
  flatShippingFeeRm: z.string().trim().default("0.00"),
  freeShippingMinRm: z.string().trim().optional().or(z.literal("")).nullable(),

  // Payment
  paymentEnabled: z.boolean().default(false),
  bankName: z.string().trim().optional().nullable(),
  bankAccountNumber: z.string().trim().optional().nullable(),
  bankAccountHolder: z.string().trim().optional().nullable(),
  duitnowQrImageUrl: z.string().trim().optional().or(z.literal("")).nullable(),
  paymentInstructions: z.string().trim().optional().nullable(),

  // WhatsApp, Instagram & Bot
  adminWhatsappNumber: z.string().trim().optional().nullable(),
  instagramUrl: z.string().trim().optional().or(z.literal("")).nullable(),
  botProvider: z.enum(["none", "telegram", "whatsapp_api"]).default("none"),
  botApiEndpointOrToken: z.string().trim().optional().nullable(),
  botTargetChatId: z.string().trim().optional().nullable(),

  // FAQ & Policy
  faqEnabled: z.boolean().default(false),
  faqItems: z.array(faqItemSchema).default([]),
  returnPolicyEnabled: z.boolean().default(false),
  returnPolicyText: z.string().trim().optional().nullable(),
});

export async function getBrandAssetPresignedUrlAction(
  filename: string,
  contentType: AllowedMimeType
) {
  const hasS3Config = Boolean(process.env.S3_ACCESS_KEY_ID && process.env.S3_SECRET_ACCESS_KEY);
  if (!hasS3Config) {
    return { success: false, s3Offline: true as const };
  }

  try {
    const { uploadUrl, fileKey, publicUrl } = await createPresignedUploadUrl({
      folder: "brand",
      filename,
      contentType,
    });
    return { success: true, uploadUrl, fileKey, publicUrl };
  } catch (err) {
    console.error("Failed to create brand asset presigned URL:", err);
    return { success: false, error: "Failed to generate S3 upload URL." };
  }
}

export async function updateStoreSettingsAction(rawData: z.infer<typeof settingsSchema>) {
  const parsed = settingsSchema.safeParse(rawData);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message || "Invalid settings input." };
  }

  const data = parsed.data;

  // Always keep in-memory mock synchronized for local preview mode
  Object.assign(MOCK_STORE_SETTINGS, {
    ...data,
    brandLogoUrl: data.brandLogoUrl || null,
    heroBannerImageUrl: data.heroBannerImageUrl || null,
    heroBannerBadge: data.heroBannerBadge || null,
    heroBannerTitle: data.heroBannerTitle || null,
    heroBannerLink: data.heroBannerLink || null,
    freeShippingMinRm: data.freeShippingMinRm || null,
    bankName: data.bankName || null,
    bankAccountNumber: data.bankAccountNumber || null,
    bankAccountHolder: data.bankAccountHolder || null,
    duitnowQrImageUrl: data.duitnowQrImageUrl || null,
    paymentInstructions: data.paymentInstructions || null,
    adminWhatsappNumber: data.adminWhatsappNumber || null,
    instagramUrl: data.instagramUrl || null,
    botApiEndpointOrToken: data.botApiEndpointOrToken || null,
    botTargetChatId: data.botTargetChatId || null,
    returnPolicyText: data.returnPolicyText || null,
    updatedAt: new Date(),
  });

  if (!hasDatabaseUrl) {
    updateTag("settings");
    return { success: true };
  }

  try {
    await db
      .insert(storeSettings)
      .values({
        id: 1,
        ...data,
        updatedAt: new Date(),
      })
      .onConflictDoUpdate({
        target: storeSettings.id,
        set: {
          ...data,
          updatedAt: new Date(),
        },
      });

    updateTag("settings");
    return { success: true };
  } catch (err: unknown) {
    console.error("Failed to update store settings:", err);
    const message = err instanceof Error ? err.message : "Failed to save settings.";
    return { success: false, error: message };
  }
}
