import type { OrderStatus, PaymentStatus } from "@/types/order";

// Badge variant-এর বদলে সরাসরি semantic color classes — pending=হলুদ, success=সবুজ, cancelled/refunded=লাল
export const orderStatusColors: Record<OrderStatus, string> = {
    PENDING: "bg-yellow-100 text-yellow-800 border-yellow-200",
    CONFIRMED: "bg-blue-100 text-blue-800 border-blue-200",
    PROCESSING: "bg-blue-100 text-blue-800 border-blue-200",
    SHIPPED: "bg-indigo-100 text-indigo-800 border-indigo-200",
    DELIVERED: "bg-green-100 text-green-800 border-green-200",
    CANCELLED: "bg-red-100 text-red-800 border-red-200",
    RETURNED: "bg-red-100 text-red-800 border-red-200",
    REFUNDED: "bg-neutral-100 text-neutral-700 border-neutral-200",
};

export const paymentStatusColors: Record<PaymentStatus, string> = {
    UNPAID: "bg-yellow-100 text-yellow-800 border-yellow-200",
    PAID: "bg-green-100 text-green-800 border-green-200",
    REFUNDED: "bg-neutral-100 text-neutral-700 border-neutral-200",
};

export const formatOrderDate = (iso: string) =>
    new Date(iso).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
