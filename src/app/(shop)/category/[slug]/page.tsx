import { Suspense } from "react";
import { notFound } from "next/navigation";
import Image from "next/image";
import type { Metadata } from "next";
import CategorySlider from "@/components/shared/CategorySlider";
import ProductListingContent from "@/components/product/ProductListingContent";
import { api, ApiError } from "@/lib/api";
import { REVALIDATE_DAY } from "@/lib/revalidate";
import { SITE_NAME } from "@/lib/constants";
import type { Category } from "@/types/category";
import type { Product } from "@/types/product";

interface CategoryPageProps {
    params: Promise<{ slug: string }>;
}

const getCategory = async (slug: string): Promise<Category | null> => {
    try {
        return await api.get<Category>(`/category/slug/${slug}`, {
            revalidate: REVALIDATE_DAY,
            tags: ["categories"],
        });
    } catch (error) {
        // শুধু আসল 404 হলে null; সাময়িক error হলে throw, যাতে ভুল page ২৪ ঘণ্টা cache না হয়
        if (error instanceof ApiError && error.status === 404) return null;
        throw error;
    }
};

const getInitialProducts = (categoryId: string) =>
    api.get<Product[]>(
        `/product?categoryId=${categoryId}&sort=newest&limit=40`,
        {
            revalidate: REVALIDATE_DAY,
            tags: ["products"],
        },
    );

const getInitialCategories = async (): Promise<Category[]> => {
    const data = await api.get<Category[]>("/category", {
        revalidate: REVALIDATE_DAY,
        tags: ["categories"],
    });
    return data.filter((c) => c.status === "ACTIVE");
};

const getInitialColors = async (categoryId: string): Promise<string[]> => {
    const data = await api.get<{ colors: string[] }>(
        `/product/facets?categoryId=${categoryId}`,
        {
            revalidate: REVALIDATE_DAY,
            tags: ["products"],
        },
    );
    return data.colors;
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
        description:
            category.description ||
            `Shop the best ${category.name} at ${SITE_NAME}. Fast delivery across Bangladesh, cash on delivery available.`,
        alternates: { canonical: `/category/${category.slug}` },
        openGraph: {
            title: category.name,
            description:
                category.description || `Shop ${category.name} at ${SITE_NAME}`,
            images: category.bannerimage
                ? [category.bannerimage]
                : category.image
                  ? [category.image]
                  : undefined,
        },
    };
};

const CategoryPage = async ({ params }: CategoryPageProps) => {
    const { slug } = await params;
    const category = await getCategory(slug);

    if (!category) {
        notFound();
    }

    const [initialProducts, initialCategories, initialColors] =
        await Promise.all([
            getInitialProducts(category.id),
            getInitialCategories(),
            getInitialColors(category.id),
        ]);

    return (
        <div>
            <CategorySlider categories={initialCategories} />

            {category.bannerimage && (
                <div className="relative aspect-16/5 w-full sm:aspect-21/5">
                    <Image
                        src={category.bannerimage}
                        alt={category.name}
                        fill
                        priority
                        className="object-cover"
                        sizes="100vw"
                    />
                    <div className="absolute inset-0 flex items-center bg-black/20">
                        <h1 className="mx-auto w-full max-w-7xl px-4 text-2xl font-bold text-white sm:text-3xl">
                            {category.name}
                        </h1>
                    </div>
                </div>
            )}

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
                    initialCategories={initialCategories}
                    initialColors={initialColors}
                />
            </Suspense>
        </div>
    );
};

export default CategoryPage;
