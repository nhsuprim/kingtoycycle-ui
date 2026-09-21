"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Banner } from "@/types/banner";

interface BannerCarouselProps {
    banners: Banner[];
}

const AUTOPLAY_INTERVAL = 4000;

const BannerCarousel = ({ banners }: BannerCarouselProps) => {
    const [activeIndex, setActiveIndex] = useState(0);
    const [isPaused, setIsPaused] = useState(false);

    useEffect(() => {
        if (banners.length <= 1 || isPaused) return;

        const interval = setInterval(() => {
            setActiveIndex((prev) => (prev + 1) % banners.length);
        }, AUTOPLAY_INTERVAL);

        return () => clearInterval(interval);
    }, [banners.length, isPaused]);

    if (banners.length === 0) return null;

    const goTo = (index: number) => {
        setActiveIndex((index + banners.length) % banners.length);
    };

    return (
        <div
            className="relative w-full overflow-hidden bg-neutral-100 sm:rounded-lg"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
        >
            {/* Carousel */}
            <div className="relative w-full">
                <div
                    className="flex w-full transition-transform duration-700 ease-in-out"
                    style={{
                        transform: `translateX(-${activeIndex * 100}%)`,
                    }}
                >
                    {banners.map((banner, i) => (
                        <div
                            key={banner.id}
                            className="relative w-full shrink-0"
                        >
                            <Image
                                src={banner.image}
                                alt={banner.title || "Banner"}
                                width={1920}
                                height={600}
                                priority={i === 0}
                                className="block h-auto w-full object-contain"
                                sizes="100vw"
                            />
                        </div>
                    ))}
                </div>
            </div>

            {/* Navigation */}
            {banners.length > 1 && (
                <>
                    <button
                        type="button"
                        onClick={() => goTo(activeIndex - 1)}
                        className="absolute left-2 top-1/2 z-10 hidden -translate-y-1/2 items-center justify-center rounded-full bg-white/80 p-2 shadow-sm transition-colors hover:bg-white sm:left-3 sm:flex"
                        aria-label="Previous banner"
                    >
                        <ChevronLeft className="h-4 w-4" />
                    </button>

                    <button
                        type="button"
                        onClick={() => goTo(activeIndex + 1)}
                        className="absolute right-2 top-1/2 z-10 hidden -translate-y-1/2 items-center justify-center rounded-full bg-white/80 p-2 shadow-sm transition-colors hover:bg-white sm:right-3 sm:flex"
                        aria-label="Next banner"
                    >
                        <ChevronRight className="h-4 w-4" />
                    </button>

                    {/* Dots */}
                    <div className="absolute bottom-2 left-1/2 z-10 flex -translate-x-1/2 gap-1.5 sm:bottom-3">
                        {banners.map((_, i) => (
                            <button
                                type="button"
                                key={i}
                                onClick={() => goTo(i)}
                                className={cn(
                                    "h-1.5 rounded-full transition-all duration-300",
                                    activeIndex === i
                                        ? "w-6 bg-white"
                                        : "w-1.5 bg-white/60",
                                )}
                                aria-label={`Go to banner ${i + 1}`}
                            />
                        ))}
                    </div>
                </>
            )}
        </div>
    );
};

export default BannerCarousel;
