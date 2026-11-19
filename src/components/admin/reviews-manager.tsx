"use client";

import { useState } from "react";
import Image from "next/image";
import { CustomerReview } from "@/db/schema";
import { upsertReviewAction, deleteReviewAction } from "@/app/actions/admin-reviews";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { Plus, Trash2, Edit3, MessageSquare, Loader2, Upload, Star, CheckCircle2 } from "lucide-react";
import { uploadImageServerAction } from "@/app/actions/upload";
import { compressImage } from "@/lib/image-compress";

interface ReviewsManagerProps {
  initialReviews: CustomerReview[];
}

function parseCaption(caption: string | null) {
  if (!caption) {
    return {
      customerName: "Verified Buyer",
      rating: 5,
      content: "",
    };
  }

  const starMatch = caption.match(/\[([1-5])★\]/);
  const rating = starMatch ? parseInt(starMatch[1], 10) : 5;
  const cleaned = caption.replace(/\[[1-5]★\]\s*/, "").trim();

  const separatorIndex = cleaned.indexOf(" — ");
  if (separatorIndex > 0 && separatorIndex < 40) {
    return {
      customerName: cleaned.slice(0, separatorIndex).trim(),
      rating,
      content: cleaned.slice(separatorIndex + 3).trim(),
    };
  }

  return {
    customerName: "Verified Buyer",
    rating,
    content: cleaned,
  };
}

