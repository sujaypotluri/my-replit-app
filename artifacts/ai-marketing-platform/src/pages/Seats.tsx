import { useGetSeats, getGetSeatsQueryKey } from "@workspace/api-client-react";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { KeyRound, ShieldAlert, XCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export function Seats() {
  const { data: seats, isLoading } = useGetSeats({}, {
    query: {
      queryKey: getGetSeatsQueryKey({}),
    }
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-heading font-bold text-foreground tracking-tight drop-shadow-[0_0_15px_rgba(0,255,240,0.1)]">Seat Monitor</h1>
        <p className="text-muted-foreground">Live tracking of individual platform access and activity.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {isLoading ? (
          Array(8).fill(0).map((_, i) => <Skeleton key={i} className="h-32 rounded-xl" />)
        ) : seats?.map(seat => (
          <Card key={seat.id} className={cn(
            "bg-card/30 backdrop-blur border-border/40 hover:border-primary/40 transition-colors relative overflow-hidden group",
            seat.status === 'at_risk' && "border-chart-5/40 hover:border-chart-5/60",
            seat.status === 'inactive' && "opacity-60 grayscale-[0.5]"
          )}>
            {/* Status indicator line */}
            <div className={cn(
              "absolute top-0 left-0 w-full h-1",
              seat.status === 'active' ? "bg-primary shadow-[0_0_10px_rgba(0,255,240,0.8)]" : 
              seat.status === 'at_risk' ? "bg-chart-5 shadow-[0_0_10px_rgba(255,180,0,0.8)]" :
              "bg-muted"
            )} />
            
            <CardContent className="p-5">
              <div className="flex justify-between items-start mb-3">
                <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center border border-border">
                  <span className="text-xs font-bold text-muted-foreground">
                    {seat.userName ? seat.userName.substring(0, 2).toUpperCase() : '??'}
                  </span>
                </div>
                <StatusBadge status={seat.status} />
              </div>
              
              <div className="space-y-1">
                <h3 className="font-medium text-sm truncate">{seat.userName || 'Unassigned'}</h3>
                <p className="text-xs text-muted-foreground truncate">{seat.userEmail || '—'}</p>
                <div className="text-xs font-mono text-muted-foreground/80 mt-2 truncate">
                  POOL: {seat.licenseName || '—'}
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-border/40 flex justify-between items-center opacity-0 group-hover:opacity-100 transition-opacity">
                <span className="text-[10px] text-muted-foreground uppercase tracking-wider">
                  {seat.inactiveDays ? `Inactive ${seat.inactiveDays}d` : 'Active Recently'}
                </span>
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground hover:text-destructive hover:bg-destructive/10">
                    <XCircle className="w-3 h-3" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground hover:text-chart-5 hover:bg-chart-5/10">
                    <ShieldAlert className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}