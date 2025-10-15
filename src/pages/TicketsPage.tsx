import { useEffect, useState } from "react";
import { useAuthStore } from "../store/useAuthStore";
import api from "../utils/api";
import { useNavigate } from "react-router-dom";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

interface Ticket {
  id: number;
  title: string;
  status: string;
}

export default function TicketsPage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const { accessToken } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTickets = async () => {
      try {
        const res = await api.get("/tickets", {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        const ticketsArray = Array.isArray(res.data) ? res.data : res.data.data;
        setTickets(ticketsArray || []);
      } catch (err) {
        console.error("Errore nel caricamento ticket:", err);
        setTickets([]);
      }
    };
    fetchTickets();
  }, [accessToken]);

  return (
    <div className="p-6">
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle>🎫 I tuoi Ticket</CardTitle>
        </CardHeader>

        <CardContent>
          {tickets.length === 0 ? (
            <p className="text-gray-500">Nessun ticket trovato.</p>
          ) : (
            <Table>
              <TableCaption>Lista completa dei ticket</TableCaption>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Titolo</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Azione</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tickets.map((ticket) => (
                  <TableRow key={ticket.id} className="hover:bg-gray-50">
                    <TableCell>{ticket.id}</TableCell>
                    <TableCell>{ticket.title}</TableCell>
                    <TableCell>

                      <Badge className={`font-semibold ${
                          ticket.status === "open"
                            ? "bg-green-600"
                            : ticket.status === "closed"
                            ? "bg-red-500"
                            : "bg-yellow-500"
                        }`}>{ticket.status} </Badge>

                    
                        

                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="default"
                        onClick={() => navigate(`/tickets/${ticket.id}`)}
                      >
                        Apri
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
