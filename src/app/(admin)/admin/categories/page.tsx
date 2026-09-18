"use client";

import { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import { Plus, Pencil, Trash2 } from "lucide-react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { api } from "@/lib/api";
import { showToast } from "@/lib/toast";
import type { Category } from "@/types/category";
import CategoryFormDialog from "@/components/admin/category/CategoryFormDialog";
import DeleteCategoryDialog from "@/components/admin/category/DeleteCategoryDialog";
import StatusConfirmDialog from "@/components/admin/category/StatusConfirmDialog";

const CategoriesPage = () => {
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);

    const [formOpen, setFormOpen] = useState(false);
    const [deleteOpen, setDeleteOpen] = useState(false);
    const [statusConfirmOpen, setStatusConfirmOpen] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState<Category | null>(
        null,
    );
    const [nextStatus, setNextStatus] = useState<"ACTIVE" | "INACTIVE" | null>(
        null,
    );

    const fetchCategories = useCallback(async () => {
        setLoading(true);
        try {
            const data = await api.get<Category[]>("/category");
            setCategories(data);
        } catch (err) {
            showToast.error(
                err instanceof Error
                    ? err.message
                    : "Failed to load categories",
            );
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchCategories();
    }, [fetchCategories]);

    const handleAddClick = () => {
        setSelectedCategory(null);
        setFormOpen(true);
    };

    const handleEditClick = (category: Category) => {
        setSelectedCategory(category);
        setFormOpen(true);
    };

    const handleDeleteClick = (category: Category) => {
        setSelectedCategory(category);
        setDeleteOpen(true);
    };

    // Switch ক্লিক করলে সরাসরি বদলাবে না, আগে confirm dialog খুলবে
    const handleSwitchClick = (category: Category, checked: boolean) => {
        setSelectedCategory(category);
        setNextStatus(checked ? "ACTIVE" : "INACTIVE");
        setStatusConfirmOpen(true);
    };

    // Dialog-এ "Confirm" চাপলে তবেই আসল API call হবে
    const handleStatusConfirm = async () => {
        if (!selectedCategory || !nextStatus) return;

        try {
            const formData = new FormData();
            formData.append("data", JSON.stringify({ status: nextStatus }));
            await api.patchForm(`/category/${selectedCategory.id}`, formData);
            showToast.success(`Category marked as ${nextStatus.toLowerCase()}`);
            fetchCategories();
        } catch (err) {
            showToast.error(
                err instanceof Error ? err.message : "Could not update status",
            );
        } finally {
            setStatusConfirmOpen(false);
        }
    };

    return (
        <div>
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold">Categories</h1>
                    <p className="mt-1 text-sm text-neutral-500">
                        Manage product categories shown on the storefront.
                    </p>
                </div>
                <Button onClick={handleAddClick} className="gap-2">
                    <Plus className="h-4 w-4" />
                    Add Category
                </Button>
            </div>

            <div className="mt-6 overflow-x-auto rounded-lg border bg-white">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Image</TableHead>
                            <TableHead>Name</TableHead>
                            <TableHead>Description</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">
                                Actions
                            </TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell
                                    colSpan={5}
                                    className="py-8 text-center text-neutral-500"
                                >
                                    Loading...
                                </TableCell>
                            </TableRow>
                        ) : categories.length === 0 ? (
                            <TableRow>
                                <TableCell
                                    colSpan={5}
                                    className="py-8 text-center text-neutral-500"
                                >
                                    No categories yet. Add your first one.
                                </TableCell>
                            </TableRow>
                        ) : (
                            categories.map((category) => (
                                <TableRow key={category.id}>
                                    <TableCell>
                                        {category.image ? (
                                            <Image
                                                src={category.image}
                                                alt={category.name}
                                                width={40}
                                                height={40}
                                                className="rounded-md object-cover"
                                            />
                                        ) : (
                                            <div className="h-10 w-10 rounded-md bg-neutral-100" />
                                        )}
                                    </TableCell>
                                    <TableCell className="font-medium">
                                        {category.name}
                                    </TableCell>
                                    <TableCell className="max-w-xs truncate text-neutral-500">
                                        {category.description || "—"}
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <Switch
                                                checked={
                                                    category.status === "ACTIVE"
                                                }
                                                onCheckedChange={(checked) =>
                                                    handleSwitchClick(
                                                        category,
                                                        checked,
                                                    )
                                                }
                                            />
                                            <Badge
                                                variant={
                                                    category.status === "ACTIVE"
                                                        ? "default"
                                                        : "secondary"
                                                }
                                            >
                                                {category.status}
                                            </Badge>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-1">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() =>
                                                    handleEditClick(category)
                                                }
                                                aria-label="Edit"
                                            >
                                                <Pencil className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() =>
                                                    handleDeleteClick(category)
                                                }
                                                aria-label="Delete"
                                            >
                                                <Trash2 className="h-4 w-4 text-red-600" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            <CategoryFormDialog
                open={formOpen}
                onOpenChange={setFormOpen}
                category={selectedCategory}
                onSuccess={fetchCategories}
            />

            <DeleteCategoryDialog
                open={deleteOpen}
                onOpenChange={setDeleteOpen}
                category={selectedCategory}
                onSuccess={fetchCategories}
            />

            <StatusConfirmDialog
                open={statusConfirmOpen}
                onOpenChange={setStatusConfirmOpen}
                category={selectedCategory}
                nextStatus={nextStatus}
                onConfirm={handleStatusConfirm}
            />
        </div>
    );
};

export default CategoriesPage;
