import type { ReactNode } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { Button } from "./ui/button";

type LayoutProps = { children: ReactNode };

export default function Layout({ children }: LayoutProps) {
  const { user, logout } = useAuthStore();

  const isAdmin = user?.role === "admin";

  return (
    <div className="flex h-screen bg-background text-foreground">
      {/* Sidebar */}
      <aside className="w-64 bg-card text-card-foreground border-r shadow-sm p-4 hidden md:block">
        <h2 className="text-xl font-bold mb-6">
          {isAdmin ? "Admin Panel" : "Ticketing"}
        </h2>

        <nav className="space-y-3 text-sm">
          {isAdmin ? (
            <>
              <a href="#" className="block hover:text-primary">
                Dashboard
              </a>
              <a href="/tickets" className="block hover:text-primary">
                Tutti i ticket
              </a>
              <a href="#" className="block hover:text-primary">
                Gestione utenti
              </a>
            </>
          ) : (
            <>
              <a href="#" className="block hover:text-primary">
                I miei ticket
              </a>
              <a href="#" className="block hover:text-primary">
                Crea nuovo ticket
              </a>
              <a href="#" className="block hover:text-primary">
                Profilo
              </a>
            </>
          )}
        </nav>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col">
        <header className="bg-card text-card-foreground border-b shadow-sm flex justify-between items-center px-6 py-3">
          <span className="font-semibold">
            Ciao, {user?.name} ({user?.role})
          </span>
          <Button variant="destructive" onClick={logout}>Logout</Button>
        </header>

        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}

