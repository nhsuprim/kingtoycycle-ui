import { Star, StarHalf } from "lucide-react";
import { cn } from "@/lib/utils";

interface StarRatingDisplayProps {
    rating: number;
    size?: "sm" | "md";
}

const StarRatingDisplay = ({ rating, size = "sm" }: StarRatingDisplayProps) => {
    const starSize = size === "sm" ? "h-3.5 w-3.5" : "h-5 w-5";

    // Rating always stays between 0 and 5
    const safeRating = Math.min(Math.max(rating || 0, 0), 5);

    const floorValue = Math.floor(safeRating);
    const decimal = safeRating - floorValue;

    let fullStars: number;
    let hasHalfStar: boolean;

    if (decimal > 0.5) {
        fullStars = floorValue + 1;
        hasHalfStar = false;
    } else if (decimal > 0) {
        fullStars = floorValue;
        hasHalfStar = true;
    } else {
        fullStars = floorValue;
        hasHalfStar = false;
    }

    // Maximum 5 stars
    fullStars = Math.min(fullStars, 5);

    const emptyStars = Math.max(5 - fullStars - (hasHalfStar ? 1 : 0), 0);

    return (
        <div className="flex items-center gap-0.5">
            {/* Full Stars */}
            {Array.from({ length: fullStars }).map((_, i) => (
                <Star
                    key={`full-${i}`}
                    className={cn(starSize, "fill-yellow-400 text-yellow-400")}
                />
            ))}

            {/* Half Star */}
            {hasHalfStar && fullStars < 5 && (
                <StarHalf
                    className={cn(starSize, "fill-yellow-400 text-yellow-400")}
                />
            )}

            {/* Empty Stars */}
            {Array.from({ length: emptyStars }).map((_, i) => (
                <Star
                    key={`empty-${i}`}
                    className={cn(
                        starSize,
                        "fill-neutral-200 text-neutral-200",
                    )}
                />
            ))}
        </div>
    );
};

export default StarRatingDisplay;
