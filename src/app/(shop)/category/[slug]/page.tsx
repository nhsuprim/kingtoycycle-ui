import { Suspense } from "react";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import CategorySlider from "@/components/shared/CategorySlider";
import ProductListingContent from "@/components/product/ProductListingContent";
import { api } from "@/lib/api";
import { SITE_NAME } from "@/lib/constants";
import type { Category } from "@/types/category";
import type { Product } from "@/types/product";

interface CategoryPageProps {
    params: Promise<{ slug: string }>;
}

const getCategory = async (slug: string): Promise<Category | null> => {
    try {
        return await api.get<Category>(`/category/slug/${slug}`, 300);
    } catch {
        return null;
    }
};

const getInitialProducts = async (categoryId: string): Promise<Product[]> => {
    try {
        return await api.get<Product[]>(
            `/product?categoryId=${categoryId}&sort=newest&limit=40`,
            60,
        );
    } catch {
        return [];
    }
};

export const generateMetadata = async ({
    params,
}: CategoryPageProps): Promise<Metadata> => {
    const { slug } = await params;
    const category = await getCategory(slug);

    if (!category) {
        return { title: "Category Not Found" };
    }

    return {
        title: category.name,
        alternates: { canonical: `/category/${category.slug}` },
        description:
            category.description ||
            `Shop the best ${category.name} at ${SITE_NAME}. Fast delivery across Bangladesh, cash on delivery available.`,
        openGraph: {
            title: category.name,
            description:
                category.description || `Shop ${category.name} at ${SITE_NAME}`,
            images: category.image ? [category.image] : undefined,
        },
    };
};

const CategoryPage = async ({ params }: CategoryPageProps) => {
    const { slug } = await params;
    const category = await getCategory(slug);

    if (!category) {
        notFound();
    }

    const initialProducts = await getInitialProducts(category.id);

    return (
        <div>
            <CategorySlider />
            <Suspense
                fallback={
                    <p className="py-16 text-center text-sm text-neutral-500">
                        Loading...
                    </p>
                }
            >
                <ProductListingContent
                    fixedCategoryId={category.id}
                    fixedCategoryName={category.name}
                    basePath={`/category/${category.slug}`}
                    initialProducts={initialProducts}
                />
            </Suspense>
        </div>
    );
};

export default CategoryPage;
