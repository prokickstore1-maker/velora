import { db, hasDatabaseUrl } from "@/db";
import { customerReviews } from "@/db/schema";
import { desc } from "drizzle-orm";
import { MOCK_REVIEWS } from "@/db/mock-data";
import { ReviewsManager } from "@/components/admin/reviews-manager";

export const metadata = {
  title: "Customer Reviews Manager | Admin Dashboard",
};

export default async function AdminReviewsPage() {
  let allReviews: Array<typeof customerReviews.$inferSelect> = [];

  if (!hasDatabaseUrl) {
    return <ReviewsManager initialReviews={MOCK_REVIEWS} />;
  }

  try {
    allReviews = await db.query.customerReviews.findMany({
      orderBy: [customerReviews.sortOrder, desc(customerReviews.createdAt)],
    });
  } catch (err) {
    console.error("Failed to fetch customer reviews from DB:", err);
    allReviews = [];
  }

  return <ReviewsManager initialReviews={allReviews} />;
}
