"use client";

import { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { api } from "@/lib/api";
import { showToast } from "@/lib/toast";
import type { Banner } from "@/types/banner";
import BannerFormDialog from "@/components/admin/banner/BannerFormDialog";
import BannerStatusDialog from "@/components/admin/banner/BannerStatusDialog";
import DeleteBannerDialog from "@/components/admin/banner/DeleteBannerDialog";

const BannersPage = () => {
    const [banners, setBanners] = useState<Banner[]>([]);
    const [loading, setLoading] = useState(true);

    const [formOpen, setFormOpen] = useState(false);
    const [statusOpen, setStatusOpen] = useState(false);
    const [deleteOpen, setDeleteOpen] = useState(false);
    const [selectedBanner, setSelectedBanner] = useState<Banner | null>(null);
    const [nextStatus, setNextStatus] = useState<boolean | null>(null);

    const fetchBanners = useCallback(async () => {
        setLoading(true);
        try {
            const data = await api.get<Banner[]>("/homepage/get-all-banners");
            setBanners(data);
        } catch (err) {
            showToast.error(
                err instanceof Error ? err.message : "Failed to load banners",
            );
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchBanners();
    }, [fetchBanners]);

    const handleSwitchClick = (banner: Banner, checked: boolean) => {
        setSelectedBanner(banner);
        setNextStatus(checked);
        setStatusOpen(true);
    };

    const handleStatusConfirm = async () => {
        if (!selectedBanner || nextStatus === null) return;

        try {
            await api.patch(
                `/homepage/change-banner-status/${selectedBanner.id}`,
                {
                    isActive: nextStatus,
                },
            );
            showToast.success(
                `Banner ${nextStatus ? "activated" : "deactivated"}`,
            );
            fetchBanners();
        } catch (err) {
            showToast.error(
                err instanceof Error ? err.message : "Could not update status",
            );
        } finally {
            setStatusOpen(false);
        }
    };

    const handleDeleteClick = (banner: Banner) => {
        setSelectedBanner(banner);
        setDeleteOpen(true);
    };

    return (
        <div>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-xl font-bold sm:text-2xl">
                        Homepage Banners
                    </h1>
                    <p className="mt-1 text-sm text-neutral-500">
                        Manage carousel banners shown on the homepage.
                    </p>
                </div>
                <Button
                    onClick={() => setFormOpen(true)}
                    className="w-full gap-2 sm:w-auto"
                >
                    <Plus className="h-4 w-4" />
                    Add Banner
                </Button>
            </div>

            <div className="mt-4 space-y-3 sm:mt-6">
                {loading ? (
                    <p className="py-8 text-center text-sm text-neutral-500">
                        Loading...
                    </p>
                ) : banners.length === 0 ? (
                    <p className="py-8 text-center text-sm text-neutral-500">
                        No banners yet. Add your first one.
                    </p>
                ) : (
                    banners.map((banner) => (
                        <div
                            key={banner.id}
                            className="flex flex-col gap-3 rounded-lg border bg-white p-3 sm:flex-row sm:items-center sm:justify-between"
                        >
                            <div className="flex items-center gap-3">
                                <div className="relative h-16 w-28 shrink-0 overflow-hidden rounded-md border bg-neutral-50">
                                    <Image
                                        src={banner.image}
                                        alt={banner.title}
                                        fill
                                        className="object-cover"
                                    />
                                </div>
                                <p className="font-medium text-neutral-900">
                                    {banner.title}
                                </p>
                            </div>

                            <div className="flex items-center justify-between gap-3 sm:justify-end">
                                <div className="flex items-center gap-2">
                                    <Switch
                                        checked={banner.isActive}
                                        onCheckedChange={(checked) =>
                                            handleSwitchClick(banner, checked)
                                        }
                                    />
                                    <span className="text-xs text-neutral-500">
                                        {banner.isActive
                                            ? "Active"
                                            : "Inactive"}
                                    </span>
                                </div>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => handleDeleteClick(banner)}
                                    aria-label="Delete"
                                >
                                    <Trash2 className="h-4 w-4 text-red-600" />
                                </Button>
                            </div>
                        </div>
                    ))
                )}
            </div>

            <BannerFormDialog
                open={formOpen}
                onOpenChange={setFormOpen}
                onSuccess={fetchBanners}
            />

            <BannerStatusDialog
                open={statusOpen}
                onOpenChange={setStatusOpen}
                banner={selectedBanner}
                nextStatus={nextStatus}
                onConfirm={handleStatusConfirm}
            />

            <DeleteBannerDialog
                open={deleteOpen}
                onOpenChange={setDeleteOpen}
                banner={selectedBanner}
                onSuccess={fetchBanners}
            />
        </div>
    );
};

export default BannersPage;
