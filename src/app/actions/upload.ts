"use server";

import { uploadBufferToS3, AllowedMimeType, ALLOWED_MIME_TYPES, isS3Configured } from "@/lib/s3";

export interface UploadActionResult {
  success: boolean;
  publicUrl?: string;
  fileKey?: string;
  error?: string;
}

export async function uploadImageServerAction(formData: FormData): Promise<UploadActionResult> {
  const file = formData.get("file") as File | null;
  const folder = (formData.get("folder") as "products" | "receipts" | "reviews" | "brand") || "products";

  if (!file) {
    return { success: false, error: "No file provided" };
  }

  const mimeType = file.type as AllowedMimeType;
  if (!ALLOWED_MIME_TYPES.includes(mimeType)) {
    return { success: false, error: `Unsupported file format: ${file.type}. Please upload PNG, JPG, or WebP.` };
  }

  if (!isS3Configured()) {
    // In local development without S3 credentials, fallback to compressed Data URL so testing is never blocked
    if (process.env.NODE_ENV !== "production") {
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      return {
        success: true,
        publicUrl: `data:${mimeType};base64,${buffer.toString("base64")}`,
        fileKey: `local-dev-${Date.now()}`,
      };
    }
    return { success: false, error: "Object Storage is not configured on the server." };
  }

  try {
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const { publicUrl, fileKey } = await uploadBufferToS3({
      buffer,
      folder,
      filename: file.name || "upload.webp",
      contentType: mimeType,
    });

    return { success: true, publicUrl, fileKey };
  } catch (err: unknown) {
    console.error("Server-side S3 upload error:", err);
    return { success: false, error: err instanceof Error ? err.message : "Failed to upload image to storage" };
  }
}
