import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Product } from "../types/product";

export interface CartItem {
    productId: string;
    name: string;
    price: number;
    thumbnailImage: string;
    quantity: number;
    stockStatus: Product["stockStatus"];
}

interface CartStore {
    items: CartItem[];
    addItem: (product: Product, quantity?: number) => void;
    removeItem: (productId: string) => void;
    updateQuantity: (productId: string, quantity: number) => void;
    clearCart: () => void;
    totalItems: () => number;
    subtotal: () => number;
}

export const useCartStore = create<CartStore>()(
    persist(
        (set, get) => ({
            items: [],

            addItem: (product, quantity = 1) => {
                const existing = get().items.find(
                    (item) => item.productId === product.id,
                );

                if (existing) {
                    set({
                        items: get().items.map((item) =>
                            item.productId === product.id
                                ? {
                                      ...item,
                                      quantity: item.quantity + quantity,
                                  }
                                : item,
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
                                quantity,
                                stockStatus: product.stockStatus,
                            },
                        ],
                    });
                }
            },

            removeItem: (productId) => {
                set({
                    items: get().items.filter(
                        (item) => item.productId !== productId,
                    ),
                });
            },

            updateQuantity: (productId, quantity) => {
                if (quantity <= 0) {
                    get().removeItem(productId);
                    return;
                }
                set({
                    items: get().items.map((item) =>
                        item.productId === productId
                            ? { ...item, quantity }
                            : item,
                    ),
                });
            },

            clearCart: () => set({ items: [] }),

            totalItems: () =>
                get().items.reduce((sum, item) => sum + item.quantity, 0),

            subtotal: () =>
                get().items.reduce(
                    (sum, item) => sum + item.price * item.quantity,
                    0,
                ),
        }),
        { name: "kingtoycycle-cart" },
    ),
);
