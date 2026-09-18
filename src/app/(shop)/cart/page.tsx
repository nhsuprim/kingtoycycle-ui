"use client";

import Link from "next/link";
import Image from "next/image";
import { Minus, Plus, Trash2, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCartStore } from "@/store/cart-store";

const CartPage = () => {
    const { items, updateQuantity, removeItem, subtotal } = useCartStore();

    if (items.length === 0) {
        return (
            <div className="mx-auto flex max-w-7xl flex-col items-center justify-center px-4 py-24 text-center">
                <ShoppingBag className="h-16 w-16 text-neutral-300" />
                <h1 className="mt-4 text-xl font-semibold text-neutral-900">
                    Your cart is empty
                </h1>
                <p className="mt-2 text-sm text-neutral-500">
                    Looks like you haven&apos;t added anything yet.
                </p>
                <Link href="/products">
                    <Button className="mt-6">Continue Shopping</Button>
                </Link>
            </div>
        );
    }

    return (
        <div className="mx-auto max-w-5xl px-4 py-6">
            <h1 className="text-xl font-bold sm:text-2xl">Shopping Cart</h1>

            <div className="mt-6 flex flex-col gap-6 lg:flex-row">
                <div className="flex-1 space-y-3">
                    {items.map((item) => (
                        <div
                            key={item.productId}
                            className="flex items-center gap-3 rounded-lg border bg-white p-3 sm:gap-4 sm:p-4"
                        >
                            <Image
                                src={item.thumbnailImage}
                                alt={item.name}
                                width={64}
                                height={64}
                                className="shrink-0 rounded-md border object-cover"
                            />

                            <div className="min-w-0 flex-1">
                                <p className="truncate text-sm font-medium text-neutral-900 sm:text-base">
                                    {item.name}
                                </p>
                                <p className="mt-1 text-sm font-semibold">
                                    ৳{item.price.toLocaleString()}
                                </p>
                                {item.stockStatus !== "IN_STOCK" && (
                                    <p className="mt-1 text-xs text-red-600">
                                        Currently unavailable
                                    </p>
                                )}
                            </div>

                            <div className="flex items-center rounded-md border">
                                <button
                                    onClick={() =>
                                        updateQuantity(
                                            item.productId,
                                            item.quantity - 1,
                                        )
                                    }
                                    className="p-1.5 text-neutral-600 hover:bg-neutral-50"
                                    aria-label="Decrease quantity"
                                >
                                    <Minus className="h-3.5 w-3.5" />
                                </button>
                                <span className="w-8 text-center text-sm font-medium">
                                    {item.quantity}
                                </span>
                                <button
                                    onClick={() =>
                                        updateQuantity(
                                            item.productId,
                                            item.quantity + 1,
                                        )
                                    }
                                    className="p-1.5 text-neutral-600 hover:bg-neutral-50"
                                    aria-label="Increase quantity"
                                >
                                    <Plus className="h-3.5 w-3.5" />
                                </button>
                            </div>

                            <button
                                onClick={() => removeItem(item.productId)}
                                className="shrink-0 p-1.5 text-neutral-400 hover:text-red-600"
                                aria-label="Remove item"
                            >
                                <Trash2 className="h-4 w-4" />
                            </button>
                        </div>
                    ))}
                </div>

                <div className="lg:w-80 lg:shrink-0">
                    <div className="rounded-lg border bg-white p-4">
                        <h2 className="text-sm font-semibold text-neutral-900">
                            Order Summary
                        </h2>
                        <div className="mt-3 flex justify-between text-sm">
                            <span className="text-neutral-500">Subtotal</span>
                            <span className="font-medium">
                                ৳{subtotal().toLocaleString()}
                            </span>
                        </div>
                        <p className="mt-1 text-xs text-neutral-400">
                            Shipping calculated at checkout
                        </p>

                        <Link href="/checkout">
                            <Button className="mt-4 w-full">
                                Proceed to Checkout
                            </Button>
                        </Link>
                        <Link href="/products">
                            <Button variant="outline" className="mt-2 w-full">
                                Continue Shopping
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CartPage;
