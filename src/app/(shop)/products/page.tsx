import { Suspense } from "react";
import type { Metadata } from "next";
import CategorySlider from "@/components/shared/CategorySlider";
import ProductListingContent from "@/components/product/ProductListingContent";
import { api } from "@/lib/api";
import { REVALIDATE_DAY } from "@/lib/revalidate";
import { SITE_NAME } from "@/lib/constants";
import type { Product } from "@/types/product";
import type { Category } from "@/types/category";

export const metadata: Metadata = {
    title: "All Products",
    description: `Browse all products at ${SITE_NAME}. Quality items, fast delivery across Bangladesh.`,
    alternates: { canonical: "/products" },
};

const getInitialProducts = () =>
    api.get<Product[]>("/product?sort=newest&limit=40", {
        revalidate: REVALIDATE_DAY,
        tags: ["products"],
    });

const getInitialCategories = async (): Promise<Category[]> => {
    const data = await api.get<Category[]>("/category", {
        revalidate: REVALIDATE_DAY,
        tags: ["categories"],
    });
    return data.filter((c) => c.status === "ACTIVE");
};

const getInitialColors = async (): Promise<string[]> => {
    const data = await api.get<{ colors: string[] }>("/product/facets", {
        revalidate: REVALIDATE_DAY,
        tags: ["products"],
    });
    return data.colors;
};

const ProductsPage = async () => {
    const [initialProducts, initialCategories, initialColors] =
        await Promise.all([
            getInitialProducts(),
            getInitialCategories(),
            getInitialColors(),
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
                    initialColors={initialColors}
                />
            </Suspense>
        </div>
    );
};

export default ProductsPage;
