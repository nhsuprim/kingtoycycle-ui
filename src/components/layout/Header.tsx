"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { ShoppingCart, Search, Menu, X, User, Heart } from "lucide-react";
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

    // --------------------------------------------------
    // CART
    // --------------------------------------------------

    const totalItems = useCartStore((state) => state.totalItems());

    /**
     * Important:
     *
     * Zustand persist/localStorage data is not available
     * during SSR.
     *
     * Server renders cart count as 0.
     * After hydration, actual cart count is displayed.
     *
     * This prevents:
     *
     * Server:
     * Cart — 0 items
     *
     * Client:
     * Cart — 2 items
     *
     * hydration mismatch.
     */
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const cartCount = mounted ? totalItems : 0;

    // --------------------------------------------------
    // FETCH PRODUCTS
    // --------------------------------------------------

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

    // --------------------------------------------------
    // SEARCH
    // --------------------------------------------------

    const searchResults = allProducts.filter((product) =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()),
    );

    // --------------------------------------------------
    // SCROLL
    // --------------------------------------------------

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.pageYOffset > 0);
        };

        window.addEventListener("scroll", handleScroll);

        return () => {
            window.removeEventListener("scroll", handleScroll);
        };
    }, []);

    // --------------------------------------------------
    // SEARCH DROPDOWN
    // --------------------------------------------------

    const renderSearchDropdown = (imageSize: number) => (
        <ul className="absolute z-100 left-0 right-0 mt-1 bg-white border border-gray-100 shadow-lg rounded-xl max-h-72 overflow-y-auto">
            {searchResults.length > 0 ? (
                searchResults.map((product) => (
                    <li
                        key={product.id}
                        className="hover:bg-gray-50 transition-colors duration-150"
                    >
                        <Link
                            href={`/products/${product.id}`}
                            onClick={() => setSearchTerm("")}
                            className="flex items-center justify-between px-3 py-2.5 gap-3"
                        >
                            <div className="flex items-center gap-3 min-w-0">
                                <Image
                                    src={product.thumbnailImage}
                                    alt={product.name}
                                    width={imageSize}
                                    height={imageSize}
                                    className="rounded-md object-cover shrink-0"
                                />

                                <p className="text-sm font-medium text-gray-800 truncate">
                                    {product.name}
                                </p>
                            </div>

                            <span className="text-sm font-semibold text-gray-900 shrink-0">
                                ৳{product.discountPrice ?? product.regularPrice}
                            </span>
                        </Link>
                    </li>
                ))
            ) : (
                <li className="px-4 py-6 text-sm text-gray-400 text-center">
                    No products found
                </li>
            )}
        </ul>
    );

    // --------------------------------------------------
    // RENDER
    // --------------------------------------------------

    return (
        <>
            {/* ==================================================
                DESKTOP: TOP HEADER
            ================================================== */}

            <header
                className={cn(
                    "hidden md:block relative z-50 w-full bg-white border-b border-gray-100 transition-all duration-500 ease-in-out will-change-transform",
                    scrolled
                        ? "max-h-0 opacity-0 overflow-hidden border-transparent"
                        : "max-h-24 opacity-100",
                )}
                aria-hidden={scrolled}
            >
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center h-16 gap-4 md:gap-8">
                        {/* LOGO */}

                        <Link
                            href="/"
                            className="shrink-0 group"
                            aria-label={`${SITE_NAME} — Home`}
                        >
                            <span className="text-2xl font-black tracking-[0.15em] text-black group-hover:opacity-70 transition-opacity duration-200">
                                {SITE_NAME}
                            </span>
                        </Link>

                        {/* SEARCH */}

                        <div className="flex-1 max-w-2xl mx-auto">
                            <div className="relative group">
                                <Search
                                    className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 group-focus-within:text-black transition-colors duration-200"
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
                                    className="pl-10 pr-4 h-10 bg-gray-50 border-gray-200 rounded-full
                                               focus-visible:ring-1 focus-visible:ring-black focus-visible:border-black
                                               hover:border-gray-300 hover:bg-white
                                               transition-all duration-200 text-sm placeholder:text-gray-400"
                                    aria-label="Search products"
                                />

                                {searchTerm && renderSearchDropdown(44)}
                            </div>
                        </div>

                        {/* ACTIONS */}

                        <div className="shrink-0 flex items-center gap-1">
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
                                className="relative inline-flex items-center justify-center h-9 w-9 rounded-full hover:bg-gray-100"
                                aria-label={`Cart — ${cartCount} items`}
                            >
                                <ShoppingCart
                                    className="h-4.5 w-4.5"
                                    strokeWidth={1.8}
                                />

                                {cartCount > 0 && (
                                    <Badge className="absolute -top-0.5 -right-0.5 h-4.5 min-w-4.5 px-1 flex items-center justify-center text-[10px] font-semibold bg-black text-white border-2 border-white rounded-full leading-none">
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

            <div className="md:hidden w-full bg-white border-b border-gray-100">
                <div className="flex items-center justify-between px-4 h-14">
                    {/* LOGO */}

                    <Link href="/" aria-label={`${SITE_NAME} — Home`}>
                        <span className="text-xl font-black tracking-[0.15em] text-black">
                            {SITE_NAME}
                        </span>
                    </Link>

                    <div className="flex items-center gap-1">
                        {/* CART */}

                        <Link
                            href="/cart"
                            className="relative inline-flex items-center justify-center h-9 w-9 rounded-full hover:bg-gray-100"
                            aria-label={`Cart — ${cartCount} items`}
                        >
                            <ShoppingCart
                                className="h-4.5 w-4.5"
                                strokeWidth={1.8}
                            />

                            {cartCount > 0 && (
                                <span className="absolute top-0.5 right-0.5 h-4 min-w-4 px-0.75 flex items-center justify-center text-[9px] font-bold bg-black text-white rounded-full leading-none border-[1.5px] border-white">
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
                                    {SITE_NAME} Menu
                                </SheetTitle>

                                <div className="flex flex-col h-full">
                                    {/* MOBILE MENU HEADER */}

                                    <div className="flex items-center px-6 py-5 border-b border-gray-100">
                                        <span className="text-xl font-black tracking-[0.15em]">
                                            {SITE_NAME}
                                        </span>
                                    </div>

                                    {/* NAV LINKS */}

                                    <nav className="flex-1 overflow-y-auto px-4 py-3">
                                        <ul role="list" className="space-y-0.5">
                                            {NAV_LINKS.map((link) => (
                                                <li key={link.href}>
                                                    <Link
                                                        href={link.href}
                                                        onClick={() =>
                                                            setMobileOpen(false)
                                                        }
                                                        className="flex items-center px-3 py-3 text-base font-medium text-gray-700
                                                                   hover:text-black hover:bg-gray-50 rounded-lg transition-colors duration-150"
                                                    >
                                                        {link.label}
                                                    </Link>
                                                </li>
                                            ))}
                                        </ul>
                                    </nav>

                                    {/* VIEW CART */}

                                    <div className="px-6 py-5 border-t border-gray-100">
                                        <Link
                                            href="/cart"
                                            onClick={() => setMobileOpen(false)}
                                        >
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="w-full gap-2 rounded-full text-sm relative"
                                            >
                                                <ShoppingCart
                                                    className="h-4 w-4"
                                                    strokeWidth={1.8}
                                                />
                                                View Cart
                                                {cartCount > 0 && (
                                                    <span className="absolute -top-1.5 -right-1.5 h-4.5 min-w-4.5 px-1 flex items-center justify-center text-[10px] font-bold bg-black text-white rounded-full border-2 border-white leading-none">
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
                            className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400"
                            aria-hidden
                        />

                        <Input
                            type="search"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Search products..."
                            className="pl-10 pr-4 h-9 bg-gray-50 border-gray-200 rounded-full text-sm
                                       focus-visible:ring-1 focus-visible:ring-black focus-visible:border-black"
                            aria-label="Search products"
                        />

                        {searchTerm && renderSearchDropdown(40)}
                    </div>
                </div>
            </div>

            {/* ==================================================
                DESKTOP: BOTTOM NAV
            ================================================== */}

            <nav
                className={cn(
                    "hidden md:block w-full bg-white border-b border-gray-100 z-40 transition-all duration-300",
                    scrolled
                        ? "sticky top-0 shadow-[0_1px_8px_rgba(0,0,0,0.06)]"
                        : "",
                )}
                aria-label="Main navigation"
            >
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center h-12 gap-4">
                        {/* STICKY LOGO */}

                        <div
                            className={cn(
                                "shrink-0 transition-all duration-300 overflow-hidden",
                                scrolled
                                    ? "w-auto opacity-100 mr-2"
                                    : "w-0 opacity-0",
                            )}
                            aria-hidden={!scrolled}
                        >
                            <Link href="/" tabIndex={scrolled ? 0 : -1}>
                                <span className="text-lg font-black tracking-[0.15em] text-black whitespace-nowrap">
                                    {SITE_NAME}
                                </span>
                            </Link>
                        </div>

                        {/* NAVIGATION LINKS */}

                        <ul
                            className="flex items-center gap-0.5 flex-1"
                            role="list"
                        >
                            {NAV_LINKS.map((link) => (
                                <li key={link.href}>
                                    <Link
                                        href={link.href}
                                        className="relative px-3.5 py-2 text-sm font-medium text-gray-600
                                                   hover:text-black transition-colors duration-150
                                                   group flex items-center"
                                    >
                                        {link.label}

                                        <span
                                            className="absolute bottom-1 left-1/2 -translate-x-1/2
                                                       h-[1.5px] w-0 bg-black rounded-full
                                                       transition-all duration-300 group-hover:w-[calc(100%-1.75rem)]"
                                            aria-hidden
                                        />
                                    </Link>
                                </li>
                            ))}
                        </ul>

                        {/* RIGHT ACTIONS */}

                        <div
                            className={cn(
                                "flex items-center gap-1 shrink-0 transition-all duration-300",
                                scrolled
                                    ? "opacity-100 pointer-events-auto"
                                    : "opacity-0 pointer-events-none",
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
                                className="relative inline-flex items-center justify-center h-8 w-8 rounded-full hover:bg-gray-100"
                                aria-label={`Cart — ${cartCount} items`}
                                tabIndex={scrolled ? 0 : -1}
                            >
                                <ShoppingCart
                                    className="h-4 w-4"
                                    strokeWidth={1.8}
                                />

                                {cartCount > 0 && (
                                    <span className="absolute top-0.5 right-0.5 h-3.75 min-w-3.75 px-0.75 flex items-center justify-center text-[9px] font-bold bg-black text-white rounded-full border-[1.5px] border-white leading-none">
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
                    className="fixed inset-0 z-60 bg-white/95 backdrop-blur-sm flex flex-col"
                    role="dialog"
                    aria-label="Search"
                    aria-modal
                >
                    <div className="container mx-auto px-4 sm:px-6 py-4">
                        <div className="flex items-center gap-3">
                            <div className="relative flex-1">
                                <Search
                                    className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400"
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
                                    className="pl-12 h-12 text-base bg-gray-50 border-gray-200 rounded-xl
                                               focus-visible:ring-1 focus-visible:ring-black focus-visible:border-black"
                                />

                                {searchTerm && renderSearchDropdown(48)}
                            </div>

                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-10 w-10 rounded-full shrink-0"
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
