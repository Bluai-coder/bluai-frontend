
// ============================================================
// lib/auth-store.ts — FINAL RBAC STORE (MODULE-BASED)
// ============================================================

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";





// ============================================================
// STORE
// ============================================================

export const useAuthStore = create()(
  persist(
    (set, get) => ({
      accessToken: null,
      refreshToken: null,
      user: null,
      tenant: null,
      isAuthenticated: false,

      hasHydrated: false,

      setHasHydrated: (state) => set({ hasHydrated: state }),

      setAuth: ({ accessToken, refreshToken, user, tenant }) =>
        set({
          accessToken,
          refreshToken,
          user,
          tenant,
          isAuthenticated: true,
        }),

      setTokens: (accessToken, refreshToken) =>
        set({ accessToken, refreshToken }),

      setUser: (user) => set({ user }),

      logout: () =>
        set({
          accessToken: null,
          refreshToken: null,
          user: null,
          tenant: null,
          isAuthenticated: false,
        }),

      // ========================================================
      // RBAC HELPERS (MODULE BASED)
      // ========================================================

      hasRole: (role) => {
        const { user } = get();
        if (!user) return false;

        return user.roles.some(
          (r) => r.name === role || r.name === "lab_director"
        );
      },

      hasAnyRole: (...roles) => {
        const { user } = get();
        if (!user) return false;

        return user.roles.some(
          (r) => roles.includes(r.name) || r.name === "lab_director"
        );
      },

      hasPermission: (module, action) => {
        const { user } = get();
        if (!user) return false;

        // super admin bypass
        if (user?.roles?.some((r) => r.name === "admin")) {
          return true;
        }
        if (user.permissions?.all == "*") {
          return true;
        }

        return user.permissions?.[module]?.includes(action) || false;
      },
    }),
    {
      name: "pathlims-auth",

      storage:
        typeof window !== "undefined"
          ? createJSONStorage(() => localStorage)
          : undefined,

      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },

      partialize: (state) => ({
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        user: state.user,
        tenant: state.tenant,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);