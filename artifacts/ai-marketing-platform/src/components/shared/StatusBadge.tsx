import { cn } from "@/lib/utils";

export type StatusType = 'active' | 'inactive' | 'at_risk' | 'pending' | 'healthy' | 'over_capacity' | 'suspended';

export function StatusBadge({ status, className }: { status: StatusType | string, className?: string }) {
  const getColors = (s: string) => {
    switch(s) {
      case 'active':
      case 'healthy':
        return 'bg-primary/10 text-primary border-primary/20 shadow-[0_0_8px_rgba(0,255,240,0.1)]';
      case 'at_risk':
      case 'over_capacity':
        return 'bg-chart-5/10 text-chart-5 border-chart-5/20 shadow-[0_0_8px_rgba(255,180,0,0.1)]';
      case 'pending':
      case 'suspended':
        return 'bg-chart-2/10 text-chart-2 border-chart-2/20 shadow-[0_0_8px_rgba(150,100,255,0.1)]';
      case 'inactive':
      default:
        return 'bg-muted/30 text-muted-foreground border-border/50';
    }
  };

  return (
    <span className={cn(
      "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border uppercase tracking-wider",
      getColors(status),
      className
    )}>
      {status.replace('_', ' ')}
    </span>
  );
}

export function RoleBadge({ role, className }: { role: string, className?: string }) {
  const getColors = (r: string) => {
    switch(r) {
      case 'super_admin':
        return 'bg-primary/10 text-primary border-primary/30';
      case 'client_admin':
        return 'bg-chart-2/10 text-chart-2 border-chart-2/30';
      case 'dept_manager':
        return 'bg-chart-3/10 text-chart-3 border-chart-3/30';
      default:
        return 'bg-secondary text-secondary-foreground border-border/50';
    }
  };

  return (
    <span className={cn(
      "inline-flex items-center px-2 py-0.5 rounded-sm text-xs font-medium border",
      getColors(role),
      className
    )}>
      {role.replace('_', ' ')}
    </span>
  );
}