import { create } from "zustand";
import { persist } from "zustand/middleware";
import api from "../utils/api";

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
}

interface AuthState {
  user: User | null;
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

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      login: async (email, password) => {
        set({ isLoading: true, error: null });
        try {
          const response = await api.post("/login", { email, password });
          const data = response.data as any;
          const user: User = data.user;
          const token: string | undefined = data.accessToken ?? data.access_token ?? data.token;

          if (!token) {
            throw new Error("Token non presente nella risposta del server");
          }

          set({
            user,
            accessToken: token,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
        } catch (error: unknown) {
          const errorMessage =
            (error as { response?: { data?: { message?: string } } })?.response?.data?.message || "Errore di autenticazione";
          set({
            user: null,
            accessToken: null,
            isAuthenticated: false,
            isLoading: false,
            error: errorMessage,
          });
          throw error;
        }
      },

      logout: async () => {
        set({ isLoading: true });
        try {
          await api.post("/logout");
        } catch (error) {
          console.error("Errore durante il logout:", error);
        } finally {
          set({
            user: null,
            accessToken: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,
          });
        }
      },

      refreshToken: async () => {
        try {
          const response = await api.post("/refresh");
          const { accessToken }: { accessToken: string } = response.data;
          set({ accessToken });
        } catch (error) {
          console.error("Refresh token scaduto");
          await get().logout();
          throw error;
        }
      },

      checkAuth: async () => {
        const { accessToken } = get();

        if (!accessToken) {
          set({ isAuthenticated: false, user: null });
          return;
        }

        set({ isLoading: true });
        try {
          // Avoid double baseURL prefix; baseURL already has /api
          const response = await api.get("/me");
          set({
            user: response.data.user,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch {
          console.error("Sessione non valida");
          set({
            user: null,
            accessToken: null,
            isAuthenticated: false,
            isLoading: false,
          });
        }
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({
        accessToken: state.accessToken,
      }),
    }
  )
);
