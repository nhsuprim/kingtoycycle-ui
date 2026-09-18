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
import type { Review } from "@/types/review";

interface DeleteReviewDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    review: Review | null;
    onSuccess: () => void;
}

const DeleteReviewDialog = ({
    open,
    onOpenChange,
    review,
    onSuccess,
}: DeleteReviewDialogProps) => {
    const handleDelete = async () => {
        if (!review) return;

        try {
            await api.delete(`/review/${review.id}`);
            showToast.success("Review deleted successfully");
            onSuccess();
        } catch (err) {
            showToast.error(
                err instanceof Error ? err.message : "Could not delete review",
            );
        } finally {
            onOpenChange(false);
        }
    };

    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Delete this review?</AlertDialogTitle>
                    <AlertDialogDescription>
                        This will permanently remove the review and update the
                        product&apos;s average rating.
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

export default DeleteReviewDialog;
