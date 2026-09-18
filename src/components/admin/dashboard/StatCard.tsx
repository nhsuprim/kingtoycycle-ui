import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

interface StatCardProps {
    label: string;
    value: string;
    icon: LucideIcon;
    accentClass?: string;
}

const StatCard = ({
    label,
    value,
    icon: Icon,
    accentClass = "bg-neutral-100 text-neutral-600",
}: StatCardProps) => {
    return (
        <div className="rounded-lg border bg-white p-4">
            <div className="flex items-center justify-between">
                <p className="text-xs font-medium text-neutral-500">{label}</p>
                <div
                    className={cn(
                        "flex h-8 w-8 shrink-0 items-center justify-center rounded-full",
                        accentClass,
                    )}
                >
                    <Icon className="h-4 w-4" />
                </div>
            </div>
            <p className="mt-2 text-xl font-bold sm:text-2xl">{value}</p>
        </div>
    );
};

export default StatCard;
