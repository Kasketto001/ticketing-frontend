import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";
import api from "../utils/api";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface Ticket {
  id: number;
  title: string;
  description: string;
  status: string;
  priority: string;
  created_at: string;
}

export default function TicketDetailPage() {
  const { id } = useParams();
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { accessToken } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTicket = async () => {
      try {
        if (!id) return;
        const res = await api.get(`/tickets/${id}`, {
          headers: accessToken
            ? { Authorization: `Bearer ${accessToken}` }
            : undefined,
        });
        const payload = res.data?.data ?? res.data;
        setTicket(payload);
        setError(null);
      } catch (err: any) {
        const status = err?.response?.status;
        if (status === 403) {
          setError("Non hai i permessi per visualizzare questo ticket.");
        } else if (status === 404) {
          navigate("/tickets", { replace: true });
        } else {
          console.error("Errore nel caricamento ticket:", err);
          setError("Si è verificato un errore durante il caricamento.");
        }
      }
    };
    fetchTicket();
  }, [id, accessToken, navigate]);

  if (error)
    return (
      <div className="p-6 flex flex-col items-center justify-center min-h-[60vh]">
        <Alert variant="destructive" className="max-w-lg w-full">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        <Button className="mt-6" onClick={() => navigate("/tickets")}>
          Torna alla lista
        </Button>
      </div>
    );

  // 🔸 Render Loading
  if (!ticket)
    return (
      <div className="p-6 flex justify-center items-center h-[70vh]">
        <p className="text-muted-foreground animate-pulse">Caricamento...</p>
      </div>
    );

  // 🔸 Render Dettagli Ticket
  return (
    <div className="p-6 min-h-screen flex flex-col items-center bg-background text-foreground transition-colors duration-300">

        <Card className="shadow-xl border border-border bg-card/80 backdrop-blur-sm transition-colors duration-300">
          <CardHeader className="flex justify-between items-center pb-2">
            <CardTitle className="text-2xl font-bold tracking-tight">
              {ticket.title}
            </CardTitle>
            <Badge
              className={`text-white capitalize ${
                ticket.status === "open"
                  ? "bg-green-500 hover:bg-green-600"
                  : ticket.status === "closed"
                  ? "bg-red-500 hover:bg-red-600"
                  : "bg-yellow-500 hover:bg-yellow-600"
              }`}
            >
              {ticket.status}
            </Badge>
          </CardHeader>

          <CardContent className="space-y-4 pt-4">
            <p className="text-base leading-relaxed whitespace-pre-line">
              {ticket.description || "Nessuna descrizione disponibile."}
            </p>

            <div className="grid gap-2 text-sm text-muted-foreground">
              <div>
                <span className="font-medium text-foreground">Priorità:</span>{" "}
                <Badge
                  variant={
                    ticket.priority === "high"
                      ? "destructive"
                      : ticket.priority === "medium"
                      ? "secondary"
                      : "outline"
                  }
                  className="capitalize"
                >
                  {ticket.priority}
                </Badge>
              </div>
              <div>
                <span className="font-medium text-foreground">Creato il:</span>{" "}
                {new Date(ticket.created_at).toLocaleString()}
              </div>
            </div>
          </CardContent>

          <CardFooter className="flex justify-end pt-6">
            <Button
              variant="outline"
              onClick={() => navigate("/tickets")}
              className="hover:bg-accent transition-colors"
            >
              ← Torna alla lista
            </Button>
          </CardFooter>
        </Card>

    </div>
  );
}
