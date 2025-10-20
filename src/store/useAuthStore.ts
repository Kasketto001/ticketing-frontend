import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Session, User as SupabaseUser } from "@supabase/supabase-js";
import { supabase } from "../utils/supabaseClient";

type AppUser = {
  id: string;
  name: string | null;
  email: string | null;
  role: string | null;
};

interface AuthState {
  user: AppUser | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<void>;
  checkAuth: () => Promise<void>;
  clearError: () => void;
}

const mapSupabaseUser = (user: SupabaseUser | null): AppUser | null => {
  if (!user) return null;

  const metadata = (user.user_metadata ?? {}) as Record<string, unknown>;
  const appMetadata = (user.app_metadata ?? {}) as Record<string, unknown>;

  const derivedRole =
    (metadata.role as string | undefined) ??
    (Array.isArray(appMetadata.roles) ? (appMetadata.roles as string[])[0] : undefined) ??
    (appMetadata.role as string | undefined) ??
    (user.role === "authenticated" ? "user" : user.role ?? undefined);

  const derivedName =
    (metadata.name as string | undefined) ??
    (metadata.full_name as string | undefined) ??
    (metadata.display_name as string | undefined) ??
    (user.email ? user.email.split("@")[0] : undefined) ??
    null;

  return {
    id: user.id,
    name: derivedName,
    email: user.email ?? null,
    role: derivedRole ?? null,
  };
};

const updateStateFromSession = (session: Session | null) => {
  const mappedUser = mapSupabaseUser(session?.user ?? null);
  return {
    user: mappedUser,
    accessToken: session?.access_token ?? null,
    isAuthenticated: Boolean(session?.access_token),
    isLoading: false,
    error: null,
  };
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => {
      const syncWithSession = async () => {
        try {
          const {
            data: { session },
          } = await supabase.auth.getSession();
          set(updateStateFromSession(session));
        } catch (error) {
          console.error("Impossibile sincronizzare la sessione Supabase:", error);
        }
      };

      void syncWithSession();

      return {
        user: null,
        accessToken: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,

        login: async (email, password) => {
          set({ isLoading: true, error: null });
          const { data, error } = await supabase.auth.signInWithPassword({ email, password });

          if (error) {
            set({
              user: null,
              accessToken: null,
              isAuthenticated: false,
              isLoading: false,
              error: error.message ?? "Errore di autenticazione",
            });
            throw error;
          }

          set({
            ...updateStateFromSession(data.session),
          });
        },

        logout: async () => {
          set({ isLoading: true });
          const { error } = await supabase.auth.signOut();
          if (error) {
            console.error("Errore durante il logout:", error);
          }
          set({
            user: null,
            accessToken: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,
          });
        },

        refreshToken: async () => {
          const { data, error } = await supabase.auth.refreshSession();
          if (error) {
            console.error("Refresh token scaduto", error);
            await get().logout();
            throw error;
          }
          set({
            ...updateStateFromSession(data.session),
          });
        },

        checkAuth: async () => {
          set({ isLoading: true });
          try {
            const {
              data: { session },
            } = await supabase.auth.getSession();
            set(updateStateFromSession(session));
          } catch (error) {
            console.error("Sessione non valida", error);
            set({
              user: null,
              accessToken: null,
              isAuthenticated: false,
              isLoading: false,
              error: "Sessione non valida",
            });
          }
        },

        clearError: () => set({ error: null }),
      };
    },
    {
      name: "auth-storage",
      partialize: (state) => ({
        accessToken: state.accessToken,
        user: state.user,
      }),
    }
  )
);
