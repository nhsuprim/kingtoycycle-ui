import Link from "next/link";
import { SITE_NAME } from "@/lib/constants";

const FOOTER_LINKS = [
    {
        title: "Shop",
        links: [
            { label: "All Products", href: "/products" },
            { label: "Track Order", href: "/track-order" },
        ],
    },
    {
        title: "Company",
        links: [
            { label: "About Us", href: "/about" },
            { label: "Contact", href: "/contact" },
        ],
    },
    {
        title: "Support",
        links: [
            { label: "Return Policy", href: "/return-policy" },
            { label: "FAQ", href: "/faq" },
        ],
    },
];

export default function Footer() {
    const year = new Date().getFullYear();

    return (
        <footer className="border-t bg-neutral-50">
            <div className="mx-auto max-w-7xl px-4 py-12">
                <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
                    <div>
                        <h2 className="text-lg font-bold">{SITE_NAME}</h2>
                        <p className="mt-2 text-sm text-neutral-600">
                            Quality toys delivered fast across Bangladesh. Cash
                            on delivery available.
                        </p>
                    </div>

                    {FOOTER_LINKS.map((section) => (
                        <div key={section.title}>
                            <h3 className="text-sm font-semibold text-neutral-900">
                                {section.title}
                            </h3>
                            <ul className="mt-3 space-y-2">
                                {section.links.map((link) => (
                                    <li key={link.href}>
                                        <Link
                                            href={link.href}
                                            className="text-sm text-neutral-600 hover:text-neutral-950"
                                        >
                                            {link.label}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>

                <div className="mt-10 border-t pt-6 text-center text-sm text-neutral-500">
                    © {year} {SITE_NAME}. All rights reserved.
                </div>
            </div>
        </footer>
    );
}
