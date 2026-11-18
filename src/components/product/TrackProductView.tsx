"use client";

import { useEffect, useRef } from "react";
import { api } from "@/lib/api";
import { getSessionId } from "@/lib/session";
import { fbTrack } from "@/lib/fbq";
import { pushDataLayer } from "@/lib/gtm";

interface TrackProductViewProps {
    productId: string;
    productName: string;
    value: number;
}

const TrackProductView = ({
    productId,
    productName,
    value,
}: TrackProductViewProps) => {
    const hasTracked = useRef(false);

    useEffect(() => {
        if (hasTracked.current) return;
        hasTracked.current = true;

        // একই session-এ একই product দ্বিতীয়বার server-এ log হবে না
        // (Pixel ও GTM আগের মতোই প্রতিবার fire হবে)
        const key = `pv:${productId}`;
        let alreadyLogged = false;

        try {
            alreadyLogged = sessionStorage.getItem(key) !== null;
            if (!alreadyLogged) sessionStorage.setItem(key, "1");
        } catch {
            // Private mode-এ sessionStorage blocked হলে log করে দেব
        }

        if (!alreadyLogged) {
            api.post("/event", {
                eventType: "PRODUCT_VIEW",
                sessionId: getSessionId(),
                productId,
                page: window.location.pathname,
            }).catch(() => {});
        }

        fbTrack("ViewContent", {
            content_ids: [productId],
            content_name: productName,
            content_type: "product",
            value,
            currency: "BDT",
        });

        pushDataLayer({
            event: "view_item",
            ecommerce: {
                currency: "BDT",
                value,
                items: [
                    {
                        item_id: productId,
                        item_name: productName,
                        price: value,
                    },
                ],
            },
        });
    }, [productId, productName, value]);

    return null;
};

export default TrackProductView;
