"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, LayoutGrid, ShoppingBag, Heart, ListTodo } from "lucide-react";

import { cn } from "@/lib/utils";
import { useCartStore } from "@/store/cart-store";
import { useWishlistStore } from "@/store/wishlist-store";

/* Vivid palette */
const BAR = "#FFF1F4"; // halka pinkish background
const ACCENT = "#F0245C"; // main pink-red (active, wishlist badge)
const ACCENT_LIGHT = "#FF5C8A"; // gradient start
const ACCENT_DARK = "#D81B4F"; // gradient end
const INACTIVE = "#4B5063"; // gaŕho slate (icon/text)

const MobileBottomNav = () => {
    const pathname = usePathname();
    const [mounted, setMounted] = useState(false);

    const cartTotal = useCartStore((state) => state.totalItems());
    const wishlistTotal = useWishlistStore((state) => state.items.length);

    useEffect(() => {
        setMounted(true);
    }, []);

    const cartCount = mounted ? cartTotal : 0;
    const wishlistCount = mounted ? wishlistTotal : 0;

    const isActive = (path: string) => {
        if (path === "/") return pathname === "/";
        return pathname === path || pathname.startsWith(`${path}/`);
    };

    const cartActive = isActive("/cart");

    return (
        <nav
            className="
                fixed inset-x-0 bottom-0 z-100
                px-3
                pb-[calc(8px+env(safe-area-inset-bottom))]
                md:hidden
            "
        >
            <div className="relative mx-auto h-14.5 w-full max-w-110">
                {/* ============ BAR (left + circular notch + right) ============ */}
                <div className="flex h-full w-full drop-shadow-[0_-3px_16px_rgba(240,36,92,0.18)]">
                    {/* LEFT */}
                    <div
                        className="flex h-full flex-1 items-center rounded-l-[18px] pl-1"
                        style={{ background: BAR }}
                    >
                        <NavItem
                            href="/"
                            label="Home"
                            icon={Home}
                            active={isActive("/")}
                        />
                        <NavItem
                            href="/products"
                            label="Category"
                            icon={LayoutGrid}
                            active={isActive("/categories")}
                        />
                    </div>

                    {/* CENTER: circle notch + rounded top corners */}
                    <svg
                        width="106"
                        height="58"
                        viewBox="0 0 106 58"
                        className="mx-[-0.5px] block shrink-0"
                        aria-hidden="true"
                    >
                        <path
                            d="M0 0 H13.81
                               A8 8 0 0 1 21.65 6.4
                               A32 32 0 0 0 84.35 6.4
                               A8 8 0 0 1 92.19 0
                               H106 V58 H0 Z"
                            fill={BAR}
                        />
                    </svg>

                    {/* RIGHT */}
                    <div
                        className="flex h-full flex-1 items-center rounded-r-[18px] pr-1"
                        style={{ background: BAR }}
                    >
                        <NavItem
                            href="/products"
                            label="All Product"
                            icon={ListTodo}
                            active={isActive("/products")}
                        />
                        <NavItem
                            href="/wishlist"
                            label="Wishlist"
                            icon={Heart}
                            active={isActive("/wishlist")}
                            badge={
                                wishlistCount > 0
                                    ? wishlistCount > 99
                                        ? "99+"
                                        : wishlistCount
                                    : undefined
                            }
                        />
                    </div>
                </div>

                {/* ================= CENTER CART BUTTON ================= */}
                <Link
                    href="/cart"
                    aria-label="Cart"
                    className="
                        group absolute left-1/2 -top-5.25
                        -translate-x-1/2
                        transition-transform active:scale-95
                    "
                >
                    <div
                        className="
                            relative flex h-12 w-12
                            items-center justify-center
                            rounded-full
                            shadow-[0_8px_18px_rgba(240,36,92,0.45)]
                            transition-transform duration-200
                            group-hover:scale-[1.05]
                        "
                        style={{
                            background: `linear-gradient(145deg, ${ACCENT_LIGHT} 0%, ${ACCENT} 55%, ${ACCENT_DARK} 100%)`,
                        }}
                    >
                        <ShoppingBag
                            className="h-5.5 w-5.5 text-white"
                            strokeWidth={2}
                        />

                        {/* CART BADGE (red-400) */}
                        <span
                            className="
                                absolute -right-1.25 -top-1.25
                                flex h-4.75 min-w-4.75
                                items-center justify-center
                                rounded-full border-2 border-white
                                bg-red-600 px-0.75
                                text-[9px] font-bold leading-none text-white
                            "
                        >
                            {cartCount > 99 ? "99+" : cartCount}
                        </span>
                    </div>
                </Link>

                {/* ================= CART LABEL ================= */}
                <Link
                    href="/cart"
                    tabIndex={-1}
                    aria-hidden="true"
                    className={cn(
                        "absolute bottom-1.5 left-1/2 -translate-x-1/2",
                        "whitespace-nowrap text-[7px] uppercase tracking-wide",
                        "transition-colors duration-200",
                        cartActive ? "font-extrabold" : "font-semibold",
                    )}
                    style={{ color: cartActive ? ACCENT : INACTIVE }}
                >
                    Cart
                </Link>
            </div>
        </nav>
    );
};

/* =========================================================
   NAV ITEM
========================================================= */

type NavItemProps = {
    href: string;
    label: string;
    icon: React.ElementType;
    active?: boolean;
    badge?: string | number;
};

const NavItem = ({
    href,
    label,
    icon: Icon,
    active = false,
    badge,
}: NavItemProps) => {
    return (
        <Link
            href={href}
            aria-label={label}
            className="flex h-full flex-1 flex-col items-center justify-center gap-0.5 transition-all duration-200 active:scale-95"
        >
            {/* ICON */}
            <div
                className={cn(
                    "relative flex h-6.5 w-10 items-center justify-center rounded-full transition-all duration-200",
                    active ? "bg-[#F0245C]/15" : "bg-transparent",
                )}
            >
                <Icon
                    className="h-4.75 w-4.75 transition-colors duration-200"
                    strokeWidth={active ? 2.3 : 1.9}
                    fill={active ? ACCENT : "none"}
                    fillOpacity={active ? 0.18 : 0}
                    style={{ color: active ? ACCENT : INACTIVE }}
                />

                {badge !== undefined && (
                    <span
                        className="
                            absolute right-0.75 top-75
                            flex h-3.5 min-w-3.5
                            items-center justify-center
                            rounded-full border-2 px-0.5
                            text-[7px] font-bold leading-none text-white
                        "
                        style={{ background: ACCENT, borderColor: BAR }}
                    >
                        {badge}
                    </span>
                )}
            </div>

            <span
                className={cn(
                    "whitespace-nowrap text-[7px] uppercase tracking-wide transition-colors duration-200",
                    active ? "font-extrabold" : "font-semibold",
                )}
                style={{ color: active ? ACCENT : INACTIVE }}
            >
                {label}
            </span>
        </Link>
    );
};

export default MobileBottomNav;
