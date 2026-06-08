import { useGetLicensePoolSummary, getGetLicensePoolSummaryQueryKey, useGetSeats, getGetSeatsQueryKey } from "@workspace/api-client-react";
import { KPICard } from "@/components/shared/KPICard";
import { Skeleton } from "@/components/ui/skeleton";
import { Users, Key, Target, ShieldAlert } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { StatusBadge } from "@/components/shared/StatusBadge";

export function ClientPortal() {
  // Using clientId = 1 as a mock context for the client portal view
  const clientId = 1;
  
  const { data: summary, isLoading: loadingSummary } = useGetLicensePoolSummary({ clientId }, {
    query: {
      queryKey: getGetLicensePoolSummaryQueryKey({ clientId }),
    }
  });

  const { data: seats, isLoading: loadingSeats } = useGetSeats({}, {
    query: {
      queryKey: getGetSeatsQueryKey({}),
    }
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-heading font-bold text-foreground tracking-tight drop-shadow-[0_0_15px_rgba(150,100,255,0.1)]">Client Portal</h1>
        <p className="text-muted-foreground">Self-service capacity and user administration.</p>
      </div>

      {loadingSummary || !summary ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array(4).fill(0).map((_, i) => <Skeleton key={i} className="h-[120px] rounded-xl" />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <KPICard title="Total Licenses" value={summary.totalLicenses} icon={<Target className="w-4 h-4" />} glow="primary" />
          <KPICard title="Allocated Seats" value={summary.totalSeats} icon={<Users className="w-4 h-4" />} />
          <KPICard title="Active Usage" value={`${Math.round(summary.utilizationRate)}%`} icon={<Activity />} />
          <KPICard title="At Risk" value={summary.atRiskSeats} icon={<ShieldAlert className="w-4 h-4" />} glow={summary.atRiskSeats > 0 ? 'warning' : 'none'} />
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-card/50 backdrop-blur border-border/50">
          <CardHeader>
            <CardTitle className="font-heading text-lg">Capacity Overview</CardTitle>
          </CardHeader>
          <CardContent>
            {loadingSummary || !summary ? (
              <div className="space-y-4">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
              </div>
            ) : (
              <div className="space-y-6">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-muted-foreground">Overall Pool Utilization</span>
                    <span className="font-medium text-primary">{Math.round(summary.utilizationRate)}%</span>
                  </div>
                  <Progress value={summary.utilizationRate} className="h-2 bg-muted/50" indicatorClassName="bg-primary shadow-[0_0_10px_rgba(0,255,240,0.5)]" />
                </div>
                
                <div className="grid grid-cols-3 gap-4 text-center border-t border-border/50 pt-4">
                  <div>
                    <div className="text-xs text-muted-foreground">Active</div>
                    <div className="text-xl font-heading font-bold text-primary mt-1">{summary.activeSeats}</div>
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground">Available</div>
                    <div className="text-xl font-heading font-bold mt-1">{summary.availableSeats}</div>
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground">Inactive</div>
                    <div className="text-xl font-heading font-bold text-chart-5 mt-1">{summary.inactiveSeats}</div>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="bg-card/50 backdrop-blur border-border/50">
          <CardHeader>
            <CardTitle className="font-heading text-lg">Recent Seat Activity</CardTitle>
          </CardHeader>
          <CardContent className="px-0">
            <div className="divide-y divide-border/50 max-h-[250px] overflow-y-auto px-6">
              {loadingSeats ? (
                Array(4).fill(0).map((_, i) => (
                  <div key={i} className="py-3 flex justify-between items-center">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-5 w-20 rounded-full" />
                  </div>
                ))
              ) : seats?.slice(0, 5).map(seat => (
                <div key={seat.id} className="py-3 flex justify-between items-center group">
                  <div>
                    <p className="text-sm font-medium">{seat.userName || 'Unassigned'}</p>
                    <p className="text-xs text-muted-foreground">{seat.licenseName}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <StatusBadge status={seat.status} />
                    {seat.inactiveDays && seat.inactiveDays > 0 ? (
                      <span className="text-[10px] text-muted-foreground">Inactive {seat.inactiveDays}d</span>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function Activity(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
    </svg>
  );
}