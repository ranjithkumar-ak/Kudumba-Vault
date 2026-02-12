import { useVault } from "@/context/VaultContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { ShieldAlert, ShieldX, ShieldCheck, AlertTriangle, Zap } from "lucide-react";

const AlertsPage = () => {
  const { alerts, addAlert, documents } = useVault();

  const triggerDemo = () => {
    addAlert({
      type: "Unauthorized Access Attempt",
      description: "Login attempt with incorrect credentials from unknown IP",
      timestamp: new Date().toISOString(),
      status: "blocked",
      ip: `${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
      details: "Automated brute-force attempt detected and blocked. IP has been blacklisted.",
    });
    toast({ title: "🚨 Security Alert!", description: "Unauthorized access attempt detected and blocked.", variant: "destructive" });
  };

  const statusConfig = {
    blocked: { icon: ShieldX, color: "bg-destructive/10 text-destructive", badge: "destructive" as const },
    warning: { icon: AlertTriangle, color: "bg-[hsl(var(--vault-warning))]/10 text-[hsl(var(--vault-warning))]", badge: "secondary" as const },
    resolved: { icon: ShieldCheck, color: "bg-accent/10 text-accent", badge: "default" as const },
  };

  const allLogs = documents.flatMap(d => d.accessLog.map(l => ({ ...l, docName: d.name }))).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).slice(0, 15);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Security Alerts</h1>
          <p className="mt-1 text-muted-foreground">Monitor vault security and access activity</p>
        </div>
        <Button onClick={triggerDemo} variant="destructive" className="gap-2">
          <Zap className="h-4 w-4" /> Trigger Security Alert Demo
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {alerts.map((alert, i) => {
          const cfg = statusConfig[alert.status];
          return (
            <motion.div key={alert.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
              <Card>
                <CardContent className="p-5">
                  <div className="mb-3 flex items-start justify-between">
                    <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${cfg.color}`}>
                      <cfg.icon className="h-5 w-5" />
                    </div>
                    <Badge variant={cfg.badge}>{alert.status.charAt(0).toUpperCase() + alert.status.slice(1)}</Badge>
                  </div>
                  <h3 className="font-semibold">{alert.type}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{alert.description}</p>
                  <div className="mt-3 space-y-1 text-xs text-muted-foreground">
                    <p>📍 IP: {alert.ip}</p>
                    <p>🕐 {format(new Date(alert.timestamp), "PPpp")}</p>
                  </div>
                  <p className="mt-3 rounded bg-muted p-2 text-xs text-muted-foreground">{alert.details}</p>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      <Card>
        <CardHeader><CardTitle>Complete Access Log</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Action</TableHead>
                <TableHead>Document</TableHead>
                <TableHead>Time</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {allLogs.map(l => (
                <TableRow key={l.id}>
                  <TableCell className="font-medium">{l.userName}</TableCell>
                  <TableCell>{l.action}</TableCell>
                  <TableCell>{l.docName}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{format(new Date(l.timestamp), "MMM d, HH:mm")}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default AlertsPage;
