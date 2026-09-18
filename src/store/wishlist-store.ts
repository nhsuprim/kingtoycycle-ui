import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Product } from "@/types/product";

export interface WishlistItem {
    productId: string;
    name: string;
    price: number;
    thumbnailImage: string;
}

interface WishlistStore {
    items: WishlistItem[];
    toggleItem: (product: Product) => void;
    isWishlisted: (productId: string) => boolean;
    removeItem: (productId: string) => void;
}

export const useWishlistStore = create<WishlistStore>()(
    persist(
        (set, get) => ({
            items: [],

            toggleItem: (product) => {
                const exists = get().items.some(
                    (i) => i.productId === product.id,
                );

                if (exists) {
                    set({
                        items: get().items.filter(
                            (i) => i.productId !== product.id,
                        ),
                    });
                } else {
                    set({
                        items: [
                            ...get().items,
                            {
                                productId: product.id,
                                name: product.name,
                                price:
                                    product.discountPrice ??
                                    product.regularPrice,
                                thumbnailImage: product.thumbnailImage,
                            },
                        ],
                    });
                }
            },

            isWishlisted: (productId) =>
                get().items.some((i) => i.productId === productId),

            removeItem: (productId) =>
                set({
                    items: get().items.filter((i) => i.productId !== productId),
                }),
        }),
        { name: "kingtoycycle-wishlist" },
    ),
);
