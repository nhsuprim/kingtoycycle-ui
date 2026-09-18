"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
    LayoutDashboard,
    Package,
    FolderTree,
    ShoppingBag,
    Ticket,
    Users,
    Truck,
    BarChart3,
    LogOut,
    Star,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { api } from "@/lib/api";
import { showToast } from "@/lib/toast";
import { useAuthStore } from "@/store/auth-store";
import { SITE_NAME } from "@/lib/constants";

const NAV_ITEMS = [
    { label: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
    { label: "Products", href: "/admin/products", icon: Package },
    { label: "Categories", href: "/admin/categories", icon: FolderTree },
    { label: "Orders", href: "/admin/orders", icon: ShoppingBag },
    { label: "Coupons", href: "/admin/coupons", icon: Ticket },
    { label: "Shipping", href: "/admin/shipping", icon: Truck },
    { label: "Staff", href: "/admin/staff", icon: Users },
    { label: "Reports", href: "/admin/reports", icon: BarChart3 },
    { label: "Reviews", href: "/admin/reviews", icon: Star },
];

interface AdminSidebarProps {
    onNavigate?: () => void; // mobile-এ link ক্লিক করলে sheet বন্ধ করার জন্য
}

const AdminSidebar = ({ onNavigate }: AdminSidebarProps) => {
    const pathname = usePathname();
    const router = useRouter();
    const setUser = useAuthStore((s) => s.setUser);

    const handleLogout = async () => {
        try {
            await api.post("/auth/logout", {});
            showToast.success("Logged out successfully");
        } catch {
            showToast.error("Logout failed");
        } finally {
            setUser(null);
            router.push("/login");
        }
    };

    return (
        <div className="flex h-full flex-col bg-white">
            <div className="border-b px-6 py-5">
                <span className="text-lg font-bold">{SITE_NAME}</span>
                <p className="text-xs text-neutral-500">Admin Panel</p>
            </div>

            <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
                {NAV_ITEMS.map((item) => {
                    const isActive = pathname === item.href;
                    const Icon = item.icon;

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            onClick={onNavigate}
                            className={cn(
                                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                                isActive
                                    ? "bg-neutral-900 text-white"
                                    : "text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900",
                            )}
                        >
                            <Icon className="h-4 w-4" />
                            {item.label}
                        </Link>
                    );
                })}
            </nav>

            <div className="border-t p-3">
                <button
                    onClick={handleLogout}
                    className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900"
                >
                    <LogOut className="h-4 w-4" />
                    Logout
                </button>
            </div>
        </div>
    );
};

export default AdminSidebar;
