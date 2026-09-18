"use client";

import { useEffect, useState, useCallback } from "react";
import { Truck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { api } from "@/lib/api";
import { showToast } from "@/lib/toast";
import type { ShippingSettings } from "@/types/shipping";
import FreeDeliveryConfirmDialog from "@/components/admin/shipping/FreeDeliveryConfirmDialog";

const ShippingSettingsPage = () => {
    const [settings, setSettings] = useState<ShippingSettings | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [insideDhakaCharge, setInsideDhakaCharge] = useState("");
    const [outsideDhakaCharge, setOutsideDhakaCharge] = useState("");

    const [freeDeliveryDialogOpen, setFreeDeliveryDialogOpen] = useState(false);
    const [pendingFreeDeliveryValue, setPendingFreeDeliveryValue] =
        useState(false);

    const fetchSettings = useCallback(async () => {
        setLoading(true);
        try {
            const data = await api.get<ShippingSettings>("/shipping");
            setSettings(data);
            setInsideDhakaCharge(data.insideDhakaCharge.toString());
            setOutsideDhakaCharge(data.outsideDhakaCharge.toString());
        } catch (err) {
            showToast.error(
                err instanceof Error
                    ? err.message
                    : "Failed to load shipping settings",
            );
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchSettings();
    }, [fetchSettings]);

    const handleSaveCharges = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);

        try {
            const updated = await api.patch<ShippingSettings>("/shipping", {
                insideDhakaCharge: Number(insideDhakaCharge),
                outsideDhakaCharge: Number(outsideDhakaCharge),
            });
            setSettings(updated);
            showToast.success("Shipping charges updated successfully");
        } catch (err) {
            showToast.error(
                err instanceof Error ? err.message : "Could not update charges",
            );
        } finally {
            setSaving(false);
        }
    };

    const handleFreeDeliverySwitchClick = (checked: boolean) => {
        setPendingFreeDeliveryValue(checked);
        setFreeDeliveryDialogOpen(true);
    };

    const handleFreeDeliveryConfirm = async () => {
        try {
            const updated = await api.patch<ShippingSettings>("/shipping", {
                freeDeliveryEnabled: pendingFreeDeliveryValue,
            });
            setSettings(updated);
            showToast.success(
                pendingFreeDeliveryValue
                    ? "Free delivery enabled"
                    : "Free delivery disabled",
            );
        } catch (err) {
            showToast.error(
                err instanceof Error
                    ? err.message
                    : "Could not update free delivery setting",
            );
        } finally {
            setFreeDeliveryDialogOpen(false);
        }
    };

    if (loading) {
        return <p className="text-sm text-neutral-500">Loading...</p>;
    }

    return (
        <div className="max-w-xl">
            <div>
                <h1 className="text-xl font-bold sm:text-2xl">
                    Shipping Settings
                </h1>
                <p className="mt-1 text-sm text-neutral-500">
                    Configure delivery charges shown to customers at checkout.
                </p>
            </div>

            {/* Free Delivery toggle — sensitive, tai alada card + confirm dialog */}
            <div className="mt-6 rounded-lg border bg-white p-4">
                <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-green-100 text-green-700">
                            <Truck className="h-4 w-4" />
                        </div>
                        <div>
                            <p className="text-sm font-semibold text-neutral-900">
                                Free Delivery
                            </p>
                            <p className="mt-0.5 text-xs text-neutral-500">
                                When enabled, all orders get free shipping
                                regardless of the charges below.
                            </p>
                        </div>
                    </div>
                    <Switch
                        checked={settings?.freeDeliveryEnabled ?? false}
                        onCheckedChange={handleFreeDeliverySwitchClick}
                        className="shrink-0"
                    />
                </div>
            </div>

            {/* Charges form */}
            <form
                onSubmit={handleSaveCharges}
                className="mt-4 space-y-4 rounded-lg border bg-white p-4"
            >
                <div>
                    <p className="text-sm font-semibold text-neutral-900">
                        Delivery Charges
                    </p>
                    <p className="mt-0.5 text-xs text-neutral-500">
                        {settings?.freeDeliveryEnabled
                            ? "These charges are currently ignored because Free Delivery is enabled."
                            : "Applied automatically based on the customer's selected delivery area."}
                    </p>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                        <Label htmlFor="insideDhaka">Inside Dhaka (৳)</Label>
                        <Input
                            id="insideDhaka"
                            type="number"
                            min={0}
                            value={insideDhakaCharge}
                            onChange={(e) =>
                                setInsideDhakaCharge(e.target.value)
                            }
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="outsideDhaka">Outside Dhaka (৳)</Label>
                        <Input
                            id="outsideDhaka"
                            type="number"
                            min={0}
                            value={outsideDhakaCharge}
                            onChange={(e) =>
                                setOutsideDhakaCharge(e.target.value)
                            }
                            required
                        />
                    </div>
                </div>

                <Button
                    type="submit"
                    disabled={saving}
                    className="w-full sm:w-auto"
                >
                    {saving ? "Saving..." : "Save Changes"}
                </Button>
            </form>

            <FreeDeliveryConfirmDialog
                open={freeDeliveryDialogOpen}
                onOpenChange={setFreeDeliveryDialogOpen}
                nextValue={pendingFreeDeliveryValue}
                onConfirm={handleFreeDeliveryConfirm}
            />
        </div>
    );
};

export default ShippingSettingsPage;
