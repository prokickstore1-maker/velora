"use client";

import { useState, useRef } from "react";
import { FaqItem } from "@/db/schema";
import {
  updateStoreSettingsAction,
  getBrandAssetPresignedUrlAction,
} from "@/app/actions/admin-settings";
import { uploadImageServerAction } from "@/app/actions/upload";
import { compressImage } from "@/lib/image-compress";
import { evaluateStorePaymentStatus } from "@/lib/store-hours";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import {
  Settings,
  Image as ImageIcon,
  CreditCard,
  Truck,
  MessageCircle,
  HelpCircle,
  Save,
  Loader2,
  ShieldAlert,
  Tag,
} from "lucide-react";

import { SettingsManagerProps } from "./settings/types";
import { HeroBannerTab } from "./settings/hero-banner-tab";
import { ShippingTab } from "./settings/shipping-tab";
import { PaymentTab } from "./settings/payment-tab";
import { ContactBotTab } from "./settings/contact-bot-tab";
import { FaqPolicyTab } from "./settings/faq-policy-tab";
import { BrandLogoTab } from "./settings/brand-logo-tab";
import { PromoTab } from "./settings/promo-tab";

export function SettingsManager({ initialSettings }: SettingsManagerProps) {
  const [isSaving, setIsSaving] = useState(false);

  // Upload refs & loading states
  const [isUploadingBanner, setIsUploadingBanner] = useState(false);
  const bannerFileInputRef = useRef<HTMLInputElement>(null);

  const [isUploadingDuitnow, setIsUploadingDuitnow] = useState(false);
  const duitnowFileInputRef = useRef<HTMLInputElement>(null);

  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const logoFileInputRef = useRef<HTMLInputElement>(null);

  // Form states
  const [brandLogoUrl, setBrandLogoUrl] = useState(initialSettings?.brandLogoUrl || "");
  const [heroBannerImageUrl, setHeroBannerImageUrl] = useState(initialSettings?.heroBannerImageUrl || "");
  const [heroBannerBadge, setHeroBannerBadge] = useState(initialSettings?.heroBannerBadge || "New Drop");
  const [heroBannerTitle, setHeroBannerTitle] = useState(initialSettings?.heroBannerTitle || "");
  const [heroBannerLink, setHeroBannerLink] = useState(initialSettings?.heroBannerLink || "/shop");

  const initialStoreStatus = evaluateStorePaymentStatus(initialSettings);

  const [shippingEnabled, setShippingEnabled] = useState(Boolean(initialSettings?.shippingEnabled));
  const [flatShippingFeeRm, setFlatShippingFeeRm] = useState(initialSettings?.flatShippingFeeRm || "8.00");
  const [freeShippingMinRm, setFreeShippingMinRm] = useState(initialSettings?.freeShippingMinRm || "150.00");

  // If yesterday's bank account expired at 10:00 PM MYT, automatically start empty so Admin uploads today's account
  const [paymentEnabled, setPaymentEnabled] = useState(
    initialStoreStatus.isOpen ? Boolean(initialSettings?.paymentEnabled) : false
  );
  const [bankName, setBankName] = useState(initialSettings?.bankName || "Maybank");
  const [bankAccountNumber, setBankAccountNumber] = useState(
    initialStoreStatus.isOpen ? initialSettings?.bankAccountNumber || "" : ""
  );
  const [bankAccountHolder, setBankAccountHolder] = useState(
    initialStoreStatus.isOpen ? initialSettings?.bankAccountHolder || "" : ""
  );
  const [duitnowQrImageUrl, setDuitnowQrImageUrl] = useState(
    initialStoreStatus.isOpen ? initialSettings?.duitnowQrImageUrl || "" : ""
  );
  const [paymentInstructions, setPaymentInstructions] = useState(initialSettings?.paymentInstructions || "");

  const [adminWhatsappNumber, setAdminWhatsappNumber] = useState(initialSettings?.adminWhatsappNumber || "");
  const [instagramUrl, setInstagramUrl] = useState(initialSettings?.instagramUrl || "");
  const [botProvider, setBotProvider] = useState<"none" | "telegram" | "whatsapp_api">(
    (initialSettings?.botProvider as "none" | "telegram" | "whatsapp_api") || "none"
  );
  const [botApiEndpointOrToken, setBotApiEndpointOrToken] = useState(initialSettings?.botApiEndpointOrToken || "");
  const [botTargetChatId, setBotTargetChatId] = useState(initialSettings?.botTargetChatId || "");

  const [faqEnabled, setFaqEnabled] = useState(Boolean(initialSettings?.faqEnabled));
  const [faqItems, setFaqItems] = useState<FaqItem[]>(initialSettings?.faqItems || []);
  const [returnPolicyEnabled, setReturnPolicyEnabled] = useState(Boolean(initialSettings?.returnPolicyEnabled));
  const [returnPolicyText, setReturnPolicyText] = useState(initialSettings?.returnPolicyText || "");

  const [promoDiscountEnabled, setPromoDiscountEnabled] = useState(Boolean(initialSettings?.promoDiscountEnabled));
  const [promoDiscountPercent, setPromoDiscountPercent] = useState(initialSettings?.promoDiscountPercent || 0);
  const [promoDiscountScope, setPromoDiscountScope] = useState(initialSettings?.promoDiscountScope || "all");
  const [promoDiscountBadge, setPromoDiscountBadge] = useState(initialSettings?.promoDiscountBadge || "SALE");

  // FAQ handlers
  const handleAddFaqItem = () => {
    setFaqItems((prev) => [
      ...prev,
      { id: `faq_${Date.now()}`, question: "New Question Title", answer: "Detailed answer goes here..." },
    ]);
  };

  const handleUpdateFaqItem = (id: string, field: "question" | "answer", val: string) => {
    setFaqItems((prev) => prev.map((item) => (item.id === id ? { ...item, [field]: val } : item)));
  };

  const handleRemoveFaqItem = (id: string) => {
    setFaqItems((prev) => prev.filter((item) => item.id !== id));
  };

  // Upload Handlers
  const handleBannerFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingBanner(true);
    try {
      const compressed = await compressImage(file, { maxWidth: 1920, maxHeight: 1080, quality: 0.85 });
      const formData = new FormData();
      formData.append("file", compressed.file);
      formData.append("folder", "brand");

      const serverRes = await uploadImageServerAction(formData);
      if (serverRes.success && serverRes.publicUrl) {
        setHeroBannerImageUrl(serverRes.publicUrl);
        toast.success("Banner image uploaded to storage.");
        return;
      }

      // Presigned PUT fallback
      const presigned = await getBrandAssetPresignedUrlAction(compressed.file.name, "image/webp");
      if (presigned.success && presigned.uploadUrl && presigned.publicUrl) {
        const uploadRes = await fetch(presigned.uploadUrl, {
          method: "PUT",
          headers: { "Content-Type": "image/webp" },
          body: compressed.blob,
        });
        if (!uploadRes.ok) throw new Error("S3 upload failed");
        setHeroBannerImageUrl(presigned.publicUrl);
        toast.success("Banner image uploaded to storage.");
      } else {
        toast.error("Failed to upload banner to storage.");
      }
    } catch {
      toast.error("Failed to upload banner image.");
    } finally {
      setIsUploadingBanner(false);
      if (bannerFileInputRef.current) bannerFileInputRef.current.value = "";
    }
  };

  const handleDuitnowQrUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingDuitnow(true);
    try {
      const compressed = await compressImage(file, { maxWidth: 800, maxHeight: 800, quality: 0.9 });
      const formData = new FormData();
      formData.append("file", compressed.file);
      formData.append("folder", "brand");

      const serverRes = await uploadImageServerAction(formData);
      if (serverRes.success && serverRes.publicUrl) {
        setDuitnowQrImageUrl(serverRes.publicUrl);
        setPaymentEnabled(true);
        toast.success("DuitNow QR uploaded! Click Save Changes to open store for today.");
      } else {
        toast.error(serverRes.error || "Failed to upload QR image.");
      }
    } catch {
      toast.error("Failed to process QR image.");
    } finally {
      setIsUploadingDuitnow(false);
      if (duitnowFileInputRef.current) duitnowFileInputRef.current.value = "";
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
      if (logoFileInputRef.current) logoFileInputRef.current.value = "";
    }
  };

  // Submit all settings
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
        promoDiscountEnabled,
        promoDiscountPercent,
        promoDiscountScope,
        promoDiscountBadge: promoDiscountBadge.trim() || "SALE",
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
          className="bg-plum hover:bg-plum-hover text-white text-xs font-semibold h-11 px-6 rounded-xl shadow-xs cursor-pointer"
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
              Payment &amp; DuitNow
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
              FAQ &amp; Policies
            </TabsTrigger>
            <TabsTrigger
              value="brand"
              className="text-xs font-bold uppercase data-active:bg-plum data-active:text-white data-[state=active]:bg-plum data-[state=active]:text-white rounded-xl px-4 py-2.5 transition-colors cursor-pointer"
            >
              <Settings className="w-3.5 h-3.5 mr-1.5" />
              Brand Logo
            </TabsTrigger>
            <TabsTrigger
              value="promo"
              className="text-xs font-bold uppercase data-active:bg-plum data-active:text-white data-[state=active]:bg-plum data-[state=active]:text-white rounded-xl px-4 py-2.5 transition-colors cursor-pointer"
            >
              <Tag className="w-3.5 h-3.5 mr-1.5" />
              Promo &amp; Sale
            </TabsTrigger>
          </TabsList>

          <TabsContent value="banner">
            <HeroBannerTab
              heroBannerImageUrl={heroBannerImageUrl}
              setHeroBannerImageUrl={setHeroBannerImageUrl}
              heroBannerBadge={heroBannerBadge}
              setHeroBannerBadge={setHeroBannerBadge}
              heroBannerTitle={heroBannerTitle}
              setHeroBannerTitle={setHeroBannerTitle}
              heroBannerLink={heroBannerLink}
              setHeroBannerLink={setHeroBannerLink}
              isUploadingBanner={isUploadingBanner}
              bannerFileInputRef={bannerFileInputRef}
              onBannerFileChange={handleBannerFileChange}
              onResetAuto={() => {
                setHeroBannerImageUrl("");
                setHeroBannerBadge("New Drop");
                setHeroBannerTitle("");
                setHeroBannerLink("");
                toast.info("Banner reset to automatic New Arrival fallback. Click Save Changes to apply.");
              }}
            />
          </TabsContent>

          <TabsContent value="shipping">
            <ShippingTab
              shippingEnabled={shippingEnabled}
              setShippingEnabled={setShippingEnabled}
              flatShippingFeeRm={flatShippingFeeRm}
              setFlatShippingFeeRm={setFlatShippingFeeRm}
              freeShippingMinRm={freeShippingMinRm}
              setFreeShippingMinRm={setFreeShippingMinRm}
            />
          </TabsContent>

          <TabsContent value="payment">
            <PaymentTab
              paymentEnabled={paymentEnabled}
              setPaymentEnabled={setPaymentEnabled}
              bankName={bankName}
              setBankName={setBankName}
              bankAccountNumber={bankAccountNumber}
              setBankAccountNumber={setBankAccountNumber}
              bankAccountHolder={bankAccountHolder}
              setBankAccountHolder={setBankAccountHolder}
              duitnowQrImageUrl={duitnowQrImageUrl}
              setDuitnowQrImageUrl={setDuitnowQrImageUrl}
              paymentInstructions={paymentInstructions}
              setPaymentInstructions={setPaymentInstructions}
              isUploadingDuitnow={isUploadingDuitnow}
              duitnowFileInputRef={duitnowFileInputRef}
              onDuitnowQrUpload={handleDuitnowQrUpload}
            />
          </TabsContent>

          <TabsContent value="whatsapp">
            <ContactBotTab
              adminWhatsappNumber={adminWhatsappNumber}
              setAdminWhatsappNumber={setAdminWhatsappNumber}
              instagramUrl={instagramUrl}
              setInstagramUrl={setInstagramUrl}
              botProvider={botProvider}
              setBotProvider={setBotProvider}
              botApiEndpointOrToken={botApiEndpointOrToken}
              setBotApiEndpointOrToken={setBotApiEndpointOrToken}
              botTargetChatId={botTargetChatId}
              setBotTargetChatId={setBotTargetChatId}
            />
          </TabsContent>

          <TabsContent value="faq">
            <FaqPolicyTab
              faqEnabled={faqEnabled}
              setFaqEnabled={setFaqEnabled}
              faqItems={faqItems}
              onAddFaqItem={handleAddFaqItem}
              onUpdateFaqItem={handleUpdateFaqItem}
              onRemoveFaqItem={handleRemoveFaqItem}
              returnPolicyEnabled={returnPolicyEnabled}
              setReturnPolicyEnabled={setReturnPolicyEnabled}
              returnPolicyText={returnPolicyText}
              setReturnPolicyText={setReturnPolicyText}
            />
          </TabsContent>

          <TabsContent value="brand">
            <BrandLogoTab
              brandLogoUrl={brandLogoUrl}
              setBrandLogoUrl={setBrandLogoUrl}
              isUploadingLogo={isUploadingLogo}
              logoFileInputRef={logoFileInputRef}
              onLogoUpload={handleLogoUpload}
            />
          </TabsContent>

          <TabsContent value="promo">
            <PromoTab
              promoDiscountEnabled={promoDiscountEnabled}
              setPromoDiscountEnabled={setPromoDiscountEnabled}
              promoDiscountPercent={promoDiscountPercent}
              setPromoDiscountPercent={setPromoDiscountPercent}
              promoDiscountScope={promoDiscountScope}
              setPromoDiscountScope={setPromoDiscountScope}
              promoDiscountBadge={promoDiscountBadge}
              setPromoDiscountBadge={setPromoDiscountBadge}
            />
          </TabsContent>
        </Tabs>
      </form>
    </div>
  );
}
