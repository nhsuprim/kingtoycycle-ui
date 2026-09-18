import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

interface GrowthIndicatorProps {
    percent: number;
}

const GrowthIndicator = ({ percent }: GrowthIndicatorProps) => {
    const isPositive = percent > 0;
    const isNeutral = percent === 0;

    const Icon = isNeutral ? Minus : isPositive ? TrendingUp : TrendingDown;

    return (
        <span
            className={cn(
                "inline-flex items-center gap-1 text-xs font-medium",
                isNeutral && "text-neutral-500",
                isPositive && "text-green-600",
                !isNeutral && !isPositive && "text-red-600",
            )}
        >
            <Icon className="h-3.5 w-3.5" />
            {Math.abs(percent)}%
        </span>
    );
};

export default GrowthIndicator;
