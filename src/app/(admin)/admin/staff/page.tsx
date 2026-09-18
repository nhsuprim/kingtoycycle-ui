"use client";

import { useEffect, useState, useCallback } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { api } from "@/lib/api";
import { showToast } from "@/lib/toast";
import { useAuthStore } from "@/store/auth-store";
import type { Staff, Role } from "@/types/staff";
import StaffFormDialog from "@/components/admin/staff/StaffFormDialog";
import StaffStatusDialog from "@/components/admin/staff/StaffStatusDialog";
import DeleteStaffDialog from "@/components/admin/staff/DeleteStaffDialog";

const StaffPage = () => {
    const currentUser = useAuthStore((s) => s.user);

    const [staffList, setStaffList] = useState<Staff[]>([]);
    const [roles, setRoles] = useState<Role[]>([]);
    const [loading, setLoading] = useState(true);

    const [formOpen, setFormOpen] = useState(false);
    const [statusOpen, setStatusOpen] = useState(false);
    const [deleteOpen, setDeleteOpen] = useState(false);
    const [selectedStaff, setSelectedStaff] = useState<Staff | null>(null);
    const [nextStatus, setNextStatus] = useState<"ACTIVE" | "INACTIVE" | null>(
        null,
    );

    const fetchStaff = useCallback(async () => {
        setLoading(true);
        try {
            const data = await api.get<Staff[]>("/users");
            setStaffList(data);
            console.log(data);
        } catch (err) {
            showToast.error(
                err instanceof Error ? err.message : "Failed to load staff",
            );
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchStaff();
    }, [fetchStaff]);

    useEffect(() => {
        // Role list-এর জন্য আলাদা কোনো public endpoint নেই এখনো,
        // তাই staff data থেকেই unique role গুলো বের করে নিচ্ছি (fallback approach)
        const fetchRoles = async () => {
            try {
                const data = await api.get<Role[]>("/roles");
                setRoles(data);
                // console.log(data);
            } catch {
                // /roles endpoint না থাকলে silently skip — নিচে note দেখুন
            }
        };
        fetchRoles();
    }, []);

    const handleAddClick = () => {
        setSelectedStaff(null);
        setFormOpen(true);
    };

    const handleEditClick = (staff: Staff) => {
        setSelectedStaff(staff);
        setFormOpen(true);
    };

    const handleDeleteClick = (staff: Staff) => {
        setSelectedStaff(staff);
        setDeleteOpen(true);
    };

    const handleSwitchClick = (staff: Staff, checked: boolean) => {
        setSelectedStaff(staff);
        setNextStatus(checked ? "ACTIVE" : "INACTIVE");
        setStatusOpen(true);
    };

    const handleStatusConfirm = async () => {
        if (!selectedStaff || !nextStatus) return;

        try {
            await api.patch(`/users/${selectedStaff.id}/status`, {
                status: nextStatus,
            });
            showToast.success(
                `Staff member marked as ${nextStatus.toLowerCase()}`,
            );
            fetchStaff();
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
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-xl font-bold sm:text-2xl">
                        Staff Members
                    </h1>
                    <p className="mt-1 text-sm text-neutral-500">
                        Manage admin and staff accounts with role-based access.
                    </p>
                </div>
                <Button
                    onClick={handleAddClick}
                    className="w-full gap-2 sm:w-auto"
                >
                    <Plus className="h-4 w-4" />
                    Add Staff
                </Button>
            </div>

            <div className="mt-4 space-y-3 sm:mt-6">
                {loading ? (
                    <p className="py-8 text-center text-sm text-neutral-500">
                        Loading...
                    </p>
                ) : staffList.length === 0 ? (
                    <p className="py-8 text-center text-sm text-neutral-500">
                        No staff members yet. Add your first one.
                    </p>
                ) : (
                    staffList.map((staff) => {
                        const isSelf = staff.id === currentUser?.id;

                        return (
                            <div
                                key={staff.id}
                                className="rounded-lg border bg-white p-4"
                            >
                                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                    <div className="min-w-0 flex-1">
                                        <div className="flex flex-wrap items-center gap-2">
                                            <p className="font-medium text-neutral-900">
                                                {staff.name}
                                            </p>
                                            {isSelf && (
                                                <span className="rounded-full bg-neutral-100 px-2 py-0.5 text-[10px] font-medium text-neutral-500">
                                                    You
                                                </span>
                                            )}
                                        </div>
                                        <p className="truncate text-sm text-neutral-500">
                                            {staff.email}
                                        </p>
                                        <p className="mt-0.5 text-xs text-neutral-400">
                                            Role: {staff.role?.name ?? "—"}
                                        </p>
                                    </div>

                                    <div className="flex items-center justify-between gap-3 sm:justify-end">
                                        <div className="flex items-center gap-2">
                                            <Switch
                                                checked={
                                                    staff.status === "ACTIVE"
                                                }
                                                onCheckedChange={(checked) =>
                                                    handleSwitchClick(
                                                        staff,
                                                        checked,
                                                    )
                                                }
                                                disabled={isSelf}
                                            />
                                            <span className="text-xs text-neutral-500">
                                                {staff.status === "ACTIVE"
                                                    ? "Active"
                                                    : "Inactive"}
                                            </span>
                                        </div>

                                        <div className="flex gap-1">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() =>
                                                    handleEditClick(staff)
                                                }
                                                aria-label="Edit"
                                            >
                                                <Pencil className="h-4 w-4" />
                                            </Button>
                                            {!isSelf && (
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() =>
                                                        handleDeleteClick(staff)
                                                    }
                                                    aria-label="Delete"
                                                >
                                                    <Trash2 className="h-4 w-4 text-red-600" />
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            <StaffFormDialog
                open={formOpen}
                onOpenChange={setFormOpen}
                staff={selectedStaff}
                roles={roles}
                onSuccess={fetchStaff}
            />

            <StaffStatusDialog
                open={statusOpen}
                onOpenChange={setStatusOpen}
                staff={selectedStaff}
                nextStatus={nextStatus}
                onConfirm={handleStatusConfirm}
            />

            <DeleteStaffDialog
                open={deleteOpen}
                onOpenChange={setDeleteOpen}
                staff={selectedStaff}
                onSuccess={fetchStaff}
            />
        </div>
    );
};

export default StaffPage;
