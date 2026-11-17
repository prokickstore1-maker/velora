import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const s3Endpoint = process.env.S3_ENDPOINT;
const s3Region = process.env.S3_REGION || "ap-southeast-1";
const s3Bucket = process.env.S3_BUCKET || "myvelorastore";
const s3AccessKeyId = process.env.S3_ACCESS_KEY_ID || "";
const s3SecretAccessKey = process.env.S3_SECRET_ACCESS_KEY || "";
const s3ForcePathStyle = process.env.S3_FORCE_PATH_STYLE === "true";
const s3PublicBaseUrl = process.env.S3_PUBLIC_BASE_URL;

export const s3Client = new S3Client({
  region: s3Region,
  endpoint: s3Endpoint,
  credentials: {
    accessKeyId: s3AccessKeyId,
    secretAccessKey: s3SecretAccessKey,
  },
  forcePathStyle: s3ForcePathStyle,
});

export const ALLOWED_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/svg+xml", // Allowed for official brand logo SVG
] as const;

export type AllowedMimeType = (typeof ALLOWED_MIME_TYPES)[number];

interface GetPresignedUrlOptions {
  folder: "products" | "receipts" | "reviews" | "brand";
  filename: string;
  contentType: AllowedMimeType;
}

/**
 * Generate a secure presigned upload URL for direct S3/MinIO upload from browser
 */
export async function createPresignedUploadUrl({
  folder,
  filename,
  contentType,
}: GetPresignedUrlOptions): Promise<{ uploadUrl: string; fileKey: string; publicUrl: string }> {
  if (!ALLOWED_MIME_TYPES.includes(contentType)) {
    throw new Error(`Unsupported content type: ${contentType}`);
  }

  // Sanitize filename & create unique key
  const sanitizedName = filename.toLowerCase().replace(/[^a-z0-9.-]/g, "_");
  const uniquePrefix = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
  const fileKey = `${folder}/${uniquePrefix}-${sanitizedName}`;

  const command = new PutObjectCommand({
    Bucket: s3Bucket,
    Key: fileKey,
    ContentType: contentType,
  });

  // URL valid for 10 minutes
  const uploadUrl = await getSignedUrl(s3Client, command, { expiresIn: 600 });

  const publicUrl = s3PublicBaseUrl
    ? `${s3PublicBaseUrl.replace(/\/$/, "")}/${fileKey}`
    : `${s3Endpoint ? s3Endpoint.replace(/\/$/, "") : `https://${s3Bucket}.s3.${s3Region}.amazonaws.com`}/${fileKey}`;

  return { uploadUrl, fileKey, publicUrl };
}
