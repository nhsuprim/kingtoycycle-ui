"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
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
import OrderStatusDialog from "@/components/admin/order/OrderStatusDialog";
import PaymentStatusDialog from "@/components/admin/order/PaymentStatusDialog";
import Image from "next/image";

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

const OrderDetailsPage = () => {
    const params = useParams();
    const router = useRouter();
    const id = params.id as string;

    const [order, setOrder] = useState<Order | null>(null);
    const [loading, setLoading] = useState(true);

    const [orderStatusOpen, setOrderStatusOpen] = useState(false);
    const [paymentStatusOpen, setPaymentStatusOpen] = useState(false);
    const [nextOrderStatus, setNextOrderStatus] = useState<OrderStatus | null>(
        null,
    );
    const [nextPaymentStatus, setNextPaymentStatus] =
        useState<PaymentStatus | null>(null);

    const fetchOrder = useCallback(async () => {
        setLoading(true);
        try {
            const data = await api.get<Order>(`/order/${id}`);
            setOrder(data);
            console.log("Fetched order:", data);
        } catch (err) {
            showToast.error(
                err instanceof Error ? err.message : "Failed to load order",
            );
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => {
        fetchOrder();
    }, [fetchOrder]);

    const handleOrderStatusSelect = (status: OrderStatus) => {
        if (!order || status === order.orderStatus) return;
        setNextOrderStatus(status);
        setOrderStatusOpen(true);
    };

    const handleOrderStatusConfirm = async () => {
        if (!order || !nextOrderStatus) return;
        try {
            await api.patch(`/order/${order.id}/status`, {
                orderStatus: nextOrderStatus,
            });
            showToast.success("Order status updated");
            fetchOrder();
        } catch (err) {
            showToast.error(
                err instanceof Error ? err.message : "Could not update status",
            );
        } finally {
            setOrderStatusOpen(false);
        }
    };

    const handlePaymentStatusSelect = (status: PaymentStatus) => {
        if (!order || status === order.paymentStatus) return;
        setNextPaymentStatus(status);
        setPaymentStatusOpen(true);
    };

    const handlePaymentStatusConfirm = async () => {
        if (!order || !nextPaymentStatus) return;
        try {
            await api.patch(`/order/${order.id}/payment-status`, {
                paymentStatus: nextPaymentStatus,
            });
            showToast.success("Payment status updated");
            fetchOrder();
        } catch (err) {
            showToast.error(
                err instanceof Error
                    ? err.message
                    : "Could not update payment status",
            );
        } finally {
            setPaymentStatusOpen(false);
        }
    };

    if (loading) {
        return <p className="text-sm text-neutral-500">Loading...</p>;
    }

    if (!order) {
        return <p className="text-sm text-red-600">Order not found</p>;
    }

    return (
        <div className="max-w-3xl">
            <button
                onClick={() => router.push("/admin/orders")}
                className="mb-4 flex items-center gap-1.5 text-sm text-neutral-500 hover:text-neutral-900"
            >
                <ArrowLeft className="h-4 w-4" />
                Back to Orders
            </button>

            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <h1 className="font-mono text-xl font-bold sm:text-2xl">
                    {order.orderNumber}
                </h1>
                <p className="text-sm text-neutral-400">
                    {formatOrderDate(order.createdAt)}
                </p>
            </div>

            {/* Status controls — mobile-e left-aligned thakbe, sm+ e center-aligned */}
            <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="rounded-lg border bg-white p-4 text-center sm:text-center">
                    <p className="text-xs font-medium text-neutral-500">
                        Order Status
                    </p>
                    <div className="mt-2 flex items-center justify-start gap-2 sm:justify-center">
                        <StatusBadge
                            label={order.orderStatus}
                            colorClasses={orderStatusColors[order.orderStatus]}
                        />
                        <Select
                            items={ORDER_STATUS_OPTIONS.map((s) => ({
                                label: s,
                                value: s,
                            }))}
                            value={order.orderStatus}
                            onValueChange={(v) =>
                                handleOrderStatusSelect(v as OrderStatus)
                            }
                        >
                            <SelectTrigger className="h-8 w-40 sm:w-44">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {ORDER_STATUS_OPTIONS.map((s) => (
                                    <SelectItem key={s} value={s}>
                                        {s}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <div className="rounded-lg border bg-white p-4 text-center sm:text-center">
                    <p className="text-xs font-medium text-neutral-500">
                        Payment Status
                    </p>
                    <div className="mt-2 flex items-center justify-start gap-2 sm:justify-center">
                        <StatusBadge
                            label={order.paymentStatus}
                            colorClasses={
                                paymentStatusColors[order.paymentStatus]
                            }
                        />
                        <Select
                            items={PAYMENT_STATUS_OPTIONS.map((s) => ({
                                label: s,
                                value: s,
                            }))}
                            value={order.paymentStatus}
                            onValueChange={(v) =>
                                handlePaymentStatusSelect(v as PaymentStatus)
                            }
                        >
                            <SelectTrigger className="h-8 w-40 sm:w-44">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {PAYMENT_STATUS_OPTIONS.map((s) => (
                                    <SelectItem key={s} value={s}>
                                        {s}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            </div>

            <div className="mt-4 rounded-lg border bg-white p-4">
                <h2 className="text-sm font-semibold text-neutral-900">
                    Customer Information
                </h2>
                <div className="mt-3 grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
                    <div>
                        <p className="text-neutral-400">Name</p>
                        <p className="font-medium">{order.customerName}</p>
                    </div>
                    <div>
                        <p className="text-neutral-400">Phone</p>
                        <p className="font-medium">{order.phone}</p>
                    </div>
                    {order.email && (
                        <div>
                            <p className="text-neutral-400">Email</p>
                            <p className="font-medium">{order.email}</p>
                        </div>
                    )}
                    <div>
                        <p className="text-neutral-400">Delivery Area</p>
                        <p className="font-medium">
                            {order.area === "DHAKA"
                                ? "Inside Dhaka"
                                : "Outside Dhaka"}
                        </p>
                    </div>
                    <div className="sm:col-span-2">
                        <p className="text-neutral-400">Address</p>
                        <p className="font-medium">{order.address}</p>
                    </div>
                </div>
            </div>

            <div className="mt-4 rounded-lg border bg-white p-4">
                <h2 className="text-sm font-semibold text-neutral-900">
                    Order Items
                </h2>
                <div className="mt-3 divide-y">
                    {order.items.map((item) => (
                        <div
                            key={item.id}
                            className="flex flex-col gap-1 py-3 first:pt-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between"
                        >
                            <div>
                                <p className="text-sm font-medium">
                                    {item.productName}
                                </p>
                                <p className="text-xs text-neutral-400">
                                    {item.productCode} • Qty: {item.quantity}
                                </p>
                            </div>
                            <p className="text-sm font-medium">
                                ৳{(item.price * item.quantity).toLocaleString()}
                            </p>
                        </div>
                    ))}
                </div>
            </div>

            <div className="mt-4 rounded-lg border bg-white p-4">
                <h2 className="text-sm font-semibold text-neutral-900">
                    Order Summary
                </h2>
                <div className="mt-3 space-y-1.5 text-sm">
                    <div className="flex justify-between">
                        <span className="text-neutral-500">Subtotal</span>
                        <span>৳{order.subtotal.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-neutral-500">Shipping</span>
                        <span>৳{order.shippingCost.toLocaleString()}</span>
                    </div>
                    {order.couponDiscount > 0 && (
                        <div className="flex justify-between text-green-600">
                            <span>Coupon Discount</span>
                            <span>
                                −৳{order.couponDiscount.toLocaleString()}
                            </span>
                        </div>
                    )}
                    <div className="flex justify-between border-t pt-2 text-base font-bold">
                        <span>Total</span>
                        <span>৳{order.totalAmount.toLocaleString()}</span>
                    </div>
                </div>
            </div>

            <OrderStatusDialog
                open={orderStatusOpen}
                onOpenChange={setOrderStatusOpen}
                order={order}
                nextStatus={nextOrderStatus}
                onConfirm={handleOrderStatusConfirm}
            />

            <PaymentStatusDialog
                open={paymentStatusOpen}
                onOpenChange={setPaymentStatusOpen}
                order={order}
                nextStatus={nextPaymentStatus}
                onConfirm={handlePaymentStatusConfirm}
            />
        </div>
    );
};

export default OrderDetailsPage;
