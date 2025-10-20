import { useState, type ReactNode } from "react";
import { useNavigate, NavLink } from "react-router-dom";
import { useAuthStore } from "@/store/useAuthStore";
import { Button } from "@/components/ui/button";
import {
  Ticket,
  LayoutDashboard,
  Users,
  PlusCircle,
  UserCircle2,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";

type LayoutProps = { children: ReactNode };

export default function Layout({ children }: LayoutProps) {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const isAdmin = user?.role === "admin";

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const navLinks = isAdmin
    ? [
        { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
        { to: "/tickets", label: "Tutti i ticket", icon: Ticket },
        { to: "/users", label: "Gestione utenti", icon: Users },
      ]
    : [
        { to: "/tickets", label: "I miei ticket", icon: Ticket },
        { to: "/tickets/new", label: "Crea nuovo ticket", icon: PlusCircle },
        { to: "/profile", label: "Profilo", icon: UserCircle2 },
      ];

  return (
    <div className="flex h-screen bg-background text-foreground">
      {/* Mobile Sidebar Toggle */}
      <div className="md:hidden absolute top-4 left-4 z-40">
        <Button
          variant="outline"
          size="icon"
          aria-label={sidebarOpen ? "Chiudi menu" : "Apri menu"}
          onClick={() => setSidebarOpen((prev) => !prev)}
        >
          {sidebarOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
        </Button>
      </div>

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed md:static z-30 top-0 left-0 h-full w-64 bg-card text-card-foreground border-r shadow-sm transform transition-transform duration-300 ease-in-out p-4",
          sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        )}
      >
        <h2 className="text-xl font-bold mb-6 select-none">
          {isAdmin ? "Admin Panel" : "Ticketing"}
        </h2>

        <nav className="space-y-2 text-sm">
          {navLinks.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-2 px-3 py-2 rounded-md transition-colors",
                  isActive
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "hover:bg-muted hover:text-foreground"
                )
              }
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span className="truncate">{label}</span>
            </NavLink>
          ))}
        </nav>
      </aside>

      {/* Main area */}
      <div className="flex-1 flex flex-col md:ml-0">
        {/* Header */}
        <header className="bg-card text-card-foreground border-b shadow-sm flex justify-between items-center px-6 py-3">
          <div className="flex flex-col">
            <span className="font-semibold">
              Ciao, {user?.name ?? "Utente"}
            </span>
            <span className="text-xs text-muted-foreground">
              Ruolo: {user?.role ?? "user"}
            </span>
          </div>
          <Button
            variant="destructive"
            size="sm"
            onClick={handleLogout}
            aria-label="Logout"
          >
            <LogOut className="w-4 h-4 mr-1" />
            Logout
          </Button>
        </header>

        {/* Main content */}
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}
