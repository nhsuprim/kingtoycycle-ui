"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { Expand } from "lucide-react";
import { cn } from "@/lib/utils";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";

interface ImageGalleryProps {
    images: string[];
    productName: string;
}

const AUTOPLAY_INTERVAL = 2000; // ২ সেকেন্ড

const ImageGallery = ({ images, productName }: ImageGalleryProps) => {
    const [activeIndex, setActiveIndex] = useState(0);
    const [zoomOpen, setZoomOpen] = useState(false);
    const [isPaused, setIsPaused] = useState(false);
    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

    useEffect(() => {
        if (images.length <= 1 || isPaused || zoomOpen) return;

        intervalRef.current = setInterval(() => {
            setActiveIndex((prev) => (prev + 1) % images.length);
        }, AUTOPLAY_INTERVAL);

        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, [images.length, isPaused, zoomOpen]);

    const activeImage = images[activeIndex] ?? images[0];

    const handleThumbnailClick = (index: number) => {
        setActiveIndex(index);
        // ম্যানুয়াল ক্লিকের পর কিছুক্ষণ autoplay বন্ধ থাকবে, বিরক্তিকর না হওয়ার জন্য
        setIsPaused(true);
        setTimeout(() => setIsPaused(false), AUTOPLAY_INTERVAL * 2);
    };

    return (
        <div>
            <div
                className="relative aspect-square overflow-hidden rounded-lg border bg-neutral-50"
                onMouseEnter={() => setIsPaused(true)}
                onMouseLeave={() => setIsPaused(false)}
            >
                <Image
                    src={activeImage}
                    alt={productName}
                    fill
                    priority
                    className="object-contain p-4 transition-opacity duration-300"
                    sizes="(max-width: 1024px) 100vw, 45vw"
                />
                <button
                    onClick={() => setZoomOpen(true)}
                    className="absolute bottom-3 right-3 rounded-full bg-white/90 p-2 shadow-sm hover:bg-white"
                    aria-label="Zoom image"
                >
                    <Expand className="h-4 w-4 text-neutral-700" />
                </button>

                {images.length > 1 && (
                    <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5">
                        {images.map((_, i) => (
                            <span
                                key={i}
                                className={cn(
                                    "h-1.5 rounded-full transition-all",
                                    activeIndex === i
                                        ? "w-4 bg-neutral-900"
                                        : "w-1.5 bg-neutral-300",
                                )}
                            />
                        ))}
                    </div>
                )}
            </div>

            {images.length > 1 && (
                <div className="mt-3 flex gap-2 overflow-x-auto">
                    {images.map((img, i) => (
                        <button
                            key={i}
                            onClick={() => handleThumbnailClick(i)}
                            className={cn(
                                "relative h-16 w-16 shrink-0 overflow-hidden rounded-md border-2 bg-neutral-50 sm:h-20 sm:w-20",
                                activeIndex === i
                                    ? "border-neutral-900"
                                    : "border-transparent",
                            )}
                        >
                            <Image
                                src={img}
                                alt={`${productName} ${i + 1}`}
                                fill
                                className="object-contain p-1"
                                sizes="80px"
                            />
                        </button>
                    ))}
                </div>
            )}

            <Dialog open={zoomOpen} onOpenChange={setZoomOpen}>
                <DialogContent className="max-w-3xl">
                    <DialogTitle className="sr-only">{productName}</DialogTitle>
                    <div className="relative aspect-square w-full">
                        <Image
                            src={activeImage}
                            alt={productName}
                            fill
                            className="object-contain"
                            sizes="90vw"
                        />
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default ImageGallery;
