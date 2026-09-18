"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Minus, Plus, ShoppingCart, Heart, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCartStore } from "@/store/cart-store";
import { useWishlistStore } from "@/store/wishlist-store";
import { showToast } from "@/lib/toast";
import { api } from "@/lib/api";
import { getSessionId } from "@/lib/session";
import { fbTrack } from "@/lib/fbq";
import { pushDataLayer } from "@/lib/gtm";
import { cn } from "@/lib/utils";
import type { Product } from "@/types/product";

interface AddToCartSectionProps {
    product: Product;
}

const AddToCartSection = ({ product }: AddToCartSectionProps) => {
    const router = useRouter();
    const [quantity, setQuantity] = useState(1);
    const [mounted, setMounted] = useState(false);
    const addItem = useCartStore((s) => s.addItem);
    const { toggleItem, isWishlisted } = useWishlistStore();

    useEffect(() => {
        setMounted(true);
    }, []);

    const wishlisted = mounted && isWishlisted(product.id);
    const isOutOfStock = product.stockStatus !== "IN_STOCK";

    const logAddToCartEvent = () => {
        const value =
            (product.discountPrice ?? product.regularPrice) * quantity;

        api.post("/event", {
            eventType: "ADD_TO_CART",
            sessionId: getSessionId(),
            productId: product.id,
            metadata: {
                quantity,
                price: product.discountPrice ?? product.regularPrice,
            },
        }).catch(() => {});

        fbTrack("AddToCart", {
            content_ids: [product.id],
            content_name: product.name,
            content_type: "product",
            value,
            currency: "BDT",
        });

        pushDataLayer({
            event: "add_to_cart",
            ecommerce: {
                currency: "BDT",
                value,
                items: [
                    {
                        item_id: product.id,
                        item_name: product.name,
                        price: product.discountPrice ?? product.regularPrice,
                        quantity,
                    },
                ],
            },
        });
    };

    const handleAddToCart = () => {
        addItem(product, quantity);
        showToast.success(`${product.name} added to cart`);
        logAddToCartEvent();
    };

    const handleBuyNow = () => {
        logAddToCartEvent();
        router.push(`/checkout?buyNow=${product.id}&qty=${quantity}`);
    };

    return (
        <div className="space-y-3">
            <div className="flex items-center gap-3">
                <div className="flex items-center rounded-md border">
                    <button
                        onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                        className="p-2 text-neutral-600 hover:bg-neutral-50 disabled:opacity-40"
                        disabled={quantity <= 1}
                        aria-label="Decrease quantity"
                    >
                        <Minus className="h-4 w-4" />
                    </button>
                    <span className="w-10 text-center text-sm font-medium">
                        {quantity}
                    </span>
                    <button
                        onClick={() => setQuantity((q) => Math.min(20, q + 1))}
                        className="p-2 text-neutral-600 hover:bg-neutral-50"
                        aria-label="Increase quantity"
                    >
                        <Plus className="h-4 w-4" />
                    </button>
                </div>

                <Button
                    onClick={handleAddToCart}
                    disabled={isOutOfStock}
                    variant="outline"
                    className="h-10 flex-1 gap-2"
                >
                    <ShoppingCart className="h-4 w-4" />
                    Add to Cart
                </Button>

                <button
                    onClick={() => toggleItem(product)}
                    className="rounded-md border p-2.5 hover:bg-neutral-50"
                    aria-label="Toggle wishlist"
                >
                    <Heart
                        className={cn(
                            "h-4 w-4",
                            wishlisted
                                ? "fill-red-500 text-red-500"
                                : "text-neutral-500",
                        )}
                    />
                </button>
            </div>

            <Button
                onClick={handleBuyNow}
                disabled={isOutOfStock}
                className="h-11 w-full gap-2 bg-neutral-900 hover:bg-neutral-800"
            >
                <Zap className="h-4 w-4" />
                {isOutOfStock ? "Out of Stock" : "Buy Now"}
            </Button>
        </div>
    );
};

export default AddToCartSection;
