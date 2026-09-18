"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { api } from "@/lib/api";
import { showToast } from "@/lib/toast";
import type { Product } from "@/types/product";
import type { Category } from "@/types/category";
import Breadcrumb from "@/components/shared/Breadcrumb";
import ProductCard from "@/components/product/ProductCard";
import ProductFilterSidebar from "@/components/product/ProductFilterSidebar";

const SORT_OPTIONS = [
    { label: "Newest", value: "newest" },
    { label: "Price: Low to High", value: "price_asc" },
    { label: "Price: High to Low", value: "price_desc" },
    { label: "Highest Rated", value: "rating" },
];

const LIMIT_OPTIONS = ["20", "40", "60"];

interface ProductListingContentProps {
    fixedCategoryId?: string;
    fixedCategoryName?: string;
    basePath: string;
    initialProducts: Product[]; // ⬅️ নতুন — server থেকে আসা প্রথম data
}

const ProductListingContent = ({
    fixedCategoryId,
    fixedCategoryName,
    basePath,
    initialProducts,
}: ProductListingContentProps) => {
    const router = useRouter();
    const searchParams = useSearchParams();

    const categoryId = fixedCategoryId ?? searchParams.get("category");
    const color = searchParams.get("color");
    const minPrice = searchParams.get("minPrice") ?? "";
    const maxPrice = searchParams.get("maxPrice") ?? "";
    const minRating = searchParams.get("minRating");
    const sort = searchParams.get("sort") ?? "newest";
    const limit = searchParams.get("limit") ?? "40";

    // প্রথমবার server থেকে আসা data দিয়েই state শুরু হবে — খালি array না, তাই SEO-friendly HTML প্রথমেই থাকে
    const [products, setProducts] = useState<Product[]>(initialProducts);
    const [allCategoryProducts, setAllCategoryProducts] =
        useState<Product[]>(initialProducts);
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(false);

    // প্রথম render-এ client-side fetch skip করার জন্য — কারণ initialProducts already আছে
    const isFirstRender = useRef(true);

    const updateParams = useCallback(
        (updates: Record<string, string | null>) => {
            const params = new URLSearchParams(searchParams.toString());
            Object.entries(updates).forEach(([key, value]) => {
                if (value === null || value === "") {
                    params.delete(key);
                } else {
                    params.set(key, value);
                }
            });
            router.push(`${basePath}?${params.toString()}`);
        },
        [router, searchParams, basePath],
    );

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const data = await api.get<Category[]>("/category");
                setCategories(data.filter((c) => c.status === "ACTIVE"));
            } catch {
                // skip
            }
        };
        fetchCategories();
    }, []);

    useEffect(() => {
        // প্রথমবার skip — initialProducts থেকেই facet বানানো হয়েছে
        if (isFirstRender.current) return;

        const fetchFacetProducts = async () => {
            try {
                const query = categoryId ? `?categoryId=${categoryId}` : "";
                const data = await api.get<Product[]>(`/product${query}`);
                setAllCategoryProducts(data);
            } catch {
                // skip
            }
        };
        fetchFacetProducts();
    }, [categoryId]);

    const fetchProducts = useCallback(async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (categoryId) params.set("categoryId", categoryId);
            if (color) params.set("color", color);
            if (minPrice) params.set("minPrice", minPrice);
            if (maxPrice) params.set("maxPrice", maxPrice);
            if (minRating) params.set("minRating", minRating);
            params.set("sort", sort);
            params.set("limit", limit);

            const data = await api.get<Product[]>(
                `/product?${params.toString()}`,
            );
            setProducts(data);
        } catch (err) {
            showToast.error(
                err instanceof Error ? err.message : "Failed to load products",
            );
        } finally {
            setLoading(false);
        }
    }, [categoryId, color, minPrice, maxPrice, minRating, sort, limit]);

    useEffect(() => {
        // প্রথমবার fetch skip করি — server থেকেই initialProducts এসেছে, duplicate call দরকার নেই
        if (isFirstRender.current) {
            isFirstRender.current = false;
            return;
        }
        fetchProducts();
    }, [fetchProducts]);

    const availableColors = Array.from(
        new Set(allCategoryProducts.map((p) => p.color.toLowerCase())),
    ).sort();

    const breadcrumbItems = [
        { label: "Home", href: "/" },
        ...(fixedCategoryName
            ? [{ label: fixedCategoryName }]
            : [{ label: "All Products" }]),
    ];

    return (
        <div className="mx-auto max-w-7xl px-4 py-4">
            <Breadcrumb items={breadcrumbItems} />

            <div className="mt-4 flex flex-col gap-6 lg:flex-row">
                <ProductFilterSidebar
                    categories={categories}
                    availableColors={availableColors}
                    selectedCategoryId={fixedCategoryId ? null : categoryId}
                    selectedColor={color}
                    minPrice={minPrice}
                    maxPrice={maxPrice}
                    minRating={minRating}
                    onCategoryChange={(id) => {
                        if (fixedCategoryId) {
                            const target = categories.find((c) => c.id === id);
                            if (target) router.push(`/category/${target.slug}`);
                            else router.push("/products");
                        } else {
                            updateParams({ category: id });
                        }
                    }}
                    onColorChange={(c) => updateParams({ color: c })}
                    onPriceChange={(min, max) =>
                        updateParams({ minPrice: min, maxPrice: max })
                    }
                    onRatingChange={(r) => updateParams({ minRating: r })}
                    onClearAll={() =>
                        router.push(fixedCategoryId ? basePath : "/products")
                    }
                />

                <div className="flex-1">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <p className="text-sm text-neutral-500">
                            {products.length} products found
                        </p>

                        <div className="flex gap-2">
                            <Select
                                items={SORT_OPTIONS}
                                value={sort}
                                onValueChange={(v) => updateParams({ sort: v })}
                            >
                                <SelectTrigger className="h-9 w-44 text-sm">
                                    <SelectValue placeholder="Sort by" />
                                </SelectTrigger>
                                <SelectContent>
                                    {SORT_OPTIONS.map((opt) => (
                                        <SelectItem
                                            key={opt.value}
                                            value={opt.value}
                                        >
                                            {opt.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>

                            <Select
                                items={LIMIT_OPTIONS.map((v) => ({
                                    label: `Show ${v}`,
                                    value: v,
                                }))}
                                value={limit}
                                onValueChange={(v) =>
                                    updateParams({ limit: v })
                                }
                            >
                                <SelectTrigger className="h-9 w-28 text-sm">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {LIMIT_OPTIONS.map((v) => (
                                        <SelectItem key={v} value={v}>
                                            Show {v}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {loading ? (
                        <p className="py-16 text-center text-sm text-neutral-500">
                            Loading...
                        </p>
                    ) : products.length === 0 ? (
                        <p className="py-16 text-center text-sm text-neutral-500">
                            No products match your filters.
                        </p>
                    ) : (
                        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
                            {products.map((product) => (
                                <ProductCard
                                    key={product.id}
                                    product={product}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ProductListingContent;
