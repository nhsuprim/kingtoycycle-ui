"use client";

import { useEffect, useState, type FormEvent } from "react";

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

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

import { api } from "@/lib/api";
import { showToast } from "@/lib/toast";
import type { Staff, Role } from "@/types/staff";

interface StaffFormDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    staff: Staff | null;
    roles: Role[];
    onSuccess: () => void;
}

const StaffFormDialog = ({
    open,
    onOpenChange,
    staff,
    roles,
    onSuccess,
}: StaffFormDialogProps) => {
    const isEditMode = Boolean(staff);

    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [roleId, setRoleId] = useState("");
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (open) {
            setName(staff?.name ?? "");
            setEmail(staff?.email ?? "");
            setPassword("");
            setRoleId(staff?.roleId ?? "");
        }
    }, [open, staff]);

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (!name.trim()) {
            showToast.error("Please enter staff name");
            return;
        }

        if (!email.trim()) {
            showToast.error("Please enter email");
            return;
        }

        if (!roleId) {
            showToast.error("Please select a role");
            return;
        }

        if (!isEditMode && password.length < 6) {
            showToast.error("Password must be at least 6 characters");
            return;
        }

        setLoading(true);

        try {
            if (isEditMode && staff) {
                await api.patch(`/users/${staff.id}`, {
                    name: name.trim(),
                    email: email.trim(),
                    roleId,
                });

                showToast.success("Staff member updated successfully");
            } else {
                await api.post("/users", {
                    name: name.trim(),
                    email: email.trim(),
                    password,
                    roleId,
                });

                showToast.success("Staff member created successfully");
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
                        {isEditMode ? "Edit Staff Member" : "Add Staff Member"}
                    </DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Name */}
                    <div className="space-y-2">
                        <Label htmlFor="name">Full Name</Label>

                        <Input
                            id="name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Enter full name"
                            required
                            disabled={loading}
                        />
                    </div>

                    {/* Email */}
                    <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>

                        <Input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Enter email address"
                            required
                            disabled={loading}
                        />
                    </div>

                    {/* Password - only create mode */}
                    {!isEditMode && (
                        <div className="space-y-2">
                            <Label htmlFor="password">Password</Label>

                            <Input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Enter password"
                                minLength={6}
                                required
                                disabled={loading}
                            />
                        </div>
                    )}

                    {/* Role */}
                    <div className="space-y-2">
                        <Label htmlFor="role">Role</Label>

                        <Select
                            items={roles.map((role) => ({
                                label: role.name,
                                value: role.id,
                            }))}
                            value={roleId}
                            onValueChange={(value) => {
                                if (value !== null) {
                                    setRoleId(value);
                                }
                            }}
                        >
                            <SelectTrigger id="role" disabled={loading}>
                                <SelectValue placeholder="Select a role" />
                            </SelectTrigger>

                            <SelectContent>
                                {roles.map((role) => (
                                    <SelectItem key={role.id} value={role.id}>
                                        {role.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Footer */}
                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                            disabled={loading}
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

export default StaffFormDialog;
