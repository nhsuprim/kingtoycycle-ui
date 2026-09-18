"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
} from "@/components/ui/card";
import { api } from "@/lib/api";
import { showToast } from "@/lib/toast";
import { useAuthStore } from "@/store/auth-store";
import { SITE_NAME } from "@/lib/constants";

type Step = "credentials" | "otp";

const AdminLoginPage = () => {
    const router = useRouter();
    const setUser = useAuthStore((s) => s.setUser);

    const [step, setStep] = useState<Step>("credentials");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [otp, setOtp] = useState("");
    const [loading, setLoading] = useState(false);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            await api.post("/auth/login", { email, password });
            showToast.success("OTP sent to your email");
            setStep("otp");
        } catch (err) {
            showToast.error(
                err instanceof Error ? err.message : "Login failed",
            );
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const result = await api.post<{ user: any }>("/auth/verify-otp", {
                email,
                otp,
            });
            setUser({
                id: result.user.id,
                roleId: result.user.roleId,
                permissions: [],
            });
            showToast.success("Login successful");
            router.push("/admin/dashboard");
        } catch (err) {
            showToast.error(err instanceof Error ? err.message : "Invalid OTP");
        } finally {
            setLoading(false);
        }
    };

    const handleResendOtp = async () => {
        try {
            await api.post("/auth/resend-otp", { email });
            showToast.info("A new OTP has been sent");
        } catch (err) {
            showToast.error(
                err instanceof Error ? err.message : "Could not resend OTP",
            );
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-neutral-50 px-4">
            <Card className="w-full max-w-sm">
                <CardHeader>
                    <CardTitle className="text-xl">{SITE_NAME} Admin</CardTitle>
                    <CardDescription>
                        {step === "credentials"
                            ? "Sign in to manage your store"
                            : `Enter the code sent to ${email}`}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {step === "credentials" ? (
                        <form onSubmit={handleLogin} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    autoFocus
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="password">Password</Label>
                                <Input
                                    id="password"
                                    type="password"
                                    value={password}
                                    onChange={(e) =>
                                        setPassword(e.target.value)
                                    }
                                    required
                                />
                            </div>
                            <Button
                                type="submit"
                                className="w-full"
                                disabled={loading}
                            >
                                {loading ? "Sending OTP..." : "Continue"}
                            </Button>
                        </form>
                    ) : (
                        <form onSubmit={handleVerifyOtp} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="otp">Verification Code</Label>
                                <Input
                                    id="otp"
                                    inputMode="numeric"
                                    maxLength={6}
                                    value={otp}
                                    onChange={(e) => setOtp(e.target.value)}
                                    required
                                    autoFocus
                                />
                            </div>
                            <Button
                                type="submit"
                                className="w-full"
                                disabled={loading}
                            >
                                {loading ? "Verifying..." : "Verify & Login"}
                            </Button>
                            <button
                                type="button"
                                onClick={handleResendOtp}
                                className="w-full text-center text-sm text-neutral-500 hover:text-neutral-900"
                            >
                                Resend code
                            </button>
                        </form>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};

export default AdminLoginPage;
