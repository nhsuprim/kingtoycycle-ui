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
import type { Category } from "@/types/category";

interface StatusConfirmDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    category: Category | null;
    nextStatus: "ACTIVE" | "INACTIVE" | null;
    onConfirm: () => void;
}

const StatusConfirmDialog = ({
    open,
    onOpenChange,
    category,
    nextStatus,
    onConfirm,
}: StatusConfirmDialogProps) => {
    const isActivating = nextStatus === "ACTIVE";

    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>
                        {isActivating ? "Activate" : "Deactivate"} &quot;
                        {category?.name}&quot;?
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                        {isActivating
                            ? "This category will become visible to customers on the storefront."
                            : "This category will be hidden from customers on the storefront."}
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

export default StatusConfirmDialog;
