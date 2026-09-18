import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import type { OrderStatus } from "@/types/order";

interface OrderStatusTimelineProps {
    currentStatus: OrderStatus;
}

const NORMAL_FLOW: OrderStatus[] = [
    "PENDING",
    "CONFIRMED",
    "PROCESSING",
    "SHIPPED",
    "DELIVERED",
];
const TERMINAL_STATUSES: OrderStatus[] = ["CANCELLED", "RETURNED", "REFUNDED"];

const STATUS_LABELS: Record<OrderStatus, string> = {
    PENDING: "Order Placed",
    CONFIRMED: "Confirmed",
    PROCESSING: "Processing",
    SHIPPED: "Shipped",
    DELIVERED: "Delivered",
    CANCELLED: "Cancelled",
    RETURNED: "Returned",
    REFUNDED: "Refunded",
};

const OrderStatusTimeline = ({ currentStatus }: OrderStatusTimelineProps) => {
    // Cancelled/Returned/Refunded হলে normal timeline না দেখিয়ে আলাদা message
    if (TERMINAL_STATUSES.includes(currentStatus)) {
        return (
            <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-center">
                <p className="text-sm font-semibold text-red-700">
                    {STATUS_LABELS[currentStatus]}
                </p>
                <p className="mt-1 text-xs text-red-600">
                    This order has been {currentStatus.toLowerCase()}.
                </p>
            </div>
        );
    }

    const currentIndex = NORMAL_FLOW.indexOf(currentStatus);

    return (
        <div className="flex items-start">
            {NORMAL_FLOW.map((status, i) => {
                const isCompleted = i <= currentIndex;
                const isLast = i === NORMAL_FLOW.length - 1;

                return (
                    <div
                        key={status}
                        className="flex flex-1 flex-col items-center"
                    >
                        <div className="flex w-full items-center">
                            <div
                                className={cn(
                                    "flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 text-xs font-semibold sm:h-8 sm:w-8",
                                    isCompleted
                                        ? "border-green-600 bg-green-600 text-white sm:ml-5 md:ml-10"
                                        : "border-neutral-300 bg-white text-neutral-400",
                                )}
                            >
                                {isCompleted ? (
                                    <Check className="h-3.5 w-3.5" />
                                ) : (
                                    i + 1
                                )}
                            </div>
                            {!isLast && (
                                <div
                                    className={cn(
                                        "h-0.5 flex-1",
                                        i < currentIndex
                                            ? "bg-green-600"
                                            : "bg-neutral-200",
                                    )}
                                />
                            )}
                        </div>
                        <p
                            className={cn(
                                "mt-1.5 text-center text-[10px] leading-tight sm:text-xs",
                                isCompleted
                                    ? "font-medium text-neutral-900"
                                    : "text-neutral-400",
                            )}
                        >
                            {STATUS_LABELS[status]}
                        </p>
                    </div>
                );
            })}
        </div>
    );
};

export default OrderStatusTimeline;
