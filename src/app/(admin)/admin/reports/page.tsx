"use client";

import { useEffect, useState, useCallback } from "react";
import {
    LineChart,
    Line,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from "recharts";
import { api } from "@/lib/api";
import { showToast } from "@/lib/toast";
import { exportToCsv } from "@/lib/csv";
import { orderStatusColors } from "@/lib/order-utils";
import type { OrderStatus } from "@/types/order";
import type {
    ReportSummary,
    OrderStatusBreakdown,
    TopProduct,
    WorstProduct,
    DailySales,
    CouponUsageStats,
    PeriodComparison,
    CategoryRevenue,
    StockOverviewItem,
    CustomerTypeBreakdown,
    TopCustomer,
    AreaBreakdown,
    CouponPerformance,
    ProductFunnelStat,
} from "@/types/report";
import StatCard from "@/components/admin/dashboard/StatCard";
import StatusBadge from "@/components/admin/order/StatusBadge";
import GrowthIndicator from "@/components/admin/reports/GrowthIndicator";
import ReportFilters from "@/components/admin/reports/ReportFilters";
import SectionCard from "@/components/admin/reports/SectionCard";
import {
    Wallet,
    ShoppingBag,
    Users,
    TrendingUp,
    CheckCircle2,
    XCircle,
    Ticket,
} from "lucide-react";

const formatCurrency = (n: number) => `৳${n.toLocaleString()}`;
const formatChartDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
    });

const STOCK_LABELS: Record<string, string> = {
    IN_STOCK: "In Stock",
    OUT_OF_STOCK: "Out of Stock",
    DISCONTINUED: "Discontinued",
};

