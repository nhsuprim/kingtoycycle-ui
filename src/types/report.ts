export interface ReportSummary {
    totalRevenue: number;
    totalOrders: number;
    uniqueCustomers: number;
    averageOrderValue: number;
    paidCount: number;
    unpaidCount: number;
    cancelledCount: number;
}

export interface OrderStatusBreakdown {
    status: string;
    count: number;
}

export interface TopProduct {
    productId: string;
    productName: string;
    totalQuantity: number;
    totalRevenue: number;
}

export interface WorstProduct {
    productId: string;
    productName: string;
    sku: string;
    totalQuantity: number;
    totalRevenue: number;
}

export interface DailySales {
    date: string;
    revenue: number;
    orderCount: number;
}

export interface CouponUsageStats {
    totalCouponOrders: number;
    totalDiscountGiven: number;
}

export interface PeriodComparison {
    current: { revenue: number; orderCount: number };
    previous: { revenue: number; orderCount: number };
    revenueGrowthPercent: number;
    orderGrowthPercent: number;
}

export interface CategoryRevenue {
    categoryName: string;
    revenue: number;
    quantity: number;
}

export interface StockOverviewItem {
    status: "IN_STOCK" | "OUT_OF_STOCK" | "DISCONTINUED";
    count: number;
}

export interface CustomerTypeBreakdown {
    newCustomers: number;
    returningCustomers: number;
}

export interface TopCustomer {
    phone: string;
    customerName: string;
    totalSpent: number;
    orderCount: number;
}

export interface AreaBreakdown {
    area: string;
    orderCount: number;
    revenue: number;
}

export interface CouponPerformance {
    couponId: string;
    code: string;
    orderCount: number;
    totalDiscount: number;
}

export interface ProductFunnelStat {
    productId: string;
    productName: string;
    sku: string;
    thumbnailImage: string;
    events: Record<string, number>;
    funnel: {
        productView: number;
        addToCart: number;
        purchase: number;
        viewToCartRate: number;
        cartToPurchaseRate: number;
        viewToPurchaseRate: number;
    };
    totalEvents: number;
}
