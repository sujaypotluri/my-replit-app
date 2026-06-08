import { useGetClients, getGetClientsQueryKey } from "@workspace/api-client-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Plus, Building2, MoreHorizontal } from "lucide-react";
import { Progress } from "@/components/ui/progress";

export function Clients() {
  const { data: clients, isLoading } = useGetClients({
    query: {
      queryKey: getGetClientsQueryKey(),
    }
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-heading font-bold text-foreground tracking-tight drop-shadow-[0_0_15px_rgba(0,255,240,0.1)]">Clients</h1>
          <p className="text-muted-foreground">Organization management and global utilization metrics.</p>
        </div>
        <Button className="bg-primary hover:bg-primary/90 text-primary-foreground font-medium shadow-[0_0_15px_rgba(0,255,240,0.3)]">
          <Plus className="w-4 h-4 mr-2" />
          Onboard Client
        </Button>
      </div>

      <div className="rounded-md border border-border/50 bg-card/50 backdrop-blur overflow-hidden">
        <Table>
          <TableHeader className="bg-muted/30">
            <TableRow className="border-border/50">
              <TableHead>Organization</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Licenses</TableHead>
              <TableHead>Seat Utilization</TableHead>
              <TableHead>Joined</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array(5).fill(0).map((_, i) => (
                <TableRow key={i} className="border-border/50">
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Skeleton className="w-8 h-8 rounded" />
                      <div className="space-y-1">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-3 w-24" />
                      </div>
                    </div>
                  </TableCell>
                  <TableCell><Skeleton className="h-6 w-20 rounded-full" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-12" /></TableCell>
                  <TableCell><Skeleton className="h-2 w-32 rounded-full" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                  <TableCell className="text-right"><Skeleton className="h-8 w-8 ml-auto" /></TableCell>
                </TableRow>
              ))
            ) : clients?.map((client) => (
              <TableRow key={client.id} className="border-border/50 hover:bg-muted/20">
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded bg-primary/10 flex items-center justify-center border border-primary/20 text-primary">
                      <Building2 className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-medium">{client.name}</div>
                      <div className="text-xs text-muted-foreground">{client.industry || 'Unknown Industry'}</div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <StatusBadge status={client.status} />
                </TableCell>
                <TableCell className="font-mono">{client.totalLicenses}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Progress 
                      value={client.utilizationRate || 0} 
                      className="h-2 w-[100px] bg-muted/50"
                      indicatorClassName={(client.utilizationRate || 0) > 90 ? "bg-destructive" : "bg-primary"}
                    />
                    <span className="text-xs text-muted-foreground w-12 text-right font-mono">
                      {Math.round(client.utilizationRate || 0)}%
                    </span>
                  </div>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {new Date(client.createdAt).toLocaleDateString()}
                </TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="icon" className="h-8 w-8 hover:text-primary">
                    <MoreHorizontal className="w-4 h-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}