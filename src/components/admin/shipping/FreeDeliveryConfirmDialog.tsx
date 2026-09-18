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

interface FreeDeliveryConfirmDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    nextValue: boolean;
    onConfirm: () => void;
}

const FreeDeliveryConfirmDialog = ({
    open,
    onOpenChange,
    nextValue,
    onConfirm,
}: FreeDeliveryConfirmDialogProps) => {
    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>
                        {nextValue
                            ? "Enable Free Delivery?"
                            : "Disable Free Delivery?"}
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                        {nextValue
                            ? "All customers will get free shipping on every order, regardless of the charges set below. This will affect your revenue immediately."
                            : "Delivery charges (Inside Dhaka / Outside Dhaka) will apply to new orders again."}
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

export default FreeDeliveryConfirmDialog;
