"use client";

import { useEffect, useState, useCallback } from "react";
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
import type { Coupon } from "@/types/coupon";
import CouponFormDialog from "@/components/admin/coupon/CouponFormDialog";
import DeleteCouponDialog from "@/components/admin/coupon/DeleteCouponDialog";
import CouponStatusDialog from "@/components/admin/coupon/CouponStatusDialog";

const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    });

const CouponsPage = () => {
    const [coupons, setCoupons] = useState<Coupon[]>([]);
    const [loading, setLoading] = useState(true);

    const [formOpen, setFormOpen] = useState(false);
    const [deleteOpen, setDeleteOpen] = useState(false);
    const [statusOpen, setStatusOpen] = useState(false);
    const [selectedCoupon, setSelectedCoupon] = useState<Coupon | null>(null);
    const [nextStatus, setNextStatus] = useState<"ACTIVE" | "INACTIVE" | null>(
        null,
    );

    const fetchCoupons = useCallback(async () => {
        setLoading(true);
        try {
            const data = await api.get<Coupon[]>("/coupon");
            setCoupons(data);
        } catch (err) {
            showToast.error(
                err instanceof Error ? err.message : "Failed to load coupons",
            );
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchCoupons();
    }, [fetchCoupons]);

    const handleAddClick = () => {
        setSelectedCoupon(null);
        setFormOpen(true);
    };

    const handleEditClick = (coupon: Coupon) => {
        setSelectedCoupon(coupon);
        setFormOpen(true);
    };

    const handleDeleteClick = (coupon: Coupon) => {
        setSelectedCoupon(coupon);
        setDeleteOpen(true);
    };

    const handleSwitchClick = (coupon: Coupon, checked: boolean) => {
        setSelectedCoupon(coupon);
        setNextStatus(checked ? "ACTIVE" : "INACTIVE");
        setStatusOpen(true);
    };

    const handleStatusConfirm = async () => {
        if (!selectedCoupon || !nextStatus) return;

        try {
            await api.patch(`/coupon/${selectedCoupon.id}/status`, {
                status: nextStatus,
            });
            showToast.success(`Coupon marked as ${nextStatus.toLowerCase()}`);
            fetchCoupons();
        } catch (err) {
            showToast.error(
                err instanceof Error ? err.message : "Could not update status",
            );
        } finally {
            setStatusOpen(false);
        }
    };

    return (
        <div>
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold">Coupons</h1>
                    <p className="mt-1 text-sm text-neutral-500">
                        Manage discount codes for your storefront.
                    </p>
                </div>
                <Button onClick={handleAddClick} className="gap-2">
                    <Plus className="h-4 w-4" />
                    Create Coupon
                </Button>
            </div>

            <div className="mt-6 overflow-x-auto rounded-lg border bg-white">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Code</TableHead>
                            <TableHead>Discount</TableHead>
                            <TableHead>Valid Period</TableHead>
                            <TableHead>Scope</TableHead>
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
                                    colSpan={6}
                                    className="py-8 text-center text-neutral-500"
                                >
                                    Loading...
                                </TableCell>
                            </TableRow>
                        ) : coupons.length === 0 ? (
                            <TableRow>
                                <TableCell
                                    colSpan={6}
                                    className="py-8 text-center text-neutral-500"
                                >
                                    No coupons yet. Create your first one.
                                </TableCell>
                            </TableRow>
                        ) : (
                            coupons.map((coupon) => (
                                <TableRow key={coupon.id}>
                                    <TableCell className="font-mono font-medium">
                                        {coupon.code}
                                    </TableCell>
                                    <TableCell>
                                        {coupon.discountType === "PERCENTAGE"
                                            ? `${coupon.discountValue}%`
                                            : `৳${coupon.discountValue}`}
                                    </TableCell>
                                    <TableCell className="text-sm text-neutral-500">
                                        {formatDate(coupon.startDate)} —{" "}
                                        {formatDate(coupon.expiryDate)}
                                    </TableCell>
                                    <TableCell>
                                        {coupon.applicableToAll ? (
                                            <Badge variant="outline">
                                                All Products
                                            </Badge>
                                        ) : (
                                            <Badge variant="outline">
                                                {coupon.applicableCategoryIds
                                                    .length +
                                                    coupon.applicableProductIds
                                                        .length}{" "}
                                                selected
                                            </Badge>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <Switch
                                                checked={
                                                    coupon.status === "ACTIVE"
                                                }
                                                onCheckedChange={(checked) =>
                                                    handleSwitchClick(
                                                        coupon,
                                                        checked,
                                                    )
                                                }
                                            />
                                            <Badge
                                                variant={
                                                    coupon.status === "ACTIVE"
                                                        ? "default"
                                                        : "secondary"
                                                }
                                            >
                                                {coupon.status}
                                            </Badge>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-1">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() =>
                                                    handleEditClick(coupon)
                                                }
                                                aria-label="Edit"
                                            >
                                                <Pencil className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() =>
                                                    handleDeleteClick(coupon)
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

            <CouponFormDialog
                open={formOpen}
                onOpenChange={setFormOpen}
                coupon={selectedCoupon}
                onSuccess={fetchCoupons}
            />

            <DeleteCouponDialog
                open={deleteOpen}
                onOpenChange={setDeleteOpen}
                coupon={selectedCoupon}
                onSuccess={fetchCoupons}
            />

            <CouponStatusDialog
                open={statusOpen}
                onOpenChange={setStatusOpen}
                coupon={selectedCoupon}
                nextStatus={nextStatus}
                onConfirm={handleStatusConfirm}
            />
        </div>
    );
};

export default CouponsPage;
