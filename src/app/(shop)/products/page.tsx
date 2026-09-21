import { Suspense } from "react";
import type { Metadata } from "next";
import CategorySlider from "@/components/shared/CategorySlider";
import ProductListingContent from "@/components/product/ProductListingContent";
import { api } from "@/lib/api";
import { SITE_NAME } from "@/lib/constants";
import type { Product } from "@/types/product";
import type { Category } from "@/types/category";

export const metadata: Metadata = {
    title: "All Products",
    description: `Browse all products at ${SITE_NAME}. Quality items, fast delivery across Bangladesh.`,
    alternates: { canonical: "/products" },
};

const getInitialProducts = async (): Promise<Product[]> => {
    try {
        return await api.get<Product[]>("/product?sort=newest&limit=40", 60);
    } catch {
        return [];
    }
};

const getInitialCategories = async (): Promise<Category[]> => {
    try {
        const data = await api.get<Category[]>("/category", 300);
        return data.filter((c) => c.status === "ACTIVE");
    } catch {
        return [];
    }
};

const ProductsPage = async () => {
    const [initialProducts, initialCategories] = await Promise.all([
        getInitialProducts(),
        getInitialCategories(),
    ]);

    return (
        <div>
            <CategorySlider categories={initialCategories} />
            <Suspense
                fallback={
                    <p className="py-16 text-center text-sm text-neutral-500">
                        Loading...
                    </p>
                }
            >
                <ProductListingContent
                    basePath="/products"
                    initialProducts={initialProducts}
                    initialCategories={initialCategories}
                />
            </Suspense>
        </div>
    );
};

export default ProductsPage;
