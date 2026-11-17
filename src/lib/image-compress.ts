/**
 * Client-Side Image Compression using HTML5 Canvas
 * Reduces photo sizes before direct S3 presigned upload
 * Prevents mobile memory issues & speeds up checkout proof upload
 */

export interface CompressionOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number; // 0.1 to 1.0 (default: 0.85)
  mimeType?: "image/webp" | "image/jpeg";
}

export interface CompressionResult {
  file: File;
  blob: Blob;
  width: number;
  height: number;
  originalSize: number;
  compressedSize: number;
}

export async function compressImage(
  file: File,
  options: CompressionOptions = {}
): Promise<CompressionResult> {
  const {
    maxWidth = 1400,
    maxHeight = 1750, // 4:5 ratio friendly (1400 x 1750)
    quality = 0.85,
    mimeType = "image/webp",
  } = options;

  // If SVG, do not compress via canvas
  if (file.type === "image/svg+xml") {
    return {
      file,
      blob: file,
      width: 0,
      height: 0,
      originalSize: file.size,
      compressedSize: file.size,
    };
  }

  return new Promise((resolve, reject) => {
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(objectUrl);

      let { width, height } = img;

      // Calculate constrained dimensions keeping aspect ratio
      if (width > maxWidth || height > maxHeight) {
        const ratio = Math.min(maxWidth / width, maxHeight / height);
        width = Math.round(width * ratio);
        height = Math.round(height * ratio);
      }

      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext("2d");
      if (!ctx) {
        reject(new Error("Unable to create canvas context"));
        return;
      }

      // Fill transparent background with white if converting PNG to JPEG
      if (mimeType === "image/jpeg") {
        ctx.fillStyle = "#FFFFFF";
        ctx.fillRect(0, 0, width, height);
      }

      ctx.drawImage(img, 0, 0, width, height);

      // Export canvas to blob
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error("Image compression failed"));
            return;
          }

          const extension = mimeType === "image/webp" ? "webp" : "jpg";
          const newFileName = file.name.replace(/\.[^/.]+$/, "") + `.${extension}`;

          const compressedFile = new File([blob], newFileName, {
            type: mimeType,
            lastModified: Date.now(),
          });

          resolve({
            file: compressedFile,
            blob,
            width,
            height,
            originalSize: file.size,
            compressedSize: blob.size,
          });
        },
        mimeType,
        quality
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error("Failed to load image for compression"));
    };

    img.src = objectUrl;
  });
}
