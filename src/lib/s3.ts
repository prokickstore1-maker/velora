import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

// Support both standard S3 env names and common aliases (used across IDCloudHost projects)
export function getS3Env(key: string): string {
  const aliases: Record<string, string[]> = {
    S3_ENDPOINT: ["S3_ENDPOINT"],
    S3_REGION: ["S3_REGION"],
    S3_BUCKET: ["S3_BUCKET", "S3_BUCKET_PUBLIC", "S3_PUBLIC_BUCKET"],
    S3_ACCESS_KEY_ID: ["S3_ACCESS_KEY_ID", "S3_ACCESS_KEY"],
    S3_SECRET_ACCESS_KEY: ["S3_SECRET_ACCESS_KEY", "S3_SECRET_KEY"],
    S3_PUBLIC_BASE_URL: ["S3_PUBLIC_BASE_URL", "NEXT_PUBLIC_S3_PUBLIC_URL"],
  };

  const candidates = aliases[key] || [key];
  for (const name of candidates) {
    const val = process.env[name]?.trim();
    if (val) return val;
  }
  return "";
}

export function isS3Configured(): boolean {
  return Boolean(
    getS3Env("S3_ENDPOINT") &&
    getS3Env("S3_ACCESS_KEY_ID") &&
    getS3Env("S3_SECRET_ACCESS_KEY") &&
    getS3Env("S3_BUCKET")
  );
}

const s3Endpoint = getS3Env("S3_ENDPOINT") || "https://is3.cloudhost.id";
const s3Region = getS3Env("S3_REGION") || "us-east-1";
const s3Bucket = getS3Env("S3_BUCKET") || "velora";
const s3AccessKeyId = getS3Env("S3_ACCESS_KEY_ID");
const s3SecretAccessKey = getS3Env("S3_SECRET_ACCESS_KEY");
const s3ForcePathStyle = process.env.S3_FORCE_PATH_STYLE !== "false"; // Default true for Ceph/IDCloudHost
const s3PublicBaseUrl = getS3Env("S3_PUBLIC_BASE_URL");

export const s3Client = new S3Client({
  region: s3Region,
  endpoint: s3Endpoint,
  credentials: {
    accessKeyId: s3AccessKeyId,
    secretAccessKey: s3SecretAccessKey,
  },
  forcePathStyle: s3ForcePathStyle,
  // Ceph / IDCloudHost compatibility: disable automatic CRC32/CRC64 flexible checksums that trigger 400 InvalidArgument
  requestChecksumCalculation: "WHEN_REQUIRED",
  responseChecksumValidation: "WHEN_REQUIRED",
});

export const ALLOWED_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/svg+xml", // Allowed for official brand logo SVG
] as const;

export type AllowedMimeType = (typeof ALLOWED_MIME_TYPES)[number];

interface GetPresignedUrlOptions {
  folder: "products" | "receipts" | "reviews" | "brand" | "artists";
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

/**
 * Direct server-side upload to S3/IDCloudHost (Bypasses any browser CORS issues)
 * Resilient against Ceph S3 ACL policies (retries automatically without ACL if canned ACL is rejected)
 */
export async function uploadBufferToS3({
  buffer,
  folder,
  filename,
  contentType,
}: {
  buffer: Buffer;
  folder: "products" | "receipts" | "reviews" | "brand" | "artists";
  filename: string;
  contentType: AllowedMimeType;
}): Promise<{ fileKey: string; publicUrl: string }> {
  if (!ALLOWED_MIME_TYPES.includes(contentType)) {
    throw new Error(`Unsupported content type: ${contentType}`);
  }

  const sanitizedName = filename.toLowerCase().replace(/[^a-z0-9.-]/g, "_");
  const uniquePrefix = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
  const fileKey = `${folder}/${uniquePrefix}-${sanitizedName}`;

  try {
    // Attempt standard public-read ACL first
    await s3Client.send(
      new PutObjectCommand({
        Bucket: s3Bucket,
        Key: fileKey,
        Body: buffer,
        ContentType: contentType,
        ACL: "public-read",
      })
    );
  } catch {
    // If Ceph/IDCloudHost rejects Canned ACL headers, retry standard PutObject without ACL
    await s3Client.send(
      new PutObjectCommand({
        Bucket: s3Bucket,
        Key: fileKey,
        Body: buffer,
        ContentType: contentType,
      })
    );
  }

  const publicUrl = s3PublicBaseUrl
    ? `${s3PublicBaseUrl.replace(/\/$/, "")}/${fileKey}`
    : `${s3Endpoint ? s3Endpoint.replace(/\/$/, "") : `https://is3.cloudhost.id/${s3Bucket}`}/${fileKey}`;

  return { fileKey, publicUrl };
}
