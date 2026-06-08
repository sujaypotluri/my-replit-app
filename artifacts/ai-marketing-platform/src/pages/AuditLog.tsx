import { useGetAuditLogs, getGetAuditLogsQueryKey } from "@workspace/api-client-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Activity, Clock, Shield, User } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export function AuditLog() {
  const { data: logs, isLoading } = useGetAuditLogs({}, {
    query: {
      queryKey: getGetAuditLogsQueryKey({}),
    }
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-heading font-bold text-foreground tracking-tight drop-shadow-[0_0_15px_rgba(0,255,240,0.1)]">System Audit</h1>
        <p className="text-muted-foreground">Immutable ledger of platform activities and mutations.</p>
      </div>

      <Card className="bg-card/50 backdrop-blur border-border/50">
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-muted/30">
              <TableRow className="border-border/50">
                <TableHead className="w-[180px]">Timestamp</TableHead>
                <TableHead>Actor</TableHead>
                <TableHead>Action</TableHead>
                <TableHead>Entity</TableHead>
                <TableHead>Details</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array(10).fill(0).map((_, i) => (
                  <TableRow key={i} className="border-border/50">
                    <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-40" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-16 rounded" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-full max-w-[200px]" /></TableCell>
                  </TableRow>
                ))
              ) : logs?.map((log) => (
                <TableRow key={log.id} className="border-border/50 hover:bg-muted/20">
                  <TableCell className="font-mono text-xs text-muted-foreground flex items-center gap-2">
                    <Clock className="w-3 h-3" />
                    {new Date(log.timestamp).toLocaleString()}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2 text-sm">
                      <User className="w-3 h-3 text-primary" />
                      <span>{log.performedBy}</span>
                    </div>
                  </TableCell>
                  <TableCell className="font-medium text-sm text-foreground">
                    {log.action}
                  </TableCell>
                  <TableCell>
                    <span className="text-xs px-2 py-1 rounded bg-secondary text-secondary-foreground border border-border/50 uppercase tracking-wider">
                      {log.entityType}
                    </span>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {log.details || `ID: ${log.entityId} ${log.entityName ? `(${log.entityName})` : ''}`}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}