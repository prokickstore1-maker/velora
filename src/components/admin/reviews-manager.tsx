"use client";

import { useState } from "react";
import Image from "next/image";
import { CustomerReview } from "@/db/schema";
import { upsertReviewAction, deleteReviewAction } from "@/app/actions/admin-reviews";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { Plus, Trash2, MessageSquare, Loader2, Upload } from "lucide-react";
import { uploadImageServerAction } from "@/app/actions/upload";
import { compressImage } from "@/lib/image-compress";

interface ReviewsManagerProps {
  initialReviews: CustomerReview[];
}

export function ReviewsManager({ initialReviews }: ReviewsManagerProps) {
  const [reviewsList, setReviewsList] = useState(initialReviews);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [imageUrl, setImageUrl] = useState("");
  const [caption, setCaption] = useState("");
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
    setImageUrl("");
    setCaption("");
    setIsDialogOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!imageUrl.trim()) {
      toast.error("Please enter image URL.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await upsertReviewAction({
        imageUrl: imageUrl.trim(),
        caption: caption.trim() || undefined,
        isPublished: true,
        sortOrder: reviewsList.length + 1,
      });

      if (!res.success) {
        toast.error(res.error || "Failed to add review.");
        setIsSubmitting(false);
        return;
      }

      toast.success("Review screenshot added!");
      setIsDialogOpen(false);
      window.location.reload();
    } catch {
      toast.error("Failed to add review.");
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this review screenshot?")) return;
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
            Customer Feedback
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
          Add WhatsApp Review
        </Button>
      </div>

      {/* Grid of Reviews */}
      {reviewsList.length === 0 ? (
        <div className="bg-white p-12 text-center rounded-2xl border border-border text-plum-muted space-y-2">
          <MessageSquare className="w-10 h-10 mx-auto opacity-50 text-plum" />
          <p className="font-heading font-bold text-plum text-lg uppercase">No Reviews Uploaded Yet</p>
          <p className="text-xs text-plum-muted">Upload WhatsApp packing and delivery screenshots to showcase buyer trust.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {reviewsList.map((review) => (
            <div
              key={review.id}
              className="bg-white rounded-2xl border border-border overflow-hidden shadow-xs flex flex-col justify-between group"
            >
              <div className="relative aspect-[9/16] w-full bg-zinc-100">
                <Image src={review.imageUrl} alt={review.caption || "Customer review"} fill sizes="(max-width: 640px) 50vw, 25vw" className="object-cover" />
              </div>

              <div className="p-3 bg-white space-y-2">
                <p className="text-xs text-plum font-medium line-clamp-2">
                  {review.caption || "No caption"}
                </p>

                <div className="pt-2 border-t border-border flex items-center justify-between">
                  <span className="text-[10px] text-plum-muted">Story 9:16</span>
                  <button
                    type="button"
                    onClick={() => handleDelete(review.id)}
                    className="text-plum-muted hover:text-destructive p-1 rounded transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Review Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md bg-white">
          <DialogHeader>
            <DialogTitle className="mv-heading-italic text-lg text-plum">
              Add Customer Review Screenshot
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSave} className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-bold uppercase text-plum">Screenshot Image *</Label>
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
                Tip: Upload straight from device (auto-compressed to WebP 9:16) or paste an image URL.
              </p>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-bold uppercase text-plum">Caption (English)</Label>
              <Input
                placeholder="e.g. Parcel arrived safely in Penang!"
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                className="h-11 rounded-xl text-xs"
              />
            </div>

            <DialogFooter className="pt-3">
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting} className="bg-plum hover:bg-plum-hover text-white">
                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save Review"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
