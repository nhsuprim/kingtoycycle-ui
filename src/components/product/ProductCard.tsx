"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Heart, ShoppingCart, Check } from "lucide-react";

import StarRatingDisplay from "@/components/admin/review/StarRatingDisplay";
import { useWishlistStore } from "@/store/wishlist-store";
import { useCartStore } from "@/store/cart-store";
import { showToast } from "@/lib/toast";
import { api } from "@/lib/api";
import { getSessionId } from "@/lib/session";
import { fbTrack } from "@/lib/fbq";
import { pushDataLayer } from "@/lib/gtm";
import { cn } from "@/lib/utils";

import type { Product } from "@/types/product";

interface ProductCardProps {
    product: Product;
}

const ProductCard = ({ product }: ProductCardProps) => {
    const [mounted, setMounted] = useState(false);
    const [justAdded, setJustAdded] = useState(false);

    const { toggleItem, isWishlisted } = useWishlistStore();
    const addItem = useCartStore((s) => s.addItem);

    useEffect(() => {
        setMounted(true);
    }, []);

    const wishlisted = mounted && isWishlisted(product.id);

    const isOutOfStock = product.stockStatus !== "IN_STOCK";

    const hasDiscount = Boolean(product.discountPrice);

    const discountPercent = hasDiscount
        ? Math.round(
              ((product.regularPrice - product.discountPrice!) /
                  product.regularPrice) *
                  100,
          )
        : 0;

    const handleAddToCart = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        if (isOutOfStock || justAdded) return;

        const value = product.discountPrice ?? product.regularPrice;

        // Add product to cart
        addItem(product, 1);

        // Toast
        showToast.success(`${product.name} added to cart`);

        // Button animation
        setJustAdded(true);

        setTimeout(() => {
            setJustAdded(false);
        }, 1500);

        // Backend event tracking
        api.post("/event", {
            eventType: "ADD_TO_CART",
            sessionId: getSessionId(),
            productId: product.id,
            metadata: {
                quantity: 1,
                price: value,
            },
        }).catch(() => {});

        // Facebook Pixel
        fbTrack("AddToCart", {
            content_ids: [product.id],
            content_name: product.name,
            content_type: "product",
            value,
            currency: "BDT",
        });

        // Google Tag Manager / GA4
        pushDataLayer({
            event: "add_to_cart",
            ecommerce: {
                currency: "BDT",
                value,
                items: [
                    {
                        item_id: product.id,
                        item_name: product.name,
                        price: value,
                        quantity: 1,
                    },
                ],
            },
        });
    };

    return (
        <Link
            href={`/products/${product.id}`}
            className="group block overflow-hidden rounded-lg border bg-white transition-shadow hover:shadow-md"
        >
            {/* ================= PRODUCT IMAGE ================= */}
            <div className="relative aspect-square ">
                <Image
                    src={product.thumbnailImage}
                    alt={product.name}
                    fill
                    className="object-contain p-3 transition-transform duration-300 group-hover:scale-105"
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                />

                {/* ================= DISCOUNT BADGE ================= */}
                {hasDiscount && (
                    <span className="absolute right-2 top-2 flex h-9 w-9 items-center justify-center rounded-full bg-red-600 text-[10px] font-bold leading-tight text-white">
                        {discountPercent}%
                        <br />
                        OFF
                    </span>
                )}

                {/* ================= WISHLIST ================= */}
                <button
                    type="button"
                    className="absolute left-2 top-2 rounded-full bg-white/90 p-1.5 shadow-sm transition hover:bg-white"
                    aria-label="Toggle wishlist"
                    onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
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

            {/* ================= PRODUCT INFO ================= */}
            <div className="p-3">
                {/* Product Name */}
                <p className="truncate text-sm font-medium text-neutral-900">
                    {product.name}
                </p>
                <div className="flex  justify-between align-middle items-center gap-2">
                    {/* LEFT SIDE */}
                    <div className="min-w-0 flex-1">
                        {/* Rating */}
                        {product.reviewCount > 0 && (
                            <div className="mt-1 flex items-center gap-1.5">
                                <StarRatingDisplay
                                    rating={product.averageRating}
                                />

                                <span className="text-xs text-neutral-500">
                                    ({product.reviewCount})
                                </span>
                            </div>
                        )}

                        {/* Price */}
                        <div className="mt-1.5 flex flex-wrap items-center gap-2">
                            <span className="font-semibold text-neutral-900">
                                ৳
                                {(
                                    product.discountPrice ??
                                    product.regularPrice
                                ).toLocaleString()}
                            </span>

                            {hasDiscount && (
                                <span className="text-xs text-neutral-400 line-through">
                                    ৳{product.regularPrice.toLocaleString()}
                                </span>
                            )}
                        </div>
                    </div>

                    {/* ================= ADD TO CART ================= */}
                    <button
                        type="button"
                        onClick={handleAddToCart}
                        disabled={isOutOfStock}
                        aria-label="Add to cart"
                        className={cn(
                            "relative flex h-9 w-9 shrink-0 items-center justify-center rounded-full shadow-sm transition-all duration-300",

                            // Out of stock
                            isOutOfStock
                                ? "cursor-not-allowed bg-neutral-200 text-neutral-400"
                                : // Successfully added
                                  justAdded
                                  ? "scale-110 bg-green-600 text-white"
                                  : // Normal + Hover
                                    "bg-neutral-100 text-neutral-700 hover:scale-110 hover:bg-neutral-900 hover:text-white",
                        )}
                    >
                        {/* Shopping Cart Icon */}
                        <span
                            className={cn(
                                "absolute transition-all duration-300",
                                justAdded
                                    ? "scale-0 opacity-0"
                                    : "scale-100 opacity-100",
                            )}
                        >
                            <ShoppingCart className="h-4 w-4" />
                        </span>

                        {/* Check Icon */}
                        <span
                            className={cn(
                                "absolute transition-all duration-300",
                                justAdded
                                    ? "scale-100 opacity-100"
                                    : "scale-0 opacity-0",
                            )}
                        >
                            <Check className="h-4 w-4" />
                        </span>

                        {/* Ripple Effect */}
                        {justAdded && (
                            <span className="absolute inset-0 animate-ping rounded-full bg-green-500 opacity-75" />
                        )}
                    </button>
                </div>
            </div>
        </Link>
    );
};

export default ProductCard;
