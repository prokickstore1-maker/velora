import { NextRequest, NextResponse } from "next/server";
import { getOrCreateStoreSettings } from "@/db";
import { MOCK_STORE_SETTINGS } from "@/db/mock-data";
import {
  processTelegramUpdate,
  syncTelegramUpdatesIfNeeded,
  TelegramUpdate,
} from "@/lib/telegram-bot";

export const dynamic = "force-dynamic";

/**
 * POST /api/telegram/webhook
 * Receives real-time updates (text commands & DuitNow QR photos) from Telegram servers
 */
export async function POST(req: NextRequest) {
  try {
    const update = (await req.json()) as TelegramUpdate;
    if (update && typeof update.update_id === "number") {
      await processTelegramUpdate(update);
    }
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Telegram webhook POST error:", err);
    return NextResponse.json({ ok: false, error: "Invalid webhook payload" }, { status: 200 });
  }
}

/**
 * GET /api/telegram/webhook
 * - ?action=register : Automatically registers this webhook URL with Telegram Bot API
 * - ?action=sync     : Polls getUpdates once (useful when running without a public HTTPS webhook)
 */
export async function GET(req: NextRequest) {
  try {
    const action = req.nextUrl.searchParams.get("action");
    const settings = (await getOrCreateStoreSettings()) || MOCK_STORE_SETTINGS;
    const token = (
      settings.botApiEndpointOrToken ||
      process.env.TELEGRAM_BOT_TOKEN ||
      ""
    ).trim();

    if (!token) {
      return NextResponse.json(
        { ok: false, error: "Telegram Bot Token belum dikonfigurasi di Store Settings." },
        { status: 400 }
      );
    }

    if (action === "register") {
      const customOrigin = req.nextUrl.searchParams.get("origin") || req.nextUrl.origin;
      const webhookUrl = `${customOrigin.replace(/\/$/, "")}/api/telegram/webhook`;

      const res = await fetch(
        `https://api.telegram.org/bot${token}/setWebhook?url=${encodeURIComponent(webhookUrl)}`
      );
      const data = await res.json();

      return NextResponse.json({
        ok: Boolean(data.ok),
        webhookUrl,
        telegramResponse: data,
      });
    }

    if (action === "delete") {
      const res = await fetch(`https://api.telegram.org/bot${token}/deleteWebhook`);
      const data = await res.json();
      return NextResponse.json({
        ok: Boolean(data.ok),
        telegramResponse: data,
      });
    }

    // Default: sync pending updates via getUpdates
    await syncTelegramUpdatesIfNeeded(settings);
    return NextResponse.json({
      ok: true,
      message: "Telegram bot updates synced.",
    });
  } catch (err) {
    console.error("Telegram webhook GET error:", err);
    return NextResponse.json({ ok: false, error: "Internal error" }, { status: 500 });
  }
}
