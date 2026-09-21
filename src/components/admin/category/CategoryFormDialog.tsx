"use client";

import { useEffect, useState } from "react";
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
import { Textarea } from "@/components/ui/textarea";
import { api } from "@/lib/api";
import { showToast } from "@/lib/toast";
import type { Category } from "@/types/category";

interface CategoryFormDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    category: Category | null;
    onSuccess: () => void;
}

const CategoryFormDialog = ({
    open,
    onOpenChange,
    category,
    onSuccess,
}: CategoryFormDialogProps) => {
    const isEditMode = Boolean(category);

    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [file, setFile] = useState<File | null>(null);
    const [bannerFile, setBannerFile] = useState<File | null>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (open) {
            setName(category?.name ?? "");
            setDescription(category?.description ?? "");
            setFile(null);
            setBannerFile(null);
        }
    }, [open, category]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const formData = new FormData();
            formData.append("data", JSON.stringify({ name, description }));
            if (file) formData.append("file", file);
            if (bannerFile) formData.append("bannerImage", bannerFile);

            if (isEditMode && category) {
                await api.patchForm(`/category/${category.id}`, formData);
                showToast.success("Category updated successfully");
            } else {
                await api.postForm("/category", formData);
                showToast.success("Category added successfully");
            }

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
                    <DialogTitle>
                        {isEditMode ? "Edit Category" : "Add Category"}
                    </DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="name">Name</Label>
                        <Input
                            id="name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                            id="description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            rows={3}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="image">
                            Icon Image{" "}
                            {isEditMode && "(leave empty to keep current)"}
                        </Label>
                        <Input
                            id="image"
                            type="file"
                            accept="image/*"
                            onChange={(e) =>
                                setFile(e.target.files?.[0] ?? null)
                            }
                        />
                        <p className="text-xs text-neutral-400">
                            Small circular icon shown in the category slider.
                        </p>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="bannerImage">
                            Banner Image{" "}
                            {isEditMode && "(leave empty to keep current)"}
                        </Label>
                        <Input
                            id="bannerImage"
                            type="file"
                            accept="image/*"
                            onChange={(e) =>
                                setBannerFile(e.target.files?.[0] ?? null)
                            }
                        />
                        <p className="text-xs text-neutral-400">
                            Wide banner shown at the top of this category&apos;s
                            page.
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
                            {loading
                                ? "Saving..."
                                : isEditMode
                                  ? "Update"
                                  : "Add"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export default CategoryFormDialog;
