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
import type { Product } from "@/types/product";

interface DeleteProductDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    product: Product | null;
    onSuccess: () => void;
}

const DeleteProductDialog = ({
    open,
    onOpenChange,
    product,
    onSuccess,
}: DeleteProductDialogProps) => {
    const handleDelete = async () => {
        if (!product) return;

        try {
            await api.delete(`/product/${product.id}`);
            showToast.success("Product deleted successfully");
            onSuccess();
        } catch (err) {
            showToast.error(
                err instanceof Error ? err.message : "Could not delete product",
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
                        Delete &quot;{product?.name}&quot;?
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                        This action cannot be undone. If this product has
                        existing orders, deletion may fail — mark it as
                        discontinued instead.
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

export default DeleteProductDialog;
