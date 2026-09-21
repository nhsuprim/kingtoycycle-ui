"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Menu } from "lucide-react";

import { api } from "@/lib/api";
import { useAuthStore } from "@/store/auth-store";
import { Button } from "@/components/ui/button";

import {
    Sheet,
    SheetContent,
    SheetTrigger,
    SheetTitle,
} from "@/components/ui/sheet";

import AdminSidebar from "@/components/admin/AdminSidebar";
import { SITE_NAME } from "@/lib/constants";

const AdminLayout = ({ children }: { children: React.ReactNode }) => {
    const pathname = usePathname();
    const router = useRouter();

    const { user, isLoading, setUser, setLoading } = useAuthStore();

    const [mobileNavOpen, setMobileNavOpen] = useState(false);

    const isLoginPage = pathname === "/login";

    useEffect(() => {
        // Login page হলে auth check করার দরকার নেই
        if (isLoginPage) {
            setLoading(false);
            return;
        }

        let mounted = true;

        const checkAuth = async () => {
            try {
                const data = await api.get<{ user: any }>("/auth/me");

                if (!mounted) return;

                setUser(data.user);
            } catch (error) {
                if (!mounted) return;

                console.error("Auth check failed:", error);

                setUser(null);
                router.replace("/login");
            } finally {
                if (mounted) {
                    setLoading(false);
                }
            }
        };

        checkAuth();

        return () => {
            mounted = false;
        };
    }, [isLoginPage, router, setLoading, setUser]);

    /*
     * Login page:
     * এখানে Admin auth check / sidebar কিছুই দেখাবে না
     */
    if (isLoginPage) {
        return <>{children}</>;
    }

    /*
     * Auth check চলাকালীন
     */
    if (isLoading) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <p className="text-sm text-neutral-500">Loading...</p>
            </div>
        );
    }

    /*
     * Auth না থাকলে কিছু render না করে
     * redirect-এর জন্য অপেক্ষা করবে
     */
    if (!user) {
        return null;
    }

    return (
        <div className="flex min-h-screen">
            {/* Desktop Sidebar */}
            <aside className="hidden w-64 shrink-0 border-r md:block">
                <AdminSidebar />
            </aside>

            <div className="flex min-h-screen flex-1 flex-col">
                {/* Mobile Header */}
                <header className="flex items-center justify-between border-b bg-white px-4 py-3 md:hidden">
                    <span className="text-base font-bold">{SITE_NAME}</span>

                    <Sheet open={mobileNavOpen} onOpenChange={setMobileNavOpen}>
                        <SheetTrigger
                            render={
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    aria-label="Open menu"
                                />
                            }
                        >
                            <Menu className="h-5 w-5" />
                        </SheetTrigger>

                        <SheetContent side="left" className="w-64 p-0">
                            <SheetTitle className="sr-only">
                                Admin Navigation
                            </SheetTitle>

                            <AdminSidebar
                                onNavigate={() => setMobileNavOpen(false)}
                            />
                        </SheetContent>
                    </Sheet>
                </header>

                <main className="flex-1 overflow-x-hidden bg-neutral-50 p-4 md:p-6">
                    {children}
                </main>
            </div>
        </div>
    );
};

export default AdminLayout;
