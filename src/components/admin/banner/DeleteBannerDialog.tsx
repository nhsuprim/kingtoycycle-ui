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
import type { Banner } from "@/types/banner";

interface DeleteBannerDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    banner: Banner | null;
    onSuccess: () => void;
}

const DeleteBannerDialog = ({
    open,
    onOpenChange,
    banner,
    onSuccess,
}: DeleteBannerDialogProps) => {
    const handleDelete = async () => {
        if (!banner) return;

        try {
            await api.delete(`/homepage/delete-banner/${banner.id}`);
            showToast.success("Banner deleted successfully");
            onSuccess();
        } catch (err) {
            showToast.error(
                err instanceof Error ? err.message : "Could not delete banner",
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
                        Delete &quot;{banner?.title}&quot;?
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                        This action cannot be undone. The banner will be
                        permanently removed.
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

export default DeleteBannerDialog;
