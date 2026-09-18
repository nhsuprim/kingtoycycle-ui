import { create } from "zustand";
import type { AdminUser } from "@/types/auth";

interface AuthStore {
    user: AdminUser | null;
    isLoading: boolean;
    setUser: (user: AdminUser | null) => void;
    setLoading: (loading: boolean) => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
    user: null,
    isLoading: true,
    setUser: (user) => set({ user }),
    setLoading: (isLoading) => set({ isLoading }),
}));
