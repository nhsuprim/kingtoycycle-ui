"use client";
import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { Search, X, Eye, Package } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

import { api } from "@/lib/api";
import { showToast } from "@/lib/toast";

import {
    orderStatusColors,
    paymentStatusColors,
    formatOrderDate,
} from "@/lib/order-utils";

import type { Order, OrderStatus, PaymentStatus } from "@/types/order";

import StatusBadge from "@/components/admin/order/StatusBadge";

// ======================================================
// Constants
// ======================================================

const ALL_VALUE = "ALL" as const;

const MAX_PREVIEW_ITEMS = 3;

// ======================================================
// Filter Types
// ======================================================

type OrderStatusFilter = OrderStatus | typeof ALL_VALUE;

type PaymentStatusFilter = PaymentStatus | typeof ALL_VALUE;

// ======================================================
// Status Options
// ======================================================

const ORDER_STATUS_OPTIONS: OrderStatus[] = [
    "PENDING",
    "CONFIRMED",
    "PROCESSING",
    "SHIPPED",
    "DELIVERED",
    "CANCELLED",
    "RETURNED",
    "REFUNDED",
];

const PAYMENT_STATUS_OPTIONS: PaymentStatus[] = ["UNPAID", "PAID", "REFUNDED"];

// ======================================================
// Component
// ======================================================

