"use server";

import { z } from "zod";
import { db, hasDatabaseUrl } from "@/db";
import { customerReviews } from "@/db/schema";
import { MOCK_REVIEWS } from "@/db/mock-data";
import { eq } from "drizzle-orm";
import { updateTag } from "next/cache";

const reviewSchema = z.object({
  id: z.number().optional(),
  imageUrl: z.string().url("Valid image URL required"),
  caption: z.string().trim().optional(),
  isPublished: z.boolean().default(true),
  sortOrder: z.number().int().default(0),
});

export async function upsertReviewAction(rawData: z.infer<typeof reviewSchema>) {
  const parsed = reviewSchema.safeParse(rawData);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message || "Invalid review data" };
  }

  const { id, ...data } = parsed.data;

  try {
    if (!hasDatabaseUrl) {
      if (id) {
        const idx = MOCK_REVIEWS.findIndex((r) => r.id === id);
        if (idx !== -1) {
          MOCK_REVIEWS[idx] = {
            ...MOCK_REVIEWS[idx],
            imageUrl: data.imageUrl,
            caption: data.caption || "",
            isPublished: data.isPublished,
            sortOrder: data.sortOrder,
          };
        }
      } else {
        const nextId = Math.max(0, ...MOCK_REVIEWS.map((r) => r.id)) + 1;
        MOCK_REVIEWS.unshift({
          id: nextId,
          imageUrl: data.imageUrl,
          caption: data.caption || "",
          isPublished: data.isPublished,
          sortOrder: data.sortOrder,
          createdAt: new Date(),
        });
      }
      updateTag("reviews");
      return { success: true };
    }

    if (id) {
      await db
        .update(customerReviews)
        .set({
          ...data,
          caption: data.caption || null,
        })
        .where(eq(customerReviews.id, id));
    } else {
      await db.insert(customerReviews).values({
        ...data,
        caption: data.caption || null,
      });
    }

    updateTag("reviews");
    return { success: true };
  } catch (err: unknown) {
    console.error("Failed to save review:", err);
    const message = err instanceof Error ? err.message : "Failed to save review.";
    return { success: false, error: message };
  }
}

export async function deleteReviewAction(id: number) {
  try {
    if (!hasDatabaseUrl) {
      const idx = MOCK_REVIEWS.findIndex((r) => r.id === id);
      if (idx !== -1) MOCK_REVIEWS.splice(idx, 1);
      updateTag("reviews");
      return { success: true };
    }
    await db.delete(customerReviews).where(eq(customerReviews.id, id));
    updateTag("reviews");
    return { success: true };
  } catch (err) {
    console.error("Failed to delete review:", err);
    return { success: false, error: "Failed to delete review." };
  }
}
