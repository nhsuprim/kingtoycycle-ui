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
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { api } from "@/lib/api";
import { showToast } from "@/lib/toast";
import type { Coupon, DiscountType } from "@/types/coupon";
import type { Category } from "@/types/category";
import type { Product } from "@/types/product";

interface CouponFormDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    coupon: Coupon | null;
    onSuccess: () => void;
}

const toDateInputValue = (isoDate: string) => isoDate.split("T")[0];

const CouponFormDialog = ({
    open,
    onOpenChange,
    coupon,
    onSuccess,
}: CouponFormDialogProps) => {
    const isEditMode = Boolean(coupon);

    const [categories, setCategories] = useState<Category[]>([]);
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(false);

    const [code, setCode] = useState("");
    const [discountType, setDiscountType] =
        useState<DiscountType>("PERCENTAGE");
    const [discountValue, setDiscountValue] = useState("");
    const [minimumOrderAmount, setMinimumOrderAmount] = useState("");
    const [maximumDiscount, setMaximumDiscount] = useState("");
    const [startDate, setStartDate] = useState("");
    const [expiryDate, setExpiryDate] = useState("");
    const [usageLimit, setUsageLimit] = useState("");
    const [perCustomerUsageLimit, setPerCustomerUsageLimit] = useState("");
    const [applicableToAll, setApplicableToAll] = useState(false);
    const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>(
        [],
    );
    const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);

    useEffect(() => {
        if (!open) return;

        const fetchData = async () => {
            try {
                const [cats, prods] = await Promise.all([
                    api.get<Category[]>("/category"),
                    api.get<Product[]>("/product"),
                ]);
                setCategories(cats);
                setProducts(prods);
            } catch {
                showToast.error("Failed to load categories/products");
            }
        };
        fetchData();

        if (coupon) {
            setCode(coupon.code);
            setDiscountType(coupon.discountType);
            setDiscountValue(coupon.discountValue.toString());
            setMinimumOrderAmount(coupon.minimumOrderAmount?.toString() ?? "");
            setMaximumDiscount(coupon.maximumDiscount?.toString() ?? "");
            setStartDate(toDateInputValue(coupon.startDate));
            setExpiryDate(toDateInputValue(coupon.expiryDate));
            setUsageLimit(coupon.usageLimit?.toString() ?? "");
            setPerCustomerUsageLimit(
                coupon.perCustomerUsageLimit?.toString() ?? "",
            );
            setApplicableToAll(coupon.applicableToAll);
            setSelectedCategoryIds(coupon.applicableCategoryIds);
            setSelectedProductIds(coupon.applicableProductIds);
        } else {
            setCode("");
            setDiscountType("PERCENTAGE");
            setDiscountValue("");
            setMinimumOrderAmount("");
            setMaximumDiscount("");
            setStartDate("");
            setExpiryDate("");
            setUsageLimit("");
            setPerCustomerUsageLimit("");
            setApplicableToAll(false);
            setSelectedCategoryIds([]);
            setSelectedProductIds([]);
        }
    }, [open, coupon]);

    const toggleCategory = (id: string) => {
        setSelectedCategoryIds((prev) =>
            prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id],
        );
    };

    const toggleProduct = (id: string) => {
        setSelectedProductIds((prev) =>
            prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id],
        );
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (
            !applicableToAll &&
            selectedCategoryIds.length === 0 &&
            selectedProductIds.length === 0
        ) {
            showToast.error(
                "Select 'Apply to all products' or choose at least one product/category",
            );
            return;
        }

        setLoading(true);

        try {
            const payload = {
                code: code.toUpperCase(),
                discountType,
                discountValue: Number(discountValue),
                minimumOrderAmount: minimumOrderAmount
                    ? Number(minimumOrderAmount)
                    : undefined,
                maximumDiscount: maximumDiscount
                    ? Number(maximumDiscount)
                    : undefined,
                startDate: new Date(`${startDate}T00:00:00.000Z`).toISOString(),
                expiryDate: new Date(
                    `${expiryDate}T23:59:59.000Z`,
                ).toISOString(),
                usageLimit: usageLimit ? Number(usageLimit) : undefined,
                perCustomerUsageLimit: perCustomerUsageLimit
                    ? Number(perCustomerUsageLimit)
                    : undefined,
                applicableToAll,
                applicableCategoryIds: applicableToAll
                    ? []
                    : selectedCategoryIds,
                applicableProductIds: applicableToAll ? [] : selectedProductIds,
            };

            if (isEditMode && coupon) {
                await api.patch(`/coupon/${coupon.id}`, payload);
                showToast.success("Coupon updated successfully");
            } else {
                await api.post("/coupon", payload);
                showToast.success("Coupon created successfully");
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
            <DialogContent className="max-h-[90vh] max-w-lg overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>
                        {isEditMode ? "Edit Coupon" : "Create Coupon"}
                    </DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="code">Coupon Code</Label>
                        <Input
                            id="code"
                            value={code}
                            onChange={(e) =>
                                setCode(e.target.value.toUpperCase())
                            }
                            placeholder="e.g. EID50"
                            required
                        />
                    </div>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="discountType">Discount Type</Label>
                            <Select
                                items={[
                                    {
                                        label: "Percentage (%)",
                                        value: "PERCENTAGE",
                                    },
                                    {
                                        label: "Fixed Amount (৳)",
                                        value: "FIXED",
                                    },
                                ]}
                                value={discountType}
                                onValueChange={(v) =>
                                    setDiscountType(v as DiscountType)
                                }
                            >
                                <SelectTrigger id="discountType">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="PERCENTAGE">
                                        Percentage (%)
                                    </SelectItem>
                                    <SelectItem value="FIXED">
                                        Fixed Amount (৳)
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="discountValue">
                                Value{" "}
                                {discountType === "PERCENTAGE" ? "(%)" : "(৳)"}
                            </Label>
                            <Input
                                id="discountValue"
                                type="number"
                                min={0}
                                value={discountValue}
                                onChange={(e) =>
                                    setDiscountValue(e.target.value)
                                }
                                required
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="minimumOrderAmount">
                                Min Order Amount (৳, optional)
                            </Label>
                            <Input
                                id="minimumOrderAmount"
                                type="number"
                                min={0}
                                value={minimumOrderAmount}
                                onChange={(e) =>
                                    setMinimumOrderAmount(e.target.value)
                                }
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="maximumDiscount">
                                Max Discount Cap (৳, optional)
                            </Label>
                            <Input
                                id="maximumDiscount"
                                type="number"
                                min={0}
                                value={maximumDiscount}
                                onChange={(e) =>
                                    setMaximumDiscount(e.target.value)
                                }
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="startDate">Start Date</Label>
                            <Input
                                id="startDate"
                                type="date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="expiryDate">Expiry Date</Label>
                            <Input
                                id="expiryDate"
                                type="date"
                                value={expiryDate}
                                onChange={(e) => setExpiryDate(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="usageLimit">
                                Total Usage Limit (optional)
                            </Label>
                            <Input
                                id="usageLimit"
                                type="number"
                                min={1}
                                value={usageLimit}
                                onChange={(e) => setUsageLimit(e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="perCustomerUsageLimit">
                                Per Customer Limit (optional)
                            </Label>
                            <Input
                                id="perCustomerUsageLimit"
                                type="number"
                                min={1}
                                value={perCustomerUsageLimit}
                                onChange={(e) =>
                                    setPerCustomerUsageLimit(e.target.value)
                                }
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-2 rounded-lg border p-3">
                        <Switch
                            id="applicableToAll"
                            checked={applicableToAll}
                            onCheckedChange={setApplicableToAll}
                        />
                        <Label
                            htmlFor="applicableToAll"
                            className="cursor-pointer font-normal"
                        >
                            Apply to all products
                        </Label>
                    </div>

                    {!applicableToAll && (
                        <>
                            <div className="space-y-2">
                                <Label>Applicable Categories</Label>
                                <div className="max-h-32 space-y-1 overflow-y-auto rounded-lg border p-2">
                                    {categories.length === 0 ? (
                                        <p className="text-sm text-neutral-400">
                                            No categories found
                                        </p>
                                    ) : (
                                        categories.map((cat) => (
                                            <div
                                                key={cat.id}
                                                className="flex items-center gap-2 py-1"
                                            >
                                                <Checkbox
                                                    id={`cat-${cat.id}`}
                                                    checked={selectedCategoryIds.includes(
                                                        cat.id,
                                                    )}
                                                    onCheckedChange={() =>
                                                        toggleCategory(cat.id)
                                                    }
                                                />
                                                <Label
                                                    htmlFor={`cat-${cat.id}`}
                                                    className="cursor-pointer text-sm font-normal"
                                                >
                                                    {cat.name}
                                                </Label>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label>Applicable Products</Label>
                                <div className="max-h-32 space-y-1 overflow-y-auto rounded-lg border p-2">
                                    {products.length === 0 ? (
                                        <p className="text-sm text-neutral-400">
                                            No products found
                                        </p>
                                    ) : (
                                        products.map((prod) => (
                                            <div
                                                key={prod.id}
                                                className="flex items-center gap-2 py-1"
                                            >
                                                <Checkbox
                                                    id={`prod-${prod.id}`}
                                                    checked={selectedProductIds.includes(
                                                        prod.id,
                                                    )}
                                                    onCheckedChange={() =>
                                                        toggleProduct(prod.id)
                                                    }
                                                />
                                                <Label
                                                    htmlFor={`prod-${prod.id}`}
                                                    className="cursor-pointer text-sm font-normal"
                                                >
                                                    {prod.name}
                                                </Label>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        </>
                    )}

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
                                  : "Create"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export default CouponFormDialog;
