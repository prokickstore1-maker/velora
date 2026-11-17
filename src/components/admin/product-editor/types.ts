import { Product, ProductVersion } from "@/db/schema";

export interface ProductWithVersions extends Product {
  versions: ProductVersion[];
}

export interface DraftVersionItem {
  id?: number;
  versionName: string;
  sku: string;
  priceRm: string;
  stock: number;
  discountPercent?: number;
  imageUrl?: string;
  isBundle?: boolean;
  bundleMode?: "standalone" | "linked";
  linkedVersionIds?: string;
}

export interface ProductEditorProps {
  product?: ProductWithVersions | null;
}
