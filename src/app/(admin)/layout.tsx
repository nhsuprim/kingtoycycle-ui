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
        const checkAuth = async () => {
            try {
                const data = await api.get<{ user: any }>("/auth/me");
                setUser(data.user);
                if (isLoginPage) router.push("/admin/dashboard");
            } catch {
                setUser(null);
                if (!isLoginPage) router.push("/login");
            } finally {
                setLoading(false);
            }
        };
        checkAuth();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    if (isLoginPage) {
        return <>{children}</>;
    }

    if (isLoading) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <p className="text-sm text-neutral-500">Loading...</p>
            </div>
        );
    }

    if (!user) {
        return null;
    }

    return (
        <div className="flex min-h-screen">
            {/* Desktop sidebar — শুধু md ও তার উপরে দেখা যাবে */}
            <aside className="hidden w-64 shrink-0 border-r md:block">
                <AdminSidebar />
            </aside>

            <div className="flex min-h-screen flex-1 flex-col">
                {/* Mobile top bar — শুধু md-এর নিচে দেখা যাবে */}
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
