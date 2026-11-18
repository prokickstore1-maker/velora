import { db, hasDatabaseUrl, getOrCreateStoreSettings } from "@/db";
import { storeSettings, StoreSettings } from "@/db/schema";
import { eq } from "drizzle-orm";
import { MOCK_STORE_SETTINGS } from "@/db/mock-data";
import { uploadBufferToS3 } from "@/lib/s3";
import { evaluateStorePaymentStatus } from "@/lib/store-hours";
import { revalidateTag } from "next/cache";

export interface TelegramPhotoSize {
  file_id: string;
  file_unique_id: string;
  width: number;
  height: number;
  file_size?: number;
}

export interface TelegramDocument {
  file_id: string;
  file_name?: string;
  mime_type?: string;
}

export interface TelegramMessage {
  message_id: number;
  from?: {
    id: number;
    first_name?: string;
    username?: string;
  };
  chat: {
    id: number;
    type: string;
  };
  date: number;
  text?: string;
  caption?: string;
  photo?: TelegramPhotoSize[];
  document?: TelegramDocument;
}

export interface TelegramUpdate {
  update_id: number;
  message?: TelegramMessage;
  edited_message?: TelegramMessage;
}

async function sendTelegramReply(token: string, chatId: number | string, text: string) {
  try {
    await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: "Markdown",
      }),
      signal: AbortSignal.timeout(8000),
    });
  } catch (err) {
    console.error("Failed to send Telegram reply:", err);
  }
}

/**
 * Parses bank account text in formats:
 * - "/rekening Maybank | 514012345678 | MYVELORA ENTERPRISE"
 * - "/bank CIMB | 8001234567 | VELORA"
 * - "Maybank | 514012345678 | MYVELORA ENTERPRISE"
 * - Multi-line:
 *   /rekening
 *   Maybank
 *   514012345678
 *   MYVELORA ENTERPRISE
 */
function parseBankText(rawText: string): {
  bankName: string;
  bankAccountNumber: string;
  bankAccountHolder: string;
  paymentInstructions?: string;
} | null {
  const cleaned = rawText
    .replace(/^\/(rekening|bank|setbank|buka)(@\w+)?\s*/i, "")
    .trim();

  if (!cleaned) return null;

  // Format 1: Pipe separated "Maybank | 514012345678 | MYVELORA ENTERPRISE"
  if (cleaned.includes("|")) {
    const parts = cleaned.split("|").map((p) => p.trim()).filter(Boolean);
    if (parts.length >= 2) {
      return {
        bankName: parts[0],
        bankAccountNumber: parts[1],
        bankAccountHolder: parts[2] || "MYVELORA STORE",
        paymentInstructions: parts[3] || undefined,
      };
    }
  }

  // Format 2: Multi-line (3+ lines)
  const lines = cleaned.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  if (lines.length >= 2) {
    return {
      bankName: lines[0],
      bankAccountNumber: lines[1],
      bankAccountHolder: lines[2] || "MYVELORA STORE",
      paymentInstructions: lines[3] || undefined,
    };
  }

  return null;
}

async function savePaymentFieldsToDb(
  currentSettings: StoreSettings,
  updates: Partial<{
    paymentEnabled: boolean;
    bankName: string | null;
    bankAccountNumber: string | null;
    bankAccountHolder: string | null;
    duitnowQrImageUrl: string | null;
    paymentInstructions: string | null;
  }>
) {
  const now = new Date();
  const merged = {
    paymentEnabled:
      updates.paymentEnabled !== undefined
        ? updates.paymentEnabled
        : currentSettings.paymentEnabled,
    bankName: updates.bankName !== undefined ? updates.bankName : currentSettings.bankName,
    bankAccountNumber:
      updates.bankAccountNumber !== undefined
        ? updates.bankAccountNumber
        : currentSettings.bankAccountNumber,
    bankAccountHolder:
      updates.bankAccountHolder !== undefined
        ? updates.bankAccountHolder
        : currentSettings.bankAccountHolder,
    duitnowQrImageUrl:
      updates.duitnowQrImageUrl !== undefined
        ? updates.duitnowQrImageUrl
        : currentSettings.duitnowQrImageUrl,
    paymentInstructions:
      updates.paymentInstructions !== undefined
        ? updates.paymentInstructions
        : currentSettings.paymentInstructions,
    updatedAt: now,
  };

  Object.assign(MOCK_STORE_SETTINGS, merged);

  if (hasDatabaseUrl) {
    await db
      .update(storeSettings)
      .set(merged)
      .where(eq(storeSettings.id, 1));
  }

  try {
    revalidateTag("settings", "max");
  } catch {
    // Ignore when called outside Next.js request context
  }

  return merged;
}

