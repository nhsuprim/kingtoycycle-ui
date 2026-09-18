import type { Metadata } from "next";
import { SITE_NAME } from "@/lib/constants";

export const metadata: Metadata = {
    title: "Return Policy",
    description: `Return and refund policy for ${SITE_NAME}.`,
    alternates: { canonical: "/return-policy" },
};

const ReturnPolicyPage = () => {
    return (
        <div className="mx-auto max-w-3xl px-4 py-10">
            <h1 className="text-2xl font-bold">Return Policy</h1>
            <div className="mt-4 space-y-4 text-sm leading-relaxed text-neutral-600">
                <p>
                    If you receive a damaged or incorrect product, please
                    contact us within 3 days of delivery with your order number
                    and photos of the product.
                </p>
                <p>
                    Products must be unused and in their original packaging to
                    be eligible for a return. Once approved, we will arrange a
                    replacement or refund.
                </p>
                <p>
                    Please note that certain items may not be eligible for
                    return due to hygiene or safety reasons. Contact our support
                    team for any questions about a specific product.
                </p>
            </div>
        </div>
    );
};

export default ReturnPolicyPage;
