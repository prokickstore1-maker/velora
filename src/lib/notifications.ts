import { StoreSettings } from "@/db/schema";

interface OrderNotificationPayload {
  orderCode: string;
  customerName: string;
  customerWhatsapp: string;
  totalRm: string;
  itemCount: number;
  itemsSummary: string;
  state: string;
  event: "order_created" | "payment_submitted";
  receiptUrl?: string | null;
}

/**
 * Non-blocking dispatch to Admin Telegram Bot or WhatsApp Webhook
 */
export async function sendAdminNotification(
  settings: StoreSettings | null,
  payload: OrderNotificationPayload
): Promise<void> {
  if (!settings) return;

  // Filter: Only notify admin when payment receipt is uploaded (Actionable payment verification)
  if (payload.event !== "payment_submitted") {
    return;
  }

  const provider = settings.botProvider;
  const token = settings.botApiEndpointOrToken || process.env.TELEGRAM_BOT_TOKEN;
  const targetId = settings.botTargetChatId || process.env.TELEGRAM_CHAT_ID;

  if (provider === "telegram" && token && targetId) {
    try {
      const text = [
        "💳 *PAYMENT RECEIPT SUBMITTED*",
        `*Order Code:* \`${payload.orderCode}\``,
        `*Customer:* ${payload.customerName} (+${payload.customerWhatsapp.replace(/\D/g, "")})`,
        `*Destination:* ${payload.state}`,
        `*Items (${payload.itemCount}):* ${payload.itemsSummary}`,
        `*Total:* *RM ${parseFloat(payload.totalRm).toFixed(2)}*`,
        payload.receiptUrl ? `*Proof Slip:* [View Image](${payload.receiptUrl})` : null,
      ]
        .filter(Boolean)
        .join("\n");

      // Fire and forget, timeout 5 seconds
      fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: targetId,
          text,
          parse_mode: "Markdown",
        }),
        signal: AbortSignal.timeout(5000),
      }).catch((err) => console.error("Telegram notification failed:", err));
    } catch (e) {
      console.error("Failed to construct Telegram notification:", e);
    }
  } else if (provider === "whatsapp_api" && token) {
    // Custom WhatsApp Gateway Webhook
    try {
      fetch(token, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          target: targetId || settings.adminWhatsappNumber,
          payload,
        }),
        signal: AbortSignal.timeout(5000),
      }).catch((err) => console.error("WhatsApp API notification failed:", err));
    } catch (e) {
      console.error("Failed to trigger WhatsApp API webhook:", e);
    }
  }
}
