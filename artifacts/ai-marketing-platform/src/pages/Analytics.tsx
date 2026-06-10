import { useState } from "react";
import {
  useGetCampaigns, getGetCampaignsQueryKey,
  useGetAnalyticsBreakdown, getGetAnalyticsBreakdownQueryKey,
  useGetAnalyticsTrends, getGetAnalyticsTrendsQueryKey,
} from "@workspace/api-client-react";
import { KPICard } from "@/components/shared/KPICard";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Skeleton } from "@/components/ui/skeleton";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Target, MousePointerClick, Users, TrendingUp, Sparkles, Copy, ChevronDown, ChevronUp, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

type Tone = "professional" | "bold" | "playful" | "urgent" | "empathetic";

interface CopyResult {
  headlines: string[];
  descriptions: string[];
  ctas: string[];
  insight: string;
}

const TONES: { value: Tone; label: string; color: string }[] = [
  { value: "professional", label: "Professional", color: "bg-blue-500/10 text-blue-400 border-blue-500/30" },
  { value: "bold",         label: "Bold",         color: "bg-primary/10 text-primary border-primary/30" },
  { value: "playful",      label: "Playful",      color: "bg-purple-500/10 text-purple-400 border-purple-500/30" },
  { value: "urgent",       label: "Urgent",       color: "bg-orange-500/10 text-orange-400 border-orange-500/30" },
  { value: "empathetic",   label: "Empathetic",   color: "bg-green-500/10 text-green-400 border-green-500/30" },
];

function CopySection({ label, items }: { label: string; items: string[] }) {
  const [copied, setCopied] = useState<number | null>(null);
  const copyText = (text: string, idx: number) => {
    navigator.clipboard.writeText(text);
    setCopied(idx);
    setTimeout(() => setCopied(null), 1500);
  };
  return (
    <div className="space-y-2">
      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{label}</p>
      {items.map((item, i) => (
        <div key={i} className="group flex items-start justify-between gap-2 rounded-md bg-muted/20 border border-border/40 px-3 py-2 hover:border-primary/30 transition-colors">
          <span className="text-sm text-foreground leading-snug">{item}</span>
          <button onClick={() => copyText(item, i)} className="shrink-0 mt-0.5 text-muted-foreground hover:text-primary transition-colors opacity-0 group-hover:opacity-100">
            <Copy className="w-3.5 h-3.5" />
          </button>
        </div>
      ))}
    </div>
  );
}

