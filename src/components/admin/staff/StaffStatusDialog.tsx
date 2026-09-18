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
import type { Staff } from "@/types/staff";

interface StaffStatusDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    staff: Staff | null;
    nextStatus: "ACTIVE" | "INACTIVE" | null;
    onConfirm: () => void;
}

const StaffStatusDialog = ({
    open,
    onOpenChange,
    staff,
    nextStatus,
    onConfirm,
}: StaffStatusDialogProps) => {
    const isActivating = nextStatus === "ACTIVE";

    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>
                        {isActivating ? "Activate" : "Deactivate"} &quot;
                        {staff?.name}&quot;?
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                        {isActivating
                            ? "This staff member will be able to log in again."
                            : "This staff member will be immediately logged out and unable to log in until reactivated."}
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

export default StaffStatusDialog;
