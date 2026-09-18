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
import type { Product, ProductStockStatus } from "@/types/product";

interface StockStatusDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    product: Product | null;
    nextStatus: ProductStockStatus | null;
    onConfirm: () => void;
}

const STATUS_LABELS: Record<ProductStockStatus, string> = {
    IN_STOCK: "In Stock",
    OUT_OF_STOCK: "Out of Stock",
    DISCONTINUED: "Discontinued",
};

const StockStatusDialog = ({
    open,
    onOpenChange,
    product,
    nextStatus,
    onConfirm,
}: StockStatusDialogProps) => {
    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>
                        Mark &quot;{product?.name}&quot; as{" "}
                        {nextStatus && STATUS_LABELS[nextStatus]}?
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                        {nextStatus === "OUT_OF_STOCK" &&
                            "Customers will see this product as unavailable for purchase."}
                        {nextStatus === "DISCONTINUED" &&
                            "This product will be permanently marked as discontinued and hidden from the storefront."}
                        {nextStatus === "IN_STOCK" &&
                            "This product will become available for purchase again."}
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

export default StockStatusDialog;
