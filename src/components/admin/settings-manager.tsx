"use client";

import { useState, useRef } from "react";
import { StoreSettings, FaqItem } from "@/db/schema";
import {
  updateStoreSettingsAction,
  getBrandAssetPresignedUrlAction,
} from "@/app/actions/admin-settings";
import { uploadImageServerAction } from "@/app/actions/upload";
import { compressImage } from "@/lib/image-compress";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import {
  Settings,
  Image as ImageIcon,
  Upload,
  CreditCard,
  Truck,
  MessageCircle,
  HelpCircle,
  Save,
  Plus,
  Trash2,
  Loader2,
  ShieldAlert,
  ArrowRight,
} from "lucide-react";

interface SettingsManagerProps {
  initialSettings: StoreSettings | null;
}

export function SettingsManager({ initialSettings }: SettingsManagerProps) {
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingBanner, setIsUploadingBanner] = useState(false);
  const bannerFileInputRef = useRef<HTMLInputElement>(null);

  const [isUploadingDuitnow, setIsUploadingDuitnow] = useState(false);
  const duitnowFileInputRef = useRef<HTMLInputElement>(null);

  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const logoFileInputRef = useRef<HTMLInputElement>(null);

  // Form states
  const [brandLogoUrl, setBrandLogoUrl] = useState(initialSettings?.brandLogoUrl || "");
  const [heroBannerImageUrl, setHeroBannerImageUrl] = useState(
    initialSettings?.heroBannerImageUrl || ""
  );
  const [heroBannerBadge, setHeroBannerBadge] = useState(
    initialSettings?.heroBannerBadge || "New Drop"
  );
  const [heroBannerTitle, setHeroBannerTitle] = useState(
    initialSettings?.heroBannerTitle || ""
  );
  const [heroBannerLink, setHeroBannerLink] = useState(
    initialSettings?.heroBannerLink || "/shop"
  );

  // Shipping
  const [shippingEnabled, setShippingEnabled] = useState(Boolean(initialSettings?.shippingEnabled));
  const [flatShippingFeeRm, setFlatShippingFeeRm] = useState(initialSettings?.flatShippingFeeRm || "8.00");
  const [freeShippingMinRm, setFreeShippingMinRm] = useState(initialSettings?.freeShippingMinRm || "150.00");

  // Payment
  const [paymentEnabled, setPaymentEnabled] = useState(Boolean(initialSettings?.paymentEnabled));
  const [bankName, setBankName] = useState(initialSettings?.bankName || "Maybank");
  const [bankAccountNumber, setBankAccountNumber] = useState(initialSettings?.bankAccountNumber || "");
  const [bankAccountHolder, setBankAccountHolder] = useState(initialSettings?.bankAccountHolder || "");
  const [duitnowQrImageUrl, setDuitnowQrImageUrl] = useState(initialSettings?.duitnowQrImageUrl || "");
  const [paymentInstructions, setPaymentInstructions] = useState(initialSettings?.paymentInstructions || "");

  // WhatsApp, Instagram & Bot
  const [adminWhatsappNumber, setAdminWhatsappNumber] = useState(initialSettings?.adminWhatsappNumber || "");
  const [instagramUrl, setInstagramUrl] = useState(initialSettings?.instagramUrl || "");
  const [botProvider, setBotProvider] = useState<"none" | "telegram" | "whatsapp_api">(
    initialSettings?.botProvider || "none"
  );
  const [botApiEndpointOrToken, setBotApiEndpointOrToken] = useState(initialSettings?.botApiEndpointOrToken || "");
  const [botTargetChatId, setBotTargetChatId] = useState(initialSettings?.botTargetChatId || "");

  // FAQ & Policy
  const [faqEnabled, setFaqEnabled] = useState(Boolean(initialSettings?.faqEnabled));
  const [faqItems, setFaqItems] = useState<FaqItem[]>(
    (initialSettings?.faqItems as FaqItem[]) || []
  );
  const [returnPolicyEnabled, setReturnPolicyEnabled] = useState(Boolean(initialSettings?.returnPolicyEnabled));
  const [returnPolicyText, setReturnPolicyText] = useState(initialSettings?.returnPolicyText || "");

  const handleAddFaqItem = () => {
    setFaqItems((prev) => [
      ...prev,
      {
        id: `faq-${Date.now()}`,
        question: "New Question?",
        answer: "Answer to the question.",
      },
    ]);
  };

  const handleRemoveFaqItem = (id: string) => {
    setFaqItems((prev) => prev.filter((item) => item.id !== id));
  };

  const handleUpdateFaqItem = (id: string, field: "question" | "answer", value: string) => {
    setFaqItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, [field]: value } : item))
    );
  };

  const handleBannerFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingBanner(true);
    try {
      const compressed = await compressImage(file, {
        maxWidth: 1600,
        maxHeight: 1000,
        quality: 0.85,
        mimeType: "image/webp",
      });

      // Tier 1: Server-side direct upload to IDCloudHost S3 (No browser CORS issues)
      const formData = new FormData();
      formData.append("file", compressed.file);
      formData.append("folder", "brand");

      const serverRes = await uploadImageServerAction(formData);

      if (serverRes.success && serverRes.publicUrl) {
        setHeroBannerImageUrl(serverRes.publicUrl);
        toast.success("Banner image uploaded to storage.");
        return;
      }

      // Tier 2: Presigned PUT Fallback
      const presigned = await getBrandAssetPresignedUrlAction(
        compressed.file.name,
        "image/webp"
      );

      if (presigned.success && presigned.uploadUrl && presigned.publicUrl) {
        const uploadRes = await fetch(presigned.uploadUrl, {
          method: "PUT",
          headers: { "Content-Type": "image/webp" },
          body: compressed.blob,
        });
        if (!uploadRes.ok) {
          throw new Error("S3 upload failed");
        }
        setHeroBannerImageUrl(presigned.publicUrl);
        toast.success("Banner image uploaded to storage.");
      } else {
        // Fallback to local compressed Data URL when S3 is not configured locally
        const dataUrl = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(String(reader.result));
          reader.onerror = reject;
          reader.readAsDataURL(compressed.blob);
        });
        setHeroBannerImageUrl(dataUrl);
        toast.success("Banner image loaded. Click Save Changes to publish.");
      }
    } catch {
      toast.error("Failed to process banner image.");
    } finally {
      setIsUploadingBanner(false);
      if (bannerFileInputRef.current) {
        bannerFileInputRef.current.value = "";
      }
    }
  };

  const handleDuitnowQrUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingDuitnow(true);
    try {
      const compressed = await compressImage(file, {
        maxWidth: 1000,
        maxHeight: 1000,
        quality: 0.9,
        mimeType: "image/webp",
      });

      const formData = new FormData();
      formData.append("file", compressed.file);
      formData.append("folder", "brand");

      const serverRes = await uploadImageServerAction(formData);
      if (serverRes.success && serverRes.publicUrl) {
        setDuitnowQrImageUrl(serverRes.publicUrl);
        toast.success("DuitNow QR / QRIS image uploaded to storage!");
      } else {
        toast.error(serverRes.error || "Failed to upload QR image.");
      }
    } catch {
      toast.error("Failed to process QR image.");
    } finally {
      setIsUploadingDuitnow(false);
      if (duitnowFileInputRef.current) {
        duitnowFileInputRef.current.value = "";
      }
    }
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingLogo(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", "brand");

      const serverRes = await uploadImageServerAction(formData);
      if (serverRes.success && serverRes.publicUrl) {
        setBrandLogoUrl(serverRes.publicUrl);
        toast.success("Brand logo uploaded to storage!");
      } else {
        toast.error(serverRes.error || "Failed to upload logo.");
      }
    } catch {
      toast.error("Failed to process logo image.");
    } finally {
      setIsUploadingLogo(false);
      if (logoFileInputRef.current) {
        logoFileInputRef.current.value = "";
      }
    }
  };

  const handleSaveAll = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const res = await updateStoreSettingsAction({
        brandLogoUrl: brandLogoUrl.trim() || null,
        heroBannerImageUrl: heroBannerImageUrl.trim() || null,
        heroBannerBadge: heroBannerBadge.trim() || null,
        heroBannerTitle: heroBannerTitle.trim() || null,
        heroBannerLink: heroBannerLink.trim() || null,
        shippingEnabled,
        flatShippingFeeRm: flatShippingFeeRm.trim() || "0.00",
        freeShippingMinRm: freeShippingMinRm.trim() || null,
        paymentEnabled,
        bankName: bankName.trim() || null,
        bankAccountNumber: bankAccountNumber.trim() || null,
        bankAccountHolder: bankAccountHolder.trim() || null,
        duitnowQrImageUrl: duitnowQrImageUrl.trim() || null,
        paymentInstructions: paymentInstructions.trim() || null,
        adminWhatsappNumber: adminWhatsappNumber.trim() || null,
        instagramUrl: instagramUrl.trim() || null,
        botProvider,
        botApiEndpointOrToken: botApiEndpointOrToken.trim() || null,
        botTargetChatId: botTargetChatId.trim() || null,
        faqEnabled,
        faqItems,
        returnPolicyEnabled,
        returnPolicyText: returnPolicyText.trim() || null,
      });

      if (!res.success) {
        toast.error(res.error || "Failed to update settings.");
        setIsSaving(false);
        return;
      }

      toast.success("Store settings updated & live on storefront!");
    } catch {
      toast.error("Failed to save settings.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-border gap-4">
        <div>
          <span className="text-xs font-bold tracking-widest text-plum-muted uppercase block">
            Global Configuration
          </span>
          <h1 className="mv-heading-italic text-2xl sm:text-3xl text-plum">
            STORE SETTINGS
          </h1>
        </div>

        <Button
          onClick={handleSaveAll}
          disabled={isSaving}
          className="bg-plum hover:bg-plum-hover text-white text-xs font-semibold h-11 px-6 rounded-xl shadow-xs"
        >
          {isSaving ? <Loader2 className="w-4 h-4 animate-spin mr-1.5" /> : <Save className="w-4 h-4 mr-1.5" />}
          Save Changes
        </Button>
      </div>

      {/* Guardrail Compliance Notice */}
      <div className="p-4 rounded-xl bg-blush-soft border border-blush text-xs text-plum flex items-start gap-3">
        <ShieldAlert className="w-5 h-5 text-pink shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          <strong className="font-bold">PDF Brand Guardrail Compliance:</strong> Shipping rates, payment instructions, and FAQ sections are only visible to the public once enabled in these settings. Toggling them off will safely hide them without leaving broken placeholders.
        </p>
      </div>

      {/* Tabs */}
      <form onSubmit={handleSaveAll}>
        <Tabs defaultValue="banner" className="w-full space-y-6">
          <TabsList className="bg-white border border-border p-1.5 rounded-2xl h-auto flex flex-wrap gap-1.5 w-full justify-start shadow-xs">
            <TabsTrigger
              value="banner"
              className="text-xs font-bold uppercase data-active:bg-plum data-active:text-white data-[state=active]:bg-plum data-[state=active]:text-white rounded-xl px-4 py-2.5 transition-colors cursor-pointer"
            >
              <ImageIcon className="w-3.5 h-3.5 mr-1.5" />
              Hero Banner
            </TabsTrigger>
            <TabsTrigger
              value="shipping"
              className="text-xs font-bold uppercase data-active:bg-plum data-active:text-white data-[state=active]:bg-plum data-[state=active]:text-white rounded-xl px-4 py-2.5 transition-colors cursor-pointer"
            >
              <Truck className="w-3.5 h-3.5 mr-1.5" />
              Shipping (Malaysia)
            </TabsTrigger>
            <TabsTrigger
              value="payment"
              className="text-xs font-bold uppercase data-active:bg-plum data-active:text-white data-[state=active]:bg-plum data-[state=active]:text-white rounded-xl px-4 py-2.5 transition-colors cursor-pointer"
            >
              <CreditCard className="w-3.5 h-3.5 mr-1.5" />
              Payment & DuitNow
            </TabsTrigger>
            <TabsTrigger
              value="whatsapp"
              className="text-xs font-bold uppercase data-active:bg-plum data-active:text-white data-[state=active]:bg-plum data-[state=active]:text-white rounded-xl px-4 py-2.5 transition-colors cursor-pointer"
            >
              <MessageCircle className="w-3.5 h-3.5 mr-1.5" />
              WhatsApp &amp; Instagram
            </TabsTrigger>
            <TabsTrigger
              value="faq"
              className="text-xs font-bold uppercase data-active:bg-plum data-active:text-white data-[state=active]:bg-plum data-[state=active]:text-white rounded-xl px-4 py-2.5 transition-colors cursor-pointer"
            >
              <HelpCircle className="w-3.5 h-3.5 mr-1.5" />
              FAQ & Policies
            </TabsTrigger>
            <TabsTrigger
              value="brand"
              className="text-xs font-bold uppercase data-active:bg-plum data-active:text-white data-[state=active]:bg-plum data-[state=active]:text-white rounded-xl px-4 py-2.5 transition-colors cursor-pointer"
            >
              <Settings className="w-3.5 h-3.5 mr-1.5" />
              Brand Logo
            </TabsTrigger>
          </TabsList>

          {/* TAB 0: HERO BANNER */}
          <TabsContent value="banner" className="bg-white p-6 rounded-2xl border border-border shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-border">
              <div>
                <h3 className="font-heading font-extrabold italic text-lg text-plum uppercase">
                  Homepage Hero Banner
                </h3>
                <p className="text-xs text-plum-muted">
                  Configure the main 16:9 visual banner displayed on the storefront homepage.
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  setHeroBannerImageUrl("");
                  setHeroBannerBadge("New Drop");
                  setHeroBannerTitle("");
                  setHeroBannerLink("");
                  toast.info("Banner reset to automatic New Arrival fallback. Click Save Changes to apply.");
                }}
                className="text-xs border-border text-plum hover:bg-blush/30 w-fit"
              >
                Use Auto New Arrival
              </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Live Banner Preview */}
              <div className="lg:col-span-6 space-y-2">
                <Label className="text-xs font-bold uppercase text-plum">Live Banner Preview (16:9)</Label>
                <div className="relative w-full aspect-[16/9] overflow-hidden rounded-2xl border border-border bg-plum shadow-sm">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={
                      heroBannerImageUrl ||
                      "https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?auto=format&fit=crop&w=1200&q=80"
                    }
                    alt="Hero banner preview"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-plum/90 via-plum/30 to-transparent" />
                  <div className="absolute inset-x-0 bottom-0 p-4 sm:p-5 flex items-end justify-between gap-4">
                    <div className="space-y-1.5 min-w-0">
                      {heroBannerBadge && (
                        <span className="inline-block bg-pink text-white text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-md">
                          {heroBannerBadge}
                        </span>
                      )}
                      <h4 className="font-heading font-extrabold italic uppercase text-white text-base sm:text-xl leading-tight line-clamp-2">
                        {heroBannerTitle || "Automatic: Latest New Arrival Title"}
                      </h4>
                    </div>
                    <span className="shrink-0 w-9 h-9 rounded-full bg-white/95 text-plum flex items-center justify-center">
                      <ArrowRight className="w-4 h-4" />
                    </span>
                  </div>
                </div>
              </div>

              {/* Banner Fields */}
              <div className="lg:col-span-6 space-y-4">
                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase text-plum">Banner Image (16:9 Recommended)</Label>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <Input
                      type="text"
                      placeholder="https://... or upload an image"
                      value={heroBannerImageUrl}
                      onChange={(e) => setHeroBannerImageUrl(e.target.value)}
                      className="h-11 rounded-xl font-mono text-xs flex-1"
                    />
                    <input
                      ref={bannerFileInputRef}
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      onChange={handleBannerFileChange}
                      className="hidden"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      disabled={isUploadingBanner}
                      onClick={() => bannerFileInputRef.current?.click()}
                      className="h-11 px-4 rounded-xl border-plum text-plum hover:bg-blush/30 text-xs font-semibold shrink-0"
                    >
                      {isUploadingBanner ? (
                        <Loader2 className="w-4 h-4 animate-spin mr-1.5" />
                      ) : (
                        <Upload className="w-4 h-4 mr-1.5" />
                      )}
                      Upload Image
                    </Button>
                  </div>
                  <p className="text-[11px] text-plum-muted">
                    Upload a banner photo from your device (auto-compressed to WebP) or paste a direct image URL. Leave blank to automatically use the latest New Arrival photo.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold uppercase text-plum">Badge Label</Label>
                    <Input
                      type="text"
                      placeholder="e.g. New Drop"
                      value={heroBannerBadge}
                      onChange={(e) => setHeroBannerBadge(e.target.value)}
                      className="h-11 rounded-xl text-xs"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold uppercase text-plum">Target Link URL</Label>
                    <Input
                      type="text"
                      placeholder="/shop or /products/slug"
                      value={heroBannerLink}
                      onChange={(e) => setHeroBannerLink(e.target.value)}
                      className="h-11 rounded-xl font-mono text-xs"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-bold uppercase text-plum">Banner Headline / Title</Label>
                  <Input
                    type="text"
                    placeholder="e.g. NewJeans - 2nd EP 'Get Up' (Bunny Beach Bag Ver.)"
                    value={heroBannerTitle}
                    onChange={(e) => setHeroBannerTitle(e.target.value)}
                    className="h-11 rounded-xl text-xs"
                  />
                  <p className="text-[11px] text-plum-muted">
                    Leave blank to automatically show the title of your newest arrival product.
                  </p>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* TAB 1: SHIPPING */}
          <TabsContent value="shipping" className="bg-white p-6 rounded-2xl border border-border shadow-xs space-y-5">
            <h3 className="font-heading font-extrabold italic text-lg text-plum uppercase pb-2 border-b border-border">
              Shipping & Delivery Configuration
            </h3>

            <label className="flex items-center gap-3 cursor-pointer text-sm font-semibold text-plum">
              <input
                type="checkbox"
                checked={shippingEnabled}
                onChange={(e) => setShippingEnabled(e.target.checked)}
                className="w-5 h-5 rounded text-plum"
              />
              <span>Enable Shipping Rate Calculation at Checkout</span>
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="space-y-1.5">
                <Label className="text-xs font-bold uppercase text-plum">Flat Rate Shipping Fee (RM)</Label>
                <Input
                  type="text"
                  placeholder="8.00"
                  value={flatShippingFeeRm}
                  onChange={(e) => setFlatShippingFeeRm(e.target.value)}
                  className="h-11 rounded-xl font-mono text-sm"
                />
                <p className="text-[11px] text-plum-muted">Applies to all deliveries across Malaysia.</p>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-bold uppercase text-plum">Free Shipping Minimum Threshold (RM)</Label>
                <Input
                  type="text"
                  placeholder="150.00"
                  value={freeShippingMinRm}
                  onChange={(e) => setFreeShippingMinRm(e.target.value)}
                  className="h-11 rounded-xl font-mono text-sm"
                />
                <p className="text-[11px] text-plum-muted">Orders at or above this amount automatically receive RM 0.00 shipping.</p>
              </div>
            </div>
          </TabsContent>

          {/* TAB 2: PAYMENT */}
          <TabsContent value="payment" className="bg-white p-6 rounded-2xl border border-border shadow-xs space-y-5">
            <h3 className="font-heading font-extrabold italic text-lg text-plum uppercase pb-2 border-b border-border">
              Bank Transfer & DuitNow QR
            </h3>

            <label className="flex items-center gap-3 cursor-pointer text-sm font-semibold text-plum">
              <input
                type="checkbox"
                checked={paymentEnabled}
                onChange={(e) => setPaymentEnabled(e.target.checked)}
                className="w-5 h-5 rounded text-plum"
              />
              <span>Enable Payment Instructions on Website (Step 04)</span>
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
                <Label className="text-xs font-bold uppercase text-plum">Account Number</Label>
                <Input
                  placeholder="e.g. 5140 1234 5678"
                  value={bankAccountNumber}
                  onChange={(e) => setBankAccountNumber(e.target.value)}
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
                      onChange={handleDuitnowQrUpload}
                      className="hidden"
                    />
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      disabled={isUploadingDuitnow}
                      onClick={() => duitnowFileInputRef.current?.click()}
                      className="h-8 text-xs font-semibold border-plum text-plum hover:bg-blush/30"
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
                        className="h-8 text-xs text-destructive hover:bg-destructive/10"
                      >
                        Remove QR
                      </Button>
                    )}
                  </div>

                  <Input
                    type="url"
                    placeholder="https://is3.cloudhost.id/velora/brand/... or paste URL"
                    value={duitnowQrImageUrl}
                    onChange={(e) => setDuitnowQrImageUrl(e.target.value)}
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
          </TabsContent>

          {/* TAB 3: WHATSAPP, INSTAGRAM & BOT */}
          <TabsContent value="whatsapp" className="bg-white p-6 rounded-2xl border border-border shadow-xs space-y-5">
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
                  className="h-11 px-3 w-full rounded-xl border border-border bg-background text-sm font-semibold text-plum"
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
          </TabsContent>

          {/* TAB 4: FAQ & POLICIES */}
          <TabsContent value="faq" className="bg-white p-6 rounded-2xl border border-border shadow-xs space-y-6">
            <h3 className="font-heading font-extrabold italic text-lg text-plum uppercase pb-2 border-b border-border">
              Frequently Asked Questions & Store Policies
            </h3>

            <label className="flex items-center gap-3 cursor-pointer text-sm font-semibold text-plum">
              <input
                type="checkbox"
                checked={faqEnabled}
                onChange={(e) => setFaqEnabled(e.target.checked)}
                className="w-5 h-5 rounded text-plum"
              />
              <span>Enable FAQ Section on Storefront</span>
            </label>

            {/* FAQ List */}
            <div className="space-y-4 pt-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase text-plum">FAQ Items ({faqItems.length})</span>
                <Button type="button" size="sm" variant="outline" onClick={handleAddFaqItem} className="h-8 text-xs font-semibold">
                  <Plus className="w-3.5 h-3.5 mr-1" />
                  Add Question
                </Button>
              </div>

              {faqItems.map((item, index) => (
                <div key={item.id} className="p-4 rounded-xl bg-ivory border border-border space-y-2 relative">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-pink uppercase">Question #{index + 1}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveFaqItem(item.id)}
                      className="text-plum-muted hover:text-destructive p-1 rounded"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <Input
                    placeholder="Question title..."
                    value={item.question}
                    onChange={(e) => handleUpdateFaqItem(item.id, "question", e.target.value)}
                    className="h-10 text-xs font-semibold bg-white"
                  />
                  <Textarea
                    placeholder="Detailed answer..."
                    value={item.answer}
                    onChange={(e) => handleUpdateFaqItem(item.id, "answer", e.target.value)}
                    className="min-h-16 text-xs bg-white resize-none"
                  />
                </div>
              ))}
            </div>

            {/* Return Policy */}
            <div className="pt-4 border-t border-border space-y-3">
              <label className="flex items-center gap-3 cursor-pointer text-sm font-semibold text-plum">
                <input
                  type="checkbox"
                  checked={returnPolicyEnabled}
                  onChange={(e) => setReturnPolicyEnabled(e.target.checked)}
                  className="w-5 h-5 rounded text-plum"
                />
                <span>Enable Store Policy Page</span>
              </label>

              {returnPolicyEnabled && (
                <div className="space-y-1.5 pt-1">
                  <Label className="text-xs font-bold uppercase text-plum">Policy Text (English)</Label>
                  <Textarea
                    placeholder="Officially confirmed terms for returns, damaged parcels, or cancellations..."
                    value={returnPolicyText}
                    onChange={(e) => setReturnPolicyText(e.target.value)}
                    className="min-h-24 text-xs"
                  />
                </div>
              )}
            </div>
          </TabsContent>

          {/* TAB 5: BRAND LOGO */}
          <TabsContent value="brand" className="bg-white p-6 rounded-2xl border border-border shadow-xs space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-border">
              <h3 className="font-heading font-extrabold italic text-lg text-plum uppercase">
                Brand Monogram &amp; Logo Asset
              </h3>
              <div className="flex items-center gap-2">
                <input
                  ref={logoFileInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/webp,image/svg+xml"
                  onChange={handleLogoUpload}
                  className="hidden"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={isUploadingLogo}
                  onClick={() => logoFileInputRef.current?.click()}
                  className="text-xs border-plum text-plum hover:bg-blush/30 w-fit"
                >
                  {isUploadingLogo ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                      <span>Uploading...</span>
                    </>
                  ) : (
                    <>
                      <Upload className="w-3.5 h-3.5 mr-1.5" />
                      <span>Upload Logo from Device</span>
                    </>
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setBrandLogoUrl("/brand/myvelora-logo.png")}
                  className="text-xs border-border text-plum hover:bg-blush/30 w-fit"
                >
                  Use Official mv Logo
                </Button>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-plum flex items-center justify-center border border-plum-hover">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={brandLogoUrl?.trim() ? brandLogoUrl.trim() : "/brand/myvelora-logo.png"}
                alt="Myvelora Logo Preview"
                className="h-14 w-auto object-contain"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase text-plum">Master Logo Path / URL (Transparent PNG or SVG)</Label>
              <Input
                type="text"
                placeholder="/brand/myvelora-logo.png"
                value={brandLogoUrl}
                onChange={(e) => setBrandLogoUrl(e.target.value)}
                className="h-11 rounded-xl font-mono text-xs"
              />
              <p className="text-[11px] text-plum-muted">
                Default: <code>/brand/myvelora-logo.png</code> (extracted from official Myvelora monogram asset).
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </form>
    </div>
  );
}