const OrdersPage = () => {
    // --------------------------------------------------
    // State
    // --------------------------------------------------

    const [orders, setOrders] = useState<Order[]>([]);

    const [loading, setLoading] = useState(true);

    const [phoneInput, setPhoneInput] = useState("");

    const [phoneSearch, setPhoneSearch] = useState("");

    const [orderStatusFilter, setOrderStatusFilter] =
        useState<OrderStatusFilter>(ALL_VALUE);

    const [paymentStatusFilter, setPaymentStatusFilter] =
        useState<PaymentStatusFilter>(ALL_VALUE);

    // ==================================================
    // Debounce Phone Search
    // ==================================================

    useEffect(() => {
        const timer = setTimeout(() => {
            setPhoneSearch(phoneInput);
        }, 400);

        return () => clearTimeout(timer);
    }, [phoneInput]);

    // ==================================================
    // Fetch Orders
    // ==================================================

    const fetchOrders = useCallback(async () => {
        setLoading(true);

        try {
            const params = new URLSearchParams();

            // Phone
            if (phoneSearch.trim()) {
                params.set("phone", phoneSearch.trim());
            }

            // Order Status
            if (orderStatusFilter !== ALL_VALUE) {
                params.set("orderStatus", orderStatusFilter);
            }

            // Payment Status
            if (paymentStatusFilter !== ALL_VALUE) {
                params.set("paymentStatus", paymentStatusFilter);
            }

            const query = params.toString();

            const data = await api.get<Order[]>(
                `/order${query ? `?${query}` : ""}`,
            );

            setOrders(data);
        } catch (err) {
            showToast.error(
                err instanceof Error ? err.message : "Failed to load orders",
            );
        } finally {
            setLoading(false);
        }
    }, [phoneSearch, orderStatusFilter, paymentStatusFilter]);

    // ==================================================
    // Fetch when filters change
    // ==================================================

    useEffect(() => {
        fetchOrders();
    }, [fetchOrders]);

    // ==================================================
    // Clear Filters
    // ==================================================

    const handleClearFilters = () => {
        setPhoneInput("");
        setPhoneSearch("");

        setOrderStatusFilter(ALL_VALUE);

        setPaymentStatusFilter(ALL_VALUE);
    };

    // ==================================================
    // Active Filters
    // ==================================================

    const hasActiveFilters =
        phoneSearch !== "" ||
        orderStatusFilter !== ALL_VALUE ||
        paymentStatusFilter !== ALL_VALUE;

    // ==================================================
    // Loading State
    // ==================================================

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center px-4">
                <div className="text-sm text-muted-foreground">
                    Loading orders...
                </div>
            </div>
        );
    }

    // ==================================================
    // Render
    // ==================================================

    return (
        <div className="w-full min-w-0 space-y-4 p-2.5 sm:space-y-5 sm:p-4 md:space-y-6 md:p-5 lg:p-6 xl:p-8">
            {/* ==================================================
                Header
            ================================================== */}

            <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                    <h1 className="text-lg font-semibold sm:text-2xl">
                        Orders
                    </h1>

                    <p className="mt-1 text-sm text-muted-foreground">
                        Manage and track customer orders
                    </p>
                </div>

                <div className="flex shrink-0 items-center gap-2 rounded-md bg-muted/50 px-3 py-2 text-sm">
                    <Package className="h-4 w-4" />

                    <span>
                        {orders.length}{" "}
                        {orders.length === 1 ? "Order" : "Orders"}
                    </span>
                </div>
            </div>

            {/* ==================================================
                Filters
            ================================================== */}

            <div className="rounded-lg border bg-background p-2.5 sm:p-4 md:p-5">
                <div className="grid min-w-0 grid-cols-1 gap-2.5 sm:gap-3 md:grid-cols-2 lg:grid-cols-[minmax(0,1fr)_minmax(160px,200px)_minmax(160px,200px)_auto]">
                    {/* Phone Search */}

                    <div className="relative min-w-0">
                        <Search
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                            size={18}
                        />

                        <Input
                            value={phoneInput}
                            onChange={(e) => setPhoneInput(e.target.value)}
                            placeholder="Search by phone number..."
                            className="h-10 w-full pl-10"
                        />
                    </div>

                    {/* Order Status */}

                    <Select
                        value={orderStatusFilter}
                        onValueChange={(value) => {
                            setOrderStatusFilter(
                                (value ?? ALL_VALUE) as OrderStatusFilter,
                            );
                        }}
                    >
                        <SelectTrigger className="h-10 w-full">
                            <SelectValue placeholder="Order Status" />
                        </SelectTrigger>

                        <SelectContent>
                            <SelectItem value={ALL_VALUE}>
                                All Order Status
                            </SelectItem>

                            {ORDER_STATUS_OPTIONS.map((status) => (
                                <SelectItem key={status} value={status}>
                                    {status}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    {/* Payment Status */}

                    <Select
                        value={paymentStatusFilter}
                        onValueChange={(value) => {
                            setPaymentStatusFilter(
                                (value ?? ALL_VALUE) as PaymentStatusFilter,
                            );
                        }}
                    >
                        <SelectTrigger className="h-10 w-full">
                            <SelectValue placeholder="Payment Status" />
                        </SelectTrigger>

                        <SelectContent>
                            <SelectItem value={ALL_VALUE}>
                                All Payment Status
                            </SelectItem>

                            {PAYMENT_STATUS_OPTIONS.map((status) => (
                                <SelectItem key={status} value={status}>
                                    {status}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    {/* Clear */}

                    {hasActiveFilters && (
                        <Button
                            type="button"
                            variant="outline"
                            onClick={handleClearFilters}
                            className="h-10 w-full gap-2 md:col-span-2 lg:col-span-1 lg:w-auto"
                        >
                            <X size={16} />

                            <span>Clear</span>
                        </Button>
                    )}
                </div>
            </div>

            {/* ==================================================
                Desktop / Tablet Table
                Hidden on mobile
            ================================================== */}

            <div className="hidden w-full min-w-0 overflow-hidden rounded-lg border md:block">
                <div className="w-full overflow-x-auto">
                    <table className="w-full min-w-225 table-auto">
                        <thead className="border-b bg-muted/50">
                            <tr>
                                {/* <th className="whitespace-nowrap px-3 py-3 text-left text-xs font-medium sm:px-4 sm:text-sm">
                                    Order
                                </th> */}

                                <th className="whitespace-nowrap px-3 py-3 text-left text-xs font-medium sm:px-4 sm:text-sm">
                                    Customer
                                </th>

                                <th className="whitespace-nowrap px-3 py-3 text-left text-xs font-medium sm:px-4 sm:text-sm">
                                    Items
                                </th>

                                <th className="whitespace-nowrap px-3 py-3 text-left text-xs font-medium sm:px-4 sm:text-sm">
                                    Total
                                </th>

                                <th className="whitespace-nowrap px-3 py-3 text-left text-xs font-medium sm:px-4 sm:text-sm">
                                    Payment
                                </th>

                                <th className="whitespace-nowrap px-3 py-3 text-left text-xs font-medium sm:px-4 sm:text-sm">
                                    Status
                                </th>

                                <th className="whitespace-nowrap px-3 py-3 text-left text-xs font-medium sm:px-4 sm:text-sm">
                                    Date
                                </th>

                                <th className="whitespace-nowrap px-4 py-3 text-right text-sm font-medium">
                                    Action
                                </th>
                            </tr>
                        </thead>

                        <tbody className="divide-y">
                            {orders.length === 0 ? (
                                <tr>
                                    <td
                                        colSpan={8}
                                        className="h-32 text-center text-sm text-muted-foreground"
                                    >
                                        No orders found.
                                    </td>
                                </tr>
                            ) : (
                                orders.map((order) => {
                                    const previewItems = order.items.slice(
                                        0,
                                        MAX_PREVIEW_ITEMS,
                                    );

                                    const remainingItems = Math.max(
                                        order.items.length - MAX_PREVIEW_ITEMS,
                                        0,
                                    );

                                    return (
                                        <tr
                                            key={order.id}
                                            className="transition-colors hover:bg-muted/30"
                                        >
                                            {/* Order */}

                                            {/* <td className="px-3 py-4 align-top sm:px-4">
                                                <div className="whitespace-nowrap font-medium">
                                                    {order.orderNumber}
                                                </div>

                                                <div className="mt-1 text-xs text-muted-foreground">
                                                    {order.paymentMethod}
                                                </div>
                                            </td> */}

                                            {/* Customer */}

                                            <td className="max-w-55 px-3 py-4 align-top sm:px-4">
                                                <div className="truncate font-medium">
                                                    {order.customerName}
                                                </div>

                                                <div className="mt-1 truncate text-sm text-muted-foreground">
                                                    {order.phone}
                                                </div>

                                                {order.email && (
                                                    <div className="truncate text-xs text-muted-foreground">
                                                        {order.email}
                                                    </div>
                                                )}
                                            </td>

                                            {/* Items */}

                                            <td className="max-w-75 px-3 py-4 align-top sm:px-4">
                                                <div className="space-y-2">
                                                    {previewItems.map(
                                                        (item) => (
                                                            <div
                                                                key={item.id}
                                                                className="flex min-w-0 items-center gap-2"
                                                            >
                                                                {item.product
                                                                    ?.thumbnailImage ? (
                                                                    <Image
                                                                        src={
                                                                            item
                                                                                .product
                                                                                .thumbnailImage
                                                                        }
                                                                        alt={
                                                                            item.productName
                                                                        }
                                                                        width={
                                                                            50
                                                                        }
                                                                        height={
                                                                            50
                                                                        }
                                                                        className="h-12 w-12 shrink-0 rounded-md object-cover"
                                                                    />
                                                                ) : (
                                                                    <div className="h-12 w-12 shrink-0 rounded-md bg-muted" />
                                                                )}

                                                                <span className="min-w-0 truncate text-sm">
                                                                    {
                                                                        item.productName
                                                                    }{" "}
                                                                    ×{" "}
                                                                    {
                                                                        item.quantity
                                                                    }
                                                                </span>
                                                            </div>
                                                        ),
                                                    )}

                                                    {remainingItems > 0 && (
                                                        <div className="text-xs text-muted-foreground">
                                                            +{remainingItems}{" "}
                                                            more item
                                                            {remainingItems > 1
                                                                ? "s"
                                                                : ""}
                                                        </div>
                                                    )}
                                                </div>
                                            </td>

                                            {/* Total */}

                                            <td className="whitespace-nowrap px-3 py-4 align-top sm:px-4">
                                                <div className="font-semibold">
                                                    ৳
                                                    {order.totalAmount.toLocaleString(
                                                        "en-BD",
                                                    )}
                                                </div>

                                                <div className="mt-1 text-xs text-muted-foreground">
                                                    Subtotal: ৳
                                                    {order.subtotal.toLocaleString(
                                                        "en-BD",
                                                    )}
                                                </div>
                                            </td>

                                            {/* Payment */}

                                            <td className="px-3 py-4 align-top sm:px-4">
                                                <StatusBadge
                                                    label={order.paymentStatus}
                                                    colorClasses={
                                                        paymentStatusColors[
                                                            order.paymentStatus
                                                        ]
                                                    }
                                                />
                                            </td>

                                            {/* Status */}

                                            <td className="px-3 py-4 align-top sm:px-4">
                                                <StatusBadge
                                                    label={order.orderStatus}
                                                    colorClasses={
                                                        orderStatusColors[
                                                            order.orderStatus
                                                        ]
                                                    }
                                                />
                                            </td>

                                            {/* Date */}

                                            <td className="whitespace-nowrap px-3 py-4 align-top text-xs text-muted-foreground sm:px-4 sm:text-sm">
                                                {formatOrderDate(
                                                    order.createdAt,
                                                )}
                                            </td>

                                            {/* Action */}

                                            <td className="px-3 py-4 text-right align-top sm:px-4">
                                                <Link
                                                    href={`/admin/orders/${order.id}`}
                                                    className="inline-flex h-9 items-center justify-center gap-2 whitespace-nowrap rounded-md border px-3 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground"
                                                >
                                                    <Eye size={16} />

                                                    <span>View</span>
                                                </Link>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* ==================================================
                Mobile Cards
                Visible below md
            ================================================== */}

            <div className="w-full min-w-0 space-y-3 md:hidden">
                {orders.length === 0 ? (
                    <div className="flex min-h-40 items-center justify-center rounded-lg border text-center text-sm text-muted-foreground">
                        No orders found.
                    </div>
                ) : (
                    orders.map((order) => {
                        const previewItems = order.items.slice(
                            0,
                            MAX_PREVIEW_ITEMS,
                        );

                        const remainingItems = Math.max(
                            order.items.length - MAX_PREVIEW_ITEMS,
                            0,
                        );

                        return (
                            <div
                                key={order.id}
                                className="w-full min-w-0 overflow-hidden rounded-xl border bg-background shadow-sm"
                            >
                                {/* ------------------------------------------
                                    Card Header
                                ------------------------------------------ */}

                                <div className="flex min-w-0 items-start justify-between gap-2 border-b bg-muted/30 p-3 sm:gap-3 sm:p-4">
                                    <div className="min-w-0">
                                        <p className="truncate text-sm font-semibold">
                                            {order.orderNumber}
                                        </p>

                                        <p className="mt-1 text-xs text-muted-foreground">
                                            {order.paymentMethod}
                                        </p>
                                    </div>

                                    <div className="shrink-0 text-right">
                                        <p className="text-sm font-bold sm:text-base">
                                            ৳
                                            {order.totalAmount.toLocaleString(
                                                "en-BD",
                                            )}
                                        </p>

                                        <p className="text-[11px] text-muted-foreground">
                                            {formatOrderDate(order.createdAt)}
                                        </p>
                                    </div>
                                </div>

                                {/* ------------------------------------------
                                    Customer
                                ------------------------------------------ */}

                                <div className="border-b p-3 sm:p-4">
                                    <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                                        Customer
                                    </p>

                                    <div className="min-w-0">
                                        <p className="truncate text-sm font-medium">
                                            {order.customerName}
                                        </p>

                                        <p className="mt-1 text-sm text-muted-foreground">
                                            {order.phone}
                                        </p>

                                        {order.email && (
                                            <p className="mt-1 truncate text-xs text-muted-foreground">
                                                {order.email}
                                            </p>
                                        )}
                                    </div>
                                </div>

                                {/* ------------------------------------------
                                    Items
                                ------------------------------------------ */}

                                <div className="border-b p-3 sm:p-4">
                                    <div className="mb-3 flex items-center justify-between">
                                        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                                            Items
                                        </p>

                                        <p className="text-xs text-muted-foreground">
                                            {order.items.length}{" "}
                                            {order.items.length === 1
                                                ? "item"
                                                : "items"}
                                        </p>
                                    </div>

                                    <div className="space-y-3">
                                        {previewItems.map((item) => (
                                            <div
                                                key={item.id}
                                                className="flex min-w-0 items-center gap-3"
                                            >
                                                {item.product
                                                    ?.thumbnailImage ? (
                                                    <Image
                                                        src={
                                                            item.product
                                                                .thumbnailImage
                                                        }
                                                        alt={item.productName}
                                                        width={56}
                                                        height={56}
                                                        className="h-14 w-14 shrink-0 rounded-md object-cover"
                                                    />
                                                ) : (
                                                    <div className="h-14 w-14 shrink-0 rounded-md bg-muted" />
                                                )}

                                                <div className="min-w-0 flex-1">
                                                    <p className="truncate text-sm font-medium">
                                                        {item.productName}
                                                    </p>

                                                    <p className="mt-1 text-xs text-muted-foreground">
                                                        Quantity:{" "}
                                                        {item.quantity}
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    {remainingItems > 0 && (
                                        <p className="mt-3 text-xs text-muted-foreground">
                                            + {remainingItems} more item
                                            {remainingItems > 1 ? "s" : ""}
                                        </p>
                                    )}
                                </div>

                                {/* ------------------------------------------
                                    Payment + Order Status
                                ------------------------------------------ */}

                                <div className="grid grid-cols-1 gap-3 border-b p-3 sm:grid-cols-2 sm:p-4">
                                    <div className="min-w-0">
                                        <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                                            Payment
                                        </p>

                                        <StatusBadge
                                            label={order.paymentStatus}
                                            colorClasses={
                                                paymentStatusColors[
                                                    order.paymentStatus
                                                ]
                                            }
                                        />
                                    </div>

                                    <div className="min-w-0">
                                        <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                                            Status
                                        </p>

                                        <StatusBadge
                                            label={order.orderStatus}
                                            colorClasses={
                                                orderStatusColors[
                                                    order.orderStatus
                                                ]
                                            }
                                        />
                                    </div>
                                </div>

                                {/* ------------------------------------------
                                    Subtotal + Action
                                ------------------------------------------ */}

                                <div className="flex flex-col gap-3 p-3 sm:flex-row sm:items-center sm:justify-between sm:p-4">
                                    <div>
                                        <p className="text-xs text-muted-foreground">
                                            Subtotal
                                        </p>

                                        <p className="font-medium">
                                            ৳
                                            {order.subtotal.toLocaleString(
                                                "en-BD",
                                            )}
                                        </p>
                                    </div>

                                    <Link
                                        href={`/admin/orders/${order.id}`}
                                        className="inline-flex h-10 w-full min-w-0 items-center justify-center gap-2 rounded-md border px-4 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground sm:w-auto"
                                    >
                                        <Eye size={16} />

                                        <span>View Order</span>
                                    </Link>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            {/* ==================================================
                Order Count
            ================================================== */}

            <div className="text-center text-sm text-muted-foreground sm:text-left">
                Showing {orders.length}{" "}
                {orders.length === 1 ? "order" : "orders"}
            </div>
        </div>
    );
};

export default OrdersPage;