/**
 * Downloads a Telegram file by file_id and uploads it to S3 'brand' folder
 */
async function downloadTelegramPhotoToS3(
  token: string,
  fileId: string
): Promise<string> {
  const fileInfoRes = await fetch(
    `https://api.telegram.org/bot${token}/getFile?file_id=${encodeURIComponent(fileId)}`,
    { signal: AbortSignal.timeout(10000) }
  );
  const fileInfo = (await fileInfoRes.json()) as {
    ok: boolean;
    result?: { file_path?: string };
  };

  if (!fileInfo.ok || !fileInfo.result?.file_path) {
    throw new Error("Gagal mengambil file_path dari server Telegram.");
  }

  const filePath = fileInfo.result.file_path;
  const downloadRes = await fetch(
    `https://api.telegram.org/file/bot${token}/${filePath}`,
    { signal: AbortSignal.timeout(15000) }
  );

  if (!downloadRes.ok) {
    throw new Error("Gagal mengunduh gambar QR dari Telegram.");
  }

  const arrayBuffer = await downloadRes.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  const ext = filePath.endsWith(".png")
    ? "png"
    : filePath.endsWith(".webp")
    ? "webp"
    : "jpg";
  const contentType =
    ext === "png"
      ? "image/png"
      : ext === "webp"
      ? "image/webp"
      : "image/jpeg";

  const { publicUrl } = await uploadBufferToS3({
    buffer,
    folder: "brand",
    filename: `duitnow-qr-${Date.now()}.${ext}`,
    contentType,
  });

  return publicUrl;
}

/**
 * Processes a single Telegram Update (Text command or Photo upload)
 */
