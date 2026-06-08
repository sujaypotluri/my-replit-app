import { useGetCampaigns, getGetCampaignsQueryKey, useGetAnalyticsBreakdown, getGetAnalyticsBreakdownQueryKey, useGetAnalyticsTrends, getGetAnalyticsTrendsQueryKey } from "@workspace/api-client-react";
import { KPICard } from "@/components/shared/KPICard";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Skeleton } from "@/components/ui/skeleton";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";
import { Target, MousePointerClick, Users, TrendingUp } from "lucide-react";

export function Analytics() {
  const [metric, setMetric] = useState<'impressions' | 'ctr' | 'leads' | 'seats' | 'utilization'>('impressions');
  
  const { data: campaigns, isLoading: loadingCampaigns } = useGetCampaigns({}, {
    query: {
      queryKey: getGetCampaignsQueryKey({}),
    }
  });

  const { data: breakdown, isLoading: loadingBreakdown } = useGetAnalyticsBreakdown({ groupBy: 'client' }, {
    query: {
      queryKey: getGetAnalyticsBreakdownQueryKey({ groupBy: 'client' }),
    }
  });

  const { data: trends, isLoading: loadingTrends } = useGetAnalyticsTrends({ metric }, {
    query: {
      queryKey: getGetAnalyticsTrendsQueryKey({ metric }),
    }
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-heading font-bold text-foreground tracking-tight drop-shadow-[0_0_15px_rgba(0,255,240,0.1)]">Analytics</h1>
        <p className="text-muted-foreground">Deep dive into campaign performance and conversion metrics.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard title="Total Pipeline" value="$2.4M" trend={15.2} icon={<TrendingUp className="w-4 h-4" />} glow="primary" />
        <KPICard title="Active Campaigns" value={campaigns?.filter(c => c.status === 'active').length || 0} icon={<Target className="w-4 h-4" />} />
        <KPICard title="Avg CTR" value="4.2%" trend={2.1} icon={<MousePointerClick className="w-4 h-4" />} />
        <KPICard title="Total Leads" value="12,450" trend={8.4} icon={<Users className="w-4 h-4" />} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 bg-card/50 backdrop-blur border-border/50">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="font-heading text-lg">Performance Trends</CardTitle>
            <Select value={metric} onValueChange={(val: any) => setMetric(val)}>
              <SelectTrigger className="w-[180px] bg-muted/50 border-muted-border">
                <SelectValue placeholder="Select metric" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="impressions">Impressions</SelectItem>
                <SelectItem value="ctr">CTR</SelectItem>
                <SelectItem value="leads">Leads</SelectItem>
                <SelectItem value="utilization">Utilization</SelectItem>
              </SelectContent>
            </Select>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              {loadingTrends ? (
                <Skeleton className="w-full h-full" />
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={trends || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                    <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '8px' }}
                      itemStyle={{ color: 'hsl(var(--primary))' }}
                      cursor={{ fill: 'hsl(var(--muted)/0.5)' }}
                    />
                    <Bar dataKey="value" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} style={{ filter: 'drop-shadow(0px 0px 5px rgba(0, 255, 240, 0.4))' }} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/50 backdrop-blur border-border/50">
          <CardHeader>
            <CardTitle className="font-heading text-lg">Client Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {loadingBreakdown ? (
                Array(5).fill(0).map((_, i) => <Skeleton key={i} className="h-10 w-full" />)
              ) : (
                breakdown?.slice(0, 5).map((entry, idx) => (
                  <div key={idx} className="flex flex-col gap-1">
                    <div className="flex justify-between text-sm">
                      <span className="truncate pr-4">{entry.label}</span>
                      <span className="font-mono text-primary">{entry.leads.toLocaleString()}</span>
                    </div>
                    <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-primary" style={{ width: `${Math.min(100, (entry.leads / 5000) * 100)}%` }} />
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="rounded-md border border-border/50 bg-card/50 backdrop-blur overflow-hidden">
        <Table>
          <TableHeader className="bg-muted/30">
            <TableRow className="border-border/50">
              <TableHead>Campaign Name</TableHead>
              <TableHead>Client</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Impressions</TableHead>
              <TableHead className="text-right">CTR</TableHead>
              <TableHead className="text-right">Leads</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loadingCampaigns ? (
              Array(5).fill(0).map((_, i) => (
                <TableRow key={i} className="border-border/50">
                  <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-6 w-20 rounded-full" /></TableCell>
                  <TableCell className="text-right"><Skeleton className="h-4 w-16 ml-auto" /></TableCell>
                  <TableCell className="text-right"><Skeleton className="h-4 w-12 ml-auto" /></TableCell>
                  <TableCell className="text-right"><Skeleton className="h-4 w-12 ml-auto" /></TableCell>
                </TableRow>
              ))
            ) : campaigns?.map(campaign => (
              <TableRow key={campaign.id} className="border-border/50 hover:bg-muted/20">
                <TableCell className="font-medium">{campaign.name}</TableCell>
                <TableCell className="text-muted-foreground">{campaign.clientName}</TableCell>
                <TableCell><StatusBadge status={campaign.status} /></TableCell>
                <TableCell className="text-right font-mono">{campaign.impressions.toLocaleString()}</TableCell>
                <TableCell className="text-right font-mono text-primary">{campaign.ctr.toFixed(2)}%</TableCell>
                <TableCell className="text-right font-mono">{campaign.leads.toLocaleString()}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}