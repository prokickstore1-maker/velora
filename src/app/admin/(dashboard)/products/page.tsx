import { db } from "@/db";
import { products, productVersions } from "@/db/schema";
import { desc } from "drizzle-orm";
import { MOCK_PRODUCTS } from "@/db/mock-data";
import { ProductsManager } from "@/components/admin/products-manager";

export const metadata = {
  title: "Products & Versions Manager | Admin Dashboard",
};

export default async function AdminProductsPage() {
  let allProducts: Array<typeof products.$inferSelect & { versions: Array<typeof productVersions.$inferSelect> }> = [];

  try {
    allProducts = await db.query.products.findMany({
      orderBy: [desc(products.createdAt)],
      with: {
        versions: {
          orderBy: [productVersions.sortOrder, productVersions.id],
        },
      },
    });

    if (allProducts.length === 0) {
      allProducts = MOCK_PRODUCTS as unknown as typeof allProducts;
    }
  } catch {
    allProducts = MOCK_PRODUCTS as unknown as typeof allProducts;
  }

  return <ProductsManager initialProducts={allProducts} />;
}
