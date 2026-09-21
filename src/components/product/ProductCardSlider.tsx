"use client";

import { useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import ProductCard from "@/components/product/ProductCard";
import type { Product } from "@/types/product";
import Link from "next/link";

interface ProductCardSliderProps {
    products: Product[];
    title?: string;
    viewAllHref?: string;
}

const ProductCardSlider = ({
    products,
    title,
    viewAllHref,
}: ProductCardSliderProps) => {
    const scrollRef = useRef<HTMLDivElement>(null);

    const scroll = (direction: "left" | "right") => {
        if (!scrollRef.current) return;
        const cardWidth =
            scrollRef.current.firstElementChild?.clientWidth ?? 200;
        const amount = (cardWidth + 16) * 2; // দুইটা card-এর সমান স্ক্রল

        scrollRef.current.scrollBy({
            left: direction === "left" ? -amount : amount,
            behavior: "smooth",
        });
    };

    if (products.length === 0) return null;

    return (
        <section className="mx-auto max-w-7xl px-4 py-6">
            {(title || viewAllHref) && (
                <div className="mb-4 flex items-center justify-between">
                    {title && (
                        <h2 className="text-lg font-bold text-neutral-900 sm:text-xl">
                            {title}
                        </h2>
                    )}
                    {viewAllHref && (
                        <Link
                            href={viewAllHref}
                            className="text-sm font-medium text-neutral-600 hover:text-neutral-900"
                        >
                            View All →
                        </Link>
                    )}
                </div>
            )}

            <div className="relative">
                <button
                    onClick={() => scroll("left")}
                    className="absolute -left-3 top-1/2 z-10 hidden -translate-y-1/2 rounded-full border bg-white p-1.5 shadow-md hover:bg-neutral-50 sm:flex"
                    aria-label="Scroll left"
                >
                    <ChevronLeft className="h-4 w-4" />
                </button>

                <div
                    ref={scrollRef}
                    className="flex gap-3 overflow-x-auto scroll-smooth pb-1 [-ms-overflow-style:none] scrollbar-none sm:gap-4 [&::-webkit-scrollbar]:hidden"
                >
                    {products.map((product) => (
                        <div
                            key={product.id}
                            className="w-[45%] shrink-0 sm:w-[31%] md:w-[23%] lg:w-[19%]"
                        >
                            <ProductCard product={product} />
                        </div>
                    ))}
                </div>

                <button
                    onClick={() => scroll("right")}
                    className="absolute -right-3 top-1/2 z-10 hidden -translate-y-1/2 rounded-full border bg-white p-1.5 shadow-md hover:bg-neutral-50 sm:flex"
                    aria-label="Scroll right"
                >
                    <ChevronRight className="h-4 w-4" />
                </button>
            </div>
        </section>
    );
};

export default ProductCardSlider;
