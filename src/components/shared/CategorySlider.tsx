"use client";

import { useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import type { Category } from "@/types/category";

interface CategorySliderProps {
    categories: Category[];
}

const CategorySlider = ({ categories }: CategorySliderProps) => {
    const scrollRef = useRef<HTMLDivElement>(null);
    const pathname = usePathname();

    const scroll = (direction: "left" | "right") => {
        if (!scrollRef.current) return;

        scrollRef.current.scrollBy({
            left: direction === "left" ? -300 : 300,
            behavior: "smooth",
        });
    };

    if (categories.length === 0) return null;

    const sortedCategories = [...categories].sort((a, b) => {
        const aSerial = a.serial_count;
        const bSerial = b.serial_count;

        if (aSerial != null && bSerial != null) {
            return Number(aSerial) - Number(bSerial);
        }

        if (aSerial != null) {
            return -1;
        }

        if (bSerial != null) {
            return 1;
        }

        return 0;
    });

    return (
        <div className="relative border-b bg-white py-4">
            <div className="mx-auto max-w-7xl px-4">
                <div className="relative">
                    <div
                        ref={scrollRef}
                        className={cn(
                            "flex items-start gap-5 overflow-x-auto scroll-smooth py-3",
                            "[-ms-overflow-style:none] scrollbar-none",
                            "[&::-webkit-scrollbar]:hidden",
                            "sm:justify-center sm:items-start sm:gap-6 px-4",
                        )}
                    >
                        {sortedCategories.map((category) => {
                            const isActive =
                                pathname === `/category/${category.slug}`;

                            return (
                                <Link
                                    key={category.id}
                                    href={`/category/${category.slug}`}
                                    className="flex w-20 shrink-0 flex-col items-center gap-2 sm:w-24"
                                >
                                    <div
                                        className={cn(
                                            "flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-full bg-neutral-100 transition-all duration-200",
                                            "sm:h-24 sm:w-24",
                                            isActive &&
                                                "ring-2 ring-neutral-900 ring-offset-2",
                                        )}
                                    >
                                        {category.image ? (
                                            <Image
                                                src={category.image}
                                                alt={category.name}
                                                width={96}
                                                height={96}
                                                className="h-full w-full object-cover"
                                            />
                                        ) : (
                                            <span className="text-sm font-medium text-neutral-400">
                                                {category.name.charAt(0)}
                                            </span>
                                        )}
                                    </div>

                                    <span
                                        className={cn(
                                            "flex min-h-10 w-full items-start justify-center text-center text-sm font-semibold leading-tight",
                                            isActive
                                                ? "text-neutral-900"
                                                : "text-neutral-600",
                                        )}
                                        title={category.name}
                                    >
                                        {category.name}
                                    </span>
                                </Link>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CategorySlider;
