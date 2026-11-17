"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface ContactBotTabProps {
  adminWhatsappNumber: string;
  setAdminWhatsappNumber: (val: string) => void;
  instagramUrl: string;
  setInstagramUrl: (val: string) => void;
  botProvider: "none" | "telegram" | "whatsapp_api";
  setBotProvider: (val: "none" | "telegram" | "whatsapp_api") => void;
  botApiEndpointOrToken: string;
  setBotApiEndpointOrToken: (val: string) => void;
  botTargetChatId: string;
  setBotTargetChatId: (val: string) => void;
}

export function ContactBotTab({
  adminWhatsappNumber,
  setAdminWhatsappNumber,
  instagramUrl,
  setInstagramUrl,
  botProvider,
  setBotProvider,
  botApiEndpointOrToken,
  setBotApiEndpointOrToken,
  botTargetChatId,
  setBotTargetChatId,
}: ContactBotTabProps) {
  return (
    <div className="bg-white p-6 rounded-2xl border border-border shadow-xs space-y-5">
      <h3 className="font-heading font-extrabold italic text-lg text-plum uppercase pb-2 border-b border-border">
        WhatsApp, Instagram &amp; Notification Bot
      </h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label className="text-xs font-bold uppercase text-plum">Admin WhatsApp Phone (With Country Code)</Label>
          <Input
            type="tel"
            placeholder="601123456789"
            value={adminWhatsappNumber}
            onChange={(e) => setAdminWhatsappNumber(e.target.value)}
            className="h-11 rounded-xl font-mono text-xs"
          />
          <p className="text-[11px] text-plum-muted">
            Displayed in footer &amp; used for Click-to-WhatsApp order confirmation. Leave blank to hide.
          </p>
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs font-bold uppercase text-plum">Instagram Username or URL</Label>
          <Input
            type="text"
            placeholder="@myvelorastore or https://instagram.com/myvelorastore"
            value={instagramUrl}
            onChange={(e) => setInstagramUrl(e.target.value)}
            className="h-11 rounded-xl font-mono text-xs"
          />
          <p className="text-[11px] text-plum-muted">
            Displayed dynamically in the storefront footer. Leave blank to hide.
          </p>
        </div>
      </div>

      <div className="pt-4 border-t border-border space-y-4">
        <div className="space-y-1.5">
          <Label className="text-xs font-bold uppercase text-plum">Automated Bot Notification Provider</Label>
          <select
            value={botProvider}
            onChange={(e) => setBotProvider(e.target.value as "none" | "telegram" | "whatsapp_api")}
            className="h-11 px-3 w-full rounded-xl border border-border bg-background text-sm font-semibold text-plum cursor-pointer"
          >
            <option value="none">Disabled (No Automated Bot)</option>
            <option value="telegram">Telegram Bot</option>
            <option value="whatsapp_api">Custom WhatsApp Webhook Gateway</option>
          </select>
        </div>

        {botProvider === "telegram" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-bold uppercase text-plum">Telegram Bot Token</Label>
              <Input
                type="password"
                placeholder="123456789:ABCdefGhIJKlmNoPQRstuVWXyz"
                value={botApiEndpointOrToken}
                onChange={(e) => setBotApiEndpointOrToken(e.target.value)}
                className="h-11 rounded-xl font-mono text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-bold uppercase text-plum">Target Chat ID</Label>
              <Input
                placeholder="-1001234567890 or 12345678"
                value={botTargetChatId}
                onChange={(e) => setBotTargetChatId(e.target.value)}
                className="h-11 rounded-xl font-mono text-xs"
              />
            </div>
          </div>
        )}

        {botProvider === "whatsapp_api" && (
          <div className="space-y-1.5">
            <Label className="text-xs font-bold uppercase text-plum">Webhook URL Endpoint</Label>
            <Input
              type="url"
              placeholder="https://api.fonnte.com/send or custom webhook"
              value={botApiEndpointOrToken}
              onChange={(e) => setBotApiEndpointOrToken(e.target.value)}
              className="h-11 rounded-xl font-mono text-xs"
            />
          </div>
        )}
      </div>
    </div>
  );
}
