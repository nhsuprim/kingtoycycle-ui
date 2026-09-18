"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Heart } from "lucide-react";
import StarRatingDisplay from "@/components/admin/review/StarRatingDisplay";
import { useWishlistStore } from "@/store/wishlist-store";
import { cn } from "@/lib/utils";
import type { Product } from "@/types/product";

interface ProductCardProps {
    product: Product;
}

const ProductCard = ({ product }: ProductCardProps) => {
    const [mounted, setMounted] = useState(false);
    const { toggleItem, isWishlisted } = useWishlistStore();

    useEffect(() => {
        setMounted(true);
    }, []);

    const wishlisted = mounted && isWishlisted(product.id);
    const hasDiscount = Boolean(product.discountPrice);
    const discountPercent = hasDiscount
        ? Math.round(
              ((product.regularPrice - product.discountPrice!) /
                  product.regularPrice) *
                  100,
          )
        : 0;

    return (
        <Link
            href={`/products/${product.id}`}
            className="group block overflow-hidden rounded-lg border bg-white transition-shadow hover:shadow-md"
        >
            <div className="relative aspect-square bg-neutral-50">
                <Image
                    src={product.thumbnailImage}
                    alt={product.name}
                    fill
                    className="object-contain p-3 transition-transform group-hover:scale-105"
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                />
                {hasDiscount && (
                    <span className="absolute right-2 top-2 flex h-9 w-9 items-center justify-center rounded-full bg-red-600 text-[10px] font-bold text-white">
                        {discountPercent}%<br />
                        OFF
                    </span>
                )}
                <button
                    className="absolute left-2 top-2 rounded-full bg-white/90 p-1.5 shadow-sm hover:bg-white"
                    aria-label="Toggle wishlist"
                    onClick={(e) => {
                        e.preventDefault();
                        toggleItem(product);
                    }}
                >
                    <Heart
                        className={cn(
                            "h-3.5 w-3.5",
                            wishlisted
                                ? "fill-red-500 text-red-500"
                                : "text-neutral-600",
                        )}
                    />
                </button>
            </div>

            <div className="p-3">
                <p className="truncate text-sm font-medium text-neutral-900">
                    {product.name}
                </p>

                {product.reviewCount > 0 && (
                    <div className="mt-1 flex items-center gap-1.5">
                        <StarRatingDisplay rating={product.averageRating} />
                        <span className="text-xs text-neutral-500">
                            ({product.reviewCount})
                        </span>
                    </div>
                )}

                <div className="mt-1.5 flex items-center gap-2">
                    <span className="font-semibold text-neutral-900">
                        ৳
                        {(
                            product.discountPrice ?? product.regularPrice
                        ).toLocaleString()}
                    </span>
                    {hasDiscount && (
                        <span className="text-xs text-neutral-400 line-through">
                            ৳{product.regularPrice.toLocaleString()}
                        </span>
                    )}
                </div>
            </div>
        </Link>
    );
};

export default ProductCard;
