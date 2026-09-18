"use client";

import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import type { Order, OrderStatus } from "@/types/order";

interface OrderStatusDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    order: Order | null;
    nextStatus: OrderStatus | null;
    onConfirm: () => void;
}

const STATUS_LABELS: Record<OrderStatus, string> = {
    PENDING: "Pending",
    CONFIRMED: "Confirmed",
    PROCESSING: "Processing",
    SHIPPED: "Shipped",
    DELIVERED: "Delivered",
    CANCELLED: "Cancelled",
    RETURNED: "Returned",
    REFUNDED: "Refunded",
};

const OrderStatusDialog = ({
    open,
    onOpenChange,
    order,
    nextStatus,
    onConfirm,
}: OrderStatusDialogProps) => {
    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>
                        Mark order &quot;{order?.orderNumber}&quot; as{" "}
                        {nextStatus && STATUS_LABELS[nextStatus]}?
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                        This will update the order status visible to the
                        customer when they track their order.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={onConfirm}>
                        Confirm
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
};

export default OrderStatusDialog;
