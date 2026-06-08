import { useGetDashboardStats, getGetDashboardStatsQueryKey } from "@workspace/api-client-react";
import { KPICard } from "@/components/shared/KPICard";
import { Users, Key, Target, Activity } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { Skeleton } from "@/components/ui/skeleton";

// Mock data for the chart to simulate trend lines
const mockChartData = [
  { date: 'Mon', impressions: 4000, ctr: 2.4 },
  { date: 'Tue', impressions: 3000, ctr: 2.1 },
  { date: 'Wed', impressions: 2000, ctr: 2.9 },
  { date: 'Thu', impressions: 2780, ctr: 2.0 },
  { date: 'Fri', impressions: 1890, ctr: 2.5 },
  { date: 'Sat', impressions: 2390, ctr: 2.1 },
  { date: 'Sun', impressions: 3490, ctr: 2.6 },
];

export function Dashboard() {
  const { data: stats, isLoading } = useGetDashboardStats({
    query: {
      queryKey: getGetDashboardStatsQueryKey(),
    }
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-heading font-bold text-foreground tracking-tight drop-shadow-[0_0_15px_rgba(0,255,240,0.1)]">Mission Control</h1>
        <p className="text-muted-foreground">System overview and high-level KPIs.</p>
      </div>

      {isLoading || !stats ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array(4).fill(0).map((_, i) => <Skeleton key={i} className="h-[120px] rounded-xl" />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <KPICard 
            title="Total Impressions" 
            value={(stats.totalImpressions / 1000000).toFixed(1) + 'M'} 
            trend={12.5} 
            trendLabel="vs last week"
            icon={<Target className="w-4 h-4" />}
            glow="primary"
          />
          <KPICard 
            title="Avg. CTR" 
            value={stats.ctr.toFixed(2) + '%'} 
            trend={-1.2} 
            trendLabel="vs last week"
            icon={<Activity className="w-4 h-4" />}
          />
          <KPICard 
            title="Active Seats" 
            value={stats.activeSeats} 
            trend={5.4} 
            trendLabel="vs last week"
            icon={<Users className="w-4 h-4" />}
            glow={stats.utilizationRate > 90 ? 'warning' : 'none'}
          />
          <KPICard 
            title="At Risk Seats" 
            value={stats.atRiskSeats} 
            icon={<Key className="w-4 h-4" />}
            glow={stats.atRiskSeats > 0 ? 'destructive' : 'none'}
          />
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 bg-card/50 backdrop-blur border-border/50 shadow-lg">
          <CardHeader>
            <CardTitle className="font-heading text-lg tracking-tight">Platform Throughput</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={mockChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorImpressions" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                  <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => `${v/1000}k`} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '8px' }}
                    itemStyle={{ color: 'hsl(var(--primary))' }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="impressions" 
                    stroke="hsl(var(--primary))" 
                    strokeWidth={2}
                    fillOpacity={1} 
                    fill="url(#colorImpressions)" 
                    style={{ filter: 'drop-shadow(0px 0px 5px rgba(0, 255, 240, 0.5))' }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/50 backdrop-blur border-border/50 shadow-lg flex flex-col">
          <CardHeader>
            <CardTitle className="font-heading text-lg tracking-tight">System Health</CardTitle>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col justify-center">
            {isLoading || !stats ? (
              <div className="space-y-4">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
              </div>
            ) : (
              <div className="space-y-6">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-muted-foreground">License Utilization</span>
                    <span className="font-medium text-primary">{Math.round(stats.utilizationRate)}%</span>
                  </div>
                  <div className="h-2 w-full bg-muted/50 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-primary shadow-[0_0_10px_rgba(0,255,240,0.5)] transition-all duration-500" 
                      style={{ width: `${stats.utilizationRate}%` }}
                    />
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-muted-foreground">Support Load</span>
                    <span className="font-medium">{stats.supportLoad}%</span>
                  </div>
                  <div className="h-2 w-full bg-muted/50 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-chart-3 shadow-[0_0_10px_rgba(0,255,100,0.5)] transition-all duration-500" 
                      style={{ width: `${stats.supportLoad}%` }}
                    />
                  </div>
                </div>

                <div className="pt-4 border-t border-border/50">
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div>
                      <p className="text-xs text-muted-foreground">Active Seats</p>
                      <p className="text-xl font-heading font-semibold mt-1">{stats.activeSeats}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Available</p>
                      <p className="text-xl font-heading font-semibold mt-1 text-primary">{stats.availableLicenses}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}