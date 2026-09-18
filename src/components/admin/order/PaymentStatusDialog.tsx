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
import type { Order, PaymentStatus } from "@/types/order";

interface PaymentStatusDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    order: Order | null;
    nextStatus: PaymentStatus | null;
    onConfirm: () => void;
}

const PaymentStatusDialog = ({
    open,
    onOpenChange,
    order,
    nextStatus,
    onConfirm,
}: PaymentStatusDialogProps) => {
    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>
                        Mark payment for &quot;{order?.orderNumber}&quot; as{" "}
                        {nextStatus}?
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                        {nextStatus === "PAID" &&
                            "Confirm that payment has been collected for this order."}
                        {nextStatus === "REFUNDED" &&
                            "This marks the payment as refunded to the customer."}
                        {nextStatus === "UNPAID" &&
                            "This marks the order as not yet paid."}
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

export default PaymentStatusDialog;
