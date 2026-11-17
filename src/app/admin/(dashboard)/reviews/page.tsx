import { db } from "@/db";
import { customerReviews } from "@/db/schema";
import { desc } from "drizzle-orm";
import { MOCK_REVIEWS } from "@/db/mock-data";
import { ReviewsManager } from "@/components/admin/reviews-manager";

export const metadata = {
  title: "Customer Reviews Manager | Admin Dashboard",
};

export default async function AdminReviewsPage() {
  let allReviews: Array<typeof customerReviews.$inferSelect> = [];

  try {
    allReviews = await db.query.customerReviews.findMany({
      orderBy: [customerReviews.sortOrder, desc(customerReviews.createdAt)],
    });

    if (allReviews.length === 0) {
      allReviews = MOCK_REVIEWS;
    }
  } catch {
    allReviews = MOCK_REVIEWS;
  }

  return <ReviewsManager initialReviews={allReviews} />;
}
