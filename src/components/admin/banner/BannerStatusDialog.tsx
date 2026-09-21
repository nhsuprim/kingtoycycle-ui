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
import { Banner } from "@/types/banner";

interface BannerStatusDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    banner: Banner | null;
    nextStatus: boolean | null;
    onConfirm: () => void;
}

const BannerStatusDialog = ({
    open,
    onOpenChange,
    banner,
    nextStatus,
    onConfirm,
}: BannerStatusDialogProps) => {
    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>
                        {nextStatus ? "Activate" : "Deactivate"} &quot;
                        {banner?.title}&quot;?
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                        {nextStatus
                            ? "This banner will appear in the homepage carousel."
                            : "This banner will be hidden from the homepage carousel."}
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={onConfirm}>
                        {nextStatus ? "Activate" : "Deactivate"}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
};

export default BannerStatusDialog;
