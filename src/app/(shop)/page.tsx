import { api } from "@/lib/api";
import type { Banner } from "@/types/banner";
import type { Product } from "@/types/product";
import type { Category } from "@/types/category";
import BannerCarousel from "@/components/home/BannerCarousel";
import CategorySlider from "@/components/shared/CategorySlider";
import ProductCardSlider from "@/components/product/ProductCardSlider";
import CategoryProductSection from "@/components/home/CategoryProductSection";

const MAX_CATEGORIES_ON_HOMEPAGE = 6; // পেজ অতিরিক্ত লম্বা না হওয়ার জন্য সীমা
const PRODUCTS_PER_CATEGORY = 12;

const getActiveBanners = async (): Promise<Banner[]> => {
    try {
        const banners = await api.get<Banner[]>(
            "/homepage/get-all-banners",
            120,
        );
        return banners.filter((b) => b.isActive);
    } catch {
        return [];
    }
};

const getFeaturedProducts = async (): Promise<Product[]> => {
    try {
        return await api.get<Product[]>("/product?featured=true&limit=20", 120);
    } catch {
        return [];
    }
};

const getCategories = async (): Promise<Category[]> => {
    try {
        const data = await api.get<Category[]>("/category", 300);
        return data.filter((c) => c.status === "ACTIVE");
    } catch {
        return [];
    }
};

const getProductsByCategory = async (
    categoryId: string,
): Promise<Product[]> => {
    try {
        return await api.get<Product[]>(
            `/product?categoryId=${categoryId}&limit=${PRODUCTS_PER_CATEGORY}`,
            120,
        );
    } catch {
        return [];
    }
};

const HomePage = async () => {
    const [banners, featuredProducts, categories] = await Promise.all([
        getActiveBanners(),
        getFeaturedProducts(),
        getCategories(),
    ]);

    const categoriesToShow = categories.slice(0, MAX_CATEGORIES_ON_HOMEPAGE);

    // প্রতিটা category-র product একসাথে (parallel) fetch করা — একে একে না করে, speed-এর জন্য
    const categoryProductsList = await Promise.all(
        categoriesToShow.map((category) => getProductsByCategory(category.id)),
    );

    return (
        <div>
            <BannerCarousel banners={banners} />
            <CategorySlider categories={categories} />

            <ProductCardSlider
                products={featuredProducts}
                title="Featured Products"
                viewAllHref="/products?featured=true"
            />

            {categoriesToShow.map((category, i) => (
                <CategoryProductSection
                    key={category.id}
                    category={category}
                    products={categoryProductsList[i]}
                />
            ))}
        </div>
    );
};

export default HomePage;
