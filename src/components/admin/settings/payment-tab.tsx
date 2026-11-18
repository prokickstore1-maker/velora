"use client";

import { CreditCard, Upload, Loader2, Clock, CheckCircle2, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { getMalaysiaTimeParts } from "@/lib/store-hours";

interface PaymentTabProps {
  paymentEnabled: boolean;
  setPaymentEnabled: (val: boolean) => void;
  bankName: string;
  setBankName: (val: string) => void;
  bankAccountNumber: string;
  setBankAccountNumber: (val: string) => void;
  bankAccountHolder: string;
  setBankAccountHolder: (val: string) => void;
  duitnowQrImageUrl: string;
  setDuitnowQrImageUrl: (val: string) => void;
  paymentInstructions: string;
  setPaymentInstructions: (val: string) => void;
  isUploadingDuitnow: boolean;
  duitnowFileInputRef: React.RefObject<HTMLInputElement | null>;
  onDuitnowQrUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export function PaymentTab({
  paymentEnabled,
  setPaymentEnabled,
  bankName,
  setBankName,
  bankAccountNumber,
  setBankAccountNumber,
  bankAccountHolder,
  setBankAccountHolder,
  duitnowQrImageUrl,
  setDuitnowQrImageUrl,
  paymentInstructions,
  setPaymentInstructions,
  isUploadingDuitnow,
  duitnowFileInputRef,
  onDuitnowQrUpload,
}: PaymentTabProps) {
  const nowMyt = getMalaysiaTimeParts();
  const isNightClosed = nowMyt.hour >= 22 || nowMyt.hour < 6;
  const hasTodayDetails = Boolean(bankAccountNumber.trim() || duitnowQrImageUrl.trim());
  const isReadyToOpen = !isNightClosed && paymentEnabled && hasTodayDetails;

  return (
    <div className="bg-white p-6 rounded-2xl border border-border shadow-xs space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-border">
        <h3 className="font-heading font-extrabold italic text-lg text-plum uppercase">
          Daily Bank Transfer &amp; DuitNow QR
        </h3>
        <span className="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-plum bg-ivory px-3 py-1 rounded-lg border border-border">
          <Clock className="w-3.5 h-3.5 text-pink" />
          Malaysia Time: {nowMyt.dateStr} • {nowMyt.formattedTime}
        </span>
      </div>

      {/* Daily Rotation & 10:00 PM Auto-Close Status Banner */}
      <div
        className={`p-4 rounded-xl border text-xs flex items-start gap-3 ${
          isReadyToOpen
            ? "bg-emerald-50 border-emerald-200 text-emerald-900"
            : "bg-amber-50 border-amber-200 text-amber-900"
        }`}
      >
        {isReadyToOpen ? (
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
        ) : (
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        )}
        <div className="space-y-1 leading-relaxed">
          <p className="font-bold text-sm">
            {isNightClosed
              ? "Night Cutoff Active (Past 10:00 PM MYT) — Store Checkout is Closed"
              : isReadyToOpen
              ? "Daily Payment Account Ready — Click 'Save Changes' to Open Store Until 10:00 PM MYT"
              : "Store Checkout is Closed — Please Upload Today's Bank Account / DuitNow QR"}
          </p>
          <p>
            Every night at <strong>10:00 PM MYT</strong>, your store&apos;s bank account and DuitNow QR automatically expire and disappear from the website. While closed, customers on Checkout see <em>&quot;Store is Closed Now&quot;</em> and can order directly via WhatsApp. Upload your new daily account each morning (10:00 AM MYT) and click <strong>Save Changes</strong> to reopen website checkout.
          </p>
        </div>
      </div>

      <label className="flex items-center gap-3 cursor-pointer text-sm font-semibold text-plum">
        <input
          type="checkbox"
          checked={paymentEnabled}
          onChange={(e) => setPaymentEnabled(e.target.checked)}
          className="w-5 h-5 rounded text-plum cursor-pointer"
        />
        <span>Enable Payment Instructions &amp; Open Website Checkout for Today</span>
      </label>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
        <div className="space-y-1.5">
          <Label className="text-xs font-bold uppercase text-plum">Bank Name</Label>
          <Input
            placeholder="e.g. Maybank, CIMB, RHB"
            value={bankName}
            onChange={(e) => setBankName(e.target.value)}
            className="h-11 rounded-xl"
          />
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs font-bold uppercase text-plum">Account Number (Daily)</Label>
          <Input
            placeholder="Enter today's account number..."
            value={bankAccountNumber}
            onChange={(e) => {
              const val = e.target.value;
              setBankAccountNumber(val);
              if (val.trim()) setPaymentEnabled(true);
            }}
            className="h-11 rounded-xl font-mono text-sm"
          />
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs font-bold uppercase text-plum">Account Holder Name</Label>
          <Input
            placeholder="e.g. MYVELORA STORE ENTERPRISE"
            value={bankAccountHolder}
            onChange={(e) => setBankAccountHolder(e.target.value)}
            className="h-11 rounded-xl"
          />
        </div>
      </div>

      {/* DuitNow QR / QRIS Upload + Preview */}
      <div className="space-y-2 pt-2">
        <Label className="text-xs font-bold uppercase text-plum block">
          DuitNow QR / QRIS Barcode Image
        </Label>

        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center bg-ivory/50 p-4 rounded-2xl border border-border">
          {duitnowQrImageUrl?.trim() ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={duitnowQrImageUrl}
              alt="DuitNow QR Preview"
              className="w-24 h-24 object-contain rounded-xl border border-border bg-white p-1 shrink-0 shadow-2xs"
            />
          ) : (
            <div className="w-24 h-24 rounded-xl border border-dashed border-border bg-white flex flex-col items-center justify-center text-[10px] text-plum-muted text-center p-2 shrink-0">
              <CreditCard className="w-6 h-6 mb-1 opacity-40 text-plum" />
              <span>No QR Uploaded</span>
            </div>
          )}

          <div className="flex-1 w-full space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <input
                ref={duitnowFileInputRef}
                type="file"
                accept="image/*"
                onChange={onDuitnowQrUpload}
                className="hidden"
              />
              <Button
                type="button"
                size="sm"
                variant="outline"
                disabled={isUploadingDuitnow}
                onClick={() => duitnowFileInputRef.current?.click()}
                className="h-8 text-xs font-semibold border-plum text-plum hover:bg-blush/30 cursor-pointer"
              >
                {isUploadingDuitnow ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                    <span>Uploading...</span>
                  </>
                ) : (
                  <>
                    <Upload className="w-3.5 h-3.5 mr-1.5" />
                    <span>Upload QR Code from Device</span>
                  </>
                )}
              </Button>
              {duitnowQrImageUrl && (
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  onClick={() => setDuitnowQrImageUrl("")}
                  className="h-8 text-xs text-destructive hover:bg-destructive/10 cursor-pointer"
                >
                  Remove QR
                </Button>
              )}
            </div>

            <Input
              type="url"
              placeholder="https://is3.cloudhost.id/velora/brand/... or paste URL"
              value={duitnowQrImageUrl}
              onChange={(e) => {
                const val = e.target.value;
                setDuitnowQrImageUrl(val);
                if (val.trim()) setPaymentEnabled(true);
              }}
              className="h-9 rounded-lg font-mono text-[11px] bg-white"
            />
            <p className="text-[11px] text-plum-muted">
              Upload your store&apos;s DuitNow QR or QRIS barcode image. It will be displayed directly to customers on Step 04 of Checkout.
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-1.5">
        <Label className="text-xs font-bold uppercase text-plum">Payment Instructions Note</Label>
        <Textarea
          placeholder="Additional instructions shown to customer on the payment screen..."
          value={paymentInstructions}
          onChange={(e) => setPaymentInstructions(e.target.value)}
          className="min-h-20 rounded-xl text-xs"
        />
      </div>
    </div>
  );
}
