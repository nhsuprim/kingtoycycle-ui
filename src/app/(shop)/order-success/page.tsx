"use client";

import { Suspense, useEffect, useRef } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { fbTrack } from "@/lib/fbq";
import { pushDataLayer } from "@/lib/gtm";

const OrderSuccessContent = () => {
    const searchParams = useSearchParams();
    const orderNumber = searchParams.get("orderNumber");
    const orderId = searchParams.get("orderId");
    const total = searchParams.get("total");
    const hasTracked = useRef(false);

    // useEffect(() => {
    //     if (hasTracked.current || !orderId || !total) return;
    //     hasTracked.current = true;

    //     // eventID = orderId — backend CAPI-তেও একই orderId ব্যবহার হবে, তাই Meta duplicate গণনা করবে না
    //     fbTrack("Purchase", { value: Number(total), currency: "BDT" }, orderId);
    // }, [orderId, total]);

    useEffect(() => {
        if (hasTracked.current || !orderId || !total) return;
        hasTracked.current = true;

        fbTrack("Purchase", { value: Number(total), currency: "BDT" }, orderId);

        pushDataLayer({
            event: "purchase",
            ecommerce: {
                transaction_id: orderId,
                currency: "BDT",
                value: Number(total),
            },
        });
    }, [orderId, total]);

    return (
        <div className="mx-auto flex max-w-md flex-col items-center px-4 py-24 text-center">
            <CheckCircle2 className="h-16 w-16 text-green-600" />
            <h1 className="mt-4 text-xl font-bold text-neutral-900">
                Order Placed Successfully!
            </h1>
            {orderNumber && (
                <p className="mt-2 text-sm text-neutral-600">
                    Your order number is{" "}
                    <span className="font-mono font-semibold">
                        {orderNumber}
                    </span>
                </p>
            )}
            <p className="mt-2 text-sm text-neutral-500">
                We&apos;ll contact you shortly to confirm your order. Payment on
                delivery.
            </p>

            <div className="mt-6 flex w-full flex-col gap-2 sm:flex-row">
                <Link href="/track-order" className="flex-1">
                    <Button variant="outline" className="w-full">
                        Track Order
                    </Button>
                </Link>
                <Link href="/products" className="flex-1">
                    <Button className="w-full">Continue Shopping</Button>
                </Link>
            </div>
        </div>
    );
};

const OrderSuccessPage = () => {
    return (
        <Suspense fallback={null}>
            <OrderSuccessContent />
        </Suspense>
    );
};

export default OrderSuccessPage;