const ReportsPage = () => {
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [loading, setLoading] = useState(true);

    const [summary, setSummary] = useState<ReportSummary | null>(null);
    const [statusBreakdown, setStatusBreakdown] = useState<
        OrderStatusBreakdown[]
    >([]);
    const [topProducts, setTopProducts] = useState<TopProduct[]>([]);
    const [worstProducts, setWorstProducts] = useState<WorstProduct[]>([]);
    const [salesByDate, setSalesByDate] = useState<DailySales[]>([]);
    const [couponStats, setCouponStats] = useState<CouponUsageStats | null>(
        null,
    );
    const [periodComparison, setPeriodComparison] =
        useState<PeriodComparison | null>(null);
    const [categoryRevenue, setCategoryRevenue] = useState<CategoryRevenue[]>(
        [],
    );
    const [stockOverview, setStockOverview] = useState<StockOverviewItem[]>([]);
    const [customerType, setCustomerType] =
        useState<CustomerTypeBreakdown | null>(null);
    const [topCustomers, setTopCustomers] = useState<TopCustomer[]>([]);
    const [areaBreakdown, setAreaBreakdown] = useState<AreaBreakdown[]>([]);
    const [couponPerformance, setCouponPerformance] = useState<
        CouponPerformance[]
    >([]);
    const [productFunnel, setProductFunnel] = useState<ProductFunnelStat[]>([]);

    const buildQuery = useCallback(() => {
        const params = new URLSearchParams();
        if (startDate) params.set("startDate", startDate);
        if (endDate) params.set("endDate", endDate);
        return params.toString();
    }, [startDate, endDate]);

    const fetchAll = useCallback(async () => {
        setLoading(true);
        const q = buildQuery();
        const qs = q ? `?${q}` : "";

        try {
            const [
                summaryData,
                statusData,
                topProductsData,
                worstProductsData,
                salesData,
                couponData,
                comparisonData,
                categoryData,
                stockData,
                customerTypeData,
                topCustomersData,
                areaData,
                couponPerfData,
                funnelData,
            ] = await Promise.all([
                api.get<ReportSummary>(`/report/summary${qs}`),
                api.get<OrderStatusBreakdown[]>(`/report/order-status${qs}`),
                api.get<TopProduct[]>(
                    `/report/top-products${qs ? `${qs}&limit=10` : "?limit=10"}`,
                ),
                api.get<WorstProduct[]>(
                    `/report/worst-products${qs ? `${qs}&limit=10` : "?limit=10"}`,
                ),
                api.get<DailySales[]>(`/report/sales-by-date${qs}`),
                api.get<CouponUsageStats>(`/report/coupon-usage${qs}`),
                api.get<PeriodComparison>(`/report/period-comparison${qs}`),
                api.get<CategoryRevenue[]>(`/report/revenue-by-category${qs}`),
                api.get<StockOverviewItem[]>("/report/stock-overview"),
                api.get<CustomerTypeBreakdown>(`/report/customer-type${qs}`),
                api.get<TopCustomer[]>(
                    `/report/top-customers${qs ? `${qs}&limit=10` : "?limit=10"}`,
                ),
                api.get<AreaBreakdown[]>(`/report/area-breakdown${qs}`),
                api.get<CouponPerformance[]>(`/report/coupon-performance${qs}`),
                api.get<ProductFunnelStat[]>(`/event/product-stats${qs}`),
            ]);

            setSummary(summaryData);
            setStatusBreakdown(statusData);
            setTopProducts(topProductsData);
            setWorstProducts(worstProductsData);
            setSalesByDate(salesData);
            setCouponStats(couponData);
            setPeriodComparison(comparisonData);
            setCategoryRevenue(categoryData);
            setStockOverview(stockData);
            setCustomerType(customerTypeData);
            setTopCustomers(topCustomersData);
            setAreaBreakdown(areaData);
            setCouponPerformance(couponPerfData);
            setProductFunnel(funnelData);
        } catch (err) {
            showToast.error(
                err instanceof Error ? err.message : "Failed to load reports",
            );
        } finally {
            setLoading(false);
        }
    }, [buildQuery]);

    useEffect(() => {
        fetchAll();
    }, [fetchAll]);

    const handleClearFilters = () => {
        setStartDate("");
        setEndDate("");
    };

    if (loading) {
        return <p className="text-sm text-neutral-500">Loading reports...</p>;
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-xl font-bold sm:text-2xl">
                    Reports & Analytics
                </h1>
                <p className="mt-1 text-sm text-neutral-500">
                    Detailed performance insights for your store.
                </p>
            </div>

            <ReportFilters
                startDate={startDate}
                endDate={endDate}
                onStartDateChange={setStartDate}
                onEndDateChange={setEndDate}
                onClear={handleClearFilters}
            />

            {/* Period Comparison */}
            {periodComparison && (
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <div className="rounded-lg border bg-white p-4">
                        <p className="text-xs font-medium text-neutral-500">
                            Revenue vs Previous Period
                        </p>
                        <div className="mt-2 flex items-center gap-3">
                            <span className="text-xl font-bold">
                                {formatCurrency(
                                    periodComparison.current.revenue,
                                )}
                            </span>
                            <GrowthIndicator
                                percent={periodComparison.revenueGrowthPercent}
                            />
                        </div>
                        <p className="mt-1 text-xs text-neutral-400">
                            Previous:{" "}
                            {formatCurrency(periodComparison.previous.revenue)}
                        </p>
                    </div>
                    <div className="rounded-lg border bg-white p-4">
                        <p className="text-xs font-medium text-neutral-500">
                            Orders vs Previous Period
                        </p>
                        <div className="mt-2 flex items-center gap-3">
                            <span className="text-xl font-bold">
                                {periodComparison.current.orderCount}
                            </span>
                            <GrowthIndicator
                                percent={periodComparison.orderGrowthPercent}
                            />
                        </div>
                        <p className="mt-1 text-xs text-neutral-400">
                            Previous: {periodComparison.previous.orderCount}
                        </p>
                    </div>
                </div>
            )}

            {/* Summary Cards */}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <StatCard
                    label="Total Revenue"
                    value={formatCurrency(summary?.totalRevenue ?? 0)}
                    icon={Wallet}
                    accentClass="bg-green-100 text-green-700"
                />
                <StatCard
                    label="Total Orders"
                    value={(summary?.totalOrders ?? 0).toString()}
                    icon={ShoppingBag}
                    accentClass="bg-blue-100 text-blue-700"
                />
                <StatCard
                    label="Unique Customers"
                    value={(summary?.uniqueCustomers ?? 0).toString()}
                    icon={Users}
                    accentClass="bg-indigo-100 text-indigo-700"
                />
                <StatCard
                    label="Avg. Order Value"
                    value={formatCurrency(summary?.averageOrderValue ?? 0)}
                    icon={TrendingUp}
                    accentClass="bg-purple-100 text-purple-700"
                />
                <StatCard
                    label="Paid Orders"
                    value={(summary?.paidCount ?? 0).toString()}
                    icon={CheckCircle2}
                    accentClass="bg-green-100 text-green-700"
                />
                <StatCard
                    label="Unpaid Orders"
                    value={(summary?.unpaidCount ?? 0).toString()}
                    icon={XCircle}
                    accentClass="bg-yellow-100 text-yellow-700"
                />
                <StatCard
                    label="Cancelled Orders"
                    value={(summary?.cancelledCount ?? 0).toString()}
                    icon={XCircle}
                    accentClass="bg-red-100 text-red-700"
                />
                <StatCard
                    label="Coupon Discounts Given"
                    value={formatCurrency(couponStats?.totalDiscountGiven ?? 0)}
                    icon={Ticket}
                    accentClass="bg-pink-100 text-pink-700"
                />
            </div>

            {/* Sales Trend */}
            <SectionCard
                title="Sales Trend"
                onExport={() => exportToCsv("sales-trend", salesByDate)}
            >
                <div className="h-64 w-full sm:h-80">
                    {salesByDate.length === 0 ? (
                        <div className="flex h-full items-center justify-center text-sm text-neutral-400">
                            No sales data yet.
                        </div>
                    ) : (
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart
                                data={salesByDate}
                                margin={{
                                    top: 5,
                                    right: 10,
                                    left: 0,
                                    bottom: 0,
                                }}
                            >
                                <CartesianGrid
                                    strokeDasharray="3 3"
                                    stroke="#f0f0f0"
                                />
                                <XAxis
                                    dataKey="date"
                                    tickFormatter={formatChartDate}
                                    fontSize={12}
                                    tickMargin={8}
                                />
                                <YAxis fontSize={12} width={45} />
                                <Tooltip
                                    labelFormatter={(v) =>
                                        formatChartDate(v as string)
                                    }
                                    formatter={(value) => [
                                        formatCurrency(Number(value ?? 0)),
                                        "Revenue",
                                    ]}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="revenue"
                                    stroke="#171717"
                                    strokeWidth={2}
                                    dot={false}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    )}
                </div>
            </SectionCard>

            {/* Revenue by Category */}
            <SectionCard
                title="Revenue by Category"
                onExport={() =>
                    exportToCsv("revenue-by-category", categoryRevenue)
                }
            >
                <div className="h-64 w-full sm:h-72">
                    {categoryRevenue.length === 0 ? (
                        <div className="flex h-full items-center justify-center text-sm text-neutral-400">
                            No data yet.
                        </div>
                    ) : (
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                                data={categoryRevenue}
                                margin={{
                                    top: 5,
                                    right: 10,
                                    left: 0,
                                    bottom: 0,
                                }}
                            >
                                <CartesianGrid
                                    strokeDasharray="3 3"
                                    stroke="#f0f0f0"
                                />
                                <XAxis
                                    dataKey="categoryName"
                                    fontSize={11}
                                    tickMargin={8}
                                />
                                <YAxis fontSize={12} width={45} />
                                <Tooltip
                                    labelFormatter={(v) =>
                                        formatChartDate(v as string)
                                    }
                                    formatter={(value) => [
                                        formatCurrency(Number(value ?? 0)),
                                        "Revenue",
                                    ]}
                                />
                                <Bar
                                    dataKey="revenue"
                                    fill="#171717"
                                    radius={[4, 4, 0, 0]}
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    )}
                </div>
            </SectionCard>

            {/* Order Status + Stock Overview */}
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                <SectionCard title="Order Status Breakdown">
                    <div className="space-y-2">
                        {statusBreakdown.length === 0 ? (
                            <p className="text-sm text-neutral-400">
                                No orders yet.
                            </p>
                        ) : (
                            statusBreakdown.map((item) => (
                                <div
                                    key={item.status}
                                    className="flex items-center justify-between rounded-md border px-3 py-2"
                                >
                                    <StatusBadge
                                        label={item.status}
                                        colorClasses={
                                            orderStatusColors[
                                                item.status as OrderStatus
                                            ]
                                        }
                                    />
                                    <span className="text-sm font-semibold">
                                        {item.count}
                                    </span>
                                </div>
                            ))
                        )}
                    </div>
                </SectionCard>

                <SectionCard title="Stock Status Overview">
                    <div className="space-y-2">
                        {stockOverview.length === 0 ? (
                            <p className="text-sm text-neutral-400">
                                No products yet.
                            </p>
                        ) : (
                            stockOverview.map((item) => (
                                <div
                                    key={item.status}
                                    className="flex items-center justify-between rounded-md border px-3 py-2"
                                >
                                    <span className="text-sm font-medium">
                                        {STOCK_LABELS[item.status]}
                                    </span>
                                    <span className="text-sm font-semibold">
                                        {item.count}
                                    </span>
                                </div>
                            ))
                        )}
                    </div>
                </SectionCard>
            </div>

            {/* Top + Worst Products */}
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                <SectionCard
                    title="Top Selling Products"
                    onExport={() => exportToCsv("top-products", topProducts)}
                >
                    <div className="space-y-2">
                        {topProducts.length === 0 ? (
                            <p className="text-sm text-neutral-400">
                                No sales data yet.
                            </p>
                        ) : (
                            topProducts.map((product, i) => (
                                <div
                                    key={product.productId}
                                    className="flex items-center justify-between gap-3 rounded-md border px-3 py-2"
                                >
                                    <div className="flex min-w-0 items-center gap-2">
                                        <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-green-600 text-[10px] font-bold text-white">
                                            {i + 1}
                                        </span>
                                        <span className="truncate text-sm font-medium">
                                            {product.productName}
                                        </span>
                                    </div>
                                    <div className="shrink-0 text-right">
                                        <p className="text-sm font-semibold">
                                            {formatCurrency(
                                                product.totalRevenue,
                                            )}
                                        </p>
                                        <p className="text-xs text-neutral-400">
                                            {product.totalQuantity} sold
                                        </p>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </SectionCard>

                <SectionCard
                    title="Slow-Moving Products"
                    onExport={() =>
                        exportToCsv("worst-products", worstProducts)
                    }
                >
                    <div className="space-y-2">
                        {worstProducts.length === 0 ? (
                            <p className="text-sm text-neutral-400">
                                No products yet.
                            </p>
                        ) : (
                            worstProducts.map((product, i) => (
                                <div
                                    key={product.productId}
                                    className="flex items-center justify-between gap-3 rounded-md border px-3 py-2"
                                >
                                    <div className="flex min-w-0 items-center gap-2">
                                        <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-red-600 text-[10px] font-bold text-white">
                                            {i + 1}
                                        </span>
                                        <span className="truncate text-sm font-medium">
                                            {product.productName}
                                        </span>
                                    </div>
                                    <div className="shrink-0 text-right">
                                        <p className="text-sm font-semibold">
                                            {formatCurrency(
                                                product.totalRevenue,
                                            )}
                                        </p>
                                        <p className="text-xs text-neutral-400">
                                            {product.totalQuantity} sold
                                        </p>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </SectionCard>
            </div>

            {/* Customer Analytics */}
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                <SectionCard title="Customer Type">
                    <div className="grid grid-cols-2 gap-3">
                        <div className="rounded-md border p-3 text-center">
                            <p className="text-2xl font-bold text-green-600">
                                {customerType?.newCustomers ?? 0}
                            </p>
                            <p className="mt-1 text-xs text-neutral-500">
                                New Customers
                            </p>
                        </div>
                        <div className="rounded-md border p-3 text-center">
                            <p className="text-2xl font-bold text-blue-600">
                                {customerType?.returningCustomers ?? 0}
                            </p>
                            <p className="mt-1 text-xs text-neutral-500">
                                Returning Customers
                            </p>
                        </div>
                    </div>
                </SectionCard>

                <SectionCard title="Orders by Area">
                    <div className="space-y-2">
                        {areaBreakdown.length === 0 ? (
                            <p className="text-sm text-neutral-400">
                                No orders yet.
                            </p>
                        ) : (
                            areaBreakdown.map((item) => (
                                <div
                                    key={item.area}
                                    className="flex items-center justify-between rounded-md border px-3 py-2"
                                >
                                    <span className="text-sm font-medium">
                                        {item.area === "DHAKA"
                                            ? "Inside Dhaka"
                                            : "Outside Dhaka"}
                                    </span>
                                    <div className="text-right">
                                        <p className="text-sm font-semibold">
                                            {formatCurrency(item.revenue)}
                                        </p>
                                        <p className="text-xs text-neutral-400">
                                            {item.orderCount} orders
                                        </p>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </SectionCard>
            </div>

            {/* Top Customers */}
            <SectionCard
                title="Top Customers by Spend"
                onExport={() => exportToCsv("top-customers", topCustomers)}
            >
                <div className="space-y-2">
                    {topCustomers.length === 0 ? (
                        <p className="text-sm text-neutral-400">
                            No customers yet.
                        </p>
                    ) : (
                        topCustomers.map((customer, i) => (
                            <div
                                key={customer.phone}
                                className="flex items-center justify-between gap-3 rounded-md border px-3 py-2"
                            >
                                <div className="flex min-w-0 items-center gap-2">
                                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-neutral-900 text-[10px] font-bold text-white">
                                        {i + 1}
                                    </span>
                                    <div className="min-w-0">
                                        <p className="truncate text-sm font-medium">
                                            {customer.customerName}
                                        </p>
                                        <p className="text-xs text-neutral-400">
                                            {customer.phone}
                                        </p>
                                    </div>
                                </div>
                                <div className="shrink-0 text-right">
                                    <p className="text-sm font-semibold">
                                        {formatCurrency(customer.totalSpent)}
                                    </p>
                                    <p className="text-xs text-neutral-400">
                                        {customer.orderCount} orders
                                    </p>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </SectionCard>

            {/* Coupon Performance */}
            <SectionCard
                title="Coupon Performance"
                onExport={() =>
                    exportToCsv("coupon-performance", couponPerformance)
                }
            >
                <div className="space-y-2">
                    {couponPerformance.length === 0 ? (
                        <p className="text-sm text-neutral-400">
                            No coupon usage yet.
                        </p>
                    ) : (
                        couponPerformance.map((coupon) => (
                            <div
                                key={coupon.couponId}
                                className="flex items-center justify-between rounded-md border px-3 py-2"
                            >
                                <span className="font-mono text-sm font-medium">
                                    {coupon.code}
                                </span>
                                <div className="text-right">
                                    <p className="text-sm font-semibold">
                                        {formatCurrency(coupon.totalDiscount)}
                                    </p>
                                    <p className="text-xs text-neutral-400">
                                        {coupon.orderCount} orders
                                    </p>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </SectionCard>

            {/* Product Funnel (from Event module) */}
            <SectionCard
                title="Product Conversion Funnel"
                onExport={() =>
                    exportToCsv(
                        "product-funnel",
                        productFunnel.map((p) => ({
                            productName: p.productName,
                            sku: p.sku,
                            views: p.funnel.productView,
                            addToCart: p.funnel.addToCart,
                            purchases: p.funnel.purchase,
                            viewToCartRate: p.funnel.viewToCartRate,
                            cartToPurchaseRate: p.funnel.cartToPurchaseRate,
                            viewToPurchaseRate: p.funnel.viewToPurchaseRate,
                        })),
                    )
                }
            >
                <div className="overflow-x-auto">
                    {productFunnel.length === 0 ? (
                        <p className="text-sm text-neutral-400">
                            No event tracking data yet. This will populate once
                            customer events (product views, cart additions,
                            purchases) start being logged.
                        </p>
                    ) : (
                        <table className="w-full min-w-150 text-sm">
                            <thead>
                                <tr className="border-b text-left text-xs text-neutral-500">
                                    <th className="pb-2 font-medium">
                                        Product
                                    </th>
                                    <th className="pb-2 font-medium">Views</th>
                                    <th className="pb-2 font-medium">Cart</th>
                                    <th className="pb-2 font-medium">
                                        Purchases
                                    </th>
                                    <th className="pb-2 font-medium">
                                        View→Cart
                                    </th>
                                    <th className="pb-2 font-medium">
                                        Cart→Purchase
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {productFunnel.map((p) => (
                                    <tr key={p.productId}>
                                        <td className="py-2 pr-2 font-medium">
                                            {p.productName}
                                        </td>
                                        <td className="py-2">
                                            {p.funnel.productView}
                                        </td>
                                        <td className="py-2">
                                            {p.funnel.addToCart}
                                        </td>
                                        <td className="py-2">
                                            {p.funnel.purchase}
                                        </td>
                                        <td className="py-2">
                                            {p.funnel.viewToCartRate}%
                                        </td>
                                        <td className="py-2">
                                            {p.funnel.cartToPurchaseRate}%
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </SectionCard>
        </div>
    );
};

export default ReportsPage;
