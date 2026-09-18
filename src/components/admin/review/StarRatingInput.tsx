"use client";

import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface StarRatingInputProps {
    value: number;
    onChange: (value: number) => void;
}

const StarRatingInput = ({ value, onChange }: StarRatingInputProps) => {
    // Ensure value is always between 0 and 5
    const safeValue = Math.min(Math.max(value || 0, 0), 5);

    return (
        <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
                <button
                    key={star}
                    type="button"
                    onClick={() => onChange(star)}
                    className="rounded-sm p-0.5 transition-transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                    aria-label={`${star} star`}
                >
                    <Star
                        className={cn(
                            "h-6 w-6 transition-colors",
                            star <= safeValue
                                ? "fill-yellow-400 text-yellow-400"
                                : "fill-neutral-200 text-neutral-200",
                        )}
                    />
                </button>
            ))}
        </div>
    );
};

export default StarRatingInput;
