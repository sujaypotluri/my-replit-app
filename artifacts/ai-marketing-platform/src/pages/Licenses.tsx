import { useGetLicenses, getGetLicensesQueryKey } from "@workspace/api-client-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Plus, MoreHorizontal } from "lucide-react";
import { Progress } from "@/components/ui/progress";

export function Licenses() {
  const { data: licenses, isLoading } = useGetLicenses({}, {
    query: {
      queryKey: getGetLicensesQueryKey({}),
    }
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-heading font-bold text-foreground tracking-tight drop-shadow-[0_0_15px_rgba(0,255,240,0.1)]">License Pools</h1>
          <p className="text-muted-foreground">Manage organizational capacity and quotas.</p>
        </div>
        <Button className="bg-primary hover:bg-primary/90 text-primary-foreground font-medium shadow-[0_0_15px_rgba(0,255,240,0.3)]">
          <Plus className="w-4 h-4 mr-2" />
          Create Pool
        </Button>
      </div>

      <div className="rounded-md border border-border/50 bg-card/50 backdrop-blur overflow-hidden">
        <Table>
          <TableHeader className="bg-muted/30">
            <TableRow className="border-border/50">
              <TableHead className="w-[250px]">Pool Name</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Utilization</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array(5).fill(0).map((_, i) => (
                <TableRow key={i} className="border-border/50">
                  <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                  <TableCell><Skeleton className="h-6 w-20 rounded-full" /></TableCell>
                  <TableCell><Skeleton className="h-2 w-32 rounded-full" /></TableCell>
                  <TableCell className="text-right"><Skeleton className="h-8 w-8 ml-auto" /></TableCell>
                </TableRow>
              ))
            ) : licenses?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                  No license pools found.
                </TableCell>
              </TableRow>
            ) : (
              licenses?.map((license) => (
                <TableRow key={license.id} className="border-border/50 hover:bg-muted/20">
                  <TableCell className="font-medium">
                    {license.name}
                    <div className="text-xs text-muted-foreground font-normal mt-1">{license.clientName}</div>
                  </TableCell>
                  <TableCell>
                    <span className="text-xs font-mono px-2 py-1 rounded bg-secondary text-secondary-foreground">
                      {license.type.toUpperCase()}
                    </span>
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={license.status} />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Progress 
                        value={(license.activeSeats / license.totalSeats) * 100} 
                        className="h-2 w-[100px] bg-muted/50"
                        indicatorClassName={((license.activeSeats / license.totalSeats) * 100) > 90 ? "bg-destructive" : "bg-primary"}
                      />
                      <span className="text-xs text-muted-foreground w-12 text-right font-mono">
                        {license.activeSeats}/{license.totalSeats}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" className="h-8 w-8 hover:text-primary">
                      <MoreHorizontal className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}