export async function processTelegramUpdate(update: TelegramUpdate): Promise<void> {
  const msg = update.message || update.edited_message;
  if (!msg) return;

  const settings = (await getOrCreateStoreSettings()) || MOCK_STORE_SETTINGS;
  const token = (settings.botApiEndpointOrToken || process.env.TELEGRAM_BOT_TOKEN || "").trim();
  if (!token) return;

  const allowedChatId = (settings.botTargetChatId || process.env.TELEGRAM_CHAT_ID || "").trim();
  const senderChatId = String(msg.chat.id);
  const senderUserId = msg.from?.id ? String(msg.from.id) : "";

  // Security check: only allow configured Admin Chat ID
  if (
    allowedChatId &&
    senderChatId !== allowedChatId &&
    senderUserId !== allowedChatId
  ) {
    await sendTelegramReply(
      token,
      msg.chat.id,
      `⛔ *Akses Ditolak*\nChat ID Anda (\`${senderChatId}\`) tidak terdaftar sebagai Admin Myvelora Store.`
    );
    return;
  }

  const rawText = (msg.text || msg.caption || "").trim();
  const lowerText = rawText.toLowerCase();

  // 1. Check if Admin sent a Photo (or Image Document) -> Upload DuitNow QR (+ optional bank caption)
  const photoFileId =
    msg.photo && msg.photo.length > 0
      ? msg.photo[msg.photo.length - 1].file_id
      : msg.document && msg.document.mime_type?.startsWith("image/")
      ? msg.document.file_id
      : null;

  if (photoFileId) {
    try {
      await sendTelegramReply(token, msg.chat.id, "⏳ *Mengunggah DuitNow QR ke server Myvelora...*");
      const qrPublicUrl = await downloadTelegramPhotoToS3(token, photoFileId);

      // Check if caption also contains bank details
      const parsedBank = rawText ? parseBankText(rawText) : null;

      const updated = await savePaymentFieldsToDb(settings, {
        paymentEnabled: true,
        duitnowQrImageUrl: qrPublicUrl,
        ...(parsedBank
          ? {
              bankName: parsedBank.bankName,
              bankAccountNumber: parsedBank.bankAccountNumber,
              bankAccountHolder: parsedBank.bankAccountHolder,
              ...(parsedBank.paymentInstructions
                ? { paymentInstructions: parsedBank.paymentInstructions }
                : {}),
            }
          : {}),
      });

      const status = evaluateStorePaymentStatus({
        ...settings,
        ...updated,
      });

      const replyLines = [
        "✅ *DUITNOW QR BERHASIL DI-UPLOAD!*",
        "",
        `• *Waktu Malaysia:* ${status.nowMyt.dateStr} (${status.nowMyt.formattedTime})`,
        `• *Status Checkout:* ${
          status.isOpen
            ? "🟢 *OPEN (Aktif s/d 22:00 MYT)*"
            : "🌙 *Tersimpan (Menunggu jam buka / di luar jam 22:00 MYT)*"
        }`,
        `• *Bank:* ${updated.bankName || "-"}`,
        `• *No. Rekening:* \`${updated.bankAccountNumber || "-"}\``,
        `• *Atas Nama:* ${updated.bankAccountHolder || "-"}`,
        `• *DuitNow QR:* [Lihat Gambar QR](${qrPublicUrl})`,
      ];

      await sendTelegramReply(token, msg.chat.id, replyLines.join("\n"));
      return;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Unknown error";
      await sendTelegramReply(
        token,
        msg.chat.id,
        `❌ *Gagal mengunggah QR:* ${errorMsg}`
      );
      return;
    }
  }

  // 2. Help / Start command
  if (lowerText === "/start" || lowerText === "/help" || lowerText === "/panduan") {
    const helpMsg = [
      "🤖 *PANDUAN BOT ADMIN MYVELORA STORE*",
      "",
      "Gunakan perintah berikut setiap pagi (jam 10:00 MYT) untuk mengaktifkan rekening harian:",
      "",
      "1️⃣ *Upload Rekening Saja (Teks):*",
      "`/rekening Maybank | 514012345678 | MYVELORA ENTERPRISE`",
      "",
      "2️⃣ *Upload DuitNow QR + Rekening Sekaligus:*",
      "Kirim *Foto QR* ke bot ini dengan caption:",
      "`Maybank | 514012345678 | MYVELORA ENTERPRISE`",
      "*(Atau kirim foto QR saja tanpa caption jika hanya ingin ganti QR)*",
      "",
      "3️⃣ *Perintah Lainnya:*",
      "• `/status` — Cek status toko & rekening aktif hari ini",
      "• `/hapusqr` — Hapus gambar QR saja",
      "• `/tutup` — Tutup toko manual & hapus rekening sekarang",
      "",
      "⏰ *Catatan Otomatis:* Setiap jam *22:00 MYT (10 malam)*, rekening & QR otomatis hilang dari website dan Checkout beralih ke tombol WhatsApp.",
    ].join("\n");

    await sendTelegramReply(token, msg.chat.id, helpMsg);
    return;
  }

  // 3. Status command
  if (lowerText === "/status" || lowerText === "/cek") {
    const status = evaluateStorePaymentStatus(settings);
    const statusMsg = [
      "📊 *STATUS REKENING & CHECKOUT MYVELORA*",
      "",
      `• *Waktu Malaysia:* ${status.nowMyt.dateStr} (${status.nowMyt.formattedTime})`,
      `• *Status Website:* ${
        status.isOpen
          ? "🟢 *OPEN (Checkout Website Aktif)*"
          : "🔴 *CLOSED (Store is Closed Now -> Order via WA)*"
      }`,
      `• *Alasan Status:* \`${status.reason}\``,
      "",
      "*Data Rekening Aktif di Website:*",
      `• *Bank:* ${status.isOpen ? settings.bankName || "-" : "_(Disembunyikan/Expired)_"}`,
      `• *No. Rekening:* ${
        status.isOpen ? `\`${settings.bankAccountNumber || "-"}\`` : "_(Disembunyikan/Expired)_"
      }`,
      `• *Atas Nama:* ${
        status.isOpen ? settings.bankAccountHolder || "-" : "_(Disembunyikan/Expired)_"
      }`,
      `• *DuitNow QR:* ${
        status.isOpen && settings.duitnowQrImageUrl
          ? `[Aktif - Lihat QR](${settings.duitnowQrImageUrl})`
          : "_(Tidak ada / Disembunyikan)_"
      }`,
    ].join("\n");

    await sendTelegramReply(token, msg.chat.id, statusMsg);
    return;
  }

  // 4. Close Store / Clear Account command
  if (lowerText === "/tutup" || lowerText === "/close") {
    await savePaymentFieldsToDb(settings, {
      paymentEnabled: false,
      bankAccountNumber: null,
      duitnowQrImageUrl: null,
    });

    await sendTelegramReply(
      token,
      msg.chat.id,
      "🔒 *TOKO BERHASIL DITUTUP!*\nNomor rekening & DuitNow QR telah dihapus dari website. Halaman Checkout kini menampilkan *\"Store is Closed Now\"* dan mengarahkan pembeli ke WhatsApp."
    );
    return;
  }

  // 5. Clear QR only command
  if (lowerText === "/hapusqr" || lowerText === "/clearqr") {
    await savePaymentFieldsToDb(settings, {
      duitnowQrImageUrl: null,
    });

    await sendTelegramReply(
      token,
      msg.chat.id,
      "🗑️ *Gambar DuitNow QR telah dihapus.* Nomor rekening teks tetap aktif."
    );
    return;
  }

  // 6. Update Bank Account command (/rekening, /bank, or direct "Bank | NoRek | Nama")
  if (
    lowerText.startsWith("/rekening") ||
    lowerText.startsWith("/bank") ||
    lowerText.startsWith("/buka") ||
    rawText.includes("|")
  ) {
    const parsed = parseBankText(rawText);
    if (!parsed) {
      await sendTelegramReply(
        token,
        msg.chat.id,
        "⚠️ *Format belum lengkap.*\nKetik dengan format:\n`/rekening Maybank | 514012345678 | MYVELORA ENTERPRISE`\n\nAtau kirim *Foto QR* langsung ke chat ini."
      );
      return;
    }

    const updated = await savePaymentFieldsToDb(settings, {
      paymentEnabled: true,
      bankName: parsed.bankName,
      bankAccountNumber: parsed.bankAccountNumber,
      bankAccountHolder: parsed.bankAccountHolder,
      ...(parsed.paymentInstructions
        ? { paymentInstructions: parsed.paymentInstructions }
        : {}),
    });

    const status = evaluateStorePaymentStatus({
      ...settings,
      ...updated,
    });

    const replyMsg = [
      "✅ *REKENING HARIAN BERHASIL DI-UPDATE!*",
      "",
      `• *Waktu Malaysia:* ${status.nowMyt.dateStr} (${status.nowMyt.formattedTime})`,
      `• *Status Checkout:* ${
        status.isOpen
          ? "🟢 *OPEN (Aktif s/d 22:00 MYT)*"
          : "🌙 *Tersimpan (Menunggu jam operasional < 22:00 MYT)*"
      }`,
      `• *Bank:* ${updated.bankName}`,
      `• *No. Rekening:* \`${updated.bankAccountNumber}\``,
      `• *Atas Nama:* ${updated.bankAccountHolder}`,
      updated.duitnowQrImageUrl
        ? `• *DuitNow QR:* [Aktif](${updated.duitnowQrImageUrl})`
        : "• *DuitNow QR:* _(Belum di-upload — kirim foto QR ke chat ini jika ingin menampilkan QR)_",
    ].join("\n");

    await sendTelegramReply(token, msg.chat.id, replyMsg);
    return;
  }
}

