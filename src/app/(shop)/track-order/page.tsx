"use client";

import { useState } from "react";
import Image from "next/image";
import { Search, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api } from "@/lib/api";
import { showToast } from "@/lib/toast";
import { paymentStatusColors, formatOrderDate } from "@/lib/order-utils";
import type { Order } from "@/types/order";
import StatusBadge from "@/components/admin/order/StatusBadge";
import OrderStatusTimeline from "@/components/shop/OrderStatusTimeline";

const TrackOrderPage = () => {
    const [orderNumber, setOrderNumber] = useState("");
    const [order, setOrder] = useState<Order | null>(null);
    const [loading, setLoading] = useState(false);
    const [searched, setSearched] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setSearched(true);

        try {
            const data = await api.post<Order>("/order/track", { orderNumber });
            setOrder(data);
        } catch (err) {
            setOrder(null);
            showToast.error(
                err instanceof Error
                    ? err.message
                    : "Order not found. Please check your order number.",
            );
        } finally {
            setLoading(false);
        }
    };
    return (
        <div className="mx-auto max-w-2xl px-4 py-8 sm:py-12">
            <div className="text-center">
                <Package className="mx-auto h-10 w-10 text-neutral-400" />
                <h1 className="mt-3 text-xl font-bold sm:text-2xl">
                    Track Your Order
                </h1>
                <p className="mt-1 text-sm text-neutral-500">
                    Enter your order number and phone number to check the
                    status.
                </p>
            </div>

            <form
                onSubmit={handleSubmit}
                className="mt-6 space-y-4 rounded-lg border bg-white p-4 sm:p-6"
            >
                <div className="space-y-2">
                    <Label htmlFor="orderNumber">Order Number</Label>
                    <Input
                        id="orderNumber"
                        value={orderNumber}
                        onChange={(e) =>
                            setOrderNumber(e.target.value.toUpperCase())
                        }
                        placeholder="ORD-12345678"
                        required
                    />
                </div>
                <Button
                    type="submit"
                    disabled={loading}
                    className="w-full gap-2"
                >
                    <Search className="h-4 w-4" />
                    {loading ? "Searching..." : "Track Order"}
                </Button>
            </form>

            {order && (
                <div className="mt-6 space-y-4">
                    <div className="rounded-lg border bg-white p-4 sm:p-6">
                        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                                <p className="font-mono text-lg font-bold">
                                    {order.orderNumber}
                                </p>
                                <p className="text-xs text-neutral-400">
                                    Placed on {formatOrderDate(order.createdAt)}
                                </p>
                            </div>
                            <StatusBadge
                                label={order.paymentStatus}
                                colorClasses={
                                    paymentStatusColors[order.paymentStatus]
                                }
                            />
                        </div>

                        <div className="mt-6">
                            <OrderStatusTimeline
                                currentStatus={order.orderStatus}
                            />
                        </div>
                    </div>

                    <div className="rounded-lg border bg-white p-4 sm:p-6">
                        <h2 className="text-sm font-semibold text-neutral-900">
                            Delivery Details
                        </h2>
                        <div className="mt-3 space-y-1 text-sm text-neutral-600">
                            <p>{order.customerName}</p>
                            <p>{order.phone}</p>
                            <p>{order.address}</p>
                            <p>
                                {order.area === "DHAKA"
                                    ? "Inside Dhaka"
                                    : "Outside Dhaka"}
                            </p>
                        </div>
                    </div>

                    <div className="rounded-lg border bg-white p-4 sm:p-6">
                        <h2 className="text-sm font-semibold text-neutral-900">
                            Items ({order.items.length})
                        </h2>
                        <div className="mt-3 divide-y">
                            {order.items.map((item) => (
                                <div
                                    key={item.id}
                                    className="flex items-center gap-3 py-3 first:pt-0 last:pb-0"
                                >
                                    {item.product?.thumbnailImage ? (
                                        <Image
                                            src={item.product.thumbnailImage}
                                            alt={item.productName}
                                            width={48}
                                            height={48}
                                            className="shrink-0 rounded-md border object-cover"
                                        />
                                    ) : (
                                        <div className="h-12 w-12 shrink-0 rounded-md bg-neutral-100" />
                                    )}
                                    <div className="min-w-0 flex-1">
                                        <p className="truncate text-sm font-medium">
                                            {item.productName}
                                        </p>
                                        <p className="text-xs text-neutral-400">
                                            Qty: {item.quantity}
                                        </p>
                                    </div>
                                    <p className="shrink-0 text-sm font-medium">
                                        ৳
                                        {(
                                            item.price * item.quantity
                                        ).toLocaleString()}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="rounded-lg border bg-white p-4 sm:p-6">
                        <h2 className="text-sm font-semibold text-neutral-900">
                            Order Summary
                        </h2>
                        <div className="mt-3 space-y-1.5 text-sm">
                            <div className="flex justify-between">
                                <span className="text-neutral-500">
                                    Subtotal
                                </span>
                                <span>৳{order.subtotal.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-neutral-500">
                                    Shipping
                                </span>
                                <span>
                                    ৳{order.shippingCost.toLocaleString()}
                                </span>
                            </div>
                            {order.couponDiscount > 0 && (
                                <div className="flex justify-between text-green-600">
                                    <span>Discount</span>
                                    <span>
                                        −৳
                                        {order.couponDiscount.toLocaleString()}
                                    </span>
                                </div>
                            )}
                            <div className="flex justify-between border-t pt-2 text-base font-bold">
                                <span>Total</span>
                                <span>
                                    ৳{order.totalAmount.toLocaleString()}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {searched && !order && !loading && (
                <p className="mt-6 text-center text-sm text-neutral-500">
                    No order found with these details. Please double-check your
                    order number and phone.
                </p>
            )}
        </div>
    );
};

export default TrackOrderPage;
