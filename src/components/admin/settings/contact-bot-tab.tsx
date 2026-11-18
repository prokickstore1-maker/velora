"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { RefreshCw, CheckCircle2, Send } from "lucide-react";

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
  const [isSyncing, setIsSyncing] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);

  const handleRegisterWebhook = async () => {
    setIsRegistering(true);
    try {
      const res = await fetch("/api/telegram/webhook?action=register");
      const data = await res.json();
      if (data.ok) {
        toast.success(`Telegram Webhook activated at ${data.webhookUrl}`);
      } else {
        toast.error(data.telegramResponse?.description || data.error || "Failed to register webhook");
      }
    } catch {
      toast.error("Failed to connect to webhook endpoint.");
    } finally {
      setIsRegistering(false);
    }
  };

  const handleSyncUpdates = async () => {
    setIsSyncing(true);
    try {
      const res = await fetch("/api/telegram/webhook?action=sync");
      const data = await res.json();
      if (data.ok) {
        toast.success("Telegram bot messages synced! Reloading settings...");
        setTimeout(() => window.location.reload(), 800);
      } else {
        toast.error(data.error || "Failed to sync Telegram messages.");
      }
    } catch {
      toast.error("Failed to sync Telegram updates.");
    } finally {
      setIsSyncing(false);
    }
  };
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
          <div className="space-y-4">
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
                <Label className="text-xs font-bold uppercase text-plum">Admin Target Chat ID</Label>
                <Input
                  placeholder="-1001234567890 or 12345678"
                  value={botTargetChatId}
                  onChange={(e) => setBotTargetChatId(e.target.value)}
                  className="h-11 rounded-xl font-mono text-xs"
                />
              </div>
            </div>

            {/* Telegram Bot Daily Bank & QR Upload Guide + Webhook Controls */}
            <div className="p-4 rounded-2xl bg-ivory/70 border border-border space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-plum flex items-center gap-1.5">
                  <Send className="w-3.5 h-3.5 text-pink" />
                  Upload Rekening &amp; DuitNow QR via Bot Telegram
                </span>

                <div className="flex items-center gap-2 flex-wrap">
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    disabled={isSyncing}
                    onClick={handleSyncUpdates}
                    className="h-8 text-xs font-semibold border-plum text-plum hover:bg-blush/30 cursor-pointer"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${isSyncing ? "animate-spin" : ""}`} />
                    Sync Pesan Bot Sekarang
                  </Button>

                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    disabled={isRegistering}
                    onClick={handleRegisterWebhook}
                    className="h-8 text-xs font-semibold border-emerald-600 text-emerald-700 hover:bg-emerald-50 cursor-pointer"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" />
                    Aktifkan Webhook Produksi
                  </Button>
                </div>
              </div>

              <div className="text-xs text-plum space-y-1.5 font-sans leading-relaxed bg-white p-3.5 rounded-xl border border-border">
                <p className="font-semibold text-plum">Cara Update Rekening Harian dari Chat Bot Telegram Anda:</p>
                <ul className="list-disc pl-4 space-y-1 text-plum-muted">
                  <li>
                    <strong className="text-plum">Upload Foto QR + Rekening Sekaligus:</strong> Kirim <strong>Foto DuitNow QR</strong> ke bot Telegram dengan caption:{" "}
                    <code className="bg-ivory px-1.5 py-0.5 rounded font-mono text-plum">
                      Maybank | 514012345678 | MYVELORA ENTERPRISE
                    </code>
                  </li>
                  <li>
                    <strong className="text-plum">Upload Foto QR Saja:</strong> Cukup kirim <strong>Foto QR</strong> ke bot tanpa caption (otomatis ter-upload ke S3 &amp; membuka toko).
                  </li>
                  <li>
                    <strong className="text-plum">Update Rekening via Teks:</strong> Ketik{" "}
                    <code className="bg-ivory px-1.5 py-0.5 rounded font-mono text-plum">
                      /rekening Maybank | 514012345678 | MYVELORA ENTERPRISE
                    </code>
                  </li>
                  <li>
                    <strong className="text-plum">Perintah Cepat Lainnya:</strong>{" "}
                    <code className="bg-ivory px-1 py-0.5 rounded font-mono text-plum">/status</code> (cek status toko),{" "}
                    <code className="bg-ivory px-1 py-0.5 rounded font-mono text-plum">/hapusqr</code> (hapus gambar QR),{" "}
                    <code className="bg-ivory px-1 py-0.5 rounded font-mono text-plum">/tutup</code> (tutup toko &amp; hapus rekening manual).
                  </li>
                </ul>
              </div>
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