// In-memory state for automatic fallback polling when no webhook is active
let lastPolledAt = 0;
let lastUpdateOffset = 0;
let isWebhookActive = false;

/**
 * Lightweight non-blocking sync that checks Telegram getUpdates if no webhook is active.
 * Ensures Telegram bot commands work even on local dev or before webhook registration.
 */
export async function syncTelegramUpdatesIfNeeded(
  settings?: StoreSettings | null
): Promise<void> {
  if (isWebhookActive) return;

  const nowMs = Date.now();
  if (nowMs - lastPolledAt < 10000) return; // Throttle to at most once every 10 seconds
  lastPolledAt = nowMs;

  const token = (
    settings?.botApiEndpointOrToken ||
    process.env.TELEGRAM_BOT_TOKEN ||
    ""
  ).trim();
  if (!token) return;

  try {
    const url = `https://api.telegram.org/bot${token}/getUpdates?timeout=0${
      lastUpdateOffset > 0 ? `&offset=${lastUpdateOffset}` : ""
    }`;
    const res = await fetch(url, {
      signal: AbortSignal.timeout(4000),
      cache: "no-store",
    });

    if (res.status === 409) {
      // 409 Conflict means a Webhook is active on Telegram; stop polling getUpdates
      isWebhookActive = true;
      return;
    }

    if (!res.ok) return;

    const data = (await res.json()) as {
      ok: boolean;
      result?: TelegramUpdate[];
    };

    if (!data.ok || !data.result || data.result.length === 0) return;

    for (const update of data.result) {
      lastUpdateOffset = update.update_id + 1;
      await processTelegramUpdate(update);
    }

    // Acknowledge processed updates on Telegram server
    if (lastUpdateOffset > 0) {
      await fetch(
        `https://api.telegram.org/bot${token}/getUpdates?offset=${lastUpdateOffset}&timeout=0`,
        { signal: AbortSignal.timeout(3000), cache: "no-store" }
      ).catch(() => {});
    }
  } catch {
    // Ignore network timeout during background poll
  }
}
