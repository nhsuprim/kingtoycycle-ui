"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Heart, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useWishlistStore } from "@/store/wishlist-store";

const WishlistPage = () => {
    const [mounted, setMounted] = useState(false);
    const { items, removeItem } = useWishlistStore();

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return null;

    if (items.length === 0) {
        return (
            <div className="mx-auto flex max-w-7xl flex-col items-center justify-center px-4 py-24 text-center">
                <Heart className="h-16 w-16 text-neutral-300" />
                <h1 className="mt-4 text-xl font-semibold text-neutral-900">
                    Your wishlist is empty
                </h1>
                <Link href="/products">
                    <Button className="mt-6">Browse Products</Button>
                </Link>
            </div>
        );
    }

    return (
        <div className="mx-auto max-w-5xl px-4 py-6">
            <h1 className="text-xl font-bold sm:text-2xl">My Wishlist</h1>

            <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
                {items.map((item) => (
                    <div
                        key={item.productId}
                        className="group relative rounded-lg border bg-white"
                    >
                        <button
                            onClick={() => removeItem(item.productId)}
                            className="absolute right-2 top-2 z-10 rounded-full bg-white/90 p-1.5 shadow-sm hover:bg-white"
                            aria-label="Remove from wishlist"
                        >
                            <Trash2 className="h-3.5 w-3.5 text-red-600" />
                        </button>
                        <Link href={`/products/${item.productId}`}>
                            <div className="relative aspect-square bg-neutral-50">
                                <Image
                                    src={item.thumbnailImage}
                                    alt={item.name}
                                    fill
                                    className="object-contain p-3"
                                    sizes="25vw"
                                />
                            </div>
                            <div className="p-3">
                                <p className="truncate text-sm font-medium">
                                    {item.name}
                                </p>
                                <p className="mt-1 font-semibold">
                                    ৳{item.price.toLocaleString()}
                                </p>
                            </div>
                        </Link>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default WishlistPage;
