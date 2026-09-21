"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { Plus, Pencil, Trash2, Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { api } from "@/lib/api";
import { showToast } from "@/lib/toast";
import type { Product, ProductStockStatus } from "@/types/product";
import type { Category } from "@/types/category";
import StatusBadge from "@/components/admin/order/StatusBadge";
import DeleteProductDialog from "@/components/admin/product/DeleteProductDialog";
import StockStatusDialog from "@/components/admin/product/StockStatusDialog";
import InlineStatusSelect from "@/components/shared/InlineStatusSelect";

const ALL_VALUE = "ALL";

const STOCK_STATUS_OPTIONS: ProductStockStatus[] = [
    "IN_STOCK",
    "OUT_OF_STOCK",
    "DISCONTINUED",
];

const stockStatusColors: Record<ProductStockStatus, string> = {
    IN_STOCK: "bg-green-100 text-green-800 border-green-200",
    OUT_OF_STOCK: "bg-yellow-100 text-yellow-800 border-yellow-200",
    DISCONTINUED: "bg-neutral-100 text-neutral-700 border-neutral-200",
};

const STOCK_LABELS: Record<ProductStockStatus, string> = {
    IN_STOCK: "In Stock",
    OUT_OF_STOCK: "Out of Stock",
    DISCONTINUED: "Discontinued",
};

