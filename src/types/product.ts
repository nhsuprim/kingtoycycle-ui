import type { Category } from "./category";

export type ProductStockStatus = "IN_STOCK" | "OUT_OF_STOCK" | "DISCONTINUED";

export interface Product {
    id: string;
    name: string;
    description: string;
    sku: string;
    color: string;
    brand?: string;
    featured: boolean;
    regularPrice: number;
    discountPrice?: number;
    stockStatus: ProductStockStatus;
    thumbnailImage: string;
    images: string[];
    categoryId: string;
    category?: Category;
    averageRating: number;
    reviewCount: number;
    createdAt: string;
    updatedAt: string;
}
