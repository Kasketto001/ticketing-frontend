import Layout from "../components/Layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/card";

export default function DashboardPage() {
  return (
    <Layout>
      <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Ticket aperti</CardTitle>
            <CardDescription>Situazione attuale</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">3 ticket ancora da gestire</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Ticket chiusi</CardTitle>
            <CardDescription>Ultimi 30 giorni</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">12 risolti</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Ultimo aggiornamento</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">15 ottobre 2025</p>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
