import { motion } from "framer-motion";
import Layout from "../components/Layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Separator } from "../components/ui/separator";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";
import {
  Ticket,
  CheckCircle2,
  Clock,
  PlusCircle,
  RefreshCcw,
} from "lucide-react";

export default function DashboardPage() {
  const navigate = useNavigate();
  const { user } = useAuthStore();

  // Simulazione dati
  const openTickets = 3;
  const closedTickets = 12;
  const lastUpdate = "15 ottobre 2025";

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
              Ecco una panoramica della tua attività
            </p>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => navigate("/tickets/new")}>
              <PlusCircle className="w-4 h-4 mr-2" />
              Nuovo Ticket
            </Button>
            <Button variant="outline" onClick={() => window.location.reload()}>
              <RefreshCcw className="w-4 h-4 mr-2" />
              Aggiorna
            </Button>
          </div>
        </div>

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
              <CardDescription>Ultimi 30 giorni</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{closedTickets}</p>
              <p className="text-sm text-muted-foreground mt-1">risolti</p>
            </CardContent>
          </Card>

          <Card className="shadow-sm hover:shadow-md transition-all">
            <CardHeader className="flex items-center justify-between">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <Clock className="w-4 h-4 text-orange-500" /> Ultimo aggiornamento
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-lg">{lastUpdate}</p>
            </CardContent>
          </Card>
        </div>

        <Separator className="my-6" />

        {/* Recent activity */}
        <div>
          <h2 className="text-xl font-semibold mb-3">🕓 Attività recenti</h2>
          <div className="space-y-2 text-sm text-muted-foreground">
            <p>✅ Hai chiuso il ticket #12: "Problema login"</p>
            <p>🎫 Hai aperto il ticket #15: "Errore API 403"</p>
            <p>🧰 Il ticket #13 è stato aggiornato</p>
          </div>
        </div>
      </motion.div>
    </Layout>
  );
}
