export type DiscountType = "PERCENTAGE" | "FIXED";

export interface Coupon {
    id: string;
    code: string;
    discountType: DiscountType;
    discountValue: number;
    minimumOrderAmount?: number;
    maximumDiscount?: number;
    startDate: string;
    expiryDate: string;
    usageLimit?: number;
    perCustomerUsageLimit?: number;
    applicableToAll: boolean;
    applicableProductIds: string[];
    applicableCategoryIds: string[];
    status: "ACTIVE" | "INACTIVE";
}
