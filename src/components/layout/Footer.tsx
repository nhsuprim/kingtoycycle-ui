import Link from "next/link";
import Image from "next/image";
import { Phone, MapPin, UserRound } from "lucide-react";

import { SITE_NAME } from "@/lib/constants";
import Logo from "@/assets/images/kingToyCycle.png";
import bannerImg from "@/assets/images/backgroundimg.png";

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
            { label: "Track Order", href: "/track-order" },
        ],
    },
];

export default function Footer() {
    const year = new Date().getFullYear();

    return (
        <footer className="relative mt-20 border-t border-neutral-200">
            {/* Background Image */}
            <div
                className="pointer-events-none absolute inset-0 bg-cover bg-center bg-no-repeat"
                style={{
                    backgroundImage: `url(${bannerImg.src})`,
                }}
            />

            {/* Background Overlay */}
            <div className="pointer-events-none absolute inset-0 bg-white/90" />

            {/* Footer Content */}
            <div className="relative z-10">
                {/* Contact / Business Info Card */}
                <div className="relative mx-auto -mt-18 max-w-5xl px-4">
                    <div className="grid grid-cols-1 gap-6 rounded-2xl bg-linear-to-r from-blue-600 via-blue-500 to-indigo-500 px-6 py-7 text-center shadow-xl shadow-blue-200 sm:grid-cols-2 sm:text-left lg:grid-cols-3 lg:gap-8 lg:px-8">
                        {/* Proprietor */}
                        <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-center">
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
                        <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-center">
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
                        <div className="flex flex-col items-center gap-4 text-center sm:col-span-2 sm:flex-row sm:items-start sm:text-left lg:col-span-1">
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
                <div className="mx-auto max-w-7xl px-4 pb-8 pt-12 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 gap-10 text-center sm:grid-cols-2 sm:text-left lg:grid-cols-5 lg:gap-8 align-middle items-center">
                        {/* Brand */}
                        <div className="flex flex-col items-center sm:col-span-2 sm:items-start lg:col-span-2">
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
                                                className="text-sm text-neutral-600 transition-all duration-200 hover:text-blue-600 sm:hover:pl-1"
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
                    <div className="mt-10 flex flex-col items-center gap-3 border-t border-neutral-200 pt-6 text-center text-sm text-neutral-500 sm:flex-row sm:items-center sm:justify-between sm:text-left">
                        <p>
                            © {year} {SITE_NAME}. All rights reserved.
                        </p>

                        <p className="font-medium">
                            Quality Toys{" "}
                            <span className="mx-1 text-orange-500">•</span>
                            Retail & Wholesale
                        </p>
                    </div>
                </div>
            </div>
        </footer>
    );
}
