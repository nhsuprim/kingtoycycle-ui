import Link from "next/link";
import Image from "next/image";
import { Phone, MapPin, UserRound } from "lucide-react";

import { SITE_NAME } from "@/lib/constants";
import Logo from "@/assets/images/kingToyCycle.png";

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
        <footer className="mt-20 border-t bg-linear-to-b from-neutral-50 to-white">
            {/* Contact / Business Info Card */}
            <div className="relative -top-18 mx-auto max-w-5xl px-4">
                <div className="grid grid-cols-1 gap-6 rounded-2xl bg-linear-to-r from-blue-600 via-blue-500 to-indigo-500 px-6 py-7 shadow-xl shadow-blue-200 sm:grid-cols-2 lg:grid-cols-3 lg:gap-8 lg:px-8">
                    {/* Proprietor */}
                    <div className="flex items-center gap-4">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white/15 ring-1 ring-white/20">
                            <UserRound className="h-5 w-5 text-white" />
                        </div>

                        <div>
                            <p className="text-xs font-medium uppercase tracking-wider text-blue-100">
                                Proprietor
                            </p>

                            <p className="mt-1 text-base font-bold text-white">
                                Md. Shimul Huda
                            </p>
                        </div>
                    </div>

                    {/* Phone */}
                    <div className="flex items-center gap-4">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white/15 ring-1 ring-white/20">
                            <Phone className="h-5 w-5 text-white" />
                        </div>

                        <div>
                            <p className="text-xs font-medium uppercase tracking-wider text-blue-100">
                                Call Us
                            </p>

                            <div className="mt-1 flex flex-col">
                                <a
                                    href="tel:01632077872"
                                    className="text-sm font-semibold text-white transition-colors hover:text-orange-200"
                                >
                                    01632-077872
                                </a>

                                <a
                                    href="tel:01409708418"
                                    className="text-sm font-semibold text-white transition-colors hover:text-orange-200"
                                >
                                    01409-708418
                                </a>
                            </div>
                        </div>
                    </div>

                    {/* Address */}
                    <div className="flex items-start gap-4 sm:col-span-2 lg:col-span-1">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white/15 ring-1 ring-white/20">
                            <MapPin className="h-5 w-5 text-white" />
                        </div>

                        <div>
                            <p className="text-xs font-medium uppercase tracking-wider text-blue-100">
                                Visit Us
                            </p>

                            <p className="mt-1 text-sm font-medium leading-5 text-white">
                                85 Kazi Allauddin Road, Bongshal,
                                <br />
                                Nazira Bazar
                            </p>

                            <p className="mt-1 text-xs leading-5 text-blue-100">
                                Besides Nazira Bazar Girls School
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Footer */}
            <div className="mx-auto max-w-7xl px-4 pb-8 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-5 lg:gap-8">
                    {/* Brand */}
                    <div className="sm:col-span-2 lg:col-span-2">
                        <Link href="/" className="inline-block">
                            <Image
                                src={Logo}
                                width={220}
                                height={110}
                                alt="King Toy Cycle Logo"
                                className="h-auto w-45 object-contain sm:w-50"
                            />
                        </Link>

                        <p className="mt-3 max-w-md text-sm leading-6 text-neutral-600">
                            All kinds of Try Cycle, Charger Bike Retailer &
                            Wholesale.
                        </p>

                        <div className="mt-4 inline-flex items-center rounded-full bg-orange-50 px-4 py-2 text-xs font-semibold text-orange-600 ring-1 ring-orange-100">
                            Retail & Wholesale
                        </div>
                    </div>

                    {/* Footer Links */}
                    {FOOTER_LINKS.map((section) => (
                        <div key={section.title}>
                            <h3 className="text-sm font-bold text-neutral-900">
                                {section.title}
                            </h3>

                            <ul className="mt-4 space-y-3">
                                {section.links.map((link) => (
                                    <li key={link.href}>
                                        <Link
                                            href={link.href}
                                            className="text-sm text-neutral-600 transition-all duration-200 hover:pl-1 hover:text-blue-600"
                                        >
                                            {link.label}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>

                {/* Bottom Footer */}
                <div className="mt-10 flex flex-col gap-3 border-t border-neutral-200 pt-6 text-center text-sm text-neutral-500 sm:flex-row sm:items-center sm:justify-between sm:text-left">
                    <p>
                        © {year} {SITE_NAME}. All rights reserved.
                    </p>

                    <p className="font-medium">
                        Quality Toys{" "}
                        <span className="mx-1 text-orange-500">•</span> Retail &
                        Wholesale
                    </p>
                </div>
            </div>
        </footer>
    );
}
