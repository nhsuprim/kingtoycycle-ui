import type { Metadata } from "next";
import { Phone, Mail, MapPin } from "lucide-react";
import { SITE_NAME, SITE_PHONE } from "@/lib/constants";

export const metadata: Metadata = {
    title: "Contact Us",
    description: `Get in touch with ${SITE_NAME}. We're here to help with your orders and questions.`,
    alternates: { canonical: "/contact" },
};

const ContactPage = () => {
    return (
        <div className="mx-auto max-w-3xl px-4 py-10">
            <h1 className="text-2xl font-bold">Contact Us</h1>
            <p className="mt-2 text-sm text-neutral-500">
                Have a question about your order or our products? Reach out to
                us.
            </p>

            <div className="mt-6 space-y-4">
                <div className="flex items-center gap-3 rounded-lg border bg-white p-4">
                    <Phone className="h-5 w-5 text-neutral-500" />
                    <div>
                        <p className="text-sm font-medium">Phone</p>
                        <a
                            href={`tel:${SITE_PHONE}`}
                            className="text-sm text-neutral-600"
                        >
                            {SITE_PHONE}
                        </a>
                    </div>
                </div>

                <div className="flex items-center gap-3 rounded-lg border bg-white p-4">
                    <Mail className="h-5 w-5 text-neutral-500" />
                    <div>
                        <p className="text-sm font-medium">Email</p>
                        <p className="text-sm text-neutral-600">
                            support@kingtoycycle.com
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-3 rounded-lg border bg-white p-4">
                    <MapPin className="h-5 w-5 text-neutral-500" />
                    <div>
                        <p className="text-sm font-medium">Address</p>
                        <p className="text-sm text-neutral-600">
                            Dhaka, Bangladesh
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ContactPage;
