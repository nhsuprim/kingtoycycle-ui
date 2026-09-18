"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";
import type { Category } from "@/types/category";

const CategorySlider = () => {
    const [categories, setCategories] = useState<Category[]>([]);
    const scrollRef = useRef<HTMLDivElement>(null);
    const pathname = usePathname();

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const data = await api.get<Category[]>("/category", 300);
                setCategories(data.filter((c) => c.status === "ACTIVE"));
            } catch {
                // skip
            }
        };
        fetchCategories();
    }, []);

    const scroll = (direction: "left" | "right") => {
        if (!scrollRef.current) return;
        scrollRef.current.scrollBy({
            left: direction === "left" ? -240 : 240,
            behavior: "smooth",
        });
    };

    if (categories.length === 0) return null;

    return (
        <div className="relative border-b bg-white py-4">
            <div className="mx-auto max-w-7xl px-4">
                <div className="relative">
                    <button
                        onClick={() => scroll("left")}
                        className="absolute -left-3 top-1/2 z-10 hidden -translate-y-1/2 rounded-full border bg-white p-1.5 shadow-sm hover:bg-neutral-50 sm:flex"
                        aria-label="Scroll left"
                    >
                        <ChevronLeft className="h-4 w-4" />
                    </button>

                    <div
                        ref={scrollRef}
                        className="flex gap-4 overflow-x-auto scroll-smooth [-ms-overflow-style:none] scrollbar-none [&::-webkit-scrollbar]:hidden sm:gap-6"
                    >
                        {categories.map((category) => {
                            const isActive =
                                pathname === `/category/${category.slug}`;

                            return (
                                <Link
                                    key={category.id}
                                    href={`/category/${category.slug}`}
                                    className="flex shrink-0 flex-col items-center gap-2"
                                >
                                    <div
                                        className={cn(
                                            "flex h-16 w-16 items-center justify-center overflow-hidden rounded-full bg-neutral-100 transition-all sm:h-20 sm:w-20",
                                            isActive &&
                                                "ring-2 ring-neutral-900 ring-offset-2",
                                        )}
                                    >
                                        {category.image ? (
                                            <Image
                                                src={category.image}
                                                alt={category.name}
                                                width={80}
                                                height={80}
                                                className="h-full w-full object-cover"
                                            />
                                        ) : (
                                            <span className="text-xs text-neutral-400">
                                                {category.name.charAt(0)}
                                            </span>
                                        )}
                                    </div>
                                    <span
                                        className={cn(
                                            "max-w-20 truncate text-center text-xs font-medium",
                                            isActive
                                                ? "text-neutral-900"
                                                : "text-neutral-600",
                                        )}
                                    >
                                        {category.name}
                                    </span>
                                </Link>
                            );
                        })}
                    </div>

                    <button
                        onClick={() => scroll("right")}
                        className="absolute -right-3 top-1/2 z-10 hidden -translate-y-1/2 rounded-full border bg-white p-1.5 shadow-sm hover:bg-neutral-50 sm:flex"
                        aria-label="Scroll right"
                    >
                        <ChevronRight className="h-4 w-4" />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CategorySlider;
