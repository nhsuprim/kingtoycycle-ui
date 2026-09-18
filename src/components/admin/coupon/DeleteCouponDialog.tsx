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
import { api } from "@/lib/api";
import { showToast } from "@/lib/toast";
import type { Coupon } from "@/types/coupon";

interface DeleteCouponDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    coupon: Coupon | null;
    onSuccess: () => void;
}

const DeleteCouponDialog = ({
    open,
    onOpenChange,
    coupon,
    onSuccess,
}: DeleteCouponDialogProps) => {
    const handleDelete = async () => {
        if (!coupon) return;

        try {
            await api.delete(`/coupon/${coupon.id}`);
            showToast.success("Coupon deleted successfully");
            onSuccess();
        } catch (err) {
            showToast.error(
                err instanceof Error ? err.message : "Could not delete coupon",
            );
        } finally {
            onOpenChange(false);
        }
    };

    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>
                        Delete &quot;{coupon?.code}&quot;?
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                        This action cannot be undone. If this coupon has already
                        been used in orders, deletion may fail — deactivate it
                        instead.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                        onClick={handleDelete}
                        className="bg-red-600 hover:bg-red-700"
                    >
                        Delete
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
};

export default DeleteCouponDialog;
