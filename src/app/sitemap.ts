import type { MetadataRoute } from "next";
import { api } from "@/lib/api";
import { SITE_URL } from "@/lib/constants";
import type { Product } from "@/types/product";
import type { Category } from "@/types/category";

export const revalidate = 3600;

const sitemap = async (): Promise<MetadataRoute.Sitemap> => {
    const staticPages: MetadataRoute.Sitemap = [
        { url: SITE_URL, changeFrequency: "daily", priority: 1 },
        {
            url: `${SITE_URL}/products`,
            changeFrequency: "daily",
            priority: 0.9,
        },
        {
            url: `${SITE_URL}/track-order`,
            changeFrequency: "monthly",
            priority: 0.3,
        },
        { url: `${SITE_URL}/about`, changeFrequency: "monthly", priority: 0.3 },
        {
            url: `${SITE_URL}/contact`,
            changeFrequency: "monthly",
            priority: 0.3,
        },
        {
            url: `${SITE_URL}/return-policy`,
            changeFrequency: "monthly",
            priority: 0.3,
        },
    ];

    let productPages: MetadataRoute.Sitemap = [];
    let categoryPages: MetadataRoute.Sitemap = [];

    try {
        const products = await api.get<Product[]>("/product");
        productPages = products.map((p) => ({
            url: `${SITE_URL}/products/${p.id}`,
            lastModified: p.updatedAt,
            changeFrequency: "weekly",
            priority: 0.8,
        }));
    } catch {
        // backend unreachable হলেও static page গুলো অন্তত থাকবে
    }

    try {
        const categories = await api.get<Category[]>("/category");
        categoryPages = categories
            .filter((c) => c.status === "ACTIVE")
            .map((c) => ({
                url: `${SITE_URL}/category/${c.slug}`,
                lastModified: c.updatedAt,
                changeFrequency: "weekly",
                priority: 0.7,
            }));
    } catch {
        // skip
    }

    return [...staticPages, ...productPages, ...categoryPages];
};

export default sitemap;
