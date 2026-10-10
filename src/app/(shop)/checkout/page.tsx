"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

import { useCartStore } from "@/store/cart-store";
import { api } from "@/lib/api";
import { showToast } from "@/lib/toast";
import { getSessionId } from "@/lib/session";

import type { ShippingArea, Order } from "@/types/order";
import type { ShippingSettings } from "@/types/shipping";
import type { Product } from "@/types/product";
import type { CartItem } from "@/store/cart-store";

import { fbTrack } from "@/lib/fbq";
import { pushDataLayer } from "@/lib/gtm";

const CheckoutContent = () => {
    const router = useRouter();
    const searchParams = useSearchParams();

    const cartStore = useCartStore();

    // =========================================================
    // BUY NOW
    // =========================================================

    const buyNowProductId = searchParams.get("buyNow");

    const buyNowQty = Math.max(1, Number(searchParams.get("qty") ?? "1"));

    const [buyNowItem, setBuyNowItem] = useState<CartItem | null>(null);

    const [buyNowLoading, setBuyNowLoading] = useState(
        Boolean(buyNowProductId),
    );

    const isBuyNowMode = Boolean(buyNowProductId);

    // =========================================================
    // FETCH BUY NOW PRODUCT
    // =========================================================

    useEffect(() => {
        if (!buyNowProductId) {
            setBuyNowLoading(false);
            return;
        }

        let cancelled = false;

        const fetchProduct = async () => {
            try {
                const product = await api.get<Product>(
                    `/product/${buyNowProductId}`,
                );

                if (cancelled) return;

                setBuyNowItem({
                    productId: product.id,
                    name: product.name,
                    price: product.discountPrice ?? product.regularPrice,
                    thumbnailImage: product.thumbnailImage,
                    quantity: buyNowQty,
                    stockStatus: product.stockStatus,
                });
            } catch (error) {
                if (cancelled) return;

                console.error("Failed to load Buy Now product:", error);

                showToast.error("Could not load product. Please try again.");

                router.push("/products");
            } finally {
                if (!cancelled) {
                    setBuyNowLoading(false);
                }
            }
        };

        fetchProduct();

        return () => {
            cancelled = true;
        };
    }, [buyNowProductId, buyNowQty, router]);

    // =========================================================
    // ITEMS
    // =========================================================

    const items: CartItem[] = isBuyNowMode
        ? buyNowItem
            ? [buyNowItem]
            : []
        : cartStore.items;

    // =========================================================
    // TOTALS
    // =========================================================

    const subtotal = items.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0,
    );

    // =========================================================
    // CUSTOMER DETAILS
    // =========================================================

    const [customerName, setCustomerName] = useState("");
    const [phone, setPhone] = useState("");
    const [address, setAddress] = useState("");

    // Default: Outside Dhaka
    const [area, setArea] = useState<ShippingArea>("OUTSIDE_DHAKA");

    const [couponCode, setCouponCode] = useState("");

    // =========================================================
    // SHIPPING
    // =========================================================

    const [shippingSettings, setShippingSettings] =
        useState<ShippingSettings | null>(null);

    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        let cancelled = false;

        const fetchShipping = async () => {
            try {
                const data = await api.get<ShippingSettings>("/shipping");

                if (!cancelled) {
                    setShippingSettings(data);
                }
            } catch (error) {
                console.error("Failed to load shipping settings:", error);

                // fallback default settings
                if (!cancelled) {
                    setShippingSettings({
                        freeDeliveryEnabled: false,
                        insideDhakaCharge: 0,
                        outsideDhakaCharge: 0,
                    } as ShippingSettings);
                }
            }
        };

        fetchShipping();

        return () => {
            cancelled = true;
        };
    }, []);

    // =========================================================
    // EMPTY CART REDIRECT
    // =========================================================

    useEffect(() => {
        if (!isBuyNowMode && !buyNowLoading && items.length === 0) {
            router.push("/cart");
        }
    }, [isBuyNowMode, buyNowLoading, items.length, router]);

    // =========================================================
    // SHIPPING COST
    // =========================================================

    const shippingCost = shippingSettings
        ? shippingSettings.freeDeliveryEnabled
            ? 0
            : area === "DHAKA"
              ? shippingSettings.insideDhakaCharge
              : shippingSettings.outsideDhakaCharge
        : 0;

    const shippingAreaLabel =
        area === "DHAKA"
            ? "Inside Dhaka (ঢাকার ভিতরে)"
            : "Outside Dhaka (ঢাকার বাইরে)";

    const estimatedTotal = subtotal + shippingCost;

    // =========================================================
    // FACEBOOK INITIATE CHECKOUT
    // =========================================================

    useEffect(() => {
        if (items.length === 0) return;

        fbTrack("InitiateCheckout", {
            content_ids: items.map((item) => item.productId),
            value: subtotal,
            currency: "BDT",
            num_items: items.reduce((total, item) => total + item.quantity, 0),
        });

        pushDataLayer({
            event: "begin_checkout",
            ecommerce: {
                currency: "BDT",
                value: subtotal,
                items: items.map((i) => ({
                    item_id: i.productId,
                    item_name: i.name,
                    price: i.price,
                    quantity: i.quantity,
                })),
            },
        });

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [items.length]);

    // =========================================================
    // SUBMIT ORDER
    // =========================================================

    const handleSubmit = async () => {
        if (submitting) return;

        if (items.length === 0) {
            showToast.error("Your cart is empty.");
            return;
        }

        if (!customerName.trim()) {
            showToast.error("Please enter your name.");
            return;
        }

        if (!phone.trim()) {
            showToast.error("Please enter your phone number.");
            return;
        }

        if (!address.trim()) {
            showToast.error("Please enter your full address.");
            return;
        }

        setSubmitting(true);

        try {
            const order = await api.post<Order>("/order", {
                customerName: customerName.trim(),
                phone: phone.trim(),
                address: address.trim(),
                area,

                items: items.map((item) => ({
                    productId: item.productId,
                    quantity: item.quantity,
                })),

                couponCode: couponCode.trim() || undefined,
            });

            // =================================================
            // PURCHASE TRACKING
            // =================================================

            items.forEach((item) => {
                api.post("/event", {
                    eventType: "PURCHASE",
                    sessionId: getSessionId(),
                    phone: phone.trim(),
                    productId: item.productId,

                    metadata: {
                        orderNumber: order.orderNumber,
                        quantity: item.quantity,
                        price: item.price,
                    },
                }).catch(() => {});
            });

            // =================================================
            // CLEAR CART
            // =================================================

            if (!isBuyNowMode) {
                cartStore.clearCart();
            }

            // =================================================
            // SUCCESS
            // =================================================

            showToast.success("Order placed successfully!");

            router.push(
                `/order-success?orderNumber=${encodeURIComponent(
                    order.orderNumber,
                )}&orderId=${encodeURIComponent(
                    order.id,
                )}&total=${encodeURIComponent(order.totalAmount)}`,
            );
        } catch (err) {
            console.error("Order submission error:", err);

            showToast.error(
                err instanceof Error ? err.message : "Could not place order",
            );
        } finally {
            setSubmitting(false);
        }
    };

    // =========================================================
    // LOADING
    // =========================================================

    if (buyNowLoading) {
        return (
            <p className="py-24 text-center text-sm text-neutral-500">
                Loading...
            </p>
        );
    }

    // =========================================================
    // EMPTY CART
    // =========================================================

    if (items.length === 0) {
        return null;
    }

    // =========================================================
    // UI
    // =========================================================

    return (
        <div className="min-h-screen bg-linear-to-br from-slate-50 via-white to-blue-50/50">
            <div className="mx-auto max-w-5xl px-4 py-6 sm:py-8">
                {/* PAGE HEADER */}

                <div className="mb-6">
                    <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                        Checkout
                    </h1>

                    <p className="mt-1 text-sm text-slate-500">
                        Complete your information to place your order.
                    </p>
                </div>

                {/* =====================================================
                    LAYOUT GRID

                    MOBILE ORDER:
                    1. Delivery Details
                    2. Order Summary
                    3. Place Order button
                    4. Payment Method

                    DESKTOP:
                    left  -> Delivery + Payment
                    right -> Order Summary (sticky)
                ====================================================== */}

                <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_20rem] lg:items-start lg:gap-6">
                    {/* =================================================
                        1. DELIVERY DETAILS
                    ================================================== */}

                    <form
                        id="checkout-form"
                        onSubmit={(e) => {
                            e.preventDefault();
                            void handleSubmit();
                        }}
                        className="lg:col-start-1 lg:row-start-1"
                    >
                        <div className="overflow-hidden rounded-2xl border border-blue-100 bg-white shadow-sm">
                            {/* Section Header */}

                            <div className="border-b border-blue-100 bg-linear-to-r from-blue-50 to-indigo-50 px-5 py-4">
                                <h2 className="text-base font-bold text-slate-900">
                                    Delivery Details
                                </h2>

                                <p className="mt-0.5 text-xs text-slate-500">
                                    আপনার delivery information দিন
                                </p>
                            </div>

                            <div className="space-y-5 p-5">
                                {/* NAME */}

                                <div className="space-y-2">
                                    <Label
                                        htmlFor="customerName"
                                        className="font-medium text-slate-700"
                                    >
                                        Full Name (নাম)
                                    </Label>

                                    <Input
                                        id="customerName"
                                        value={customerName}
                                        onChange={(e) =>
                                            setCustomerName(e.target.value)
                                        }
                                        placeholder="আপনার পূর্ণ নাম লিখুন"
                                        className="h-11 border-slate-200 bg-slate-50/50 transition focus:border-blue-400 focus:bg-white"
                                        required
                                    />
                                </div>

                                {/* PHONE */}

                                <div className="space-y-2">
                                    <Label
                                        htmlFor="phone"
                                        className="font-medium text-slate-700"
                                    >
                                        Phone Number (ফোন নম্বর)
                                    </Label>

                                    <Input
                                        id="phone"
                                        type="tel"
                                        value={phone}
                                        onChange={(e) =>
                                            setPhone(e.target.value)
                                        }
                                        placeholder="01XXXXXXXXX"
                                        className="h-11 border-slate-200 bg-slate-50/50 transition focus:border-blue-400 focus:bg-white"
                                        required
                                    />
                                </div>

                                {/* ADDRESS */}

                                <div className="space-y-2">
                                    <Label
                                        htmlFor="address"
                                        className="font-medium text-slate-700"
                                    >
                                        Full Address (ঠিকানা)
                                    </Label>

                                    <Textarea
                                        id="address"
                                        value={address}
                                        onChange={(e) =>
                                            setAddress(e.target.value)
                                        }
                                        placeholder="বাড়ি/ফ্ল্যাট, রোড, এলাকা ইত্যাদি লিখুন"
                                        rows={3}
                                        className="resize-none border-slate-200 bg-slate-50/50 transition focus:border-blue-400 focus:bg-white"
                                        required
                                    />
                                </div>

                                {/* =================================================
                                    AREA - HIGHLIGHTED
                                ================================================== */}

                                <div className="relative overflow-hidden rounded-2xl border border-orange-200 bg-linear-to-br from-orange-50 via-amber-50 to-yellow-50 p-4 shadow-sm ring-1 ring-orange-100">
                                    {/* Decorative Glow */}

                                    <div className="pointer-events-none absolute -right-8 -top-8 h-28 w-28 rounded-full bg-orange-300/30 blur-3xl" />

                                    <div className="pointer-events-none absolute -bottom-10 -left-8 h-24 w-24 rounded-full bg-yellow-300/20 blur-2xl" />

                                    <div className="relative flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                        {/* Area Title */}

                                        <div className="min-w-0">
                                            <div className="flex items-center gap-2.5">
                                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-orange-500 text-lg shadow-md shadow-orange-200">
                                                    🚚
                                                </div>

                                                <div>
                                                    <Label
                                                        htmlFor="area"
                                                        className="font-bold text-slate-800"
                                                    >
                                                        Delivery Area
                                                        <span className="ml-1 text-orange-700">
                                                            (ডেলিভারি এলাকা)
                                                        </span>
                                                    </Label>

                                                    <p className="mt-0.5 text-xs text-slate-600">
                                                        আপনার delivery location
                                                        নির্বাচন করুন
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Area Select */}

                                        <Select
                                            items={[
                                                {
                                                    label: `Inside Dhaka (ঢাকার ভিতরে) — ৳${
                                                        shippingSettings?.insideDhakaCharge ??
                                                        0
                                                    }`,
                                                    value: "DHAKA",
                                                },
                                                {
                                                    label: `Outside Dhaka (ঢাকার বাইরে) — ৳${
                                                        shippingSettings?.outsideDhakaCharge ??
                                                        0
                                                    }`,
                                                    value: "OUTSIDE_DHAKA",
                                                },
                                            ]}
                                            value={area}
                                            onValueChange={(value) => {
                                                if (value) {
                                                    setArea(
                                                        value as ShippingArea,
                                                    );
                                                }
                                            }}
                                        >
                                            <SelectTrigger
                                                id="area"
                                                className="h-12 w-full border-2 border-orange-300 bg-white font-semibold text-slate-800 shadow-sm transition-all hover:border-orange-400 hover:bg-orange-50/50 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 sm:w-72"
                                            >
                                                <SelectValue />
                                            </SelectTrigger>

                                            <SelectContent>
                                                <SelectItem value="DHAKA">
                                                    Inside Dhaka (ঢাকার ভিতরে)
                                                    {" — ৳"}
                                                    {(
                                                        shippingSettings?.insideDhakaCharge ??
                                                        0
                                                    ).toLocaleString()}
                                                </SelectItem>

                                                <SelectItem value="OUTSIDE_DHAKA">
                                                    Outside Dhaka (ঢাকার বাইরে)
                                                    {" — ৳"}
                                                    {(
                                                        shippingSettings?.outsideDhakaCharge ??
                                                        0
                                                    ).toLocaleString()}
                                                </SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    {/* Selected Delivery Information */}

                                    <div className="relative mt-3 flex items-center gap-2 rounded-xl border border-orange-200/80 bg-white/80 px-3 py-2.5 text-xs backdrop-blur-sm">
                                        <span className="flex h-2.5 w-2.5 shrink-0 rounded-full bg-orange-500 shadow-[0_0_0_3px_rgba(249,115,22,0.15)]" />

                                        <span className="text-slate-500">
                                            Delivery charge:
                                        </span>

                                        <span className="font-bold text-orange-700">
                                            {shippingCost === 0
                                                ? "Free Delivery"
                                                : `৳${shippingCost.toLocaleString()}`}
                                        </span>

                                        <span className="ml-auto font-semibold text-slate-700">
                                            {area === "DHAKA"
                                                ? "ঢাকার ভিতরে"
                                                : "ঢাকার বাইরে"}
                                        </span>
                                    </div>
                                </div>

                                {/* COUPON */}

                                <div className="space-y-2">
                                    <Label
                                        htmlFor="coupon"
                                        className="font-medium text-slate-700"
                                    >
                                        Coupon Code (কুপন কোড)
                                    </Label>

                                    <Input
                                        id="coupon"
                                        value={couponCode}
                                        onChange={(e) =>
                                            setCouponCode(
                                                e.target.value.toUpperCase(),
                                            )
                                        }
                                        placeholder="যেমন: EID50"
                                        className="h-11 border-slate-200 bg-slate-50/50 transition focus:border-blue-400 focus:bg-white"
                                    />
                                </div>
                            </div>
                        </div>
                    </form>

                    {/* =================================================
                        2. ORDER SUMMARY
                    ================================================== */}

                    <div className="lg:col-start-2 lg:row-span-2 lg:row-start-1">
                        <div className="overflow-hidden rounded-2xl border border-indigo-100 bg-white shadow-sm lg:sticky lg:top-5">
                            {/* Summary Header */}

                            <div className="bg-linear-to-r from-indigo-600 to-blue-600 px-5 py-4 text-white">
                                <h2 className="text-base font-bold">
                                    Order Summary
                                </h2>

                                <p className="mt-0.5 text-xs text-blue-100">
                                    আপনার অর্ডারের বিস্তারিত
                                </p>
                            </div>

                            <div className="p-5">
                                {/* PRODUCTS */}

                                <div className="max-h-64 space-y-3 overflow-y-auto">
                                    {items.map((item) => (
                                        <div
                                            key={item.productId}
                                            className="flex items-center gap-3 rounded-xl bg-slate-50 p-2"
                                        >
                                            <Image
                                                src={item.thumbnailImage}
                                                alt={item.name}
                                                width={48}
                                                height={48}
                                                className="h-12 w-12 shrink-0 rounded-lg border object-cover"
                                            />

                                            <div className="min-w-0 flex-1">
                                                <p className="truncate text-xs font-semibold text-slate-800">
                                                    {item.name}
                                                </p>

                                                <p className="mt-0.5 text-xs text-slate-400">
                                                    {item.quantity} × ৳
                                                    {item.price.toLocaleString()}
                                                </p>
                                            </div>

                                            <p className="text-xs font-semibold text-slate-700">
                                                ৳
                                                {(
                                                    item.price * item.quantity
                                                ).toLocaleString()}
                                            </p>
                                        </div>
                                    ))}
                                </div>

                                {/* TOTALS */}

                                <div className="mt-4 space-y-3 border-t border-slate-100 pt-4 text-sm">
                                    {/* SUBTOTAL */}

                                    <div className="flex justify-between">
                                        <span className="text-slate-500">
                                            Subtotal (সাবটোটাল)
                                        </span>

                                        <span className="font-medium text-slate-800">
                                            ৳{subtotal.toLocaleString()}
                                        </span>
                                    </div>

                                    {/* SHIPPING */}

                                    <div className="flex items-center justify-between gap-3">
                                        <span className="text-slate-500">
                                            Shipping{" "}
                                            <span className="text-xs text-slate-400">
                                                ({shippingAreaLabel})
                                            </span>
                                        </span>

                                        <span className="font-medium text-slate-800">
                                            {shippingCost === 0
                                                ? "Free"
                                                : `৳${shippingCost.toLocaleString()}`}
                                        </span>
                                    </div>

                                    {/* TOTAL */}

                                    <div className="flex items-center justify-between rounded-xl bg-linear-to-r from-blue-50 to-indigo-50 px-3 py-3 text-base font-bold">
                                        <span className="text-slate-800">
                                            Total (মোট)
                                        </span>

                                        <span className="text-blue-700">
                                            ৳{estimatedTotal.toLocaleString()}
                                        </span>
                                    </div>
                                </div>

                                {/* DESKTOP PLACE ORDER */}

                                <Button
                                    type="button"
                                    onClick={() => {
                                        void handleSubmit();
                                    }}
                                    disabled={submitting}
                                    className="mt-5 hidden h-11 w-full rounded-xl bg-linear-to-r from-blue-600 to-indigo-600 font-semibold shadow-md transition hover:from-blue-700 hover:to-indigo-700 sm:block"
                                >
                                    {submitting
                                        ? "Placing Order..."
                                        : "Place Order"}
                                </Button>

                                <p className="mt-3 text-center text-[11px] text-slate-400">
                                    🔒 Your information is safe and secure
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* =================================================
                        3. MOBILE PLACE ORDER
                    ================================================== */}

                    <Button
                        type="submit"
                        form="checkout-form"
                        disabled={submitting}
                        className="h-12 w-full rounded-xl bg-linear-to-r from-blue-600 to-indigo-600 text-sm font-semibold shadow-md transition hover:from-blue-700 hover:to-indigo-700 sm:hidden"
                    >
                        {submitting
                            ? "Placing Order..."
                            : `Place Order — ৳${estimatedTotal.toLocaleString()}`}
                    </Button>

                    {/* =================================================
                        4. PAYMENT METHOD
                    ================================================== */}

                    <div className="overflow-hidden rounded-2xl border border-emerald-100 bg-white shadow-sm lg:col-start-1 lg:row-start-2">
                        <div className="border-b border-emerald-100 bg-linear-to-r from-emerald-50 to-teal-50 px-5 py-4">
                            <h2 className="text-base font-bold text-slate-900">
                                Payment Method
                            </h2>

                            <p className="mt-0.5 text-xs text-slate-500">
                                পেমেন্ট পদ্ধতি
                            </p>
                        </div>

                        <div className="p-5">
                            <div className="flex items-center gap-3 rounded-xl border border-emerald-100 bg-emerald-50/70 p-4">
                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-lg">
                                    💵
                                </div>

                                <div>
                                    <p className="font-semibold text-slate-800">
                                        Cash on Delivery (COD)
                                    </p>

                                    <p className="text-xs text-slate-500">
                                        পণ্য হাতে পাওয়ার পর পেমেন্ট করুন
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// =============================================================
// CHECKOUT PAGE
// =============================================================

const CheckoutPage = () => {
    return (
        <Suspense
            fallback={
                <p className="py-24 text-center text-sm text-neutral-500">
                    Loading...
                </p>
            }
        >
            <CheckoutContent />
        </Suspense>
    );
};

export default CheckoutPage;
