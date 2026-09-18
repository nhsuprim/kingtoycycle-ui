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
import type { Category } from "@/types/category";

interface DeleteCategoryDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    category: Category | null;
    onSuccess: () => void;
}

const DeleteCategoryDialog = ({
    open,
    onOpenChange,
    category,
    onSuccess,
}: DeleteCategoryDialogProps) => {
    const handleDelete = async () => {
        if (!category) return;

        try {
            await api.delete(`/category/${category.id}`);
            showToast.success("Category deleted successfully");
            onSuccess();
        } catch (err) {
            showToast.error(
                err instanceof Error
                    ? err.message
                    : "Could not delete category",
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
                        Delete &quot;{category?.name}&quot;?
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                        This action cannot be undone. If products are linked to
                        this category, deletion may fail.
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

export default DeleteCategoryDialog;
