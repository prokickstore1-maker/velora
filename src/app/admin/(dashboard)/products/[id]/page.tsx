import { db } from "@/db";
import { products, productVersions } from "@/db/schema";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { ProductEditor } from "@/components/admin/product-editor";
import { MOCK_PRODUCTS } from "@/db/mock-data";

export const metadata = {
  title: "Edit Product | Admin Dashboard",
};

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const numId = parseInt(id, 10);
  if (isNaN(numId)) {
    notFound();
  }

  let product = null;

  try {
    const rows = await db.query.products.findMany({
      where: eq(products.id, numId),
      with: {
        versions: {
          orderBy: [productVersions.sortOrder, productVersions.id],
        },
      },
      limit: 1,
    });
    product = rows[0] || null;
  } catch {
    product = null;
  }

  if (!product) {
    const mockMatch = MOCK_PRODUCTS.find((p) => p.id === numId);
    if (mockMatch) {
      product = mockMatch as unknown as typeof product;
    }
  }

  if (!product) {
    notFound();
  }

  return <ProductEditor product={product} />;
}
