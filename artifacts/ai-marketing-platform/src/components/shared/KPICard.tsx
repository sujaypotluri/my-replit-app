import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { ArrowDownIcon, ArrowUpIcon, MinusIcon } from "lucide-react";

interface KPICardProps {
  title: string;
  value: string | number;
  trend?: number;
  trendLabel?: string;
  icon?: React.ReactNode;
  className?: string;
  glow?: 'primary' | 'destructive' | 'warning' | 'none';
}

export function KPICard({ title, value, trend, trendLabel, icon, className, glow = 'none' }: KPICardProps) {
  
  const glowClasses = {
    primary: "shadow-[0_0_15px_rgba(0,255,240,0.05)] border-primary/20",
    destructive: "shadow-[0_0_15px_rgba(255,50,50,0.05)] border-destructive/20",
    warning: "shadow-[0_0_15px_rgba(255,180,0,0.05)] border-chart-5/20",
    none: ""
  };

  return (
    <Card className={cn("bg-card/50 backdrop-blur border-border/50", glowClasses[glow], className)}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-medium text-muted-foreground tracking-tight">{title}</h3>
          {icon && <div className="text-muted-foreground">{icon}</div>}
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-heading font-semibold tracking-tighter">{value}</span>
          {trend !== undefined && (
            <span className={cn(
              "flex items-center text-xs font-medium",
              trend > 0 ? "text-primary drop-shadow-[0_0_5px_rgba(0,255,240,0.3)]" : trend < 0 ? "text-destructive" : "text-muted-foreground"
            )}>
              {trend > 0 ? <ArrowUpIcon className="w-3 h-3 mr-0.5" /> : trend < 0 ? <ArrowDownIcon className="w-3 h-3 mr-0.5" /> : <MinusIcon className="w-3 h-3 mr-0.5" />}
              {Math.abs(trend)}%
            </span>
          )}
        </div>
        {trendLabel && (
          <p className="text-xs text-muted-foreground mt-2">{trendLabel}</p>
        )}
      </CardContent>
    </Card>
  );
}