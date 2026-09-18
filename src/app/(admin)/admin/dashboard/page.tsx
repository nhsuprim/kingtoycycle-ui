"use client";

import { useEffect, useState } from "react";
import {
    Wallet,
    ShoppingBag,
    Users,
    TrendingUp,
    CheckCircle2,
    XCircle,
    Ticket,
} from "lucide-react";

import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from "recharts";

import { api } from "@/lib/api";
import { showToast } from "@/lib/toast";
import { orderStatusColors } from "@/lib/order-utils";

import type { OrderStatus } from "@/types/order";

import type {
    ReportSummary,
    OrderStatusBreakdown,
    TopProduct,
    DailySales,
    CouponUsageStats,
} from "@/types/report";

import StatCard from "@/components/admin/dashboard/StatCard";
import StatusBadge from "@/components/admin/order/StatusBadge";

const formatCurrency = (n: number) => `৳${n.toLocaleString()}`;

const formatChartDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
    });

const DashboardPage = () => {
    const [summary, setSummary] = useState<ReportSummary | null>(null);

    const [statusBreakdown, setStatusBreakdown] = useState<
        OrderStatusBreakdown[]
    >([]);

    const [topProducts, setTopProducts] = useState<TopProduct[]>([]);

    const [salesByDate, setSalesByDate] = useState<DailySales[]>([]);

    const [couponStats, setCouponStats] = useState<CouponUsageStats | null>(
        null,
    );

    const [loading, setLoading] = useState(true);

    // Fetch dashboard data
    useEffect(() => {
        const fetchAll = async () => {
            setLoading(true);

            try {
                const [
                    summaryData,
                    statusData,
                    productsData,
                    salesData,
                    couponData,
                ] = await Promise.all([
                    api.get<ReportSummary>("/report/summary"),

                    api.get<OrderStatusBreakdown[]>("/report/order-status"),

                    api.get<TopProduct[]>("/report/top-products?limit=5"),

                    api.get<DailySales[]>("/report/sales-by-date"),

                    api.get<CouponUsageStats>("/report/coupon-usage"),
                ]);

                setSummary(summaryData);
                setStatusBreakdown(statusData);
                setTopProducts(productsData);
                setSalesByDate(salesData);
                setCouponStats(couponData);
            } catch (err) {
                showToast.error(
                    err instanceof Error
                        ? err.message
                        : "Failed to load dashboard data",
                );
            } finally {
                setLoading(false);
            }
        };

        fetchAll();
    }, []);

    if (loading) {
        return <p className="text-sm text-neutral-500">Loading dashboard...</p>;
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-xl font-bold sm:text-2xl">Dashboard</h1>

                <p className="mt-1 text-sm text-neutral-500">
                    Overview of your store&apos;s performance.
                </p>
            </div>

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

            {/* Sales Trend Chart */}
            <div className="rounded-lg border bg-white p-4">
                <h2 className="text-sm font-semibold text-neutral-900">
                    Sales Trend
                </h2>

                <div className="mt-4 h-64 w-full sm:h-80">
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
                                    labelFormatter={(value) =>
                                        formatChartDate(String(value))
                                    }
                                    formatter={(value) => [
                                        formatCurrency(
                                            typeof value === "number"
                                                ? value
                                                : Number(value ?? 0),
                                        ),
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
            </div>

            {/* Order Status + Top Products */}
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                {/* Order Status Breakdown */}
                <div className="rounded-lg border bg-white p-4">
                    <h2 className="text-sm font-semibold text-neutral-900">
                        Order Status Breakdown
                    </h2>

                    <div className="mt-3 space-y-2">
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
                </div>

                {/* Top Selling Products */}
                <div className="rounded-lg border bg-white p-4">
                    <h2 className="text-sm font-semibold text-neutral-900">
                        Top Selling Products
                    </h2>

                    <div className="mt-3 space-y-2">
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
                                        <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-neutral-900 text-[10px] font-bold text-white">
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
                </div>
            </div>
        </div>
    );
};

export default DashboardPage;