const ProductsPage = () => {
    const [products, setProducts] = useState<Product[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);

    const [searchInput, setSearchInput] = useState("");
    const [searchTerm, setSearchTerm] = useState("");
    const [categoryFilter, setCategoryFilter] = useState(ALL_VALUE);
    const [stockFilter, setStockFilter] = useState(ALL_VALUE);

    const [deleteOpen, setDeleteOpen] = useState(false);
    const [statusOpen, setStatusOpen] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(
        null,
    );
    const [nextStatus, setNextStatus] = useState<ProductStockStatus | null>(
        null,
    );

    useEffect(() => {
        const timer = setTimeout(() => setSearchTerm(searchInput), 400);
        return () => clearTimeout(timer);
    }, [searchInput]);

    const fetchProducts = useCallback(async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (searchTerm) params.set("search", searchTerm);
            if (categoryFilter !== ALL_VALUE)
                params.set("categoryId", categoryFilter);
            if (stockFilter !== ALL_VALUE)
                params.set("stockStatus", stockFilter);

            const query = params.toString();
            const data = await api.get<Product[]>(
                `/product${query ? `?${query}` : ""}`,
            );
            setProducts(data);
        } catch (err) {
            showToast.error(
                err instanceof Error ? err.message : "Failed to load products",
            );
        } finally {
            setLoading(false);
        }
    }, [searchTerm, categoryFilter, stockFilter]);

    useEffect(() => {
        fetchProducts();
    }, [fetchProducts]);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const data = await api.get<Category[]>("/category");
                setCategories(data);
            } catch {
                // categories load ব্যর্থ হলেও product list দেখাতে সমস্যা নেই
            }
        };
        fetchCategories();
    }, []);

    const handleClearFilters = () => {
        setSearchInput("");
        setSearchTerm("");
        setCategoryFilter(ALL_VALUE);
        setStockFilter(ALL_VALUE);
    };

    const hasActiveFilters =
        searchTerm !== "" ||
        categoryFilter !== ALL_VALUE ||
        stockFilter !== ALL_VALUE;

    const handleDeleteClick = (product: Product) => {
        setSelectedProduct(product);
        setDeleteOpen(true);
    };

    const handleStatusChange = (
        product: Product,
        status: ProductStockStatus,
    ) => {
        if (status === product.stockStatus) return;
        setSelectedProduct(product);
        setNextStatus(status);
        setStatusOpen(true);
    };

    const handleStatusConfirm = async () => {
        if (!selectedProduct || !nextStatus) return;

        try {
            await api.patch(`/product/${selectedProduct.id}/stock-status`, {
                stockStatus: nextStatus,
            });
            showToast.success("Stock status updated successfully");
            fetchProducts();
        } catch (err) {
            showToast.error(
                err instanceof Error ? err.message : "Could not update status",
            );
        } finally {
            setStatusOpen(false);
        }
    };

    return (
        <div>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-xl font-bold sm:text-2xl">Products</h1>
                    <p className="mt-1 text-sm text-neutral-500">
                        Manage your product catalog.
                    </p>
                </div>
                <Link href="/admin/products/new">
                    <Button className="w-full gap-2 sm:w-auto">
                        <Plus className="h-4 w-4" />
                        Add Product
                    </Button>
                </Link>
            </div>

            {/* Filter bar — mobile stack, sm+ row */}
            <div className="mt-4 flex flex-col gap-3 sm:mt-6 sm:flex-row sm:flex-wrap sm:items-center">
                <div className="relative w-full sm:w-64">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
                    <Input
                        value={searchInput}
                        onChange={(e) => setSearchInput(e.target.value)}
                        placeholder="Search by name or SKU..."
                        className="pl-9"
                    />
                </div>

                <Select
                    items={[
                        { label: "All Categories", value: ALL_VALUE },
                        ...categories.map((c) => ({
                            label: c.name,
                            value: c.id,
                        })),
                    ]}
                    value={categoryFilter}
                    onValueChange={(value) =>
                        setCategoryFilter(value ?? ALL_VALUE)
                    }
                >
                    <SelectTrigger className="w-full sm:w-48">
                        <SelectValue placeholder="Category" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value={ALL_VALUE}>
                            All Categories
                        </SelectItem>
                        {categories.map((c) => (
                            <SelectItem key={c.id} value={c.id}>
                                {c.name}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                <Select
                    items={[
                        { label: "All Stock Status", value: ALL_VALUE },
                        ...STOCK_STATUS_OPTIONS.map((s) => ({
                            label: STOCK_LABELS[s],
                            value: s,
                        })),
                    ]}
                    value={stockFilter}
                    onValueChange={(value) =>
                        setStockFilter(value ?? ALL_VALUE)
                    }
                >
                    <SelectTrigger className="w-full sm:w-48">
                        <SelectValue placeholder="Stock Status" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value={ALL_VALUE}>
                            All Stock Status
                        </SelectItem>
                        {STOCK_STATUS_OPTIONS.map((s) => (
                            <SelectItem key={s} value={s}>
                                {STOCK_LABELS[s]}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                {hasActiveFilters && (
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleClearFilters}
                        className="gap-1"
                    >
                        <X className="h-3.5 w-3.5" />
                        Clear
                    </Button>
                )}
            </div>

            {/* Product list — card-based, fully responsive */}
            <div className="mt-4 space-y-3 sm:mt-6">
                {loading ? (
                    <p className="py-8 text-center text-sm text-neutral-500">
                        Loading...
                    </p>
                ) : products.length === 0 ? (
                    <p className="py-8 text-center text-sm text-neutral-500">
                        {hasActiveFilters
                            ? "No products match your filters."
                            : "No products yet. Add your first one."}
                    </p>
                ) : (
                    products.map((product) => (
                        <div
                            key={product.id}
                            className="rounded-lg border bg-white p-4 transition-shadow hover:shadow-sm"
                        >
                            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                {/* বাম দিক — image + info */}
                                <div className="flex min-w-0 flex-1 items-center gap-3">
                                    <Image
                                        src={product.thumbnailImage}
                                        alt={product.name}
                                        width={48}
                                        height={48}
                                        className="shrink-0 rounded-md border object-cover"
                                    />
                                    <div className="min-w-0">
                                        <p className="truncate font-medium text-neutral-900">
                                            {product.name}
                                        </p>
                                        <p className="text-xs text-neutral-500">
                                            {product.sku} •{" "}
                                            {product.category?.name ?? "—"}
                                        </p>
                                        <div className="mt-1">
                                            {product.discountPrice ? (
                                                <span className="text-sm">
                                                    <span className="font-semibold">
                                                        ৳{product.discountPrice}
                                                    </span>{" "}
                                                    <span className="text-xs text-neutral-400 line-through">
                                                        ৳{product.regularPrice}
                                                    </span>
                                                </span>
                                            ) : (
                                                <span className="text-sm font-semibold">
                                                    ৳{product.regularPrice}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* ডান দিক — status + actions */}
                                <div className="flex items-center justify-between gap-3 sm:flex-col sm:items-end sm:justify-center sm:gap-2">
                                    <div className="flex items-center gap-2">
                                        <InlineStatusSelect
                                            value={product.stockStatus}
                                            options={STOCK_STATUS_OPTIONS.map(
                                                (s) => ({
                                                    label: STOCK_LABELS[s],
                                                    value: s,
                                                    colorClasses:
                                                        stockStatusColors[s],
                                                }),
                                            )}
                                            onValueChange={(value) =>
                                                handleStatusChange(
                                                    product,
                                                    value as ProductStockStatus,
                                                )
                                            }
                                        />
                                    </div>

                                    <div className="flex gap-1">
                                        <Link
                                            href={`/admin/products/${product.id}/edit`}
                                        >
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                aria-label="Edit"
                                            >
                                                <Pencil className="h-4 w-4" />
                                            </Button>
                                        </Link>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() =>
                                                handleDeleteClick(product)
                                            }
                                            aria-label="Delete"
                                        >
                                            <Trash2 className="h-4 w-4 text-red-600" />
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            <DeleteProductDialog
                open={deleteOpen}
                onOpenChange={setDeleteOpen}
                product={selectedProduct}
                onSuccess={fetchProducts}
            />

            <StockStatusDialog
                open={statusOpen}
                onOpenChange={setStatusOpen}
                product={selectedProduct}
                nextStatus={nextStatus}
                onConfirm={handleStatusConfirm}
            />
        </div>
    );
};

export default ProductsPage;