function CopyGenerator({ campaigns }: { campaigns: { id: number; name: string; clientName: string; impressions: number; ctr: number; leads: number }[] }) {
  const [selectedId, setSelectedId] = useState<string>("");
  const [tone, setTone] = useState<Tone>("professional");
  const [context, setContext] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<CopyResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const selected = campaigns.find(c => String(c.id) === selectedId);

  const generate = async () => {
    if (!selected) return;
    setLoading(true);
    setResult(null);
    setError(null);
    try {
      const res = await fetch("/api/ai/generate-copy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          campaignName: selected.name,
          clientName: selected.clientName,
          impressions: selected.impressions,
          ctr: selected.ctr,
          leads: selected.leads,
          tone,
          additionalContext: context || undefined,
        }),
      });
      if (!res.ok) throw new Error(`Server error ${res.status}`);
      const data: CopyResult = await res.json();
      setResult(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Generation failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="bg-card/50 backdrop-blur border-border/50">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded bg-primary/15 flex items-center justify-center border border-primary/30">
            <Sparkles className="w-3.5 h-3.5 text-primary" />
          </div>
          <div>
            <CardTitle className="font-heading text-base">AI Copy Generator</CardTitle>
            <CardDescription className="text-xs">Generate headlines, descriptions, and CTAs from campaign data</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Campaign picker */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground">Campaign</label>
          <Select value={selectedId} onValueChange={setSelectedId}>
            <SelectTrigger className="bg-muted/30 border-border/50 h-9 text-sm">
              <SelectValue placeholder="Select a campaign…" />
            </SelectTrigger>
            <SelectContent>
              {campaigns.map(c => (
                <SelectItem key={c.id} value={String(c.id)}>
                  <span className="font-medium">{c.name}</span>
                  <span className="text-muted-foreground ml-1.5 text-xs">— {c.clientName}</span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Tone selector */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground">Tone</label>
          <div className="flex flex-wrap gap-1.5">
            {TONES.map(t => (
              <button
                key={t.value}
                onClick={() => setTone(t.value)}
                className={cn(
                  "px-2.5 py-1 rounded-full text-xs font-medium border transition-all",
                  tone === t.value
                    ? t.color + " shadow-sm"
                    : "bg-muted/20 text-muted-foreground border-border/40 hover:border-border"
                )}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Advanced */}
        <div>
          <button
            onClick={() => setShowAdvanced(v => !v)}
            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            {showAdvanced ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            Additional context
          </button>
          {showAdvanced && (
            <Textarea
              value={context}
              onChange={e => setContext(e.target.value)}
              placeholder="e.g. targeting C-suite finance professionals in North America, emphasise ROI…"
              className="mt-2 bg-muted/20 border-border/50 text-sm resize-none h-20 focus-visible:ring-primary/50"
            />
          )}
        </div>

        <Button
          onClick={generate}
          disabled={!selectedId || loading}
          className="w-full bg-primary/90 hover:bg-primary text-black font-semibold shadow-[0_0_16px_rgba(0,255,240,0.2)] hover:shadow-[0_0_24px_rgba(0,255,240,0.35)] transition-all"
        >
          {loading ? (
            <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Generating…</>
          ) : (
            <><Sparkles className="w-4 h-4 mr-2" />Generate Copy</>
          )}
        </Button>

        {error && (
          <p className="text-xs text-destructive bg-destructive/10 border border-destructive/30 rounded-md px-3 py-2">{error}</p>
        )}

        {result && (
          <div className="space-y-4 pt-1 border-t border-border/40">
            {result.insight && (
              <div className="flex gap-2 rounded-md bg-primary/5 border border-primary/20 px-3 py-2">
                <Sparkles className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
                <p className="text-xs text-primary/90 italic leading-relaxed">{result.insight}</p>
              </div>
            )}
            <CopySection label="Headlines" items={result.headlines} />
            <CopySection label="Descriptions" items={result.descriptions} />
            <CopySection label="CTAs" items={result.ctas} />
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function Analytics() {
  const [metric, setMetric] = useState<'impressions' | 'ctr' | 'leads' | 'seats' | 'utilization'>('impressions');

  const { data: campaigns, isLoading: loadingCampaigns } = useGetCampaigns({}, {
    query: { queryKey: getGetCampaignsQueryKey({}) }
  });

  const { data: breakdown, isLoading: loadingBreakdown } = useGetAnalyticsBreakdown({ groupBy: 'client' }, {
    query: { queryKey: getGetAnalyticsBreakdownQueryKey({ groupBy: 'client' }) }
  });

  const { data: trends, isLoading: loadingTrends } = useGetAnalyticsTrends({ metric }, {
    query: { queryKey: getGetAnalyticsTrendsQueryKey({ metric }) }
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

      {/* Charts + AI Generator row */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Left: trends + breakdown */}
        <div className="xl:col-span-2 space-y-6">
          <Card className="bg-card/50 backdrop-blur border-border/50">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="font-heading text-lg">Performance Trends</CardTitle>
              <Select value={metric} onValueChange={(val: any) => setMetric(val)}>
                <SelectTrigger className="w-[160px] bg-muted/50 border-muted-border text-sm">
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
              <div className="h-[260px] w-full">
                {loadingTrends ? <Skeleton className="w-full h-full" /> : (
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
                {loadingBreakdown
                  ? Array(5).fill(0).map((_, i) => <Skeleton key={i} className="h-10 w-full" />)
                  : breakdown?.slice(0, 5).map((entry, idx) => (
                    <div key={idx} className="flex flex-col gap-1">
                      <div className="flex justify-between text-sm">
                        <span className="truncate pr-4">{entry.label}</span>
                        <span className="font-mono text-primary">{entry.leads.toLocaleString()}</span>
                      </div>
                      <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                        <div className="h-full bg-primary" style={{ width: `${Math.min(100, (entry.leads / 5000) * 100)}%` }} />
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right: AI Copy Generator */}
        <div className="xl:col-span-1">
          {loadingCampaigns
            ? <Skeleton className="h-[420px] w-full rounded-xl" />
            : <CopyGenerator campaigns={campaigns ?? []} />
          }
        </div>
      </div>

      {/* Campaign table */}
      <div className="rounded-md border border-border/50 bg-card/50 backdrop-blur overflow-hidden">
        <div className="px-4 py-3 border-b border-border/50 flex items-center justify-between">
          <h2 className="font-heading font-semibold text-sm">Campaigns</h2>
          <Badge variant="outline" className="text-xs border-border/50 text-muted-foreground">
            {campaigns?.length ?? 0} total
          </Badge>
        </div>
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
            {loadingCampaigns
              ? Array(5).fill(0).map((_, i) => (
                <TableRow key={i} className="border-border/50">
                  {[32, 24, 20, 16, 12, 12].map((w, j) => (
                    <TableCell key={j} className={j >= 3 ? "text-right" : ""}>
                      <Skeleton className={`h-4 w-${w} ${j >= 3 ? "ml-auto" : ""}`} />
                    </TableCell>
                  ))}
                </TableRow>
              ))
              : campaigns?.map(campaign => (
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
