import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useAuthStore } from "@/store/useAuthStore";
import { ThemeProvider } from "@/components/theme-provider-";

import LoginPage from "@/pages/LoginPage";
import DashboardPage from "@/pages/DashboardPage";
import TicketsPage from "@/pages/TicketsPage";
import TicketDetailPage from "@/pages/TicketDetailPage";

// 🔒 Componente per proteggere le route private
function PrivateRoute({ children }: { children: React.ReactElement }) {
  const { isAuthenticated, isLoading } = useAuthStore();

  if (isLoading) return <p className="p-6 text-gray-500">Caricamento...</p>;

  return isAuthenticated ? children : <Navigate to="/login" replace />;
}

export default function App() {
  const { isAuthenticated, isLoading, checkAuth } = useAuthStore();

  useEffect(() => {
    // ✅ Controlla la sessione al caricamento dell'app
    void checkAuth();

    // ✅ Aggiorna lo stato quando cambia la sessione Supabase (login/logout)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        // Quando cambia la sessione, aggiorna lo stato dallo store
        useAuthStore.setState({
          user: session.user
            ? {
                id: session.user.id,
                name: (session.user.user_metadata?.name as string | undefined) ?? null,
                email: session.user.email ?? null,
                role:
                  (session.user.user_metadata?.role as string | undefined) ??
                  (session.user.app_metadata?.role as string | undefined) ??
                  "user",
              }
            : null,
          accessToken: session.access_token,
          isAuthenticated: Boolean(session.access_token),
          isLoading: false,
          error: null,
        });
      } else {
        useAuthStore.setState({
          user: null,
          accessToken: null,
          isAuthenticated: false,
          isLoading: false,
        });
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [checkAuth]);

  if (isLoading) return <p className="p-6 text-gray-500">Caricamento...</p>;

  return (
    <ThemeProvider defaultTheme="system">
      <BrowserRouter>
        <Routes>
          {/* LOGIN */}
          <Route
            path="/login"
            element={
              isAuthenticated ? (
                <Navigate to="/dashboard" replace />
              ) : (
                <LoginPage />
              )
            }
          />

          {/* DASHBOARD */}
          <Route
            path="/dashboard"
            element={
              <PrivateRoute>
                <DashboardPage />
              </PrivateRoute>
            }
          />

          {/* LISTA TICKET */}
          <Route
            path="/tickets"
            element={
              <PrivateRoute>
                <TicketsPage />
              </PrivateRoute>
            }
          />

          {/* DETTAGLIO TICKET */}
          <Route
            path="/tickets/:id"
            element={
              <PrivateRoute>
                <TicketDetailPage />
              </PrivateRoute>
            }
          />

          {/* DEFAULT */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}
