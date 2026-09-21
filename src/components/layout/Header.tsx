"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { ShoppingCart, Search, Menu, X, Heart } from "lucide-react";
import Image from "next/image";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

import {
    Sheet,
    SheetContent,
    SheetTrigger,
    SheetTitle,
} from "@/components/ui/sheet";

import { cn } from "@/lib/utils";
import { api } from "@/lib/api";
import { useCartStore } from "@/store/cart-store";
import { SITE_NAME } from "@/lib/constants";
import type { Product } from "@/types/product";
import Logo from "@/assets/images/kingToyCycle.png";

const NAV_LINKS = [
    { label: "Home", href: "/" },
    { label: "All Products", href: "/products" },
    { label: "Categories", href: "/categories" },
    { label: "Track Order", href: "/track-order" },
];

export default function Header() {
    const [scrolled, setScrolled] = useState(false);
    const [searchOpen, setSearchOpen] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);

    const searchRef = useRef<HTMLInputElement>(null);

    const [searchTerm, setSearchTerm] = useState("");
    const [allProducts, setAllProducts] = useState<Product[]>([]);

    // ==================================================
    // CART
    // ==================================================

    const totalItems = useCartStore((state) => state.totalItems());
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const cartCount = mounted ? totalItems : 0;

    // ==================================================
    // FETCH PRODUCTS
    // ==================================================

    useEffect(() => {
        async function fetchProducts() {
            try {
                const products = await api.get<Product[]>("/product");
                setAllProducts(products);
            } catch (error) {
                console.error("Error fetching products:", error);
            }
        }

        fetchProducts();
    }, []);

    // ==================================================
    // SEARCH
    // ==================================================

    const searchResults = allProducts.filter((product) =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()),
    );

    // ==================================================
    // SCROLL
    // ==================================================

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.pageYOffset > 0);
        };

        window.addEventListener("scroll", handleScroll);

        return () => {
            window.removeEventListener("scroll", handleScroll);
        };
    }, []);

    // ==================================================
    // SEARCH DROPDOWN
    // ==================================================

    const renderSearchDropdown = (imageSize: number) => (
        <ul className="absolute left-0 right-0 z-100 mt-1 max-h-72 overflow-y-auto rounded-xl border border-gray-100 bg-white shadow-lg">
            {searchResults.length > 0 ? (
                searchResults.map((product) => (
                    <li
                        key={product.id}
                        className="transition-colors duration-150 hover:bg-gray-50"
                    >
                        <Link
                            href={`/products/${product.id}`}
                            onClick={() => setSearchTerm("")}
                            className="flex items-center justify-between gap-3 px-3 py-2.5"
                        >
                            <div className="flex min-w-0 items-center gap-3">
                                <Image
                                    src={product.thumbnailImage}
                                    alt={product.name}
                                    width={imageSize}
                                    height={imageSize}
                                    className="shrink-0 rounded-md object-cover"
                                />

                                <p className="truncate text-sm font-medium text-gray-800">
                                    {product.name}
                                </p>
                            </div>

                            <span className="shrink-0 text-sm font-semibold text-gray-900">
                                ৳{product.discountPrice ?? product.regularPrice}
                            </span>
                        </Link>
                    </li>
                ))
            ) : (
                <li className="px-4 py-6 text-center text-sm text-gray-400">
                    No products found
                </li>
            )}
        </ul>
    );

    return (
        <>
            {/* ==================================================
                DESKTOP: TOP HEADER
            ================================================== */}

            <header
                className={cn(
                    "relative z-50 hidden w-full border-b border-gray-100 bg-white transition-all duration-500 ease-in-out will-change-transform md:block",
                    scrolled
                        ? "max-h-0 overflow-hidden border-transparent opacity-0"
                        : "max-h-24 opacity-100",
                )}
                aria-hidden={scrolled}
            >
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex h-16 items-center gap-4 py-2 md:gap-8">
                        {/* LOGO */}

                        <Link
                            href="/"
                            className="shrink-0 group"
                            aria-label={`${SITE_NAME} — Home`}
                        >
                            <Image
                                src={Logo}
                                height={100}
                                width={120}
                                alt="King Toy Cycle Logo"
                            />
                        </Link>

                        {/* SEARCH */}

                        <div className="mx-auto max-w-2xl flex-1">
                            <div className="group relative">
                                <Search
                                    className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 transition-colors duration-200 group-focus-within:text-black"
                                    aria-hidden
                                />

                                <Input
                                    ref={searchRef}
                                    type="search"
                                    value={searchTerm}
                                    onChange={(e) =>
                                        setSearchTerm(e.target.value)
                                    }
                                    placeholder="Search for toys, brands, categories..."
                                    className="h-10 rounded-full border-gray-200 bg-gray-50 pl-10 pr-4 text-sm placeholder:text-gray-400 hover:border-gray-300 hover:bg-white focus-visible:border-black focus-visible:ring-1 focus-visible:ring-black"
                                    aria-label="Search products"
                                />

                                {searchTerm && renderSearchDropdown(44)}
                            </div>
                        </div>

                        {/* ACTIONS */}

                        <div className="flex shrink-0 items-center gap-1">
                            {/* WISHLIST */}

                            <Link href="/wishlist">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-9 w-9 rounded-full hover:bg-gray-100"
                                    aria-label="Wishlist"
                                >
                                    <Heart
                                        className="h-4.5 w-4.5"
                                        strokeWidth={1.8}
                                    />
                                </Button>
                            </Link>

                            {/* CART */}

                            <Link
                                href="/cart"
                                className="relative inline-flex h-9 w-9 items-center justify-center rounded-full hover:bg-gray-100"
                                aria-label={`Cart — ${cartCount} items`}
                            >
                                <ShoppingCart
                                    className="h-4.5 w-4.5"
                                    strokeWidth={1.8}
                                />

                                {cartCount > 0 && (
                                    <Badge className="absolute -right-0.5 -top-0.5 flex h-4.5 min-w-4.5 items-center justify-center rounded-full border-2 border-white bg-black px-1 text-[10px] font-semibold leading-none text-white">
                                        {cartCount}
                                    </Badge>
                                )}
                            </Link>
                        </div>
                    </div>
                </div>
            </header>

            {/* ==================================================
                MOBILE: TOP BAR
            ================================================== */}

            <div className="w-full border-b border-gray-100 bg-white md:hidden">
                <div className="flex h-14 items-center justify-between px-4">
                    {/* LOGO */}

                    <Link href="/" aria-label={`${SITE_NAME} — Home`}>
                        <Image
                            src={Logo}
                            height={60}
                            width={100}
                            alt="King Toy Cycle Logo"
                        />
                    </Link>

                    <div className="flex items-center gap-1">
                        {/* CART */}

                        <Link
                            href="/cart"
                            className="relative inline-flex h-9 w-9 items-center justify-center rounded-full hover:bg-gray-100"
                            aria-label={`Cart — ${cartCount} items`}
                        >
                            <ShoppingCart
                                className="h-4.5 w-4.5"
                                strokeWidth={1.8}
                            />

                            {cartCount > 0 && (
                                <span className="absolute right-0.5 top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full border-[1.5px] border-white bg-black px-0.75 text-[9px] font-bold leading-none text-white">
                                    {cartCount}
                                </span>
                            )}
                        </Link>

                        {/* MOBILE MENU */}

                        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
                            <SheetTrigger
                                render={
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-9 w-9 rounded-full"
                                        aria-label="Open menu"
                                    />
                                }
                            >
                                {mobileOpen ? (
                                    <X className="h-5 w-5" strokeWidth={1.8} />
                                ) : (
                                    <Menu
                                        className="h-5 w-5"
                                        strokeWidth={1.8}
                                    />
                                )}
                            </SheetTrigger>

                            <SheetContent side="left" className="w-72 p-0">
                                <SheetTitle className="sr-only">
                                    <Image
                                        src={Logo}
                                        height={60}
                                        width={100}
                                        alt="King Toy Cycle Logo"
                                    />
                                </SheetTitle>

                                <div className="flex h-full flex-col">
                                    {/* MOBILE MENU HEADER */}

                                    <div className="flex items-center border-b border-gray-100 px-6 py-5">
                                        <Image
                                            src={Logo}
                                            height={100}
                                            width={100}
                                            alt="King Toy Cycle Logo"
                                        />
                                    </div>

                                    {/* MOBILE NAV */}

                                    <nav className="flex-1 overflow-y-auto px-4 py-3">
                                        <ul role="list" className="space-y-0.5">
                                            {NAV_LINKS.map((link) => (
                                                <li key={link.href}>
                                                    <Link
                                                        href={link.href}
                                                        onClick={() =>
                                                            setMobileOpen(false)
                                                        }
                                                        className="flex items-center rounded-lg px-3 py-3 text-base font-medium text-gray-700 transition-colors duration-150 hover:bg-gray-50 hover:text-black"
                                                    >
                                                        {link.label}
                                                    </Link>
                                                </li>
                                            ))}
                                        </ul>
                                    </nav>

                                    {/* MOBILE CART */}

                                    <div className="border-t border-gray-100 px-6 py-5">
                                        <Link
                                            href="/cart"
                                            onClick={() => setMobileOpen(false)}
                                        >
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="relative w-full gap-2 rounded-full text-sm"
                                            >
                                                <ShoppingCart
                                                    className="h-4 w-4"
                                                    strokeWidth={1.8}
                                                />
                                                View Cart
                                                {cartCount > 0 && (
                                                    <span className="absolute -right-1.5 -top-1.5 flex h-4.5 min-w-4.5 items-center justify-center rounded-full border-2 border-white bg-black px-1 text-[10px] font-bold leading-none text-white">
                                                        {cartCount}
                                                    </span>
                                                )}
                                            </Button>
                                        </Link>
                                    </div>
                                </div>
                            </SheetContent>
                        </Sheet>
                    </div>
                </div>

                {/* MOBILE SEARCH */}

                <div className="px-4 pb-2.5">
                    <div className="relative">
                        <Search
                            className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
                            aria-hidden
                        />

                        <Input
                            type="search"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Search products..."
                            className="h-9 rounded-full border-gray-200 bg-gray-50 pl-10 pr-4 text-sm focus-visible:border-black focus-visible:ring-1 focus-visible:ring-black"
                            aria-label="Search products"
                        />

                        {searchTerm && renderSearchDropdown(40)}
                    </div>
                </div>
            </div>

            {/* ==================================================
                DESKTOP: BOTTOM NAV
                MENU IS ALWAYS CENTERED
            ================================================== */}

            <nav
                className={cn(
                    "z-40 hidden w-full border-b border-gray-100 bg-white transition-all duration-300 md:block",
                    scrolled
                        ? "sticky top-0 shadow-[0_1px_8px_rgba(0,0,0,0.06)]"
                        : "",
                )}
                aria-label="Main navigation"
            >
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    {/* relative container keeps menu perfectly centered */}

                    <div className="relative flex h-12 items-center justify-center">
                        {/* ==================================================
                            STICKY LOGO - LEFT
                        ================================================== */}

                        <div
                            className={cn(
                                "absolute left-0 shrink-0 overflow-hidden transition-all duration-300",
                                scrolled
                                    ? "w-auto opacity-100"
                                    : "w-0 opacity-0",
                            )}
                            aria-hidden={!scrolled}
                        >
                            <Link href="/" tabIndex={scrolled ? 0 : -1}>
                                <Image
                                    src={Logo}
                                    height={60}
                                    width={90}
                                    alt="King Toy Cycle Logo"
                                />
                            </Link>
                        </div>

                        {/* ==================================================
                            CENTER NAVIGATION
                        ================================================== */}

                        <ul
                            className="flex items-center justify-center gap-0.5"
                            role="list"
                        >
                            {NAV_LINKS.map((link) => (
                                <li key={link.href}>
                                    <Link
                                        href={link.href}
                                        className="group relative flex items-center px-3.5 py-2 text-sm font-medium text-gray-600 transition-colors duration-150 hover:text-black"
                                    >
                                        {link.label}

                                        <span
                                            className="absolute bottom-1 left-1/2 h-[1.5px] w-0 -translate-x-1/2 rounded-full bg-black transition-all duration-300 group-hover:w-[calc(100%-1.75rem)]"
                                            aria-hidden
                                        />
                                    </Link>
                                </li>
                            ))}
                        </ul>

                        {/* ==================================================
                            RIGHT ACTIONS - SEARCH + CART
                        ================================================== */}

                        <div
                            className={cn(
                                "absolute right-0 flex shrink-0 items-center gap-1 transition-all duration-300",
                                scrolled
                                    ? "pointer-events-auto opacity-100"
                                    : "pointer-events-none opacity-0",
                            )}
                            aria-hidden={!scrolled}
                        >
                            {/* SEARCH */}

                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 rounded-full hover:bg-gray-100"
                                onClick={() => setSearchOpen(true)}
                                tabIndex={scrolled ? 0 : -1}
                                aria-label="Open search"
                            >
                                <Search className="h-4 w-4" strokeWidth={1.8} />
                            </Button>

                            {/* CART */}

                            <Link
                                href="/cart"
                                className="relative inline-flex h-8 w-8 items-center justify-center rounded-full hover:bg-gray-100"
                                aria-label={`Cart — ${cartCount} items`}
                                tabIndex={scrolled ? 0 : -1}
                            >
                                <ShoppingCart
                                    className="h-4 w-4"
                                    strokeWidth={1.8}
                                />

                                {cartCount > 0 && (
                                    <span className="absolute right-0.5 top-0.5 flex h-3.75 min-w-3.75 items-center justify-center rounded-full border-[1.5px] border-white bg-black px-0.75 text-[9px] font-bold leading-none text-white">
                                        {cartCount}
                                    </span>
                                )}
                            </Link>
                        </div>
                    </div>
                </div>
            </nav>

            {/* ==================================================
                DESKTOP FULLSCREEN SEARCH OVERLAY
            ================================================== */}

            {searchOpen && (
                <div
                    className="fixed inset-0 z-60 flex flex-col bg-white/95 backdrop-blur-sm"
                    role="dialog"
                    aria-label="Search"
                    aria-modal
                >
                    <div className="container mx-auto px-4 py-4 sm:px-6">
                        <div className="flex items-center gap-3">
                            <div className="relative flex-1">
                                <Search
                                    className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400"
                                    aria-hidden
                                />

                                <Input
                                    type="search"
                                    value={searchTerm}
                                    onChange={(e) =>
                                        setSearchTerm(e.target.value)
                                    }
                                    placeholder="Search for toys, brands, categories..."
                                    autoFocus
                                    className="h-12 rounded-xl border-gray-200 bg-gray-50 pl-12 text-base focus-visible:border-black focus-visible:ring-1 focus-visible:ring-black"
                                />

                                {searchTerm && renderSearchDropdown(48)}
                            </div>

                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-10 w-10 shrink-0 rounded-full"
                                onClick={() => {
                                    setSearchOpen(false);
                                    setSearchTerm("");
                                }}
                                aria-label="Close search"
                            >
                                <X className="h-5 w-5" />
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
