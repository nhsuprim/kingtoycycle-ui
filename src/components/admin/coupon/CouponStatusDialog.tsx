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
import type { Coupon } from "@/types/coupon";

interface CouponStatusDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    coupon: Coupon | null;
    nextStatus: "ACTIVE" | "INACTIVE" | null;
    onConfirm: () => void;
}

const CouponStatusDialog = ({
    open,
    onOpenChange,
    coupon,
    nextStatus,
    onConfirm,
}: CouponStatusDialogProps) => {
    const isActivating = nextStatus === "ACTIVE";

    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>
                        {isActivating ? "Activate" : "Deactivate"} &quot;
                        {coupon?.code}&quot;?
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                        {isActivating
                            ? "Customers will be able to use this coupon code at checkout again."
                            : "This coupon code will stop working at checkout immediately."}
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={onConfirm}>
                        {isActivating ? "Activate" : "Deactivate"}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
};

export default CouponStatusDialog;
