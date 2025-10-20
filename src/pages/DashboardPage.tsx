import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Layout from "@/components/Layout";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/store/useAuthStore";
import { supabase } from "@/lib/supabaseClient";
import { toast } from "sonner";
import {
  Ticket,
  CheckCircle2,
  Clock,
  PlusCircle,
  RefreshCcw,
} from "lucide-react";

interface TicketItem {
  id: number;
  title: string;
  status: string;
  updated_at: string;
}

export default function DashboardPage() {
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const [openTickets, setOpenTickets] = useState<number>(0);
  const [closedTickets, setClosedTickets] = useState<number>(0);
  const [recentTickets, setRecentTickets] = useState<TicketItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [lastUpdate, setLastUpdate] = useState<string>("—");

  // Carica i dati dal backend
useEffect(() => {
  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);

      // Admin -> tutti i ticket | User -> solo i propri
      const query =
        user?.role === "admin"
          ? supabase.from("tickets").select("*")
          : supabase.from("tickets").select("*").eq("user_id", user?.id);

      const { data, error } = await query.order("created_at", { ascending: false });

      if (error) throw error;
      if (!data) return;

      const openCount = data.filter((t) => t.status === "open").length;
      const closedCount = data.filter((t) => t.status === "closed").length;

      setOpenTickets(openCount);
      setClosedTickets(closedCount);
      setRecentTickets(data.slice(0, 5));
      setLastUpdate(new Date().toLocaleString());
    } catch (err: unknown) {
      if (err instanceof Error) {
        console.error("Errore caricamento dashboard:", err.message);
        toast.error(err.message);
      } else {
        console.error("Errore sconosciuto:", err);
        toast.error("Errore durante il caricamento dei dati");
      }
    } finally {
      setIsLoading(false);
    }
  };

  fetchDashboardData();
}, [user]);


  return (
    <Layout>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="p-4 md:p-6"
      >
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Benvenuto{user?.name ? `, ${user.name}` : ""} 👋
            </h1>
            <p className="text-muted-foreground text-sm">
              {user?.role === "admin"
                ? "Panoramica generale dei ticket del sistema"
                : "Ecco un riepilogo dei tuoi ticket"}
            </p>
          </div>
          <div className="flex gap-2">
            {user?.role !== "admin" && (
              <Button onClick={() => navigate("/tickets/new")}>
                <PlusCircle className="w-4 h-4 mr-2" />
                Nuovo Ticket
              </Button>
            )}
            <Button
              variant="outline"
              onClick={() => window.location.reload()}
              disabled={isLoading}
            >
              <RefreshCcw className="w-4 h-4 mr-2" />
              Aggiorna
            </Button>
          </div>
        </div>

        {isLoading ? (
          <p className="text-muted-foreground text-sm">Caricamento dati...</p>
        ) : (
          <>
            {/* Stat cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
              <Card className="shadow-sm hover:shadow-md transition-all">
                <CardHeader className="flex items-center justify-between">
                  <CardTitle className="text-base font-semibold flex items-center gap-2">
                    <Ticket className="w-4 h-4 text-blue-500" /> Ticket aperti
                  </CardTitle>
                  <CardDescription>Situazione attuale</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold">{openTickets}</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    ancora da gestire
                  </p>
                </CardContent>
              </Card>

              <Card className="shadow-sm hover:shadow-md transition-all">
                <CardHeader className="flex items-center justify-between">
                  <CardTitle className="text-base font-semibold flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-500" /> Ticket chiusi
                  </CardTitle>
                  <CardDescription>Totale risolti</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold">{closedTickets}</p>
                  <p className="text-sm text-muted-foreground mt-1">conclusi</p>
                </CardContent>
              </Card>

              <Card className="shadow-sm hover:shadow-md transition-all">
                <CardHeader className="flex items-center justify-between">
                  <CardTitle className="text-base font-semibold flex items-center gap-2">
                    <Clock className="w-4 h-4 text-orange-500" /> Ultimo aggiornamento
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{lastUpdate}</p>
                </CardContent>
              </Card>
            </div>

            <Separator className="my-6" />

            {/* Recent activity */}
            <div>
              <h2 className="text-xl font-semibold mb-3">
                🕓 Attività recenti
              </h2>
              {recentTickets.length === 0 ? (
                <p className="text-muted-foreground text-sm">
                  Nessuna attività recente.
                </p>
              ) : (
                <ul className="space-y-2 text-sm text-muted-foreground">
                  {recentTickets.map((ticket) => (
                    <li
                      key={ticket.id}
                      className="flex justify-between items-center border-b border-border pb-2"
                    >
                      <span>
                        {ticket.status === "closed" ? "✅" : "🎫"}{" "}
                        {ticket.title.length > 40
                          ? ticket.title.slice(0, 40) + "..."
                          : ticket.title}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {new Date(ticket.updated_at).toLocaleDateString()}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </>
        )}
      </motion.div>
    </Layout>
  );
}
