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
    const [email, setEmail] = useState("");
    const [address, setAddress] = useState("");

    const [area, setArea] = useState<ShippingArea>("DHAKA");

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
        // Buy Now mode হলে এই redirect প্রযোজ্য না
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

    const estimatedTotal = subtotal + shippingCost;

    // =========================================================
    // FACEBOOK INITIATE CHECKOUT
    // =========================================================

    // useEffect(() => {
    //     if (items.length === 0) return;

    //     fbTrack("InitiateCheckout", {
    //         content_ids: items.map((item) => item.productId),
    //         value: subtotal,
    //         currency: "BDT",
    //         num_items: items.reduce((total, item) => total + item.quantity, 0),
    //     });
    // }, [items, subtotal]);

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

                email: email.trim() || undefined,

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

            // Buy Now হলে cart clear করবে না
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
        <div className="mx-auto max-w-5xl px-4 py-6">
            <h1 className="text-xl font-bold sm:text-2xl">Checkout</h1>

            <div className="mt-6 flex flex-col gap-6 lg:flex-row">
                {/* =================================================
                    CHECKOUT FORM
                ================================================== */}

                <form
                    onSubmit={(e) => {
                        e.preventDefault();
                        void handleSubmit();
                    }}
                    className="flex-1 space-y-4"
                >
                    {/* DELIVERY DETAILS */}

                    <div className="rounded-lg border bg-white p-4">
                        <h2 className="text-sm font-semibold text-neutral-900">
                            Delivery Details
                        </h2>

                        <div className="mt-4 space-y-4">
                            {/* NAME */}

                            <div className="space-y-2">
                                <Label htmlFor="customerName">Full Name</Label>

                                <Input
                                    id="customerName"
                                    value={customerName}
                                    onChange={(e) =>
                                        setCustomerName(e.target.value)
                                    }
                                    required
                                />
                            </div>

                            {/* PHONE + EMAIL */}

                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="phone">Phone Number</Label>

                                    <Input
                                        id="phone"
                                        type="tel"
                                        value={phone}
                                        onChange={(e) =>
                                            setPhone(e.target.value)
                                        }
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="email">
                                        Email (optional)
                                    </Label>

                                    <Input
                                        id="email"
                                        type="email"
                                        value={email}
                                        onChange={(e) =>
                                            setEmail(e.target.value)
                                        }
                                    />
                                </div>
                            </div>

                            {/* ADDRESS */}

                            <div className="space-y-2">
                                <Label htmlFor="address">Full Address</Label>

                                <Textarea
                                    id="address"
                                    value={address}
                                    onChange={(e) => setAddress(e.target.value)}
                                    rows={3}
                                    required
                                />
                            </div>

                            {/* AREA */}

                            <div className="space-y-2">
                                <Label htmlFor="area">Delivery Area</Label>

                                <Select
                                    items={[
                                        {
                                            label: "Inside Dhaka",
                                            value: "DHAKA",
                                        },
                                        {
                                            label: "Outside Dhaka",
                                            value: "OUTSIDE_DHAKA",
                                        },
                                    ]}
                                    value={area}
                                    onValueChange={(value) => {
                                        if (value) {
                                            setArea(value as ShippingArea);
                                        }
                                    }}
                                >
                                    <SelectTrigger id="area">
                                        <SelectValue />
                                    </SelectTrigger>

                                    <SelectContent>
                                        <SelectItem value="DHAKA">
                                            Inside Dhaka
                                        </SelectItem>

                                        <SelectItem value="OUTSIDE_DHAKA">
                                            Outside Dhaka
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* COUPON */}

                            <div className="space-y-2">
                                <Label htmlFor="coupon">
                                    Coupon Code (optional)
                                </Label>

                                <Input
                                    id="coupon"
                                    value={couponCode}
                                    onChange={(e) =>
                                        setCouponCode(
                                            e.target.value.toUpperCase(),
                                        )
                                    }
                                    placeholder="e.g. EID50"
                                />
                            </div>
                        </div>
                    </div>

                    {/* PAYMENT */}

                    <div className="rounded-lg border bg-white p-4">
                        <h2 className="text-sm font-semibold text-neutral-900">
                            Payment Method
                        </h2>

                        <p className="mt-2 text-sm text-neutral-600">
                            Cash on Delivery (COD)
                        </p>
                    </div>

                    {/* MOBILE PLACE ORDER */}

                    <Button
                        type="submit"
                        disabled={submitting}
                        className="w-full sm:hidden"
                    >
                        {submitting
                            ? "Placing Order..."
                            : `Place Order — ৳${estimatedTotal.toLocaleString()}`}
                    </Button>
                </form>

                {/* =================================================
                    ORDER SUMMARY
                ================================================== */}

                <div className="lg:w-80 lg:shrink-0">
                    <div className="rounded-lg border bg-white p-4">
                        <h2 className="text-sm font-semibold text-neutral-900">
                            Order Summary
                        </h2>

                        {/* PRODUCTS */}

                        <div className="mt-3 max-h-64 space-y-2 overflow-y-auto">
                            {items.map((item) => (
                                <div
                                    key={item.productId}
                                    className="flex items-center gap-2"
                                >
                                    <Image
                                        src={item.thumbnailImage}
                                        alt={item.name}
                                        width={40}
                                        height={40}
                                        className="shrink-0 rounded border object-cover"
                                    />

                                    <div className="min-w-0 flex-1">
                                        <p className="truncate text-xs font-medium">
                                            {item.name}
                                        </p>

                                        <p className="text-xs text-neutral-400">
                                            {item.quantity} × ৳
                                            {item.price.toLocaleString()}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* TOTALS */}

                        <div className="mt-3 space-y-1.5 border-t pt-3 text-sm">
                            {/* SUBTOTAL */}

                            <div className="flex justify-between">
                                <span className="text-neutral-500">
                                    Subtotal
                                </span>

                                <span>৳{subtotal.toLocaleString()}</span>
                            </div>

                            {/* SHIPPING */}

                            <div className="flex justify-between">
                                <span className="text-neutral-500">
                                    Shipping
                                </span>

                                <span>
                                    {shippingCost === 0
                                        ? "Free"
                                        : `৳${shippingCost.toLocaleString()}`}
                                </span>
                            </div>

                            {/* TOTAL */}

                            <div className="flex justify-between border-t pt-2 text-base font-bold">
                                <span>Total</span>

                                <span>৳{estimatedTotal.toLocaleString()}</span>
                            </div>
                        </div>

                        {/* DESKTOP PLACE ORDER */}

                        <Button
                            type="button"
                            onClick={() => {
                                void handleSubmit();
                            }}
                            disabled={submitting}
                            className="mt-4 hidden w-full sm:block"
                        >
                            {submitting ? "Placing Order..." : "Place Order"}
                        </Button>
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
