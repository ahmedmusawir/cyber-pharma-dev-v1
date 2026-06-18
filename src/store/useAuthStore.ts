import { create } from "zustand";
import { persist } from "zustand/middleware";
import { AppRole } from "@/utils/app-role";
import type { User as SupabaseUser } from "@supabase/auth-js";

interface AuthState {
  user: SupabaseUser | null;
  role: AppRole | null;
  isAdmin: boolean;
  isMember: boolean;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<string>;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      role: null,
      isAdmin: false,
      isMember: false,
      isAuthenticated: false,
      isLoading: true,
      login: async (email, password) => {
        const response = await fetch("/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        });

        const result = await response.json();
        if (!response.ok) {
          throw new Error(result.error || "Login failed");
        }

        const user: SupabaseUser = result.data.user;
        const role: AppRole | null = result.data.role;

        set({
          user,
          role,
          isAdmin: role === AppRole.ADMIN,
          isMember: role === AppRole.MEMBER,
          isAuthenticated: true,
        });

        // Two-surface split (UI_SPEC v1.3 §A/§E): both roles land on /owedbook.
        // Admins reach the Admin Portal via the navbar switcher.
        if (role === AppRole.ADMIN || role === AppRole.MEMBER) return "/owedbook";
        return "/access-denied";
      },
      logout: async () => {
        const response = await fetch("/api/auth/logout", { method: "POST" });
        if (!response.ok) {
          const result = await response.json();
          throw new Error(result.error || "Logout failed");
        }

        set({
          user: null,
          role: null,
          isAdmin: false,
          isMember: false,
          isAuthenticated: false,
        });
      },
    }),
    {
      name: "auth-store",
    }
  )
);
