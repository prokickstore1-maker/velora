"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Order, OrderItem, StoreSettings } from "@/db/schema";
import { compressImage } from "@/lib/image-compress";
import { getReceiptPresignedUrlAction, submitPaymentReceiptAction } from "@/app/actions/payment";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { toast } from "sonner";
import {
  CreditCard,
  Copy,
  Upload,
  CheckCircle2,
  Loader2,
  ArrowRight,
  AlertCircle,
} from "lucide-react";

interface PaymentClientProps {
  order: Order & { items: OrderItem[] };
  settings: StoreSettings | null;
}

export function PaymentClient({ order, settings }: PaymentClientProps) {
  const router = useRouter();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(order.paymentReceiptUrl || null);
  const [referenceNote, setReferenceNote] = useState(order.paymentReference || "");
  const [isUploading, setIsUploading] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(label);
    toast.success(`Copied ${label} to clipboard!`);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file (PNG, JPG, or WebP).");
      return;
    }

    try {
      // Compress in browser via Canvas before upload
      toast.info("Compressing payment receipt for fast upload...");
      const compressed = await compressImage(file, { maxWidth: 1200, quality: 0.85 });
      setSelectedFile(compressed.file);
      setPreviewUrl(URL.createObjectURL(compressed.blob));
      toast.success("Receipt image ready.");
    } catch (err) {
      console.error("Compression error:", err);
      // Fallback to original file
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmitReceipt = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedFile && !order.paymentReceiptUrl) {
      toast.error("Please select a screenshot or photo of your payment receipt.");
      return;
    }

    setIsUploading(true);

    try {
      let finalReceiptUrl = order.paymentReceiptUrl;

      // If new file chosen, upload via presigned URL or data URL
      if (selectedFile) {
        const presigned = await getReceiptPresignedUrlAction(order.orderCode, selectedFile.name);

        if (presigned.success && presigned.uploadUrl && presigned.publicUrl) {
          // Direct S3/MinIO PUT upload
          const uploadRes = await fetch(presigned.uploadUrl, {
            method: "PUT",
            headers: {
              "Content-Type": selectedFile.type,
            },
            body: selectedFile,
          });

          if (!uploadRes.ok) {
            throw new Error("Direct storage upload failed");
          }
          finalReceiptUrl = presigned.publicUrl;
        } else {
          // Fallback: convert to base64 Data URL for local dev if S3 is unconfigured
          finalReceiptUrl = await new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = reject;
            reader.readAsDataURL(selectedFile);
          });
        }
      }

      if (!finalReceiptUrl) {
        throw new Error("Unable to determine receipt image URL");
      }

      const saveRes = await submitPaymentReceiptAction({
        orderCode: order.orderCode,
        receiptUrl: finalReceiptUrl,
        referenceNote: referenceNote.trim() || undefined,
      });

      if (!saveRes.success) {
        toast.error(saveRes.error || "Failed to submit receipt.");
        setIsUploading(false);
        return;
      }

      toast.success("Payment receipt submitted successfully!");
      router.push(`/orders/${order.orderCode}/confirmation`);
    } catch (err) {
      console.error("Payment receipt submission error:", err);
      toast.error("Failed to upload receipt. Please check your connection or contact our admin.");
      setIsUploading(false);
    }
  };

  const isPaymentEnabled = Boolean(settings?.paymentEnabled);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Step Header */}
      <Card className="bg-white border border-border ring-0 shadow-xs">
        <CardContent className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1">
          <div>
            <span className="text-xs font-bold tracking-widest text-pink uppercase block">
              Step 04 of 05
            </span>
            <h1 className="mv-heading-italic text-2xl sm:text-3xl text-plum">
              COMPLETE PAYMENT
            </h1>
            <p className="text-xs text-plum-muted mt-1">
              Order Code: <span className="font-mono font-bold text-plum">{order.orderCode}</span>
            </p>
          </div>

          <div className="text-left sm:text-right p-3 sm:p-0 bg-ivory sm:bg-transparent rounded-xl">
            <span className="text-[11px] text-plum-muted uppercase font-semibold block">
              Amount Due
            </span>
            <div className="flex items-center sm:justify-end gap-2">
              <span className="font-heading font-extrabold text-2xl sm:text-3xl text-plum whitespace-nowrap">
                RM {parseFloat(order.totalRm).toFixed(2)}
              </span>
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                onClick={() => copyToClipboard(order.totalRm, "Amount")}
                className="text-plum hover:bg-blush/40"
                title="Copy amount"
              >
                <Copy className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payment Instructions Section */}
      {!isPaymentEnabled ? (
        <Card className="bg-white border border-border ring-0 text-center">
          <CardContent className="py-6 space-y-4">
            <div className="w-12 h-12 rounded-full bg-blush flex items-center justify-center mx-auto text-plum">
              <AlertCircle className="w-6 h-6 text-pink" />
            </div>
            <h3 className="font-heading font-bold text-lg text-plum uppercase">
              Payment Details Being Configured
            </h3>
            <p className="text-sm text-plum-muted max-w-md mx-auto">
              Payment instructions will be shared directly with you via WhatsApp. You may proceed to confirmation to verify your order code.
            </p>
            <Button
              onClick={() => router.push(`/orders/${order.orderCode}/confirmation`)}
              className="bg-plum hover:bg-plum-hover text-white"
            >
              Continue to Order Confirmation
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
          {/* Left: Bank / DuitNow Info Card */}
          <Card className="md:col-span-6 bg-white border border-border ring-0 shadow-xs">
            <CardHeader className="border-b border-border">
              <CardTitle className="font-heading font-extrabold italic text-lg text-plum uppercase flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-pink" />
                Transfer Instructions
              </CardTitle>
              <CardDescription className="text-xs text-plum-muted">
                Transfer the exact amount and upload your payment slip.
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* DuitNow QR if available */}
              {settings?.duitnowQrImageUrl && (
                <div className="text-center space-y-2 p-4 rounded-xl bg-ivory border border-border">
                  <span className="text-xs font-bold text-plum uppercase tracking-wider block">
                    Scan to Pay (DuitNow QR)
                  </span>
                  <div className="relative w-44 h-44 mx-auto rounded-lg overflow-hidden border-2 border-plum bg-white shadow-xs">
                    <Image
                      src={settings.duitnowQrImageUrl}
                      alt="DuitNow QR Code"
                      fill
                      sizes="176px"
                      className="object-contain p-2"
                    />
                  </div>
                </div>
              )}

              {/* Bank Transfer Details */}
              {settings?.bankAccountNumber && (
                <div className="space-y-3">
                  <div className="p-3.5 rounded-xl bg-blush-soft border border-blush flex items-center justify-between gap-2">
                    <div>
                      <span className="text-[10px] text-plum-muted uppercase font-bold block">
                        Bank Name
                      </span>
                      <span className="font-heading font-bold text-sm text-plum">
                        {settings.bankName || "Bank Transfer"}
                      </span>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-blush-soft border border-blush flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <span className="text-[10px] text-plum-muted uppercase font-bold block">
                        Account Number
                      </span>
                      <span className="font-mono font-bold text-sm sm:text-base text-plum break-all">
                        {settings.bankAccountNumber}
                      </span>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard(settings.bankAccountNumber!, "Account Number")}
                      className="h-8 text-xs font-semibold border-plum text-plum hover:bg-plum hover:text-white shrink-0"
                    >
                      {copiedField === "Account Number" ? "Copied!" : "Copy"}
                    </Button>
                  </div>

                  {settings?.bankAccountHolder && (
                    <div className="p-3.5 rounded-xl bg-blush-soft border border-blush">
                      <span className="text-[10px] text-plum-muted uppercase font-bold block">
                        Account Holder Name
                      </span>
                      <span className="font-heading font-semibold text-xs text-plum">
                        {settings.bankAccountHolder}
                      </span>
                    </div>
                  )}
                </div>
              )}

              {settings?.paymentInstructions && (
                <p className="text-xs text-plum-muted whitespace-pre-line leading-relaxed border-t border-border/80 pt-3">
                  {settings.paymentInstructions}
                </p>
              )}
            </CardContent>
          </Card>

          {/* Right: Upload Payment Receipt Form */}
          <Card className="md:col-span-6 bg-white border border-border ring-0 shadow-xs">
            <CardHeader className="border-b border-border">
              <CardTitle className="font-heading font-extrabold italic text-lg text-plum uppercase flex items-center gap-2">
                <Upload className="w-5 h-5 text-pink" />
                Upload Payment Slip
              </CardTitle>
            </CardHeader>

            <CardContent>

            <form onSubmit={handleSubmitReceipt} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="receiptFile" className="text-xs font-bold text-plum uppercase block">
                  Payment Screenshot / Slip *
                </Label>

                <div className="border-2 border-dashed border-border hover:border-pink rounded-2xl p-6 text-center bg-ivory/50 transition-colors cursor-pointer relative">
                  <input
                    id="receiptFile"
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                  />
                  {previewUrl ? (
                    <div className="space-y-3">
                      <div className="relative w-32 h-44 mx-auto rounded-lg overflow-hidden border border-border shadow-xs bg-white">
                        <Image src={previewUrl} alt="Receipt preview" fill sizes="128px" className="object-cover" />
                      </div>
                      <p className="text-xs font-semibold text-emerald-700 flex items-center justify-center gap-1">
                        <CheckCircle2 className="w-4 h-4" />
                        Slip Selected (Tap to change)
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-2 py-4">
                      <div className="w-12 h-12 rounded-full bg-blush flex items-center justify-center mx-auto text-plum">
                        <Upload className="w-6 h-6 text-pink" />
                      </div>
                      <p className="font-heading font-bold text-xs uppercase text-plum">
                        Tap to upload payment receipt
                      </p>
                      <p className="text-[11px] text-plum-muted">
                        JPG, PNG, or screenshot
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Optional Reference or Remarks */}
              <div className="space-y-1.5 pt-2">
                <Label htmlFor="referenceNote" className="text-xs font-bold text-plum uppercase">
                  Reference Note (Optional)
                </Label>
                <Input
                  id="referenceNote"
                  type="text"
                  placeholder="e.g. Maybank2u Ref: 82910394"
                  value={referenceNote}
                  onChange={(e) => setReferenceNote(e.target.value)}
                  className="h-12 text-base rounded-xl bg-background border-border"
                />
              </div>

              <div className="pt-2">
                <Button
                  type="submit"
                  size="lg"
                  disabled={isUploading}
                  className="w-full bg-plum hover:bg-plum-hover text-white font-semibold text-sm sm:text-base h-12 rounded-xl shadow-sm flex items-center justify-center gap-2"
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Submitting...</span>
                    </>
                  ) : (
                    <>
                      <span>Submit Receipt</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </Button>
              </div>

              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => router.push(`/orders/${order.orderCode}/confirmation`)}
                  className="text-xs font-semibold text-plum-muted hover:text-plum underline"
                >
                  Skip upload and confirm on WhatsApp directly
                </button>
              </div>
            </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
