"use client";

import { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api } from "@/lib/api";
import { showToast } from "@/lib/toast";

interface BannerFormDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess: () => void;
}

const BannerFormDialog = ({
    open,
    onOpenChange,
    onSuccess,
}: BannerFormDialogProps) => {
    const [title, setTitle] = useState("");
    const [file, setFile] = useState<File | null>(null);
    const [loading, setLoading] = useState(false);

    const resetForm = () => {
        setTitle("");
        setFile(null);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!file) {
            showToast.error("Banner image is required");
            return;
        }

        setLoading(true);

        try {
            const formData = new FormData();
            formData.append("data", JSON.stringify({ title }));
            formData.append("image", file);

            await api.postForm("/homepage/add-banner", formData);
            showToast.success("Banner added successfully");

            resetForm();
            onSuccess();
            onOpenChange(false);
        } catch (err) {
            showToast.error(
                err instanceof Error ? err.message : "Something went wrong",
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Add Banner</DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="title">Title</Label>
                        <Input
                            id="title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="e.g. Eid Special Offer"
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="image">Banner Image</Label>
                        <Input
                            id="image"
                            type="file"
                            accept="image/*"
                            onChange={(e) =>
                                setFile(e.target.files?.[0] ?? null)
                            }
                            required
                        />
                        <p className="text-xs text-neutral-400">
                            Recommended: wide landscape image (e.g. 1600×600px)
                            for best carousel display.
                        </p>
                    </div>

                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" disabled={loading}>
                            {loading ? "Uploading..." : "Add Banner"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export default BannerFormDialog;
