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
import type { Staff } from "@/types/staff";

interface DeleteStaffDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    staff: Staff | null;
    onSuccess: () => void;
}

const DeleteStaffDialog = ({
    open,
    onOpenChange,
    staff,
    onSuccess,
}: DeleteStaffDialogProps) => {
    const handleDelete = async () => {
        if (!staff) return;

        try {
            await api.delete(`/users/${staff.id}`);
            showToast.success("Staff member deleted successfully");
            onSuccess();
        } catch (err) {
            showToast.error(
                err instanceof Error
                    ? err.message
                    : "Could not delete staff member",
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
                        Delete &quot;{staff?.name}&quot;?
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                        This action cannot be undone. This will permanently
                        remove their account and access.
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

export default DeleteStaffDialog;
