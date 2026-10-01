"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, LayoutGrid, Star, Heart, ShoppingBag } from "lucide-react";
import { cn } from "@/lib/utils";
import { useCartStore } from "@/store/cart-store";
import { useWishlistStore } from "@/store/wishlist-store";

const MobileBottomNav = () => {
    const pathname = usePathname();
    const [mounted, setMounted] = useState(false);

    const cartCount = useCartStore((s) => s.totalItems());
    const wishlistCount = useWishlistStore((s) => s.items.length);

    useEffect(() => {
        setMounted(true);
    }, []);

    const isActive = (path: string) => pathname === path;

    const NAV_ITEMS = [
        {
            label: "Home",
            href: "/",
            icon: Home,
        },
        {
            label: "Categories",
            href: "/products",
            icon: LayoutGrid,
        },
    ];

    const SIDE_ITEMS = [
        {
            label: "Wishlist",
            href: "/wishlist",
            icon: Heart,
            count: mounted ? wishlistCount : 0,
        },
        {
            label: "Cart",
            href: "/cart",
            icon: ShoppingBag,
            count: mounted ? cartCount : 0,
        },
    ];

    return (
        <nav
            className="
                fixed inset-x-0 bottom-0 z-40
                flex items-center justify-around
                border-t border-yellow-100
                bg-yellow-50/95
                shadow-[0_-4px_20px_rgba(120,53,15,0.08)]
                backdrop-blur-md
                pb-[env(safe-area-inset-bottom,0px)]
                md:hidden
            "
        >
            {/* Left Navigation */}
            {NAV_ITEMS.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.href);

                return (
                    <Link
                        key={item.href}
                        href={item.href}
                        className="group flex flex-1 flex-col items-center justify-center py-2.5"
                    >
                        <div
                            className={cn(
                                "flex h-9 w-12 items-center justify-center rounded-xl transition-all duration-200",
                                active
                                    ? "bg-yellow-200 shadow-sm"
                                    : "bg-transparent group-active:bg-yellow-100",
                            )}
                        >
                            <Icon
                                className={cn(
                                    "h-5 w-5 transition-all duration-200",
                                    active
                                        ? "text-red-800"
                                        : "text-red-500 group-active:text-red-700",
                                )}
                                strokeWidth={active ? 2.4 : 1.9}
                            />
                        </div>

                        <span
                            className={cn(
                                "mt-0.5 text-[10px] transition-colors",
                                active
                                    ? "font-bold text-red-800"
                                    : "font-medium text-red-500",
                            )}
                        >
                            {item.label}
                        </span>
                    </Link>
                );
            })}

            {/* Center Shop */}
            <div className="relative flex flex-1 flex-col items-center">
                <Link
                    href="/products"
                    aria-label="Shop"
                    className="
                        -mt-7
                        flex h-14 w-14
                        items-center justify-center
                        rounded-full
                        border-[3px] border-white
                        bg-yellow-200
                        shadow-[0_5px_18px_rgba(220,38,38,0.18)]
                        ring-1 ring-yellow-300
                        transition-all duration-200
                        hover:bg-yellow-300
                        active:scale-95
                    "
                >
                    <Star
                        className="h-6 w-6 fill-red-500 text-red-500"
                        strokeWidth={1.8}
                    />
                </Link>

                <span className="mt-1 text-[10px] font-bold text-red-700">
                    Shop
                </span>
            </div>

            {/* Right Navigation */}
            {SIDE_ITEMS.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.href);

                return (
                    <Link
                        key={item.href}
                        href={item.href}
                        className="group relative flex flex-1 flex-col items-center justify-center py-2.5"
                    >
                        <div
                            className={cn(
                                "relative flex h-9 w-12 items-center justify-center rounded-xl transition-all duration-200",
                                active
                                    ? "bg-yellow-200 shadow-sm"
                                    : "bg-transparent group-active:bg-yellow-100",
                            )}
                        >
                            <Icon
                                className={cn(
                                    "h-5 w-5 transition-all duration-200",
                                    active
                                        ? "text-red-800"
                                        : "text-red-500 group-active:text-red-700",
                                )}
                                strokeWidth={active ? 2.4 : 1.9}
                            />

                            {/* Badge */}
                            {item.count > 0 && (
                                <span
                                    className="
                                        absolute -right-0.5 -top-1.5
                                        flex h-4.25 min-w-4.25
                                        items-center justify-center
                                        rounded-full
                                        border-2 border-yellow-50
                                        bg-red-500
                                        px-1
                                        text-[8px]
                                        font-bold
                                        leading-none
                                        text-white
                                        shadow-sm
                                    "
                                >
                                    {item.count > 9 ? "9+" : item.count}
                                </span>
                            )}
                        </div>

                        <span
                            className={cn(
                                "mt-0.5 text-[10px] transition-colors",
                                active
                                    ? "font-bold text-red-800"
                                    : "font-medium text-red-500",
                            )}
                        >
                            {item.label}
                        </span>
                    </Link>
                );
            })}
        </nav>
    );
};

export default MobileBottomNav;
