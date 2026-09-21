"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { SlidersHorizontal } from "lucide-react";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import {
    Sheet,
    SheetContent,
    SheetTrigger,
    SheetTitle,
} from "@/components/ui/sheet";
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
    initialProducts: Product[];
    initialCategories: Category[];
}

const ProductListingContent = ({
    fixedCategoryId,
    fixedCategoryName,
    basePath,
    initialProducts,
    initialCategories,
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

    const [products, setProducts] = useState<Product[]>(initialProducts);
    const [allCategoryProducts, setAllCategoryProducts] =
        useState<Product[]>(initialProducts);
    const [categories, setCategories] = useState<Category[]>(initialCategories);
    const [loading, setLoading] = useState(false);
    const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

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

    const activeFilterCount = [color, minPrice, maxPrice, minRating].filter(
        Boolean,
    ).length;

    const handleCategoryChange = (id: string | null) => {
        if (fixedCategoryId) {
            const target = categories.find((c) => c.id === id);
            if (target) router.push(`/category/${target.slug}`);
            else router.push("/products");
        } else {
            updateParams({ category: id });
        }
    };

    const filterSidebarProps = {
        categories,
        availableColors,
        selectedCategoryId: fixedCategoryId ? null : categoryId,
        selectedColor: color,
        minPrice,
        maxPrice,
        minRating,
        onCategoryChange: handleCategoryChange,
        onColorChange: (c: string | null) => updateParams({ color: c }),
        onPriceChange: (min: string, max: string) =>
            updateParams({ minPrice: min, maxPrice: max }),
        onRatingChange: (r: string | null) => updateParams({ minRating: r }),
        onClearAll: () => router.push(fixedCategoryId ? basePath : "/products"),
    };

    return (
        <div className="mx-auto max-w-7xl px-4 py-4">
            <Breadcrumb items={breadcrumbItems} />

            <div className="mt-4 flex flex-col gap-6 lg:flex-row">
                {/* Desktop sidebar — শুধু lg+ এ দেখা যাবে */}
                <div className="hidden lg:block">
                    <ProductFilterSidebar {...filterSidebarProps} />
                </div>

                <div className="flex-1">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <p className="text-sm text-neutral-500">
                            {products.length} products found
                        </p>

                        <div className="flex gap-2">
                            {/* Mobile/Tablet filter button — lg-এর নিচে দেখা যাবে */}
                            <Sheet
                                open={mobileFilterOpen}
                                onOpenChange={setMobileFilterOpen}
                            >
                                <SheetTrigger
                                    render={
                                        <Button
                                            variant="outline"
                                            className="h-9 gap-1.5 text-sm lg:hidden"
                                        />
                                    }
                                >
                                    <SlidersHorizontal className="h-4 w-4" />
                                    Filters
                                    {activeFilterCount > 0 && (
                                        <span className="ml-1 flex h-4 w-4 items-center justify-center rounded-full bg-neutral-900 text-[10px] font-medium text-white">
                                            {activeFilterCount}
                                        </span>
                                    )}
                                </SheetTrigger>
                                <SheetContent
                                    side="left"
                                    className="w-80 overflow-y-auto p-4"
                                >
                                    <SheetTitle>Filters</SheetTitle>
                                    <div className="mt-4">
                                        <ProductFilterSidebar
                                            {...filterSidebarProps}
                                        />
                                    </div>
                                </SheetContent>
                            </Sheet>

                            <Select
                                items={SORT_OPTIONS}
                                value={sort}
                                onValueChange={(v) => updateParams({ sort: v })}
                            >
                                <SelectTrigger className="h-9 w-40 text-sm sm:w-44">
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
                                <SelectTrigger className="hidden h-9 w-28 text-sm sm:flex">
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
