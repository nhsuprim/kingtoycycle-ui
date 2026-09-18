"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import StarRatingDisplay from "@/components/admin/review/StarRatingDisplay";
import { cn } from "@/lib/utils";
import type { Category } from "@/types/category";

interface ProductFilterSidebarProps {
    categories: Category[];
    availableColors: string[];
    selectedCategoryId: string | null;
    selectedColor: string | null;
    minPrice: string;
    maxPrice: string;
    minRating: string | null;
    onCategoryChange: (id: string | null) => void;
    onColorChange: (color: string | null) => void;
    onPriceChange: (min: string, max: string) => void;
    onRatingChange: (rating: string | null) => void;
    onClearAll: () => void;
}

const RATING_OPTIONS = [4, 3, 2, 1];

const ProductFilterSidebar = ({
    categories,
    availableColors,
    selectedCategoryId,
    selectedColor,
    minPrice,
    maxPrice,
    minRating,
    onCategoryChange,
    onColorChange,
    onPriceChange,
    onRatingChange,
    onClearAll,
}: ProductFilterSidebarProps) => {
    const [localMinPrice, setLocalMinPrice] = useState(minPrice);
    const [localMaxPrice, setLocalMaxPrice] = useState(maxPrice);

    const handlePriceApply = () => {
        onPriceChange(localMinPrice, localMaxPrice);
    };

    return (
        <aside className="w-full space-y-6 lg:w-64 lg:shrink-0">
            <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold text-neutral-900">
                    Filters
                </h2>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={onClearAll}
                    className="h-auto p-0 text-xs"
                >
                    Clear all
                </Button>
            </div>

            {/* Category */}
            <div>
                <h3 className="mb-1 text-xs font-semibold uppercase tracking-wide text-neutral-500">
                    Categories
                </h3>
                <div className="max-h-56 space-y-1 overflow-y-auto">
                    {categories.map((cat) => (
                        <button
                            key={cat.id}
                            onClick={() =>
                                onCategoryChange(
                                    selectedCategoryId === cat.id
                                        ? null
                                        : cat.id,
                                )
                            }
                            className={cn(
                                "block w-full rounded px-2 py-1.5 text-left text-sm hover:bg-neutral-50",
                                selectedCategoryId === cat.id
                                    ? "bg-neutral-900 text-white hover:bg-neutral-900"
                                    : "text-neutral-700",
                            )}
                        >
                            {cat.name}
                        </button>
                    ))}
                </div>
            </div>

            {/* Price Range */}
            <div>
                <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-neutral-500">
                    Price Range (৳)
                </h3>
                <div className="flex items-center gap-2">
                    <Input
                        type="number"
                        placeholder="Min"
                        value={localMinPrice}
                        onChange={(e) => setLocalMinPrice(e.target.value)}
                        className="h-8 text-sm"
                    />
                    <span className="text-neutral-400">–</span>
                    <Input
                        type="number"
                        placeholder="Max"
                        value={localMaxPrice}
                        onChange={(e) => setLocalMaxPrice(e.target.value)}
                        className="h-8 text-sm"
                    />
                </div>
                <Button
                    size="sm"
                    variant="outline"
                    onClick={handlePriceApply}
                    className="mt-2 w-full"
                >
                    Apply
                </Button>
            </div>

            {/* Color */}
            {availableColors.length > 0 && (
                <div>
                    <h3 className="mb-1 text-xs font-semibold uppercase tracking-wide text-neutral-500">
                        Color
                    </h3>
                    <div className="space-y-1.5">
                        {availableColors.map((color) => (
                            <div
                                key={color}
                                className="flex items-center gap-2"
                            >
                                <Checkbox
                                    id={`color-${color}`}
                                    checked={selectedColor === color}
                                    onCheckedChange={(checked) =>
                                        onColorChange(checked ? color : null)
                                    }
                                />
                                <Label
                                    htmlFor={`color-${color}`}
                                    className="cursor-pointer text-sm font-normal capitalize"
                                >
                                    {color}
                                </Label>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Rating */}
            <div>
                <h3 className="mb-1 text-xs font-semibold uppercase tracking-wide text-neutral-500">
                    Rating
                </h3>
                <div className="space-y-1.5">
                    {RATING_OPTIONS.map((rating) => (
                        <button
                            key={rating}
                            onClick={() =>
                                onRatingChange(
                                    minRating === String(rating)
                                        ? null
                                        : String(rating),
                                )
                            }
                            className={cn(
                                "flex w-full items-center gap-2 rounded px-2 py-1 text-left hover:bg-neutral-50",
                                minRating === String(rating) &&
                                    "bg-neutral-100",
                            )}
                        >
                            <StarRatingDisplay rating={rating} />
                            <span className="text-xs text-neutral-500">
                                & up
                            </span>
                        </button>
                    ))}
                </div>
            </div>
        </aside>
    );
};

export default ProductFilterSidebar;