export function ReviewsManager({ initialReviews }: ReviewsManagerProps) {
  const [reviewsList, setReviewsList] = useState(initialReviews);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  // Form Fields
  const [customerName, setCustomerName] = useState("");
  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [reviewText, setReviewText] = useState("");
  const [imageUrl, setImageUrl] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const compressed = await compressImage(file, {
        maxWidth: 1080,
        maxHeight: 1920, // 9:16 story ratio
        quality: 0.85,
        mimeType: "image/webp",
      });

      const formData = new FormData();
      formData.append("file", compressed.file);
      formData.append("folder", "reviews");

      const res = await uploadImageServerAction(formData);
      if (res.success && res.publicUrl) {
        setImageUrl(res.publicUrl);
        toast.success("Review screenshot uploaded to storage!");
      } else {
        toast.error(res.error || "Failed to upload to storage.");
      }
    } catch {
      toast.error("Failed to process image.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleOpenNew = () => {
    setEditingId(null);
    setCustomerName("");
    setRating(5);
    setHoverRating(0);
    setReviewText("");
    setImageUrl("");
    setIsDialogOpen(true);
  };

  const handleOpenEdit = (review: CustomerReview) => {
    const parsed = parseCaption(review.caption);
    setEditingId(review.id);
    setCustomerName(parsed.customerName === "Verified Buyer" ? "" : parsed.customerName);
    setRating(parsed.rating);
    setHoverRating(0);
    setReviewText(parsed.content);
    setImageUrl(review.imageUrl);
    setIsDialogOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim()) {
      toast.error("Please enter the customer's name.");
      return;
    }
    if (!reviewText.trim()) {
      toast.error("Please enter the customer's review feedback.");
      return;
    }
    if (!imageUrl.trim()) {
      toast.error("Please provide a screenshot or unboxing image URL.");
      return;
    }

    setIsSubmitting(true);
    try {
      // Format: "Customer Name [5★] — Review text"
      const formattedCaption = `${customerName.trim()} [${rating}★] — ${reviewText.trim()}`;

      const res = await upsertReviewAction({
        id: editingId || undefined,
        imageUrl: imageUrl.trim(),
        caption: formattedCaption,
        isPublished: true,
        sortOrder: editingId
          ? (reviewsList.find((r) => r.id === editingId)?.sortOrder ?? 0)
          : reviewsList.length + 1,
      });

      if (!res.success) {
        toast.error(res.error || "Failed to save review.");
        setIsSubmitting(false);
        return;
      }

      toast.success(editingId ? "Review updated!" : "Review added successfully!");
      setIsDialogOpen(false);
      window.location.reload();
    } catch {
      toast.error("Failed to save review.");
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this customer review?")) return;
    const res = await deleteReviewAction(id);
    if (res.success) {
      toast.success("Review deleted.");
      setReviewsList((prev) => prev.filter((r) => r.id !== id));
    } else {
      toast.error(res.error || "Failed to delete.");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-border gap-4">
        <div>
          <span className="text-xs font-bold tracking-widest text-pink uppercase block">
            Customer Feedback & Social Proof
          </span>
          <h1 className="mv-heading-italic text-2xl sm:text-3xl text-plum">
            CUSTOMER REVIEWS ({reviewsList.length})
          </h1>
        </div>

        <Button
          onClick={handleOpenNew}
          className="bg-plum hover:bg-plum-hover text-white text-xs font-semibold h-11 px-5 rounded-xl shadow-xs"
        >
          <Plus className="w-4 h-4 mr-1.5" />
          Add Customer Review
        </Button>
      </div>

      {/* Grid of Reviews */}
      {reviewsList.length === 0 ? (
        <div className="bg-white p-12 text-center rounded-2xl border border-border text-plum-muted space-y-3">
          <MessageSquare className="w-10 h-10 mx-auto opacity-50 text-plum" />
          <p className="font-heading font-bold text-plum text-lg uppercase">No Reviews Uploaded Yet</p>
          <p className="text-xs text-plum-muted max-w-md mx-auto">
            Upload WhatsApp unboxing and packing feedback with customer names, star ratings, and review quotes to showcase genuine buyer trust.
          </p>
          <Button
            onClick={handleOpenNew}
            variant="outline"
            className="border-pink text-pink hover:bg-pink/10 text-xs font-semibold rounded-xl"
          >
            <Plus className="w-3.5 h-3.5 mr-1" />
            Add First Review
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {reviewsList.map((review) => {
            const parsed = parseCaption(review.caption);

            return (
              <div
                key={review.id}
                className="bg-white rounded-2xl border border-border overflow-hidden shadow-xs flex flex-col justify-between group hover:border-pink/40 transition-all"
              >
                {/* Image Thumbnail */}
                <div className="relative aspect-[9/16] w-full bg-zinc-100 overflow-hidden">
                  <Image
                    src={review.imageUrl}
                    alt={parsed.content || "Customer review"}
                    fill
                    sizes="(max-width: 640px) 100vw, 25vw"
                    className="object-cover"
                  />
                  <div className="absolute top-2 right-2 bg-plum/80 backdrop-blur-xs text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                    <Star className="w-2.5 h-2.5 fill-pink text-pink" />
                    <span>{parsed.rating}.0</span>
                  </div>
                </div>

                {/* Content Details */}
                <div className="p-3 bg-white space-y-2 flex-1 flex flex-col justify-between">
                  <div className="space-y-1">
                    {/* Stars */}
                    <div className="flex items-center gap-0.5 text-pink">
                      {Array.from({ length: 5 }).map((_, starIdx) => (
                        <Star
                          key={starIdx}
                          className={`w-3 h-3 ${
                            starIdx < parsed.rating
                              ? "fill-pink text-pink"
                              : "fill-zinc-200 text-zinc-300"
                          }`}
                        />
                      ))}
                    </div>

                    {/* Customer Name */}
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-xs text-plum truncate">
                        {parsed.customerName}
                      </span>
                      <span className="inline-flex items-center gap-0.5 text-[9px] font-semibold text-emerald-700 bg-emerald-50 px-1 py-0.2 rounded shrink-0">
                        <CheckCircle2 className="w-2.5 h-2.5" />
                        <span>Verified</span>
                      </span>
                    </div>

                    {/* Review Words */}
                    {parsed.content && (
                      <p className="text-xs text-plum/80 line-clamp-3 italic leading-relaxed pt-0.5">
                        &ldquo;{parsed.content}&rdquo;
                      </p>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="pt-2 border-t border-border flex items-center justify-between">
                    <span className="text-[10px] text-plum-muted">Story 9:16</span>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => handleOpenEdit(review)}
                        className="text-plum-muted hover:text-plum p-1.5 rounded transition-colors"
                        title="Edit Review"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(review.id)}
                        className="text-plum-muted hover:text-destructive p-1.5 rounded transition-colors"
                        title="Delete Review"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add / Edit Review Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md bg-white">
          <DialogHeader>
            <DialogTitle className="mv-heading-italic text-lg text-plum">
              {editingId ? "Edit Customer Review" : "Add Customer Review"}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSave} className="space-y-4 pt-2">
            {/* Customer Name */}
            <div className="space-y-1.5">
              <Label className="text-xs font-bold uppercase text-plum">
                Customer Name *
              </Label>
              <Input
                required
                placeholder="e.g. Aina R. (or Chloe T., Syafiqah M.)"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="h-11 rounded-xl text-xs"
              />
            </div>

            {/* Star Rating Picker */}
            <div className="space-y-1.5">
              <Label className="text-xs font-bold uppercase text-plum">
                Star Rating *
              </Label>
              <div className="flex items-center gap-3 p-2.5 rounded-xl border border-border bg-ivory/40">
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      className="p-1 -m-1 focus:outline-hidden transition-transform hover:scale-110 cursor-pointer"
                      title={`${star} Star${star > 1 ? "s" : ""}`}
                    >
                      <Star
                        className={`w-6 h-6 transition-colors ${
                          star <= (hoverRating || rating)
                            ? "fill-pink text-pink drop-shadow-xs"
                            : "fill-zinc-200 text-zinc-300"
                        }`}
                      />
                    </button>
                  ))}
                </div>
                <span className="text-xs font-bold text-plum">
                  {rating === 5 && "5.0 ★ (Excellent)"}
                  {rating === 4 && "4.0 ★ (Very Good)"}
                  {rating === 3 && "3.0 ★ (Good)"}
                  {rating === 2 && "2.0 ★ (Fair)"}
                  {rating === 1 && "1.0 ★ (Poor)"}
                </span>
              </div>
            </div>

            {/* Review Feedback / Kata-kata Pembeli */}
            <div className="space-y-1.5">
              <Label className="text-xs font-bold uppercase text-plum">
                Review / Words From Customer *
              </Label>
              <Textarea
                required
                rows={3}
                placeholder="e.g. Parcel arrived safely in Penang! Packed with thick double bubble wrap and official photocards are in 100% mint condition. Fast shipping!"
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
                className="rounded-xl text-xs resize-none leading-relaxed"
              />
            </div>

            {/* Screenshot Image URL / Upload */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-bold uppercase text-plum">
                  Screenshot / Unboxing Image *
                </Label>
                <label className="cursor-pointer inline-flex items-center gap-1.5 text-xs text-pink font-semibold hover:underline">
                  <Upload className="w-3.5 h-3.5" />
                  <span>{isUploading ? "Uploading..." : "Upload from Device"}</span>
                  <input
                    type="file"
                    accept="image/*"
                    disabled={isUploading}
                    className="hidden"
                    onChange={handleFileUpload}
                  />
                </label>
              </div>
              <Input
                required
                type="url"
                placeholder="https://is3.cloudhost.id/velora/reviews/..."
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                className="h-11 rounded-xl font-mono text-xs"
              />
              <p className="text-[11px] text-plum-muted">
                Tip: Upload straight from device (auto-compressed to WebP 9:16) or paste image URL.
              </p>

              {/* Thumbnail Preview */}
              {imageUrl && (
                <div className="mt-2 flex items-center gap-3 p-2 bg-ivory/50 rounded-xl border border-border">
                  <div className="relative h-16 w-12 rounded-lg overflow-hidden border border-border bg-zinc-100 shrink-0">
                    <Image src={imageUrl} alt="Review preview" fill className="object-cover" />
                  </div>
                  <div className="text-[11px] text-plum-muted overflow-hidden">
                    <p className="font-semibold text-plum truncate">Image Selected</p>
                    <p className="truncate font-mono text-[10px]">{imageUrl}</p>
                  </div>
                </div>
              )}
            </div>

            <DialogFooter className="pt-3">
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting} className="bg-plum hover:bg-plum-hover text-white">
                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : editingId ? "Update Review" : "Save Review"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
