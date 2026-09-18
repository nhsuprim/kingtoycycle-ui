import { cn } from "@/lib/utils";

interface StatusBadgeProps {
    label: string;
    colorClasses: string;
    className?: string;
}

const StatusBadge = ({ label, colorClasses, className }: StatusBadgeProps) => {
    return (
        <span
            className={cn(
                "inline-flex shrink-0 items-center rounded-full border px-2.5 py-0.5 text-xs font-medium",
                colorClasses,
                className,
            )}
        >
            {label}
        </span>
    );
};

export default StatusBadge;
